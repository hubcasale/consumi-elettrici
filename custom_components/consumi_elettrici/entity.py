"""Base comune delle entità: un dispositivo generale e uno per ogni consumatore."""
from __future__ import annotations

from typing import Any

from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import DeviceInfo

from .const import DOMAIN, TITLE
from .controller import ConsumiController
from .engine import METER, UNMONITORED

GENERAL = "generale"


def unique_id(controller: ConsumiController, key: str, suffix: str) -> str:
    """Id stabile: le entità generali (contatore, non monitorato) stanno sotto 'generale'."""
    owner = {METER: GENERAL, UNMONITORED: f"{GENERAL}_non_monitorato"}.get(key, key)
    return f"{controller.entry.entry_id}_{owner}_{suffix}"


class ConsumiEntity:
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, controller: ConsumiController, key: str, suffix: str, translation_key: str | None = None) -> None:
        self.controller = controller
        self.key = key
        self._attr_unique_id = unique_id(controller, key, suffix)
        self._attr_translation_key = translation_key or suffix
        self._written: Any = None
        if key in controller.consumers:
            src = controller.consumers[key]
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, key)}, name=f"Consumi {src.name}", manufacturer=TITLE, model="Consumatore", entry_type=DeviceEntryType.SERVICE
            )
        else:
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, controller.entry.entry_id)}, name=TITLE, manufacturer=TITLE, model="Contatore generale", entry_type=DeviceEntryType.SERVICE
            )

    @property
    def snap(self) -> dict[str, Any]:
        return self.controller.snapshot()

    @property
    def source(self) -> dict[str, Any]:
        return self.snap["sources"][self.key]

    def _fingerprint(self) -> Any:
        """Quello che decide se riscrivere lo stato: le classi figlie restituiscono valore e attributi."""
        raise NotImplementedError

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(async_dispatcher_connect(self.hass, self.controller.signal, self._refresh))  # type: ignore[attr-defined]

    @callback
    def _refresh(self) -> None:
        current = self._fingerprint()
        if current != self._written:
            self._written = current
            self.async_write_ha_state()  # type: ignore[attr-defined]
