"""Prove dentro un Home Assistant vero (pytest-homeassistant-custom-component)."""
from datetime import datetime, timedelta
from unittest.mock import patch
from zoneinfo import ZoneInfo

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType, InvalidData
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import CLIENT_ID, MockConfigEntry, async_capture_events, async_fire_time_changed, async_mock_service

from custom_components.consumi_elettrici.const import DOMAIN, EVENT_OVERLOAD, EVENT_REPORT
from custom_components.consumi_elettrici.engine import METER, UNMONITORED

M_W = "sensor.linea_power"
M_E = "sensor.linea_energy"
LAV_W = "sensor.lavatrice_power"
LAV_E = "sensor.lavatrice_energy"
CAF_W = "sensor.caffe_power"
PRICE = "sensor.prezzo"
ROME = ZoneInfo("Europe/Rome")
T0 = datetime(2030, 10, 23, 10, 0, tzinfo=ROME)      # mercoledì mattina: fascia F1

CONSUMERS = [
    {"subentry_id": "lav", "subentry_type": "consumer", "title": "Lavatrice", "unique_id": None,
     "data": {"name": "Lavatrice", "icon": "mdi:washing-machine", "power_entity": LAV_W, "energy_entity": LAV_E, "parent": "_meter"}},
    {"subentry_id": "caf", "subentry_type": "consumer", "title": "Caffè", "unique_id": None,
     "data": {"name": "Caffè", "icon": "mdi:coffee", "power_entity": CAF_W, "energy_entity": "", "parent": "_meter"}},
]


def _w(hass: HomeAssistant, entity: str, value) -> None:
    hass.states.async_set(entity, str(value), {"unit_of_measurement": "W", "device_class": "power"})


def _kwh(hass: HomeAssistant, entity: str, value, unit="kWh") -> None:
    hass.states.async_set(entity, str(value), {"unit_of_measurement": unit, "device_class": "energy"})


async def _setup(hass: HomeAssistant, freezer, consumers=None, start=T0, **options) -> MockConfigEntry:
    await hass.config.async_set_time_zone("Europe/Rome")
    hass.config.language = "it"          # i nomi delle entità (e quindi gli id) seguono la lingua
    freezer.move_to(start)
    _w(hass, M_W, 1000)
    _kwh(hass, M_E, 5000.0)
    _w(hass, LAV_W, 0)
    _kwh(hass, LAV_E, 100.0)
    _w(hass, CAF_W, 0)
    entry = MockConfigEntry(
        domain=DOMAIN, title="Consumi elettrici", data={}, unique_id=DOMAIN,
        options={"meter_power": [M_W], "meter_energy": [M_E], "contract_kw": 3.0, "price": 0.2, **options},
        subentries_data=CONSUMERS if consumers is None else consumers,
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _eid(hass: HomeAssistant, entry, key: str, suffix: str, domain="sensor") -> str:
    eid = er.async_get(hass).async_get_entity_id(domain, DOMAIN, f"{entry.entry_id}_{key}_{suffix}")
    assert eid, (key, suffix)
    return eid


def _state(hass: HomeAssistant, entry, key: str, suffix: str, domain="sensor"):
    return hass.states.get(_eid(hass, entry, key, suffix, domain))


async def _tick(hass: HomeAssistant, freezer, when: datetime) -> None:
    freezer.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()


def _ctrl(hass: HomeAssistant, entry):
    return hass.data[DOMAIN][entry.entry_id]


# ------------------------------------------------------------------ configurazione
async def test_config_flow_creates_the_entry(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"meter_power": [M_W], "contract_kw": 6, "contract_kw_f3": 0, "price_entity": PRICE, "price": 0.3})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    options = result["options"]
    assert options["meter_power"] == [M_W]
    assert options["meter_energy"] == []
    assert options["tariff_mode"] == "entity"
    assert options["contract_kw"] == 6
    await hass.async_block_till_done()
    # una sola voce
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    assert result["type"] is FlowResultType.ABORT


async def test_config_flow_needs_a_meter(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {"meter_power": [], "contract_kw": 3, "contract_kw_f3": 0, "price": 0.3})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"meter_power": "meter_required"}


async def test_options_pages(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer, price_entity=PRICE, tariff_mode="entity")
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU
    result = await hass.config_entries.options.async_configure(result["flow_id"], {"next_step_id": "tariff"})
    assert result["type"] is FlowResultType.FORM
    # prezzo da entità senza entità: errore
    bad = await hass.config_entries.options.async_configure(result["flow_id"], {"tariff_mode": "entity", "price": 0.3, "price_f1": 0.3, "price_f2": 0.2, "price_f3": 0.1})
    assert bad["errors"] == {"price_entity": "entity_required"}
    # passando al prezzo fisso l'entità lasciata vuota si toglie davvero
    result = await hass.config_entries.options.async_configure(bad["flow_id"], {"tariff_mode": "fixed", "price": 0.31, "price_f1": 0.3, "price_f2": 0.2, "price_f3": 0.1})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert entry.options["price_entity"] == ""
    assert entry.options["price"] == 0.31
    assert entry.options["meter_power"] == [M_W]          # le altre pagine non si toccano
    assert _state(hass, entry, "generale", "prezzo").state == "0.31"

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(result["flow_id"], {"next_step_id": "bill"})
    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"bill_enabled": True, "full_cost": True, "energy_fixed_year": 72, "energy_extra_kwh": 0.018468, "transport_fixed_year": 20.52, "transport_power_year": 21.24,
         "transport_kwh": 0.00889, "charges_kwh": 0.0424, "excise_kwh": 0.0227, "vat": 10, "other_month": -7.8},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert _state(hass, entry, "generale", "bolletta_mese").attributes["altro"] == -7.8
    assert entry.options["other_month"] == -7.8

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(result["flow_id"], {"next_step_id": "alerts"})
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"notify_services": ["notify.recipient_corrado"], "monthly_report": False, "overload_alert": True, "overload_minutes": 5}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert _ctrl(hass, entry).notify == ["notify.recipient_corrado"]
    assert _ctrl(hass, entry).overload_notify == ["notify.recipient_corrado"]       # vuoto = gli stessi del report

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(result["flow_id"], {"next_step_id": "meter"})
    result = await hass.config_entries.options.async_configure(result["flow_id"], {"meter_power": [M_W], "meter_energy": [M_E], "contract_kw": 3, "contract_kw_f3": 6})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert entry.options["contract_kw_f3"] == 6
    assert _ctrl(hass, entry).contract_kw() == 3                                    # mercoledì mattina: F1


async def test_consumer_subentry_flow(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer, consumers=[])
    _w(hass, "sensor.forno_power", 0)
    result = await hass.config_entries.subentries.async_init((entry.entry_id, "consumer"), context={"source": "user"})
    assert result["type"] is FlowResultType.FORM
    bad = await hass.config_entries.subentries.async_configure(result["flow_id"], {"name": "Forno", "parent": "_meter"})
    assert bad["errors"] == {"base": "sensor_required"}
    result = await hass.config_entries.subentries.async_configure(bad["flow_id"], {"name": "Forno", "icon": "mdi:stove", "power_entity": "sensor.forno_power", "parent": "_meter"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    (sid,) = list(entry.subentries)
    assert entry.subentries[sid].title == "Forno"
    assert entry.subentries[sid].data["energy_entity"] == ""
    # le entità del consumatore stanno sotto il suo dispositivo, legato alla sotto-voce
    eid = _eid(hass, entry, sid, "energia_oggi")
    assert eid == "sensor.consumi_forno_energia_oggi"
    assert er.async_get(hass).async_get(eid).config_subentry_id == sid
    device = dr.async_get(hass).async_get_device_by_identifier((DOMAIN, sid), entry.entry_id)
    assert device.name == "Consumi Forno"

    # un altro con lo stesso nome: no
    result = await hass.config_entries.subentries.async_init((entry.entry_id, "consumer"), context={"source": "user"})
    bad = await hass.config_entries.subentries.async_configure(result["flow_id"], {"name": " forno ", "power_entity": "sensor.forno_power", "parent": "_meter"})
    assert bad["errors"] == {"name": "name_exists"}

    # modifica
    result = await hass.config_entries.subentries.async_init((entry.entry_id, "consumer"), context={"source": "reconfigure", "subentry_id": sid})
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.subentries.async_configure(
        result["flow_id"], {"name": "Forno", "icon": "mdi:stove", "power_entity": "sensor.forno_power", "energy_entity": "sensor.forno_energy", "parent": "_none"}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    await hass.async_block_till_done()
    assert _ctrl(hass, entry).consumers[sid].energy_entities == ("sensor.forno_energy",)
    assert _ctrl(hass, entry).consumers[sid].parent == ""

    # rimozione: spariscono entità, dispositivo e storico
    _ctrl(hass, entry).ledger.add(sid, T0.date(), 1.0, 0.2)
    assert hass.config_entries.async_remove_subentry(entry, sid)
    await hass.async_block_till_done()
    assert er.async_get(hass).async_get(eid) is None
    assert dr.async_get(hass).async_get_device_by_identifier((DOMAIN, sid), entry.entry_id) is None
    assert sid not in _ctrl(hass, entry).ledger.keys()


async def test_consumer_behind_another_consumer(hass: HomeAssistant, freezer) -> None:
    """Una linea con il suo sensore (Appartamento) e una presa che ci sta sotto: niente doppi conteggi."""
    _w(hass, "sensor.app_power", 900)
    _kwh(hass, "sensor.app_energy", 300.0)
    consumers = [
        {"subentry_id": "app", "subentry_type": "consumer", "title": "Appartamento", "unique_id": None,
         "data": {"name": "Appartamento", "icon": "mdi:home", "power_entity": "sensor.app_power", "energy_entity": "sensor.app_energy", "parent": "_meter"}},
        {**CONSUMERS[0], "data": {**CONSUMERS[0]["data"], "parent": "app"}},
    ]
    entry = await _setup(hass, freezer, consumers=consumers)
    controller = _ctrl(hass, entry)
    assert controller.top == ["app"] and controller.children == {"app": ["lav"]}
    _w(hass, LAV_W, 600)
    freezer.move_to(T0 + timedelta(minutes=10))
    _kwh(hass, M_E, 5002.0)
    _kwh(hass, "sensor.app_energy", 301.0)
    _kwh(hass, LAV_E, 100.4)
    await hass.async_block_till_done()
    await _tick(hass, freezer, T0 + timedelta(minutes=11))
    # non monitorato = contatore meno la linea (la lavatrice è già dentro la linea)
    assert float(_state(hass, entry, "generale_non_monitorato", "energia_oggi").state) == pytest.approx(1.0)
    assert float(_state(hass, entry, "generale_non_monitorato", "potenza").state) == 100
    assert float(_state(hass, entry, "app", "energia_oggi").state) == pytest.approx(1.0)       # la linea resta quella misurata
    info = controller.info()
    app, lav = info["consumers"]
    assert app["parent"] == METER and lav["parent"] == "app" and lav["in_meter"]
    assert app["rest"]["power"] == 300
    assert app["rest"]["periods"]["today"]["k"] == pytest.approx(0.6)
    assert "rest" not in lav

    # nel modulo: la lavatrice può stare sotto il contatore, sotto l'Appartamento o fuori; l'Appartamento, che ha già un figlio, no
    flow = await hass.config_entries.subentries.async_init((entry.entry_id, "consumer"), context={"source": "reconfigure", "subentry_id": "lav"})
    options = flow["data_schema"].schema["parent"].config["options"]
    assert [o["value"] for o in options] == ["_meter", "app", "_none"]
    assert options[0]["label"] == "Contatore generale"
    flow = await hass.config_entries.subentries.async_init((entry.entry_id, "consumer"), context={"source": "reconfigure", "subentry_id": "app"})
    assert [o["value"] for o in flow["data_schema"].schema["parent"].config["options"]] == ["_meter", "_none"]
    with pytest.raises(InvalidData):
        await hass.config_entries.subentries.async_configure(flow["flow_id"], {"name": "Appartamento", "power_entity": "sensor.app_power", "parent": "lav"})

    # tolta la linea, la presa torna sotto il contatore
    assert hass.config_entries.async_remove_subentry(entry, "app")
    await hass.async_block_till_done()
    assert _ctrl(hass, entry).top == ["lav"]


# ------------------------------------------------------------------ entità e conti
async def test_entities_are_created(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer)
    assert _state(hass, entry, "generale", "potenza").state == "1000.0"
    assert _state(hass, entry, "generale", "energia_oggi").state == "0.0"
    assert _state(hass, entry, "generale", "fascia").state == "f1"
    assert _state(hass, entry, "generale", "prezzo").state == "0.2"
    assert _state(hass, entry, "generale_non_monitorato", "potenza").state == "1000.0"
    assert _state(hass, entry, "generale", "sovraccarico", "binary_sensor").state == "off"
    assert _eid(hass, entry, "generale", "energia_oggi") == "sensor.consumi_elettrici_energia_oggi"
    assert _eid(hass, entry, "lav", "costo_mese") == "sensor.consumi_lavatrice_costo_mese"
    reg = er.async_get(hass)
    assert reg.async_get(_eid(hass, entry, "lav", "costo_anno")).disabled_by is not None       # spento all'inizio
    assert reg.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_generale_bolletta_mese") is None   # bolletta non attiva
    state = _state(hass, entry, "lav", "energia_oggi")
    assert state.attributes["state_class"] == "total"
    assert state.attributes["last_reset"] == "2030-10-23T00:00:00+02:00"
    assert state.attributes["ieri"] == 0


async def test_energy_from_counters_cost_and_unmonitored(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer)
    t = T0 + timedelta(minutes=10)
    freezer.move_to(t)
    _kwh(hass, M_E, 5001.0)          # il contatore generale sale di 1 kWh
    _kwh(hass, LAV_E, 100.4)         # la lavatrice di 0,4
    _w(hass, LAV_W, 2000)
    await hass.async_block_till_done()
    await _tick(hass, freezer, t + timedelta(seconds=5))
    assert float(_state(hass, entry, "generale", "energia_oggi").state) == pytest.approx(1.0)
    assert float(_state(hass, entry, "generale", "costo_oggi").state) == pytest.approx(0.2)
    assert _state(hass, entry, "generale", "energia_oggi").attributes["f1"] == pytest.approx(1.0)
    assert float(_state(hass, entry, "lav", "energia_oggi").state) == pytest.approx(0.4)
    assert float(_state(hass, entry, "lav", "costo_oggi").state) == pytest.approx(0.08)
    assert float(_state(hass, entry, "generale_non_monitorato", "energia_oggi").state) == pytest.approx(0.6)
    assert float(_state(hass, entry, "generale_non_monitorato", "quota_oggi").state) == pytest.approx(60)
    assert float(_state(hass, entry, "generale_non_monitorato", "potenza").state) == 0     # 1000 W di contatore, 2000 della lavatrice
    assert float(_state(hass, entry, "generale", "energia_mese").state) == pytest.approx(1.0)


async def test_energy_from_power_when_there_is_no_counter(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer)
    _w(hass, CAF_W, 1200)
    await hass.async_block_till_done()
    t = T0
    for _ in range(30):
        t += timedelta(minutes=1)
        await _tick(hass, freezer, t)
    _w(hass, CAF_W, 0)
    await hass.async_block_till_done()
    for _ in range(5):
        t += timedelta(minutes=1)
        await _tick(hass, freezer, t)
    assert float(_state(hass, entry, "caf", "energia_oggi").state) == pytest.approx(0.6, abs=0.001)    # 1200 W per mezz'ora
    assert float(_state(hass, entry, "caf", "costo_oggi").state) == pytest.approx(0.12, abs=0.001)
    assert float(_state(hass, entry, "generale", "picco_oggi").state) == 1000


async def test_impossible_power_reading_is_ignored(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer)
    _w(hass, LAV_W, 3284256)               # certe prese ogni tanto mandano milioni di watt
    await hass.async_block_till_done()
    await _tick(hass, freezer, T0 + timedelta(minutes=1))
    assert _ctrl(hass, entry).power("lav") is None
    assert float(_state(hass, entry, "generale_non_monitorato", "potenza").state) == 1000


async def test_units_and_several_meter_lines(hass: HomeAssistant, freezer) -> None:
    hass.states.async_set("sensor.linea2_power", "1.5", {"unit_of_measurement": "kW"})
    _kwh(hass, "sensor.linea2_energy", 2_000_000, "Wh")
    entry = await _setup(hass, freezer, meter_power=[M_W, "sensor.linea2_power"], meter_energy=[M_E, "sensor.linea2_energy"])
    assert float(_state(hass, entry, "generale", "potenza").state) == 2500
    freezer.move_to(T0 + timedelta(minutes=5))
    _kwh(hass, M_E, 5000.3)
    _kwh(hass, "sensor.linea2_energy", 2_000_200, "Wh")
    await hass.async_block_till_done()
    await _tick(hass, freezer, T0 + timedelta(minutes=5, seconds=5))
    assert float(_state(hass, entry, "generale", "energia_oggi").state) == pytest.approx(0.5)


async def test_price_from_entity_and_bands(hass: HomeAssistant, freezer) -> None:
    hass.states.async_set(PRICE, "0.099", {"unit_of_measurement": "€/kWh"})
    entry = await _setup(hass, freezer, tariff_mode="entity", price_entity=PRICE)
    assert _state(hass, entry, "generale", "prezzo").state == "0.099"
    freezer.move_to(T0 + timedelta(minutes=10))
    _kwh(hass, M_E, 5002.0)
    await hass.async_block_till_done()
    hass.states.async_set(PRICE, "unavailable")           # da qui vale il prezzo fisso
    await hass.async_block_till_done()
    freezer.move_to(T0 + timedelta(minutes=20))
    _kwh(hass, M_E, 5003.0)
    await hass.async_block_till_done()
    await _tick(hass, freezer, T0 + timedelta(minutes=21))
    assert float(_state(hass, entry, "generale", "costo_oggi").state) == pytest.approx(2 * 0.099 + 0.2, abs=0.006)
    assert _state(hass, entry, "generale", "prezzo").state == "0.2"

    # di sera cambia la fascia: i kWh vanno in F2 e, con la tariffa a fasce, cambia anche il prezzo
    hass.config_entries.async_update_entry(entry, options={**entry.options, "tariff_mode": "bands", "price_f1": 0.3, "price_f2": 0.2, "price_f3": 0.1})
    await hass.async_block_till_done()
    evening = T0.replace(hour=20)
    await _tick(hass, freezer, evening)
    assert _state(hass, entry, "generale", "fascia").state == "f2"
    assert _state(hass, entry, "generale", "prezzo").state == "0.2"
    freezer.move_to(evening + timedelta(minutes=5))
    _kwh(hass, M_E, 5003.5)
    await hass.async_block_till_done()
    await _tick(hass, freezer, evening + timedelta(minutes=6))
    state = _state(hass, entry, "generale", "energia_oggi")
    assert state.attributes["f1"] == pytest.approx(3.0)
    assert state.attributes["f2"] == pytest.approx(0.5)
    assert float(_state(hass, entry, "generale", "costo_oggi").state) == pytest.approx(2 * 0.099 + 0.2 + 0.5 * 0.2, abs=0.006)


async def test_full_cost_and_bill(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(
        hass, freezer, bill_enabled=True, full_cost=True, energy_fixed_year=72, transport_fixed_year=24, transport_power_year=20, transport_kwh=0.01,
        charges_kwh=0.04, excise_kwh=0.02, vat=10,
    )
    freezer.move_to(T0 + timedelta(minutes=30))
    _kwh(hass, M_E, 5010.0)
    await hass.async_block_till_done()
    await _tick(hass, freezer, T0 + timedelta(minutes=31))
    # 10 kWh: energia 2,00 + quote variabili 0,70, più IVA
    assert float(_state(hass, entry, "generale", "costo_oggi").state) == pytest.approx(2.97)
    bill = _state(hass, entry, "generale", "bolletta_mese")
    assert bill.attributes["energia"] == pytest.approx(2.0 + 6.0)
    assert bill.attributes["trasporto"] == pytest.approx(0.1 + 2.0 + 5.0)
    assert bill.attributes["oneri"] == pytest.approx(0.4)
    assert float(bill.state) == pytest.approx((8.0 + 7.1 + 0.4 + 0.2) * 1.1, abs=0.01)
    assert bill.attributes["previsione_kwh"] > 10


async def test_periods_roll_over_at_midnight(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer, start=T0.replace(hour=23, minute=50))
    freezer.move_to(T0.replace(hour=23, minute=55))
    _kwh(hass, M_E, 5002.0)
    await hass.async_block_till_done()
    tomorrow = T0.replace(hour=0, minute=1) + timedelta(days=1)
    await _tick(hass, freezer, tomorrow)
    state = _state(hass, entry, "generale", "energia_oggi")
    assert float(state.state) == 0
    assert state.attributes["ieri"] == pytest.approx(2.0)
    assert state.attributes["last_reset"] == "2030-10-24T00:00:00+02:00"
    assert float(_state(hass, entry, "generale", "energia_settimana").state) == pytest.approx(2.0)


async def test_restart_keeps_data_and_recovers_what_was_missed(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer)
    freezer.move_to(T0 + timedelta(minutes=10))
    _kwh(hass, M_E, 5001.0)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    # a integrazione ferma il contatore va avanti
    freezer.move_to(T0 + timedelta(minutes=40))
    _kwh(hass, M_E, 5001.7)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert float(_state(hass, entry, "generale", "energia_oggi").state) == pytest.approx(1.7)


async def test_long_stop_does_not_dump_everything_on_today(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer)
    freezer.move_to(T0 + timedelta(minutes=10))
    _kwh(hass, M_E, 5001.0)
    await hass.async_block_till_done()
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    later = T0 + timedelta(days=3)
    freezer.move_to(later)
    _kwh(hass, M_E, 5090.0)                # tre giorni di consumi mentre l'integrazione era ferma
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert float(_state(hass, entry, "generale", "energia_oggi").state) == 0
    freezer.move_to(later + timedelta(minutes=5))
    _kwh(hass, M_E, 5090.2)
    await hass.async_block_till_done()
    await _tick(hass, freezer, later + timedelta(minutes=6))
    assert float(_state(hass, entry, "generale", "energia_oggi").state) == pytest.approx(0.2)
    assert float(_state(hass, entry, "generale", "energia_settimana").state) == pytest.approx(1.2)


# ------------------------------------------------------------------ scheda
async def test_websocket_info_and_stats(hass: HomeAssistant, freezer, hass_ws_client, hass_admin_user) -> None:
    entry = await _setup(hass, freezer)
    freezer.move_to(T0 + timedelta(minutes=10))
    _kwh(hass, M_E, 5001.0)
    _kwh(hass, LAV_E, 100.4)
    await hass.async_block_till_done()
    # il gettone va creato a orologio già spostato, altrimenti risulta scaduto
    refresh = await hass.auth.async_create_refresh_token(hass_admin_user, CLIENT_ID)
    client = await hass_ws_client(hass, hass.auth.async_create_access_token(refresh))
    await client.send_json({"id": 1, "type": "consumi_elettrici/info"})
    msg = await client.receive_json()
    assert msg["success"]
    info = msg["result"]
    assert info["meter"]["power"] == 1000
    assert info["meter"]["periods"]["today"] == {"k": 1.0, "c": 0.2}
    assert info["meter"]["bands"]["today"] == [1.0, 0.0, 0.0]
    assert [c["name"] for c in info["consumers"]] == ["Lavatrice", "Caffè"]
    lav = info["consumers"][0]
    assert lav["power_entity"] == LAV_W and lav["icon"] == "mdi:washing-machine"
    assert lav["periods"]["today"]["k"] == 0.4
    assert lav["entities"]["energia_oggi"] == "sensor.consumi_lavatrice_energia_oggi"
    assert info["unmonitored"]["periods"]["today"]["k"] == 0.6
    assert info["tariff"] == {"mode": "fixed", "band": 1, "price": 0.2, "full_price": 0.2}
    assert info["contract_kw"] == 3.0 and info["available_kw"] == 3.3
    assert info["version"]

    await client.send_json({"id": 2, "type": "consumi_elettrici/stats", "granularity": "day", "count": 3})
    stats = (await client.receive_json())["result"]
    assert stats["labels"] == ["2030-10-21", "2030-10-22", "2030-10-23"]
    assert stats["series"][METER]["k"] == [0, 0, 1.0]
    assert stats["series"]["lav"]["k"] == [0, 0, 0.4]
    assert stats["series"][UNMONITORED]["k"] == [0, 0, 0.6]
    await client.send_json({"id": 3, "type": "consumi_elettrici/stats", "granularity": "month", "count": 2})
    stats = (await client.receive_json())["result"]
    assert stats["labels"] == ["2030-09", "2030-10"]
    assert stats["series"][METER]["c"] == [0, 0.2]


# ------------------------------------------------------------------ avvisi e report
async def test_overload_alert(hass: HomeAssistant, freezer) -> None:
    calls = async_mock_service(hass, "notify", "famiglia")
    events = async_capture_events(hass, EVENT_OVERLOAD)
    entry = await _setup(hass, freezer, notify_services=["notify.famiglia"], overload_minutes=2)
    _w(hass, LAV_W, 2100)
    _w(hass, M_W, 3600)                                    # oltre i 3,3 kW disponibili
    await hass.async_block_till_done()
    t = T0
    for _ in range(3):
        t += timedelta(minutes=1)
        await _tick(hass, freezer, t)
    assert len(events) == 1
    assert events[0].data["level"] == 1
    assert events[0].data["consumers"] == [{"name": "Lavatrice", "power": 2100}]
    assert len(calls) == 1
    assert calls[0].data["title"] == "Potenza oltre il limite"
    assert "Lavatrice 2,10 kW" in calls[0].data["message"]
    assert _state(hass, entry, "generale", "sovraccarico", "binary_sensor").state == "on"
    _w(hass, M_W, 1500)
    await hass.async_block_till_done()
    for _ in range(3):
        t += timedelta(minutes=1)
        await _tick(hass, freezer, t)
    assert _state(hass, entry, "generale", "sovraccarico", "binary_sensor").state == "off"
    assert len(calls) == 1


async def test_overload_follows_the_power_of_the_band(hass: HomeAssistant, freezer) -> None:
    """Sperimentazione ARERA: 6 kW in F3 (notte, domeniche, festivi), 3 kW nel resto. E l'avviso ha i suoi destinatari."""
    report_calls = async_mock_service(hass, "notify", "famiglia")
    alert_calls = async_mock_service(hass, "notify", "corrado")
    night = T0.replace(hour=23, minute=30)
    entry = await _setup(hass, freezer, start=night, contract_kw=3, contract_kw_f3=6, notify_services=["notify.famiglia"], overload_notify=["notify.corrado"], overload_minutes=2)
    _w(hass, M_W, 5200)                                    # la wallbox carica: di notte va bene
    await hass.async_block_till_done()
    t = night
    for _ in range(4):
        t += timedelta(minutes=1)
        await _tick(hass, freezer, t)
    state = _state(hass, entry, "generale", "sovraccarico", "binary_sensor")
    assert state.state == "off"
    assert state.attributes["potenza_contratto_kw"] == 6
    assert state.attributes["potenza_disponibile_kw"] == 6.6
    assert not alert_calls
    # alle 7 la potenza torna a 3 kW e la ricarica è ancora in corso
    t = night.replace(hour=7, minute=0) + timedelta(days=1)
    for _ in range(4):
        await _tick(hass, freezer, t)
        t += timedelta(minutes=1)
    state = _state(hass, entry, "generale", "sovraccarico", "binary_sensor")
    assert state.state == "on"
    assert state.attributes["potenza_contratto_kw"] == 3
    assert len(alert_calls) == 1
    assert "5,20 kW su 3,0 kW" in alert_calls[0].data["message"]
    assert not report_calls                                # l'avviso non va a chi riceve solo il report


async def test_report_service_and_automatic_report(hass: HomeAssistant, freezer) -> None:
    calls = async_mock_service(hass, "notify", "famiglia")
    events = async_capture_events(hass, EVENT_REPORT)
    entry = await _setup(hass, freezer, start=datetime(2030, 10, 31, 22, 0, tzinfo=ROME), notify_services=["notify.famiglia"])
    ledger = _ctrl(hass, entry).ledger
    ledger.add(METER, datetime(2030, 10, 10).date(), 300.0, 60.0, 1)
    ledger.add("lav", datetime(2030, 10, 10).date(), 45.0, 9.0)
    ledger.add(METER, datetime(2030, 9, 10).date(), 250.0, 50.0, 3)
    result = await hass.services.async_call(DOMAIN, "send_report", {"period": "month"}, blocking=True, return_response=True)
    assert result["month"] == "2030-10"
    assert result["kwh"] == 300.0
    assert result["previous_kwh"] == 250.0
    assert result["consumers"] == [{"name": "Lavatrice", "kwh": 45.0, "cost": 9.0}]
    assert result["unmonitored_kwh"] == 255.0
    assert calls[0].data["title"] == "Consumi di ottobre 2030"
    assert len(events) == 1
    # il primo del mese, ma non di notte
    await _tick(hass, freezer, datetime(2030, 11, 1, 0, 5, tzinfo=ROME))
    assert len(calls) == 1
    await _tick(hass, freezer, datetime(2030, 11, 1, 8, 1, tzinfo=ROME))
    assert len(calls) == 2
    assert calls[1].data["title"] == "Consumi di ottobre 2030"
    assert "1. Lavatrice: 45,0 kWh (15%), 9,00 €" in calls[1].data["message"]
    await _tick(hass, freezer, datetime(2030, 11, 1, 8, 2, tzinfo=ROME))
    assert len(calls) == 2


# ------------------------------------------------------------------ storico
async def test_import_history_from_statistics(hass: HomeAssistant, freezer) -> None:
    entry = await _setup(hass, freezer)
    controller = _ctrl(hass, entry)
    controller.ledger.add(METER, datetime(2030, 10, 21).date(), 7.0, 1.4, 1)          # giorno già misurato

    def hour(day: int, h: int, change: float) -> dict:
        return {"start": datetime(2030, 10, day, h, 0, tzinfo=ROME).timestamp(), "change": change}

    rows = {
        M_E: [hour(19, 10, 1.0), hour(20, 10, 2.0), hour(20, 21, 1.0), hour(21, 10, 50.0), hour(22, 3, 4.0), hour(22, 4, 500.0), hour(22, 5, -1.0), hour(23, 8, 0.5)],
        LAV_E: [hour(20, 10, 0.8)],
    }

    def fake_stats(_hass, _start, _end, ids, period, units, types):
        assert period == "hour" and units == {"energy": "kWh"} and types == {"change"}
        return {i: rows[i] for i in ids if i in rows}

    class FakeRecorder:
        async def async_add_executor_job(self, func, *args):
            return func(*args)

    hass.config.components.add("recorder")
    with patch("homeassistant.components.recorder.get_instance", return_value=FakeRecorder()), patch(
        "homeassistant.components.recorder.statistics.statistics_during_period", fake_stats
    ):
        result = await hass.services.async_call(DOMAIN, "import_history", {"days": 30}, blocking=True, return_response=True)
    hass.config.components.remove("recorder")
    assert result == {"days_written": {"Contatore": 4, "Lavatrice": 1}}
    ledger = controller.ledger
    assert ledger.day(METER, datetime(2030, 10, 20).date()) == {"k": 3.0, "e": pytest.approx(0.6), "i": 1, "f": [0.0, 0.0, 3.0]}   # il 20 è domenica: tutto in F3
    assert ledger.day(METER, datetime(2030, 10, 21).date())["k"] == 7.0               # il giorno misurato resta
    assert ledger.day(METER, datetime(2030, 10, 22).date())["k"] == 4.0               # scartate le ore impossibili
    assert ledger.day(METER, datetime(2030, 10, 23).date())["k"] == 0.5               # oggi: lo storico ne sa di più
    assert ledger.day("lav", datetime(2030, 10, 20).date())["k"] == 0.8
    assert float(_state(hass, entry, "generale", "energia_settimana").state) == pytest.approx(11.5)
