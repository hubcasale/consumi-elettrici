"""Sensori: potenza, energia e costo per periodo (generale, non monitorato, ogni consumatore), tariffa, bolletta."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE, UnitOfEnergy, UnitOfPower
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .controller import ConsumiController
from .engine import METER, UNMONITORED, period_ranges
from .entity import ConsumiEntity

# periodo -> (suffisso, periodo precedente, nome dell'attributo col precedente)
PERIOD_SUFFIX = {
    "today": ("oggi", "yesterday", "ieri"),
    "week": ("settimana", "last_week", "settimana_scorsa"),
    "month": ("mese", "last_month", "mese_scorso"),
    "year": ("anno", "last_year", "anno_scorso"),
}
# entità spente all'inizio: si accendono dalla pagina del dispositivo
_OFF_BY_DEFAULT = {("cost", "week"), ("cost", "year")}
SENSOR_SUFFIXES = tuple(f"{kind}_{PERIOD_SUFFIX[p][0]}" for kind in ("energia", "costo") for p in PERIOD_SUFFIX)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    controller: ConsumiController = hass.data[DOMAIN][entry.entry_id]
    general: list[SensorEntity] = [
        PowerSensor(controller, METER, "potenza"),
        PowerSensor(controller, UNMONITORED, "potenza", "non_monitorato_potenza"),
        ShareSensor(controller),
        PriceSensor(controller),
        BandSensor(controller),
        PeakSensor(controller),
    ]
    for period in PERIOD_SUFFIX:
        general.append(PeriodSensor(controller, METER, "energy", period))
        general.append(PeriodSensor(controller, METER, "cost", period, enabled=True))
        general.append(PeriodSensor(controller, UNMONITORED, "energy", period, enabled=period in ("today", "month")))
    if controller.bill.enabled:
        general += [BillSensor(controller, "month", "bolletta_mese"), BillSensor(controller, "last_month", "bolletta_mese_scorso"), BillSensor(controller, "year", "bolletta_anno")]
    async_add_entities(general)
    for key in controller.consumers:
        entities = [PeriodSensor(controller, key, kind, period) for kind in ("energy", "cost") for period in PERIOD_SUFFIX]
        async_add_entities(entities, config_subentry_id=key)


class PowerSensor(ConsumiEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.POWER
    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 0

    @property
    def native_value(self) -> float | None:
        return self.source["power"]

    def _fingerprint(self) -> Any:
        return self.native_value


class PeriodSensor(ConsumiEntity, SensorEntity):
    """Energia (kWh) o costo (EUR) di un periodo; il periodo precedente è tra gli attributi."""

    _attr_state_class = SensorStateClass.TOTAL

    def __init__(self, controller: ConsumiController, key: str, kind: str, period: str, enabled: bool | None = None) -> None:
        suffix, self._previous, self._previous_name = PERIOD_SUFFIX[period]
        name = f"{'energia' if kind == 'energy' else 'costo'}_{suffix}"
        super().__init__(controller, key, name, f"non_monitorato_{name}" if key == UNMONITORED else name)
        self._period = period
        self._field = "k" if kind == "energy" else "c"
        if kind == "energy":
            self._attr_device_class = SensorDeviceClass.ENERGY
            self._attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
            self._attr_suggested_display_precision = 2
        else:
            self._attr_device_class = SensorDeviceClass.MONETARY
            self._attr_native_unit_of_measurement = "EUR"
            self._attr_suggested_display_precision = 2
        self._attr_entity_registry_enabled_default = enabled if enabled is not None else (kind, period) not in _OFF_BY_DEFAULT

    @property
    def native_value(self) -> float:
        return self.source["periods"][self._period][self._field]

    @property
    def last_reset(self) -> datetime:
        return dt_util.start_of_local_day(period_ranges(dt_util.now().date())[self._period][0])

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        attrs: dict[str, Any] = {self._previous_name: self.source["periods"][self._previous][self._field]}
        if self.key == METER and self._field == "k":
            f = self.source["bands"][self._period]
            attrs.update(f1=f[0], f2=f[1], f3=f[2])
        return attrs

    def _fingerprint(self) -> Any:
        return self.native_value, self.extra_state_attributes


class ShareSensor(ConsumiEntity, SensorEntity):
    """Quanta parte dell'energia di oggi non appartiene a nessun consumatore."""

    _attr_native_unit_of_measurement = PERCENTAGE
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 0
    _attr_icon = "mdi:help-circle-outline"

    def __init__(self, controller: ConsumiController) -> None:
        super().__init__(controller, UNMONITORED, "quota_oggi", "non_monitorato_quota_oggi")

    @property
    def native_value(self) -> float | None:
        total = self.snap["sources"][METER]["periods"]["today"]["k"]
        return round(self.source["periods"]["today"]["k"] / total * 100, 1) if total > 0 else None

    def _fingerprint(self) -> Any:
        return self.native_value


class PriceSensor(ConsumiEntity, SensorEntity):
    _attr_native_unit_of_measurement = "EUR/kWh"
    _attr_suggested_display_precision = 4
    _attr_icon = "mdi:currency-eur"

    def __init__(self, controller: ConsumiController) -> None:
        super().__init__(controller, METER, "prezzo")

    @property
    def native_value(self) -> float:
        return self.snap["tariff"]["price"]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        t = self.snap["tariff"]
        return {"fascia": f"F{t['band']}", "prezzo_pieno": t["full_price"], "modo": t["mode"]}

    def _fingerprint(self) -> Any:
        return self.native_value, self.extra_state_attributes


class BandSensor(ConsumiEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = ["f1", "f2", "f3"]
    _attr_icon = "mdi:clock-outline"

    def __init__(self, controller: ConsumiController) -> None:
        super().__init__(controller, METER, "fascia")

    @property
    def native_value(self) -> str:
        return f"f{self.snap['tariff']['band']}"

    def _fingerprint(self) -> Any:
        return self.native_value


class PeakSensor(ConsumiEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.POWER
    _attr_native_unit_of_measurement = UnitOfPower.WATT
    _attr_suggested_display_precision = 0
    _attr_icon = "mdi:chart-bell-curve"

    def __init__(self, controller: ConsumiController) -> None:
        super().__init__(controller, METER, "picco_oggi")

    @property
    def native_value(self) -> float | None:
        return self.snap["peak"]["w"]

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"ora": self.snap["peak"]["at"]}

    def _fingerprint(self) -> Any:
        return self.native_value, self.snap["peak"]["at"]


class BillSensor(ConsumiEntity, SensorEntity):
    """Bolletta stimata, con le voci tra gli attributi (e la proiezione a fine mese per quella in corso)."""

    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_native_unit_of_measurement = "EUR"
    _attr_suggested_display_precision = 2
    _attr_icon = "mdi:receipt-text-outline"

    def __init__(self, controller: ConsumiController, period: str, suffix: str) -> None:
        super().__init__(controller, METER, suffix)
        self._period = period

    @property
    def native_value(self) -> float | None:
        return self.snap["bill"].get(self._period, {}).get("totale")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        bill = self.snap["bill"]
        attrs = {k: v for k, v in bill.get(self._period, {}).items() if k != "totale"}
        if self._period == "month" and "forecast" in bill:
            attrs["previsione_kwh"] = bill["forecast"]["kwh"]
            attrs["previsione_totale"] = bill["forecast"]["totale"]
        return attrs

    def _fingerprint(self) -> Any:
        return self.native_value, self.extra_state_attributes
