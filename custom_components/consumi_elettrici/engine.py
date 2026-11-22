"""Motore dei consumi elettrici: fasce orarie, tariffa, accumulo dell'energia, periodi, bolletta, report.

Nessuna dipendenza da Home Assistant: si prova da solo (tests/test_engine.py).
"""
from __future__ import annotations

from calendar import monthrange
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
import re
from typing import Any, Callable, Iterable

ENTITY_RE = re.compile(r"^[a-z_]+\.[a-z0-9_]+$")

METER = "_meter"                 # chiave del contatore generale
UNMONITORED = "_unmonitored"     # chiave (calcolata) della quota non monitorata

MAX_KW = 25.0                    # oltre questa potenza media un salto del contatore di energia è un errore di lettura
MAX_GAP = 600                    # secondi: oltre, la potenza non si integra (Home Assistant fermo)
MAX_CATCHUP = 6 * 3600           # secondi di fermo dell'integrazione oltre i quali i contatori ripartono da capo (ci pensa lo storico)
MAX_HOUR_KWH = 100.0             # un'ora di storico oltre questo valore si scarta

PERIODS = ("today", "yesterday", "week", "last_week", "month", "last_month", "year", "last_year")
LIVE_PERIODS = ("today", "week", "month", "year")
MONTHS_IT = ("gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre")

# ---------------------------------------------------------------------------------------- fasce orarie (ARERA 181/06)
_FIXED_HOLIDAYS = {(1, 1), (1, 6), (4, 25), (5, 1), (6, 2), (8, 15), (11, 1), (12, 8), (12, 25), (12, 26)}


def easter(year: int) -> date:
    """Domenica di Pasqua (calendario gregoriano)."""
    a, b, c = year % 19, year // 100, year % 100
    d, e = b // 4, b % 4
    g = (8 * b + 13) // 25
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 19 * l) // 433
    month = (h + l - 7 * m + 90) // 25
    day = (h + l - 7 * m + 33 * month + 19) % 32
    return date(year, month, day)


def is_holiday(d: date) -> bool:
    """Festività nazionali considerate dalle fasce (compreso il lunedì di Pasqua)."""
    return (d.month, d.day) in _FIXED_HOLIDAYS or d == easter(d.year) + timedelta(days=1)


def band(when: datetime) -> int:
    """Fascia 1, 2 o 3 dell'ora locale `when`.

    F1 lun-ven 8-19; F2 lun-ven 7-8 e 19-23, sabato 7-23; F3 notte 23-7, domeniche e festivi.
    """
    wd, h = when.weekday(), when.hour
    if wd == 6 or is_holiday(when.date()) or h >= 23 or h < 7:
        return 3
    if wd == 5:
        return 2
    return 1 if 8 <= h < 19 else 2


# ---------------------------------------------------------------------------------------- configurazione
def _entities(value: Any) -> tuple[str, ...]:
    if isinstance(value, str):
        value = [value]
    out: list[str] = []
    for v in value or ():
        v = str(v).strip()
        if ENTITY_RE.match(v) and v not in out:
            out.append(v)
    return tuple(out)


def _num(value: Any, default: float, lo: float = 0.0, hi: float = 1e9) -> float:
    try:
        v = float(value)
    except (TypeError, ValueError):
        return default
    return v if lo <= v <= hi else default


@dataclass(frozen=True)
class Source:
    """Qualcosa che consuma: il contatore generale o un consumatore."""

    key: str
    name: str
    icon: str = "mdi:power-plug"
    power_entities: tuple[str, ...] = ()
    energy_entities: tuple[str, ...] = ()
    in_meter: bool = True

    @property
    def from_power(self) -> bool:
        """Senza un contatore di energia, l'energia si ricava dalla potenza."""
        return not self.energy_entities and bool(self.power_entities)

    @property
    def signature(self) -> str:
        return "|".join(self.energy_entities)


def parse_consumer(key: str, data: dict[str, Any]) -> Source | None:
    power = _entities(data.get("power_entity"))[:1]
    energy = _entities(data.get("energy_entity"))[:1]
    name = str(data.get("name") or "").strip()
    if not name or not (power or energy):
        return None
    icon = str(data.get("icon") or "").strip() or "mdi:power-plug"
    return Source(key, name, icon, power, energy, bool(data.get("in_meter", True)))


def parse_meter(options: dict[str, Any]) -> Source:
    return Source(METER, "Contatore", "mdi:meter-electric", _entities(options.get("meter_power")), _entities(options.get("meter_energy")))


@dataclass(frozen=True)
class Tariff:
    mode: str = "fixed"                                     # fixed | entity | bands
    price: float = 0.25
    price_entity: str = ""
    band_prices: tuple[float, float, float] = (0.25, 0.25, 0.25)
    band_entities: tuple[str, str, str] = ("", "", "")

    @property
    def entities(self) -> tuple[str, ...]:
        if self.mode == "entity":
            return (self.price_entity,) if self.price_entity else ()
        if self.mode == "bands":
            return tuple(e for e in self.band_entities if e)
        return ()

    def current(self, band_no: int, lookup: Callable[[str], float | None]) -> float:
        """Prezzo (EUR/kWh) nella fascia indicata; `lookup` legge il prezzo da un'entità (None se non valido)."""
        if self.mode == "entity":
            v = lookup(self.price_entity) if self.price_entity else None
            return v if v is not None else self.price
        if self.mode == "bands":
            ent = self.band_entities[band_no - 1]
            v = lookup(ent) if ent else None
            return v if v is not None else self.band_prices[band_no - 1]
        return self.price


def parse_tariff(options: dict[str, Any]) -> Tariff:
    mode = options.get("tariff_mode")
    if mode not in ("fixed", "entity", "bands"):
        mode = "fixed"
    price = _num(options.get("price"), 0.25, 0, 5)

    def _ent(name: str) -> str:
        return (_entities(options.get(name)) or ("",))[0]

    return Tariff(
        mode,
        price,
        _ent("price_entity"),
        tuple(_num(options.get(f"price_f{i}"), price, 0, 5) for i in (1, 2, 3)),  # type: ignore[arg-type]
        (_ent("entity_f1"), _ent("entity_f2"), _ent("entity_f3")),
    )


@dataclass(frozen=True)
class Bill:
    """Voci della bolletta oltre al prezzo dell'energia."""

    enabled: bool = False
    full_cost: bool = True            # i costi comprendono trasporto, oneri, accise e IVA
    energy_fixed_year: float = 0.0    # quota fissa materia energia, EUR/anno
    transport_fixed_year: float = 0.0  # quota fissa trasporto, EUR/anno
    transport_power_year: float = 0.0  # quota potenza, EUR/kW/anno
    transport_kwh: float = 0.0
    charges_kwh: float = 0.0          # oneri di sistema
    excise_kwh: float = 0.0           # accise
    vat: float = 10.0                 # IVA, %
    contract_kw: float = 3.0

    def cost(self, kwh: float, energy_eur: float) -> float:
        """Costo di un consumo: solo energia, oppure con le quote variabili e l'IVA."""
        if not (self.enabled and self.full_cost):
            return energy_eur
        return (energy_eur + kwh * (self.transport_kwh + self.charges_kwh + self.excise_kwh)) * (1 + self.vat / 100)

    def estimate(self, kwh: float, energy_eur: float, months: float = 1.0) -> dict[str, float]:
        """Bolletta stimata di un periodo lungo `months` mesi (le quote fisse sono annue)."""
        share = months / 12
        energia = energy_eur + self.energy_fixed_year * share
        trasporto = kwh * self.transport_kwh + (self.transport_fixed_year + self.transport_power_year * self.contract_kw) * share
        oneri = kwh * self.charges_kwh
        accise = kwh * self.excise_kwh
        iva = (energia + trasporto + oneri + accise) * self.vat / 100
        return {
            "kwh": round(kwh, 3),
            "energia": round(energia, 2),
            "trasporto": round(trasporto, 2),
            "oneri": round(oneri, 2),
            "accise": round(accise, 2),
            "iva": round(iva, 2),
            "totale": round(energia + trasporto + oneri + accise + iva, 2),
        }


def parse_bill(options: dict[str, Any]) -> Bill:
    return Bill(
        enabled=bool(options.get("bill_enabled", False)),
        full_cost=bool(options.get("full_cost", True)),
        energy_fixed_year=_num(options.get("energy_fixed_year"), 0.0, 0, 10000),
        transport_fixed_year=_num(options.get("transport_fixed_year"), 0.0, 0, 10000),
        transport_power_year=_num(options.get("transport_power_year"), 0.0, 0, 10000),
        transport_kwh=_num(options.get("transport_kwh"), 0.0, 0, 5),
        charges_kwh=_num(options.get("charges_kwh"), 0.0, 0, 5),
        excise_kwh=_num(options.get("excise_kwh"), 0.0, 0, 5),
        vat=_num(options.get("vat"), 10.0, 0, 100),
        contract_kw=_num(options.get("contract_kw"), 3.0, 0.5, 1000),
    )


# ---------------------------------------------------------------------------------------- letture
def to_kwh(value: float, unit: str | None) -> float:
    u = (unit or "kWh").strip().lower()
    if u == "wh":
        return value / 1000
    if u == "mwh":
        return value * 1000
    return value


def to_watt(value: float, unit: str | None) -> float:
    u = (unit or "W").strip().lower()
    if u == "kw":
        return value * 1000
    if u == "mw":
        return value * 1_000_000
    return value


@dataclass
class EnergyReading:
    """Ultima lettura di un contatore di energia (kWh) e quando è arrivata."""

    last: float | None = None
    ts: float | None = None

    def delta(self, value: float, ts: float) -> float:
        """kWh consumati dall'ultima lettura. Gestisce azzeramenti, oscillazioni e letture impossibili."""
        last, last_ts = self.last, self.ts
        if last is None or last_ts is None:
            self.last, self.ts = value, ts
            return 0.0
        if value < last:
            if value > last * 0.9:
                return 0.0                      # oscillazione: la base non scende
            delta = value                       # contatore ripartito da zero
        else:
            delta = value - last
        gap = ts - last_ts
        self.last, self.ts = value, ts
        if delta > MAX_KW * max(gap, 60) / 3600 + 0.05:
            return 0.0
        return delta


@dataclass
class PowerHold:
    """Ultima potenza nota (W): l'energia si integra tenendola costante fino alla lettura successiva."""

    w: float | None = None
    ts: float | None = None

    def delta(self, w: float | None, ts: float) -> float:
        """kWh dell'intervallo appena chiuso; poi la potenza diventa `w` (None = sensore non disponibile)."""
        prev_w, prev_ts = self.w, self.ts
        self.w, self.ts = w, ts
        if prev_w is None or prev_ts is None:
            return 0.0
        gap = ts - prev_ts
        if gap <= 0 or gap > MAX_GAP:
            return 0.0
        return max(prev_w, 0.0) * gap / 3_600_000


# ---------------------------------------------------------------------------------------- periodi
def period_ranges(today: date) -> dict[str, tuple[date, date]]:
    """Primo e ultimo giorno (compresi) di ogni periodo."""
    yesterday = today - timedelta(days=1)
    week = today - timedelta(days=today.weekday())
    month = today.replace(day=1)
    last_month_end = month - timedelta(days=1)
    return {
        "today": (today, today),
        "yesterday": (yesterday, yesterday),
        "week": (week, today),
        "last_week": (week - timedelta(days=7), week - timedelta(days=1)),
        "month": (month, today),
        "last_month": (last_month_end.replace(day=1), last_month_end),
        "year": (date(today.year, 1, 1), today),
        "last_year": (date(today.year - 1, 1, 1), date(today.year - 1, 12, 31)),
    }


def _empty() -> dict[str, Any]:
    return {"k": 0.0, "e": 0.0, "f": [0.0, 0.0, 0.0]}


class Ledger:
    """Registro giornaliero: per ogni sorgente e giorno kWh (k), EUR di energia (e), kWh per fascia (f), picco (p, pt).

    I giorni più vecchi dell'anno scorso si riassumono per mese.
    """

    def __init__(self, data: dict[str, Any] | None = None) -> None:
        data = data or {}
        self.days: dict[str, dict[str, dict[str, Any]]] = data.get("days") or {}
        self.months: dict[str, dict[str, dict[str, Any]]] = data.get("months") or {}
        self._version = 0
        self._cache: dict[str, tuple[str, int, dict[str, dict[str, Any]]]] = {}
        self._cache_day = ""

    def to_dict(self) -> dict[str, Any]:
        return {"days": self.days, "months": self.months}

    # -- scrittura
    def _bucket(self, key: str, iso: str) -> dict[str, Any]:
        days = self.days.setdefault(key, {})
        b = days.get(iso)
        if b is None:
            b = days[iso] = {"k": 0.0, "e": 0.0}
        return b

    def add(self, key: str, day: date, kwh: float, eur: float, band_no: int | None = None) -> None:
        if kwh <= 0:
            return
        iso = day.isoformat()
        b = self._bucket(key, iso)
        b["k"] = round(b["k"] + kwh, 6)
        b["e"] = round(b["e"] + eur, 6)
        b.pop("i", None)
        if band_no:
            f = b.setdefault("f", [0.0, 0.0, 0.0])
            f[band_no - 1] = round(f[band_no - 1] + kwh, 6)
        if iso != self._cache_day:
            self._version += 1

    def peak(self, key: str, day: date, watt: float, hhmm: str) -> None:
        b = self._bucket(key, day.isoformat())
        if watt > b.get("p", 0):
            b["p"] = round(watt, 1)
            b["pt"] = hhmm

    def set_imported(self, key: str, day: date, kwh: float, eur: float, bands: list[float] | None, today: date) -> bool:
        """Scrive un giorno preso dallo storico: mai sopra un giorno misurato; oggi solo se lo storico ne sa di più."""
        iso = day.isoformat()
        existing = self.days.get(key, {}).get(iso)
        if day == today:
            if existing is not None and existing["k"] >= kwh:
                return False
            b = self._bucket(key, iso)
            b["k"], b["e"] = round(kwh, 6), round(eur, 6)
            if bands:
                b["f"] = [round(x, 6) for x in bands]
            return True
        if existing is not None and not existing.get("i"):
            return False
        b = {"k": round(kwh, 6), "e": round(eur, 6), "i": 1}
        if bands:
            b["f"] = [round(x, 6) for x in bands]
        self.days.setdefault(key, {})[iso] = b
        self._version += 1
        return True

    def remove(self, key: str) -> None:
        self.days.pop(key, None)
        self.months.pop(key, None)
        self._cache.pop(key, None)

    def keys(self) -> set[str]:
        return set(self.days) | set(self.months)

    def compact(self, today: date) -> None:
        """I giorni precedenti il primo gennaio dell'anno scorso confluiscono nei mesi."""
        limit = date(today.year - 1, 1, 1).isoformat()
        for key, days in self.days.items():
            old = [iso for iso in days if iso < limit]
            for iso in old:
                b = days.pop(iso)
                m = self.months.setdefault(key, {}).setdefault(iso[:7], {"k": 0.0, "e": 0.0})
                m["k"] = round(m["k"] + b["k"], 6)
                m["e"] = round(m["e"] + b["e"], 6)
                if "f" in b:
                    f = m.setdefault("f", [0.0, 0.0, 0.0])
                    for i in range(3):
                        f[i] = round(f[i] + b["f"][i], 6)
            if old:
                self._version += 1

    # -- lettura
    def day(self, key: str, day: date) -> dict[str, Any]:
        return self.days.get(key, {}).get(day.isoformat()) or {"k": 0.0, "e": 0.0}

    def total(self, key: str, start: date, end: date) -> dict[str, Any]:
        """Somma di un intervallo qualsiasi di giorni (estremi compresi)."""
        a, b = start.isoformat(), end.isoformat()
        out = _empty()
        for iso, d in self.days.get(key, {}).items():
            if a <= iso <= b:
                out["k"] += d["k"]
                out["e"] += d["e"]
                if "f" in d:
                    for i in range(3):
                        out["f"][i] += d["f"][i]
        return out

    def _base(self, key: str, today: date) -> dict[str, dict[str, Any]]:
        """Somme di ogni periodo senza il giorno di oggi (che cambia di continuo)."""
        iso_today = today.isoformat()
        if iso_today != self._cache_day:
            self._cache_day = iso_today
            self._cache.clear()
        cached = self._cache.get(key)
        if cached and cached[0] == iso_today and cached[1] == self._version:
            return cached[2]
        ranges = {name: (a.isoformat(), b.isoformat()) for name, (a, b) in period_ranges(today).items()}
        base = {name: _empty() for name in PERIODS}
        for iso, b in self.days.get(key, {}).items():
            if iso == iso_today:
                continue
            for name, (start, end) in ranges.items():
                if start <= iso <= end:
                    t = base[name]
                    t["k"] += b["k"]
                    t["e"] += b["e"]
                    if "f" in b:
                        for i in range(3):
                            t["f"][i] += b["f"][i]
        self._cache[key] = (iso_today, self._version, base)
        return base

    def summary(self, key: str, today: date) -> dict[str, dict[str, Any]]:
        """kWh, EUR e fasce di ogni periodo."""
        base = self._base(key, today)
        now = self.days.get(key, {}).get(today.isoformat())
        out: dict[str, dict[str, Any]] = {}
        for name in PERIODS:
            t = base[name]
            k, e, f = t["k"], t["e"], list(t["f"])
            if now and name in LIVE_PERIODS:
                k += now["k"]
                e += now["e"]
                if "f" in now:
                    f = [f[i] + now["f"][i] for i in range(3)]
            out[name] = {"k": k, "e": e, "f": f}
        return out

    def series_days(self, key: str, today: date, count: int) -> list[dict[str, Any]]:
        days = self.days.get(key, {})
        out = []
        for n in range(count - 1, -1, -1):
            iso = (today - timedelta(days=n)).isoformat()
            b = days.get(iso) or {}
            out.append({"k": b.get("k", 0.0), "e": b.get("e", 0.0)})
        return out

    def series_months(self, key: str, today: date, count: int) -> list[dict[str, Any]]:
        totals: dict[str, list[float]] = {}
        for ym, m in self.months.get(key, {}).items():
            totals[ym] = [m["k"], m["e"]]
        for iso, b in self.days.get(key, {}).items():
            t = totals.setdefault(iso[:7], [0.0, 0.0])
            t[0] += b["k"]
            t[1] += b["e"]
        out = []
        for ym in month_labels(today, count):
            t = totals.get(ym, [0.0, 0.0])
            out.append({"k": t[0], "e": t[1]})
        return out


def day_labels(today: date, count: int) -> list[str]:
    return [(today - timedelta(days=n)).isoformat() for n in range(count - 1, -1, -1)]


def month_labels(today: date, count: int) -> list[str]:
    out = []
    y, m = today.year, today.month
    for _ in range(count):
        out.append(f"{y:04d}-{m:02d}")
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    return out[::-1]


def unmonitored(meter: dict[str, dict[str, Any]], consumers: Iterable[dict[str, dict[str, Any]]]) -> dict[str, dict[str, Any]]:
    """Quota non monitorata di ogni periodo: contatore meno la somma dei consumatori (mai negativa)."""
    consumers = list(consumers)
    out: dict[str, dict[str, Any]] = {}
    for name in PERIODS:
        k = meter[name]["k"] - sum(c[name]["k"] for c in consumers)
        e = meter[name]["e"] - sum(c[name]["e"] for c in consumers)
        out[name] = {"k": max(k, 0.0), "e": max(e, 0.0), "f": [0.0, 0.0, 0.0]}
    return out


def forecast_month(kwh: float, eur: float, today: date, day_fraction: float) -> tuple[float, float]:
    """Proiezione a fine mese di kWh ed EUR, dal ritmo tenuto finora (`day_fraction` = parte trascorsa di oggi)."""
    elapsed = today.day - 1 + min(max(day_fraction, 0.0), 1.0)
    if elapsed < 0.5:
        return kwh, eur
    factor = monthrange(today.year, today.month)[1] / elapsed
    return kwh * factor, eur * factor


# ---------------------------------------------------------------------------------------- sovraccarico
OVERLOAD_AVAILABLE = 1.10     # potenza disponibile: il 10% oltre quella impegnata, senza limiti di tempo
OVERLOAD_CRITICAL = 1.33      # oltre, il contatore stacca in un paio di minuti
OVERLOAD_CRITICAL_SECONDS = 20
OVERLOAD_CLEAR_SECONDS = 60


@dataclass
class Overload:
    """Livello di sovraccarico: 0 nessuno, 1 oltre la potenza disponibile, 2 distacco imminente."""

    level: int = 0
    _warn_since: float | None = field(default=None, repr=False)
    _crit_since: float | None = field(default=None, repr=False)
    _ok_since: float | None = field(default=None, repr=False)

    def update(self, watt: float | None, contract_kw: float, ts: float, minutes: float) -> int | None:
        """Aggiorna il livello; restituisce il nuovo livello quando sale (momento di avvisare)."""
        if watt is None or contract_kw <= 0:
            return None
        base = contract_kw * 1000
        warn, crit = base * OVERLOAD_AVAILABLE, base * OVERLOAD_CRITICAL
        if watt > warn:
            self._ok_since = None
            if self._warn_since is None:
                self._warn_since = ts
        else:
            self._warn_since = None
            if self.level:
                if self._ok_since is None:
                    self._ok_since = ts
                elif ts - self._ok_since >= OVERLOAD_CLEAR_SECONDS:
                    self.level = 0
                    self._ok_since = None
        if watt > crit:
            if self._crit_since is None:
                self._crit_since = ts
        else:
            self._crit_since = None
        target = self.level
        if self._crit_since is not None and ts - self._crit_since >= OVERLOAD_CRITICAL_SECONDS:
            target = 2
        elif self._warn_since is not None and ts - self._warn_since >= minutes * 60:
            target = max(target, 1)
        if target > self.level:
            self.level = target
            return target
        return None


# ---------------------------------------------------------------------------------------- testi
def fmt(value: float, decimals: int = 1) -> str:
    """Numero all'italiana: virgola decimale."""
    return f"{value:.{decimals}f}".replace(".", ",")


def overload_message(level: int, watt: float, contract_kw: float, top: list[tuple[str, float]]) -> tuple[str, str]:
    title = "Distacco del contatore imminente" if level >= 2 else "Potenza oltre il limite"
    lines = [f"Stai prelevando {fmt(watt / 1000, 2)} kW su {fmt(contract_kw, 1)} kW di contratto."]
    lines.append("Il contatore può staccare entro un paio di minuti: spegni qualcosa." if level >= 2 else "Oltre questa soglia il contatore stacca dopo qualche ora, o subito se il prelievo sale ancora.")
    if top:
        lines.append("In funzione: " + ", ".join(f"{name} {fmt(w / 1000, 2)} kW" if w >= 1000 else f"{name} {round(w)} W" for name, w in top))
    return title, "\n".join(lines)


def monthly_report(
    month: date,
    kwh: float,
    previous_kwh: float,
    cost: float,
    bill: dict[str, float] | None,
    bands: list[float],
    ranking: list[tuple[str, float, float]],
    unmonitored_kwh: float,
) -> tuple[str, str]:
    """Titolo e testo del report di un mese chiuso. `ranking` = (nome, kWh, EUR) in ordine di consumo."""
    name = f"{MONTHS_IT[month.month - 1]} {month.year}"
    title = f"Consumi di {name}"
    first = f"Hai consumato {fmt(kwh)} kWh"
    if previous_kwh > 0:
        change = (kwh - previous_kwh) / previous_kwh * 100
        first += f" ({'+' if change >= 0 else ''}{fmt(change, 0)}% sul mese prima)"
    lines = [first + "."]
    if bill:
        lines.append(f"Bolletta stimata: {fmt(bill['totale'], 2)} €")
        lines.append(f"  energia {fmt(bill['energia'], 2)} € · trasporto {fmt(bill['trasporto'], 2)} € · oneri {fmt(bill['oneri'], 2)} € · accise e IVA {fmt(bill['accise'] + bill['iva'], 2)} €")
    else:
        lines.append(f"Costo: {fmt(cost, 2)} €")
    if sum(bands) > 0:
        lines.append(f"Fasce: F1 {fmt(bands[0], 0)} · F2 {fmt(bands[1], 0)} · F3 {fmt(bands[2], 0)} kWh")
    if ranking:
        lines.append("Chi ha consumato di più:")
        for i, (who, k, eur) in enumerate(ranking[:5], 1):
            share = f" ({fmt(k / kwh * 100, 0)}%)" if kwh > 0 else ""
            lines.append(f"{i}. {who}: {fmt(k)} kWh{share}, {fmt(eur, 2)} €")
    if kwh > 0 and unmonitored_kwh > 0:
        lines.append(f"Non monitorato: {fmt(unmonitored_kwh)} kWh ({fmt(unmonitored_kwh / kwh * 100, 0)}%)")
    return title, "\n".join(lines)
