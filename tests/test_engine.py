"""Prove del motore (senza Home Assistant)."""
from datetime import date, datetime
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "custom_components" / "consumi_elettrici"))

import engine as e  # noqa: E402


# ------------------------------------------------------------------ fasce
@pytest.mark.parametrize(("year", "month", "day"), [(2024, 3, 31), (2025, 4, 20), (2026, 4, 5), (2027, 3, 28), (2030, 4, 21), (2038, 4, 25)])
def test_easter(year, month, day):
    assert e.easter(year) == date(year, month, day)


def test_holidays():
    assert e.is_holiday(date(2026, 4, 6))        # lunedì di Pasqua
    assert e.is_holiday(date(2026, 12, 8))
    assert e.is_holiday(date(2026, 8, 15))
    assert not e.is_holiday(date(2026, 4, 7))
    assert not e.is_holiday(date(2026, 12, 24))


@pytest.mark.parametrize(
    ("when", "expected"),
    [
        (datetime(2026, 11, 23, 10, 0), 1),    # lunedì mattina
        (datetime(2026, 11, 23, 8, 0), 1),
        (datetime(2026, 11, 23, 18, 59), 1),
        (datetime(2026, 11, 23, 7, 30), 2),
        (datetime(2026, 11, 23, 19, 0), 2),
        (datetime(2026, 11, 23, 22, 59), 2),
        (datetime(2026, 11, 23, 23, 0), 3),
        (datetime(2026, 11, 23, 6, 59), 3),
        (datetime(2026, 11, 28, 12, 0), 2),    # sabato
        (datetime(2026, 11, 28, 23, 30), 3),
        (datetime(2026, 11, 29, 12, 0), 3),    # domenica
        (datetime(2026, 12, 8, 10, 0), 3),     # festivo di martedì
        (datetime(2026, 4, 6, 10, 0), 3),      # lunedì di Pasqua
        (datetime(2026, 12, 26, 10, 0), 3),    # festivo di sabato
    ],
)
def test_band(when, expected):
    assert e.band(when) == expected


# ------------------------------------------------------------------ letture
def test_energy_reading_counts_increments():
    r = e.EnergyReading()
    assert r.delta(100.0, 0) == 0            # la prima lettura fa solo da base
    assert r.delta(100.2, 60) == pytest.approx(0.2)
    assert r.delta(100.2, 120) == 0
    assert r.delta(100.5, 180) == pytest.approx(0.3)


def test_energy_reading_ignores_small_decrease_without_lowering_the_base():
    r = e.EnergyReading(100.0, 0)
    assert r.delta(99.99, 60) == 0
    assert r.delta(100.2, 120) == pytest.approx(0.2)


def test_energy_reading_handles_counter_restart():
    r = e.EnergyReading(11.26, 0)             # energia di una sessione di ricarica
    assert r.delta(0.0, 600) == 0
    assert r.delta(0.4, 900) == pytest.approx(0.4)
    r = e.EnergyReading(11.26, 0)
    assert r.delta(0.3, 600) == pytest.approx(0.3)   # ripartito e già salito


def test_energy_reading_discards_impossible_jumps():
    r = e.EnergyReading(1256.89, 0)
    assert r.delta(0.0, 60) == 0              # il sensore per un attimo dice zero
    assert r.delta(1256.95, 120) == 0         # e poi torna al valore vero: non sono 1256 kWh consumati
    assert r.delta(1257.0, 180) == pytest.approx(0.05)
    r = e.EnergyReading(10.0, 0)
    assert r.delta(845000.0, 60) == 0         # picco di una presa
    assert r.delta(845000.1, 120) == pytest.approx(0.1)


def test_energy_reading_after_a_long_idle():
    r = e.EnergyReading(100.0, 0)
    assert r.delta(101.5, 10 * 3600) == pytest.approx(1.5)     # fermo da dieci ore, poi riparte: è un consumo vero


def test_power_hold_integrates_the_previous_value():
    h = e.PowerHold()
    assert h.delta(1000.0, 0) == 0
    assert h.delta(2000.0, 360) == pytest.approx(0.1)          # 1000 W per sei minuti
    assert h.delta(2000.0, 540) == pytest.approx(0.1)          # 2000 W per tre minuti
    assert h.delta(None, 600) == pytest.approx(2000 * 60 / 3_600_000)
    assert h.delta(500.0, 660) == 0                            # era non disponibile
    assert h.delta(500.0, 660 + e.MAX_GAP + 1) == 0            # buco troppo lungo
    assert h.delta(-300.0, 720 + e.MAX_GAP + 1) == pytest.approx(500 * 60 / 3_600_000)
    assert h.delta(0.0, 780 + e.MAX_GAP + 1) == 0              # la potenza negativa non è un consumo


def test_units():
    assert e.to_kwh(1500, "Wh") == 1.5
    assert e.to_kwh(2, "MWh") == 2000
    assert e.to_kwh(3, "kWh") == 3
    assert e.to_watt(1.5, "kW") == 1500
    assert e.to_watt(7, None) == 7


# ------------------------------------------------------------------ registro
TODAY = date(2030, 10, 23)   # mercoledì


def _ledger():
    led = e.Ledger()
    led.add("a", date(2029, 6, 1), 10, 2)            # anno scorso
    led.add("a", date(2030, 1, 5), 20, 4)            # quest'anno
    led.add("a", date(2030, 9, 30), 5, 1)            # mese scorso
    led.add("a", date(2030, 10, 1), 3, 0.6)          # questo mese
    led.add("a", date(2030, 10, 14), 4, 0.8)         # settimana scorsa (lun 14 - dom 20)
    led.add("a", date(2030, 10, 21), 1, 0.2)         # lunedì di questa settimana
    led.add("a", date(2030, 10, 22), 2, 0.4)         # ieri
    led.add("a", TODAY, 0.5, 0.1)
    return led


def test_summary_periods():
    s = _ledger().summary("a", TODAY)
    assert s["today"]["k"] == pytest.approx(0.5)
    assert s["yesterday"]["k"] == pytest.approx(2)
    assert s["week"]["k"] == pytest.approx(3.5)
    assert s["last_week"]["k"] == pytest.approx(4)
    assert s["month"]["k"] == pytest.approx(10.5)
    assert s["last_month"]["k"] == pytest.approx(5)
    assert s["year"]["k"] == pytest.approx(35.5)
    assert s["last_year"]["k"] == pytest.approx(10)
    assert s["year"]["e"] == pytest.approx(7.1)


def test_summary_follows_new_readings_and_the_day_change():
    led = _ledger()
    assert led.summary("a", TODAY)["today"]["k"] == pytest.approx(0.5)
    led.add("a", TODAY, 0.25, 0.05)
    assert led.summary("a", TODAY)["week"]["k"] == pytest.approx(3.75)
    led.add("a", date(2030, 10, 22), 1, 0.2)                     # arriva in ritardo un consumo di ieri
    assert led.summary("a", TODAY)["yesterday"]["k"] == pytest.approx(3)
    tomorrow = date(2030, 10, 24)
    s = led.summary("a", tomorrow)
    assert s["today"]["k"] == 0
    assert s["yesterday"]["k"] == pytest.approx(0.75)
    assert s["week"]["k"] == pytest.approx(4.75)


def test_bands_and_peak():
    led = e.Ledger()
    led.add(e.METER, TODAY, 1, 0.2, 1)
    led.add(e.METER, TODAY, 2, 0.4, 3)
    led.peak(e.METER, TODAY, 3200, "12:30")
    led.peak(e.METER, TODAY, 2100, "13:00")
    assert led.summary(e.METER, TODAY)["today"]["f"] == [1, 0, 2]
    assert led.day(e.METER, TODAY)["p"] == 3200
    assert led.day(e.METER, TODAY)["pt"] == "12:30"


def test_imported_days_never_replace_measured_ones():
    led = e.Ledger()
    led.add("a", date(2030, 10, 20), 2, 0.4)
    assert not led.set_imported("a", date(2030, 10, 20), 9, 1.8, None, TODAY)
    assert led.set_imported("a", date(2030, 10, 19), 3, 0.6, None, TODAY)
    assert led.set_imported("a", date(2030, 10, 19), 3.5, 0.7, None, TODAY)        # un giorno importato si aggiorna
    assert led.day("a", date(2030, 10, 19))["k"] == 3.5
    led.add("a", TODAY, 1.0, 0.2)
    assert not led.set_imported("a", TODAY, 0.8, 0.16, None, TODAY)                # oggi: lo storico ne sa meno
    assert led.set_imported("a", TODAY, 1.4, 0.28, None, TODAY)                    # oggi: lo storico ne sa di più
    led.add("a", TODAY, 0.1, 0.02)
    assert led.summary("a", TODAY)["week"]["k"] == pytest.approx(1.5)
    assert led.summary("a", TODAY)["month"]["k"] == pytest.approx(7.0)


def test_compact_moves_old_days_into_months():
    led = e.Ledger()
    led.add(e.METER, date(2028, 3, 1), 1, 0.2, 1)
    led.add(e.METER, date(2028, 3, 2), 2, 0.4, 2)
    led.add(e.METER, date(2029, 1, 1), 5, 1.0, 3)
    led.compact(TODAY)
    assert "2028-03-01" not in led.days[e.METER]
    assert led.months[e.METER]["2028-03"] == {"k": 3, "e": pytest.approx(0.6), "f": [1, 2, 0]}
    assert led.summary(e.METER, TODAY)["last_year"]["k"] == 5
    months = led.series_months(e.METER, TODAY, 32)
    assert e.month_labels(TODAY, 32)[0] == "2028-03"
    assert months[0]["k"] == 3
    led2 = e.Ledger(led.to_dict())
    assert led2.summary(e.METER, TODAY)["last_year"]["k"] == 5


def test_series_and_total():
    led = _ledger()
    assert e.day_labels(TODAY, 3) == ["2030-10-21", "2030-10-22", "2030-10-23"]
    assert [p["k"] for p in led.series_days("a", TODAY, 3)] == [1, 2, 0.5]
    assert e.month_labels(TODAY, 3) == ["2030-08", "2030-09", "2030-10"]
    assert [p["k"] for p in led.series_months("a", TODAY, 3)] == [0, 5, pytest.approx(10.5)]
    assert led.total("a", date(2030, 9, 1), date(2030, 9, 30))["k"] == 5


def test_unmonitored_is_never_negative():
    meter = {p: {"k": 10.0, "e": 2.0, "f": [0, 0, 0]} for p in e.PERIODS}
    a = {p: {"k": 4.0, "e": 0.8, "f": [0, 0, 0]} for p in e.PERIODS}
    b = {p: {"k": 3.0, "e": 0.6, "f": [0, 0, 0]} for p in e.PERIODS}
    assert e.unmonitored(meter, [a, b])["today"]["k"] == pytest.approx(3)
    assert e.unmonitored(meter, [a, b])["today"]["e"] == pytest.approx(0.6)
    assert e.unmonitored(meter, [a, b, a])["month"]["k"] == 0


def test_remove_source():
    led = _ledger()
    led.remove("a")
    assert led.summary("a", TODAY)["year"]["k"] == 0
    assert led.keys() == set()


# ------------------------------------------------------------------ tariffa e bolletta
def test_tariff_modes():
    prices = {"sensor.p": 0.099, "sensor.f3": 0.08, "sensor.bad": None}
    lookup = prices.get
    assert e.parse_tariff({"price": 0.3}).current(1, lookup) == 0.3
    t = e.parse_tariff({"tariff_mode": "entity", "price": 0.3, "price_entity": "sensor.p"})
    assert t.current(2, lookup) == 0.099
    assert t.entities == ("sensor.p",)
    assert e.parse_tariff({"tariff_mode": "entity", "price": 0.3, "price_entity": "sensor.bad"}).current(2, lookup) == 0.3
    t = e.parse_tariff({"tariff_mode": "bands", "price_f1": 0.2, "price_f2": 0.15, "price_f3": 0.1, "entity_f3": "sensor.f3"})
    assert [t.current(b, lookup) for b in (1, 2, 3)] == [0.2, 0.15, 0.08]
    assert e.parse_tariff({"tariff_mode": "boh"}).mode == "fixed"


def test_bill_matches_the_old_package_formula():
    # valori del pacchetto sostituito: 856,79 kWh nel mese a 0,103 EUR/kWh
    bill = e.parse_bill(
        {"bill_enabled": True, "energy_fixed_year": 76.20, "transport_fixed_year": 20.52, "transport_power_year": 21.24, "transport_kwh": 0.008890,
         "charges_kwh": 0.0424393, "excise_kwh": 0.0227, "vat": 10, "contract_kw": 3}
    )
    out = bill.estimate(856.79, 856.79 * 0.103)
    assert out["energia"] == pytest.approx(88.25 + 6.35, abs=0.01)
    assert out["trasporto"] == pytest.approx(7.62 + 1.71 + 5.31, abs=0.01)
    assert out["oneri"] == pytest.approx(36.36, abs=0.01)
    assert out["totale"] == pytest.approx(181.55, abs=0.02)          # sensor.bolletta_tot del pacchetto
    # costo pieno di un consumo: quote variabili e IVA, senza quote fisse
    assert bill.cost(10, 1.03) == pytest.approx((1.03 + 10 * (0.008890 + 0.0424393 + 0.0227)) * 1.1)


def test_bill_reproduces_a_real_bill():
    # bolletta di agosto 2026: 635 kWh, prezzo con perdite 0,099, dispacciamento 0,018468, sconto mensile di 7,80
    bill = e.parse_bill(
        {"bill_enabled": True, "energy_fixed_year": 72.08, "energy_extra_kwh": 0.018468, "transport_fixed_year": 23.04, "transport_power_year": 23.72,
         "transport_kwh": 0.01473, "charges_kwh": 0.033153, "excise_kwh": 0.0227, "vat": 10, "other_month": -7.80, "contract_kw": 3}
    )
    out = bill.estimate(635, 635 * 0.099)
    assert out["energia"] == pytest.approx(80.65, abs=0.06)
    assert out["trasporto"] == pytest.approx(17.20, abs=0.01)
    assert out["oneri"] == pytest.approx(21.05, abs=0.01)
    assert out["accise"] == pytest.approx(14.42, abs=0.01)
    assert out["altro"] == -7.80
    assert out["iva"] == pytest.approx(12.55, abs=0.01)
    assert out["totale"] == pytest.approx(138.07, abs=0.06)
    # un kWh in più costa: energia, dispacciamento, trasporto, oneri, accise, più IVA
    assert bill.cost(1, 0.099) == pytest.approx(0.2069, abs=0.0001)


def test_cost_is_energy_only_when_bill_is_off():
    assert e.parse_bill({}).cost(10, 2.5) == 2.5
    assert e.parse_bill({"bill_enabled": True, "full_cost": False, "transport_kwh": 0.1}).cost(10, 2.5) == 2.5


def test_forecast():
    k, eur = e.forecast_month(100, 20, date(2030, 10, 11), 0.0)      # dieci giorni trascorsi su 31
    assert k == pytest.approx(310)
    assert eur == pytest.approx(62)
    assert e.forecast_month(1, 0.2, date(2030, 10, 1), 0.1) == (1, 0.2)   # troppo presto per proiettare


# ------------------------------------------------------------------ configurazione
def test_parse_consumer():
    c = e.parse_consumer("x", {"name": " Lavatrice ", "icon": "mdi:washing-machine", "power_entity": "sensor.lav_power", "energy_entity": ""})
    assert c.name == "Lavatrice" and c.from_power and c.parent == e.METER
    assert e.parse_consumer("x", {"name": "Solo nome"}) is None
    assert e.parse_consumer("x", {"name": "", "power_entity": "sensor.a"}) is None
    c = e.parse_consumer("x", {"name": "Wallbox", "energy_entity": "sensor.wb_energy", "power_entity": "non valido", "parent": "_none"})
    assert c.power_entities == () and not c.from_power and c.parent == "" and c.icon == "mdi:power-plug"
    assert e.parse_consumer("x", {"name": "Forno", "power_entity": "sensor.f", "parent": "app"}).parent == "app"


def test_link_consumers_keeps_one_level():
    mk = lambda key, parent: e.parse_consumer(key, {"name": key, "power_entity": f"sensor.{key}", "parent": parent})  # noqa: E731
    linked = e.link_consumers({"app": mk("app", "_meter"), "forno": mk("forno", "app"), "luce": mk("luce", "forno"), "solo": mk("solo", "solo"), "orfano": mk("orfano", "sparito"), "fuori": mk("fuori", "_none")})
    assert linked["forno"].parent == "app"
    assert linked["luce"].parent == e.METER        # il suo genitore è a sua volta un figlio
    assert linked["solo"].parent == e.METER
    assert linked["orfano"].parent == e.METER
    assert linked["fuori"].parent == ""


def test_contract_power_by_band():
    assert e.contract_power({"contract_kw": 3}, 3) == 3
    assert e.contract_power({"contract_kw": 3, "contract_kw_f3": 6}, 1) == 3
    assert e.contract_power({"contract_kw": 3, "contract_kw_f3": 6}, 2) == 3
    assert e.contract_power({"contract_kw": 3, "contract_kw_f3": 6}, 3) == 6
    assert e.contract_power({}, 3) == 3


def test_parse_meter():
    m = e.parse_meter({"meter_power": ["sensor.a", "sensor.b", "sensor.a"], "meter_energy": "sensor.c"})
    assert m.power_entities == ("sensor.a", "sensor.b")
    assert m.energy_entities == ("sensor.c",)
    assert not m.from_power


# ------------------------------------------------------------------ sovraccarico
def test_overload_levels():
    o = e.Overload()
    assert o.update(3000, 3, 0, 3) is None
    assert o.update(3400, 3, 10, 3) is None              # oltre i 3,3 kW, ma da poco
    assert o.update(3400, 3, 100, 3) is None
    assert o.update(3400, 3, 190, 3) == 1                # da tre minuti
    assert o.update(3400, 3, 250, 3) is None             # già avvisato
    assert o.update(4200, 3, 260, 3) is None             # oltre i 4 kW
    assert o.update(4200, 3, 281, 3) == 2                # da venti secondi
    assert o.update(2000, 3, 300, 3) is None
    assert o.level == 2
    assert o.update(2000, 3, 361, 3) is None
    assert o.level == 0                                  # rientrato da un minuto


def test_overload_short_spike_does_not_alert():
    o = e.Overload()
    assert o.update(3500, 3, 0, 3) is None
    assert o.update(2900, 3, 60, 3) is None
    assert o.update(3500, 3, 120, 3) is None
    assert o.update(3500, 3, 240, 3) is None             # il conteggio è ripartito
    assert o.update(3500, 3, 300, 3) == 1
    assert o.update(None, 3, 400, 3) is None


# ------------------------------------------------------------------ testi
def test_monthly_report_text():
    bill = {"kwh": 500, "energia": 60.0, "trasporto": 10.0, "oneri": 20.0, "accise": 11.35, "altro": 0.0, "iva": 10.14, "totale": 111.49}
    title, text = e.monthly_report(date(2030, 9, 1), 500.0, 400.0, 95.0, bill, [100, 150, 250], [("Wallbox", 200.0, 38.0), ("Lavatrice", 50.0, 9.5)], 120.0)
    assert title == "Consumi di settembre 2030"
    assert "Hai consumato 500,0 kWh (+25% sul mese prima)." in text
    assert "Bolletta stimata: 111,49 €" in text
    assert "accise e IVA 21,49 €" in text
    assert "altre partite" not in text
    assert "altre partite -7,80 €" in e.monthly_report(date(2030, 9, 1), 500.0, 400.0, 95.0, {**bill, "altro": -7.8}, [0, 0, 0], [], 0.0)[1]
    assert "Fasce: F1 100 · F2 150 · F3 250 kWh" in text
    assert "1. Wallbox: 200,0 kWh (40%), 38,00 €" in text
    assert "Non monitorato: 120,0 kWh (24%)" in text
    _, text = e.monthly_report(date(2030, 9, 1), 500.0, 0.0, 95.0, None, [0, 0, 0], [], 0.0)
    assert text == "Hai consumato 500,0 kWh.\nCosto: 95,00 €"


def test_overload_message():
    title, text = e.overload_message(1, 3600, 3.0, [("Forno", 2100.0), ("Frigo", 90.0)])
    assert title == "Potenza oltre il limite"
    assert "3,60 kW su 3,0 kW" in text
    assert "Forno 2,10 kW, Frigo 90 W" in text
    assert e.overload_message(2, 4500, 3.0, [])[0] == "Distacco del contatore imminente"
