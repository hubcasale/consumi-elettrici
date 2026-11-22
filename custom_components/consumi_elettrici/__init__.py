"""Consumi elettrici: energia e costo del contatore generale e di ogni consumatore, per periodo; con scheda."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.storage import Store
from homeassistant.helpers.typing import ConfigType

from .const import CARD_FILE, CARD_URL, DOMAIN, PLATFORMS, SERVICE_IMPORT, SERVICE_REPORT, STORAGE_VERSION
from .controller import ConsumiController
from .entity import unique_id
from .sensor import SENSOR_SUFFIXES

_LOGGER = logging.getLogger(__name__)
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


def _version() -> str:
    try:
        return json.loads((Path(__file__).parent / "manifest.json").read_text())["version"]
    except (OSError, ValueError, KeyError):
        return "0"


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Registra la scheda (servita dall'integrazione), i comandi per la scheda e i servizi."""
    hass.data.setdefault(DOMAIN, {})
    card_path = Path(__file__).parent / CARD_FILE
    version = await hass.async_add_executor_job(_version)
    hass.data[DOMAIN]["version"] = version
    if await hass.async_add_executor_job(card_path.is_file):
        await hass.http.async_register_static_paths([StaticPathConfig(CARD_URL, str(card_path), cache_headers=False)])
        frontend.add_extra_js_url(hass, f"{CARD_URL}?v={version}")
    else:
        _LOGGER.warning("Scheda non trovata in %s: costruiscila con npm run build", card_path)
    for command in (ws_info, ws_stats):
        websocket_api.async_register_command(hass, command)

    async def _import(call: ServiceCall) -> ServiceResponse:
        controller = _controller(hass, None)
        if controller is None:
            raise ServiceValidationError("Consumi elettrici non è configurato")
        written = await controller.async_import(call.data.get("days"))
        return {"days_written": {controller.sources[k].name: n for k, n in written.items() if k in controller.sources}}

    async def _report(call: ServiceCall) -> ServiceResponse:
        controller = _controller(hass, None)
        if controller is None:
            raise ServiceValidationError("Consumi elettrici non è configurato")
        return await controller.async_send_report(call.data.get("period", "last_month"))

    hass.services.async_register(
        DOMAIN, SERVICE_IMPORT, _import, vol.Schema({vol.Optional("days"): vol.All(vol.Coerce(int), vol.Range(min=1, max=800))}), supports_response=SupportsResponse.OPTIONAL
    )
    hass.services.async_register(
        DOMAIN, SERVICE_REPORT, _report, vol.Schema({vol.Optional("period", default="last_month"): vol.In(["last_month", "month"])}), supports_response=SupportsResponse.OPTIONAL
    )
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    controller = ConsumiController(hass, entry)
    await controller.async_start()
    hass.data[DOMAIN][entry.entry_id] = controller
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_updated))
    return True


async def _async_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Opzioni o consumatori cambiati: la voce si ricarica (il registro dei consumi resta)."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        controller: ConsumiController = hass.data[DOMAIN].pop(entry.entry_id)
        await controller.async_stop()
    return ok


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await Store(hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}").async_remove()


# ---------------------------------------------------------------------- comandi per la scheda
def _controller(hass: HomeAssistant, entry_id: str | None) -> ConsumiController | None:
    controllers = {k: v for k, v in hass.data.get(DOMAIN, {}).items() if isinstance(v, ConsumiController)}
    if entry_id:
        return controllers.get(entry_id)
    return next(iter(controllers.values()), None)


def _entities_of(hass: HomeAssistant, controller: ConsumiController, key: str) -> dict[str, str]:
    reg = er.async_get(hass)
    out: dict[str, str] = {}
    for suffix in SENSOR_SUFFIXES:
        eid = reg.async_get_entity_id("sensor", DOMAIN, unique_id(controller, key, suffix))
        if eid:
            out[suffix] = eid
    return out


@websocket_api.websocket_command({vol.Required("type"): "consumi_elettrici/info", vol.Optional("entry_id"): str})
@callback
def ws_info(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    controller = _controller(hass, msg.get("entry_id"))
    if controller is None:
        connection.send_error(msg["id"], "not_found", "Consumi elettrici non è configurato")
        return
    data = controller.info()
    data["version"] = hass.data[DOMAIN].get("version", "0")
    data["meter"]["entities"] = _entities_of(hass, controller, data["meter"]["key"])
    for item in data["consumers"]:
        item["entities"] = _entities_of(hass, controller, item["key"])
    connection.send_result(msg["id"], data)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "consumi_elettrici/stats",
        vol.Optional("entry_id"): str,
        vol.Optional("granularity", default="day"): vol.In(["day", "month"]),
        vol.Optional("count", default=30): vol.All(int, vol.Range(min=1, max=400)),
    }
)
@callback
def ws_stats(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    controller = _controller(hass, msg.get("entry_id"))
    if controller is None:
        connection.send_error(msg["id"], "not_found", "Consumi elettrici non è configurato")
        return
    connection.send_result(msg["id"], controller.stats(msg["granularity"], msg["count"]))
