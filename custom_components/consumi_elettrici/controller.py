"""Collega il motore a Home Assistant: ascolta i sensori, accumula l'energia, salva il registro, avvisa."""
from __future__ import annotations

from datetime import date, datetime, timedelta
import logging
import math
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_state_change_event, async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
    CONF_NOTIFY,
    CONF_OVERLOAD,
    CONF_OVERLOAD_MINUTES,
    CONF_OVERLOAD_NOTIFY,
    CONF_REPORT,
    DEFAULTS,
    DOMAIN,
    EVENT_OVERLOAD,
    EVENT_REPORT,
    REFRESH_DELAY,
    SAVE_DELAY,
    SIGNAL_UPDATE,
    STORAGE_VERSION,
    SUBENTRY_CONSUMER,
    TICK_SECONDS,
)
from .engine import (
    LIVE_PERIODS,
    MAX_CATCHUP,
    MAX_HOUR_KWH,
    METER,
    OVERLOAD_AVAILABLE,
    PERIODS,
    UNMONITORED,
    EnergyReading,
    Ledger,
    Overload,
    PowerHold,
    Source,
    band,
    contract_power,
    day_labels,
    forecast_month,
    link_consumers,
    month_labels,
    monthly_report,
    overload_message,
    parse_bill,
    parse_consumer,
    parse_meter,
    parse_tariff,
    period_ranges,
    to_kwh,
    to_watt,
    unmonitored,
)

_LOGGER = logging.getLogger(__name__)
REPORT_HOUR = 8          # il report del mese chiuso parte alla prima occasione dopo quest'ora del primo giorno
OVERLOAD_MIN_W = 50      # i consumatori sotto questa potenza non entrano nell'elenco dell'avviso


class ConsumiController:
    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        self.hass = hass
        self.entry = entry
        self.signal = SIGNAL_UPDATE.format(entry.entry_id)
        self.store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}")
        self.ledger = Ledger()
        self.readings: dict[str, EnergyReading] = {}
        self.holds: dict[str, PowerHold] = {}
        self.overload = Overload()
        self.imported: dict[str, str] = {}
        self.last_report: str | None = None
        self._unsub: list[CALLBACK_TYPE] = []
        self._refresh: CALLBACK_TYPE | None = None
        self._snap: dict[str, Any] | None = None
        self._day: date | None = None

        options = {**DEFAULTS, **entry.options}
        self.options = options
        self.meter: Source = parse_meter(options)
        parsed: dict[str, Source] = {}
        for sid, sub in entry.subentries.items():
            if sub.subentry_type == SUBENTRY_CONSUMER and (src := parse_consumer(sid, dict(sub.data))):
                parsed[sid] = src
        self.consumers: dict[str, Source] = link_consumers(parsed)
        self.sources: dict[str, Source] = {METER: self.meter, **self.consumers}
        # chi sta direttamente sotto il contatore (si toglie dal non monitorato) e chi sotto un altro consumatore
        self.top: list[str] = [k for k, s in self.consumers.items() if s.parent == METER]
        self.children: dict[str, list[str]] = {}
        for key, src in self.consumers.items():
            if src.parent in self.consumers:
                self.children.setdefault(src.parent, []).append(key)
        self.tariff = parse_tariff(options)
        self.bill = parse_bill(options)
        self.notify: list[str] = _services(options.get(CONF_NOTIFY))
        self.overload_notify: list[str] = _services(options.get(CONF_OVERLOAD_NOTIFY)) or self.notify
        # entità ascoltate -> [(sorgente, ruolo)]
        self._watch: dict[str, list[tuple[str, str]]] = {}
        for key, src in self.sources.items():
            for ent in src.energy_entities:
                self._watch.setdefault(ent, []).append((key, "energy"))
            for ent in src.power_entities:
                self._watch.setdefault(ent, []).append((key, "power"))
        for ent in self.tariff.entities:
            self._watch.setdefault(ent, []).append((METER, "price"))

    # ------------------------------------------------------------------ avvio e arresto
    async def async_start(self) -> None:
        data = await self.store.async_load() or {}
        self.ledger = Ledger(data)
        for key in self.ledger.keys() - set(self.sources):
            self.ledger.remove(key)            # consumatori tolti: via anche il loro storico
        now = dt_util.now()
        # dopo un fermo breve i contatori recuperano quello che è passato; dopo uno lungo ripartono (i giorni mancanti li riempie lo storico)
        if now.timestamp() - (data.get("alive") or 0) <= MAX_CATCHUP:
            for name, value in (data.get("readings") or {}).items():
                if name.split("|", 1)[0] in self.sources and isinstance(value, list) and len(value) == 2:
                    self.readings[name] = EnergyReading(value[0], value[1])
        self.imported = {k: v for k, v in (data.get("imported") or {}).items() if k in self.sources}
        self._day = now.date()
        self.last_report = data.get("last_report") or _previous_month(self._day)
        ts = now.timestamp()
        for key, src in self.sources.items():
            for ent in src.energy_entities:
                self._read_energy(key, ent, ts)
            if src.power_entities:
                self._read_power(key, ts)
        if self._watch:
            self._unsub.append(async_track_state_change_event(self.hass, list(self._watch), self._on_state))
        self._unsub.append(async_track_time_interval(self.hass, self._on_tick, timedelta(seconds=TICK_SECONDS)))
        self.entry.async_create_background_task(self.hass, self._async_startup_import(), f"{DOMAIN}_import")

    async def async_stop(self) -> None:
        for unsub in self._unsub:
            unsub()
        self._unsub.clear()
        if self._refresh:
            self._refresh()
            self._refresh = None
        ts = dt_util.utcnow().timestamp()
        for key, src in self.sources.items():
            if src.from_power:
                self._read_power(key, ts)
        await self.store.async_save(self._data())

    def _data(self) -> dict[str, Any]:
        return {
            **self.ledger.to_dict(),
            "readings": {name: [r.last, r.ts] for name, r in self.readings.items() if r.last is not None},
            "imported": self.imported,
            "last_report": self.last_report,
            "alive": dt_util.utcnow().timestamp(),
        }

    def _save(self) -> None:
        self.store.async_delay_save(self._data, SAVE_DELAY)

    # ------------------------------------------------------------------ letture
    def _number(self, entity_id: str) -> tuple[float, str | None] | None:
        state = self.hass.states.get(entity_id)
        if state is None or state.state in (STATE_UNKNOWN, STATE_UNAVAILABLE, ""):
            return None
        try:
            value = float(state.state)
        except ValueError:
            return None
        if not math.isfinite(value):
            return None
        return value, state.attributes.get("unit_of_measurement")

    def power(self, key: str) -> float | None:
        """Potenza attuale (W) di una sorgente: somma dei suoi sensori disponibili."""
        src = self.sources.get(key)
        if src is None:
            return None
        values = [to_watt(*n) for ent in src.power_entities if (n := self._number(ent)) is not None]
        return sum(values) if values else None

    def _price_lookup(self, entity_id: str) -> float | None:
        n = self._number(entity_id)
        if n is None:
            return None
        value, unit = n
        if unit and "mwh" in unit.lower():
            value /= 1000
        return value if 0 <= value <= 5 else None

    def price(self, band_no: int) -> float:
        return self.tariff.current(band_no, self._price_lookup)

    def _account(self, key: str, kwh: float, ts: float) -> None:
        """Mette nel registro un consumo, nel giorno e nella fascia dell'istante `ts`, al prezzo di adesso."""
        local = dt_util.as_local(dt_util.utc_from_timestamp(ts))
        b = band(local)
        self.ledger.add(key, local.date(), kwh, kwh * self.price(b), b if key == METER else None)
        self._snap = None

    def _read_energy(self, key: str, entity_id: str, ts: float) -> None:
        n = self._number(entity_id)
        if n is None:
            return
        reading = self.readings.setdefault(f"{key}|{entity_id}", EnergyReading())
        delta = reading.delta(to_kwh(*n), ts)
        if delta > 0:
            self._account(key, delta, ts)

    def _read_power(self, key: str, ts: float) -> None:
        src = self.sources[key]
        watt = self.power(key)
        if src.from_power:
            hold = self.holds.setdefault(key, PowerHold())
            start = hold.ts
            delta = hold.delta(watt, ts)
            if delta > 0 and start is not None:
                self._account(key, delta, start)
        if key == METER and watt is not None:
            local = dt_util.as_local(dt_util.utc_from_timestamp(ts))
            self.ledger.peak(METER, local.date(), watt, local.strftime("%H:%M"))
            self._check_overload(watt, ts)

    @callback
    def _on_state(self, event: Event) -> None:
        ts = dt_util.utcnow().timestamp()
        for key, role in self._watch.get(event.data["entity_id"], ()):
            if role == "energy":
                self._read_energy(key, event.data["entity_id"], ts)
            elif role == "power":
                self._read_power(key, ts)
        self._schedule_refresh()

    @callback
    def _on_tick(self, _now: datetime) -> None:
        now = dt_util.now()
        ts = now.timestamp()
        for key, src in self.sources.items():
            if src.from_power or key == METER:
                self._read_power(key, ts)
        if now.date() != self._day:
            self._day = now.date()
            self.ledger.compact(self._day)
        if now.hour >= REPORT_HOUR and self.last_report != _previous_month(now.date()):
            self.last_report = _previous_month(now.date())
            if self.options.get(CONF_REPORT):
                self.hass.async_create_task(self.async_send_report("last_month"))
        self._save()
        self._do_refresh()

    def _schedule_refresh(self) -> None:
        if self._refresh is None:
            self._refresh = async_call_later(self.hass, REFRESH_DELAY, self._do_refresh)

    @callback
    def _do_refresh(self, _now: datetime | None = None) -> None:
        if self._refresh:
            self._refresh()
            self._refresh = None
        self._snap = None
        async_dispatcher_send(self.hass, self.signal)

    # ------------------------------------------------------------------ avvisi
    def contract_kw(self, when: datetime | None = None) -> float:
        """Potenza di contratto valida adesso (o all'ora locale `when`): in F3 può essere più alta."""
        return contract_power(self.options, band(when or dt_util.now()))

    def _check_overload(self, watt: float, ts: float) -> None:
        contract = self.contract_kw(dt_util.as_local(dt_util.utc_from_timestamp(ts)))
        level = self.overload.update(watt, contract, ts, float(self.options.get(CONF_OVERLOAD_MINUTES) or 3))
        if not level:
            return
        # le linee che contengono altri consumatori non dicono cosa spegnere: nell'elenco vanno i singoli
        top = sorted(((s.name, w) for k, s in self.consumers.items() if k not in self.children and (w := self.power(k)) is not None and w >= OVERLOAD_MIN_W), key=lambda x: -x[1])[:5]
        title, message = overload_message(level, watt, contract, top)
        self.hass.bus.async_fire(EVENT_OVERLOAD, {"level": level, "power": round(watt), "contract_kw": contract, "consumers": [{"name": n, "power": round(w)} for n, w in top], "title": title, "message": message})
        if self.options.get(CONF_OVERLOAD):
            self.hass.async_create_task(self._async_notify(title, message, self.overload_notify))

    async def _async_notify(self, title: str, message: str, services: list[str]) -> None:
        for service in services:
            name = service.split(".", 1)[1]
            if not self.hass.services.has_service("notify", name):
                _LOGGER.warning("Servizio di notifica %s non trovato", service)
                continue
            await self.hass.services.async_call("notify", name, {"title": title, "message": message}, blocking=False)

    def report(self, period: str = "last_month") -> dict[str, Any]:
        """Dati e testo del report di un mese: quello chiuso ('last_month') o quello in corso ('month')."""
        today = dt_util.now().date()
        start, end = period_ranges(today)[period]
        before_end = start - timedelta(days=1)
        meter = self.ledger.total(METER, start, end)
        previous = self.ledger.total(METER, before_end.replace(day=1), before_end)
        ranking = []
        monitored = 0.0
        for key, src in self.consumers.items():
            t = self.ledger.total(key, start, end)
            if src.parent == METER:
                monitored += t["k"]
            if t["k"] > 0 and key not in self.children:
                ranking.append((src.name, round(t["k"], 2), round(self.bill.cost(t["k"], t["e"]), 2)))
        ranking.sort(key=lambda x: -x[1])
        bill = self.bill.estimate(meter["k"], meter["e"]) if self.bill.enabled else None
        unmon = max(meter["k"] - monitored, 0.0)
        title, message = monthly_report(start, meter["k"], previous["k"], self.bill.cost(meter["k"], meter["e"]), bill, meter["f"], ranking, unmon)
        return {
            "month": start.strftime("%Y-%m"),
            "kwh": round(meter["k"], 2),
            "previous_kwh": round(previous["k"], 2),
            "cost": round(self.bill.cost(meter["k"], meter["e"]), 2),
            "bill": bill,
            "bands": [round(x, 2) for x in meter["f"]],
            "consumers": [{"name": n, "kwh": k, "cost": c} for n, k, c in ranking],
            "unmonitored_kwh": round(unmon, 2),
            "title": title,
            "message": message,
        }

    async def async_send_report(self, period: str = "last_month") -> dict[str, Any]:
        data = self.report(period)
        self.hass.bus.async_fire(EVENT_REPORT, data)
        await self._async_notify(data["title"], data["message"], self.notify)
        return data

    # ------------------------------------------------------------------ storico dalle statistiche di Home Assistant
    async def _async_startup_import(self) -> None:
        try:
            await self.async_import()
        except Exception:  # noqa: BLE001 - lo storico è un di più: non deve fermare l'integrazione
            _LOGGER.exception("Importazione dello storico non riuscita")

    async def async_import(self, days: int | None = None) -> dict[str, int]:
        """Riempie i giorni mancanti con le statistiche orarie dei contatori di energia.

        Senza `days`: dall'anno scorso per le sorgenti mai importate, gli ultimi dieci giorni per le altre.
        Restituisce i giorni scritti per sorgente.
        """
        if "recorder" not in self.hass.config.components:
            return {}
        from homeassistant.components.recorder import get_instance  # noqa: PLC0415
        from homeassistant.components.recorder.statistics import statistics_during_period  # noqa: PLC0415

        today = dt_util.now().date()
        result: dict[str, int] = {}
        for key, src in list(self.sources.items()):
            if not src.energy_entities:
                continue
            if days is not None:
                first_day = today - timedelta(days=days)
            elif self.imported.get(key) != src.signature:
                first_day = date(today.year - 1, 1, 1)
            else:
                first_day = today - timedelta(days=10)
            start = dt_util.as_utc(dt_util.start_of_local_day(first_day))
            rows = await get_instance(self.hass).async_add_executor_job(
                statistics_during_period, self.hass, start, None, set(src.energy_entities), "hour", {"energy": "kWh"}, {"change"}
            )
            if key not in self.sources:
                continue
            per_day: dict[date, list[Any]] = {}
            for entity_rows in rows.values():
                for row in entity_rows:
                    change = row.get("change")
                    if change is None or change <= 0 or change > MAX_HOUR_KWH:
                        continue
                    local = dt_util.as_local(dt_util.utc_from_timestamp(row["start"]))
                    b = band(local)
                    d = per_day.setdefault(local.date(), [0.0, 0.0, [0.0, 0.0, 0.0]])
                    d[0] += change
                    d[1] += change * self.price(b)
                    d[2][b - 1] += change
            written = 0
            for day, (kwh, eur, bands) in per_day.items():
                if self.ledger.set_imported(key, day, kwh, eur, bands if key == METER else None, today):
                    written += 1
            self.imported[key] = src.signature
            result[key] = written
        if result:
            self._save()
            self._do_refresh()
        return result

    # ------------------------------------------------------------------ dati per entità e scheda
    def snapshot(self) -> dict[str, Any]:
        """Fotografia di adesso: potenze, periodi, tariffa, bolletta. Ricalcolata solo quando qualcosa cambia."""
        if self._snap is not None:
            return self._snap
        now = dt_util.now()
        today = now.date()
        meter_sum = self.ledger.summary(METER, today)
        sums = {key: self.ledger.summary(key, today) for key in self.consumers}
        unmon_sum = unmonitored(meter_sum, [sums[k] for k in self.top])

        def periods(summary: dict[str, dict[str, Any]]) -> dict[str, dict[str, float]]:
            return {name: {"k": round(summary[name]["k"], 3), "c": round(self.bill.cost(summary[name]["k"], summary[name]["e"]), 2)} for name in PERIODS}

        meter_w = self.power(METER)
        powers = {key: self.power(key) for key in self.consumers}
        unmon_w = None
        if meter_w is not None:
            unmon_w = max(meter_w - sum(w for k in self.top if (w := powers[k]) is not None), 0.0)
        b = band(now)
        contract = contract_power(self.options, b)
        # il resto di una linea che contiene altri consumatori: quello che misura meno la somma dei suoi figli
        rest: dict[str, dict[str, Any]] = {}
        for parent, kids in self.children.items():
            pw = powers[parent]
            rest[parent] = {
                "power": _r(None if pw is None else max(pw - sum(w for k in kids if (w := powers[k]) is not None), 0.0)),
                "periods": periods(unmonitored(sums[parent], [sums[k] for k in kids])),
            }
        peak = self.ledger.day(METER, today)
        bill: dict[str, Any] = {"enabled": self.bill.enabled}
        if self.bill.enabled:
            month, last_month, year, last_year = (meter_sum[p] for p in ("month", "last_month", "year", "last_year"))
            fraction = (now.hour * 3600 + now.minute * 60 + now.second) / 86400
            fk, fe = forecast_month(month["k"], month["e"], today, fraction)
            bill.update(
                month=self.bill.estimate(month["k"], month["e"]),
                last_month=self.bill.estimate(last_month["k"], last_month["e"]),
                year=self.bill.estimate(year["k"], year["e"], today.month),
                last_year=self.bill.estimate(last_year["k"], last_year["e"], 12),
                forecast=self.bill.estimate(fk, fe),
            )
        self._snap = {
            "now": now.isoformat(),
            "tariff": {"mode": self.tariff.mode, "band": b, "price": round(self.price(b), 5), "full_price": round(self.bill.cost(1.0, self.price(b)), 5)},
            "contract_kw": contract,
            "contract_base_kw": contract_power(self.options, 1),
            "contract_f3_kw": contract_power(self.options, 3),
            "available_kw": round(contract * OVERLOAD_AVAILABLE, 2),
            "overload": self.overload.level,
            "bill": bill,
            "peak": {"w": peak.get("p"), "at": peak.get("pt")},
            "sources": {
                METER: {"power": _r(meter_w), "periods": periods(meter_sum), "bands": {name: [round(x, 3) for x in meter_sum[name]["f"]] for name in LIVE_PERIODS + ("yesterday", "last_month")}},
                UNMONITORED: {"power": _r(unmon_w), "periods": periods(unmon_sum)},
                **{key: {"power": _r(powers[key]), "periods": periods(sums[key]), **({"rest": rest[key]} if key in rest else {})} for key in self.consumers},
            },
        }
        return self._snap

    def info(self) -> dict[str, Any]:
        """Tutto quello che serve alla scheda."""
        snap = self.snapshot()
        src = snap["sources"]
        return {
            "entry_id": self.entry.entry_id,
            "now": snap["now"],
            "tariff": snap["tariff"],
            "contract_kw": snap["contract_kw"],
            "contract_base_kw": snap["contract_base_kw"],
            "contract_f3_kw": snap["contract_f3_kw"],
            "available_kw": snap["available_kw"],
            "overload": snap["overload"],
            "bill": snap["bill"],
            "peak": snap["peak"],
            "meter": {"key": METER, "name": self.meter.name, "icon": self.meter.icon, "power_entities": list(self.meter.power_entities), "energy_entities": list(self.meter.energy_entities), **src[METER]},
            "unmonitored": {"key": UNMONITORED, **src[UNMONITORED]},
            "consumers": [
                {
                    "key": key,
                    "name": s.name,
                    "icon": s.icon,
                    "power_entity": s.power_entities[0] if s.power_entities else None,
                    "energy_entity": s.energy_entities[0] if s.energy_entities else None,
                    "parent": s.parent or None,
                    "in_meter": s.parent == METER or (s.parent in self.consumers and self.consumers[s.parent].parent == METER),
                    **src[key],
                }
                for key, s in self.consumers.items()
            ],
        }

    def stats(self, granularity: str, count: int) -> dict[str, Any]:
        """Serie per i grafici: kWh e costo di ogni sorgente, per giorno o per mese."""
        today = dt_util.now().date()
        if granularity == "month":
            labels = month_labels(today, count)
            raw = {key: self.ledger.series_months(key, today, count) for key in self.sources}
        else:
            labels = day_labels(today, count)
            raw = {key: self.ledger.series_days(key, today, count) for key in self.sources}
        series: dict[str, dict[str, list[float]]] = {
            key: {"k": [round(p["k"], 3) for p in points], "c": [round(self.bill.cost(p["k"], p["e"]), 2) for p in points]} for key, points in raw.items()
        }
        unmon_k, unmon_c = [], []
        inside = self.top
        for i in range(len(labels)):
            k = max(raw[METER][i]["k"] - sum(raw[c][i]["k"] for c in inside), 0.0)
            e = max(raw[METER][i]["e"] - sum(raw[c][i]["e"] for c in inside), 0.0)
            unmon_k.append(round(k, 3))
            unmon_c.append(round(self.bill.cost(k, e), 2))
        series[UNMONITORED] = {"k": unmon_k, "c": unmon_c}
        return {"granularity": granularity, "labels": labels, "series": series}


def _services(value: Any) -> list[str]:
    return [s for s in value or [] if isinstance(s, str) and s.startswith("notify.")]


def _r(value: float | None) -> float | None:
    return None if value is None else round(value, 1)


def _previous_month(today: date) -> str:
    return (today.replace(day=1) - timedelta(days=1)).strftime("%Y-%m")
