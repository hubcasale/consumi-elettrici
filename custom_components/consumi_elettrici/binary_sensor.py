"""Sensore binario di sovraccarico: prelievo oltre la potenza disponibile."""
from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN
from .controller import ConsumiController
from .engine import METER
from .entity import ConsumiEntity


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddConfigEntryEntitiesCallback) -> None:
    async_add_entities([OverloadSensor(hass.data[DOMAIN][entry.entry_id])])


class OverloadSensor(ConsumiEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, controller: ConsumiController) -> None:
        super().__init__(controller, METER, "sovraccarico")

    @property
    def is_on(self) -> bool:
        return self.snap["overload"] > 0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"livello": self.snap["overload"], "potenza_contratto_kw": self.snap["contract_kw"], "potenza_disponibile_kw": self.snap["available_kw"]}

    def _fingerprint(self) -> Any:
        return self.snap["overload"], self.snap["contract_kw"]
