"""Configurazione dall'interfaccia: una voce (contatore e tariffa), opzioni a menu, un consumatore per sotto-voce."""
from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, ConfigSubentryFlow, OptionsFlow, SubentryFlowResult
from homeassistant.core import callback
from homeassistant.helpers import selector

from .engine import PARENT_METER, PARENT_NONE
from .const import (
    CONF_BILL,
    CONF_CHARGES_KWH,
    CONF_CONTRACT_KW,
    CONF_CONTRACT_KW_F3,
    CONF_ENERGY_ENTITY,
    CONF_ENERGY_FIXED,
    CONF_ENTITY_F1,
    CONF_ENTITY_F2,
    CONF_ENTITY_F3,
    CONF_EXCISE_KWH,
    CONF_FULL_COST,
    CONF_ICON,
    CONF_METER_ENERGY,
    CONF_METER_POWER,
    CONF_NAME,
    CONF_NOTIFY,
    CONF_OVERLOAD,
    CONF_OVERLOAD_MINUTES,
    CONF_OVERLOAD_NOTIFY,
    CONF_PARENT,
    CONF_POWER_ENTITY,
    CONF_PRICE,
    CONF_PRICE_ENTITY,
    CONF_PRICE_F1,
    CONF_PRICE_F2,
    CONF_PRICE_F3,
    CONF_REPORT,
    CONF_TARIFF_MODE,
    CONF_TRANSPORT_FIXED,
    CONF_TRANSPORT_KWH,
    CONF_TRANSPORT_POWER,
    CONF_VAT,
    DEFAULT_ICON,
    DEFAULTS,
    DOMAIN,
    SUBENTRY_CONSUMER,
    TITLE,
)

_POWER = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor", device_class="power"))
_POWER_MANY = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor", device_class="power", multiple=True))
_ENERGY = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor", device_class="energy"))
_ENERGY_MANY = selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor", device_class="energy", multiple=True))
_PRICE_ENTITY = selector.EntitySelector(selector.EntitySelectorConfig(domain=["sensor", "input_number", "number"]))


def _number(lo: float, hi: float, step: float | str, unit: str) -> selector.NumberSelector:
    return selector.NumberSelector(selector.NumberSelectorConfig(min=lo, max=hi, step=step, unit_of_measurement=unit, mode=selector.NumberSelectorMode.BOX))


_PRICE = _number(0, 5, "any", "€/kWh")
_KW = _number(0.5, 100, 0.5, "kW")
_KW_F3 = _number(0, 100, 0.5, "kW")
_MODE = selector.SelectSelector(
    selector.SelectSelectorConfig(options=["fixed", "entity", "bands"], translation_key="tariff_mode", mode=selector.SelectSelectorMode.LIST)
)


def _fill(schema: vol.Schema, user_input: dict[str, Any]) -> dict[str, Any]:
    """I campi facoltativi lasciati vuoti non arrivano: qui tornano al valore vuoto, così si possono togliere."""
    out: dict[str, Any] = {}
    for marker in schema.schema:
        name = str(marker)
        if name in user_input:
            out[name] = user_input[name]
        elif isinstance(marker, vol.Optional):
            out[name] = [] if isinstance(DEFAULTS.get(name), list) else ""
    return out


class ConsumiConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return ConsumiOptionsFlow()

    @classmethod
    @callback
    def async_get_supported_subentry_types(cls, config_entry: ConfigEntry) -> dict[str, type[ConfigSubentryFlow]]:
        return {SUBENTRY_CONSUMER: ConsumerFlow}

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        schema = vol.Schema(
            {
                vol.Required(CONF_METER_POWER): _POWER_MANY,
                vol.Optional(CONF_METER_ENERGY): _ENERGY_MANY,
                vol.Required(CONF_CONTRACT_KW, default=DEFAULTS[CONF_CONTRACT_KW]): _KW,
                vol.Required(CONF_CONTRACT_KW_F3, default=DEFAULTS[CONF_CONTRACT_KW_F3]): _KW_F3,
                vol.Optional(CONF_PRICE_ENTITY): _PRICE_ENTITY,
                vol.Required(CONF_PRICE, default=DEFAULTS[CONF_PRICE]): _PRICE,
            }
        )
        errors: dict[str, str] = {}
        if user_input is not None:
            if not user_input.get(CONF_METER_POWER):
                errors[CONF_METER_POWER] = "meter_required"
            else:
                options = {**DEFAULTS, **_fill(schema, user_input)}
                options[CONF_TARIFF_MODE] = "entity" if options[CONF_PRICE_ENTITY] else "fixed"
                return self.async_create_entry(title=TITLE, data={}, options=options)
        return self.async_show_form(step_id="user", data_schema=self.add_suggested_values_to_schema(schema, user_input or {}), errors=errors)


class ConsumiOptionsFlow(OptionsFlow):
    """Opzioni divise in quattro pagine: contatore, tariffa, bolletta, avvisi."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        return self.async_show_menu(step_id="init", menu_options=["meter", "tariff", "bill", "alerts"])

    def _current(self) -> dict[str, Any]:
        return {**DEFAULTS, **self.config_entry.options}

    def _page(self, step_id: str, schema: vol.Schema, user_input: dict[str, Any] | None, errors: dict[str, str] | None = None) -> ConfigFlowResult:
        if user_input is not None and not errors:
            return self.async_create_entry(data={**self._current(), **_fill(schema, user_input)})
        return self.async_show_form(step_id=step_id, data_schema=self.add_suggested_values_to_schema(schema, user_input or self._current()), errors=errors or {})

    async def async_step_meter(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        schema = vol.Schema(
            {
                vol.Required(CONF_METER_POWER): _POWER_MANY,
                vol.Optional(CONF_METER_ENERGY): _ENERGY_MANY,
                vol.Required(CONF_CONTRACT_KW): _KW,
                vol.Required(CONF_CONTRACT_KW_F3): _KW_F3,
            }
        )
        errors = {CONF_METER_POWER: "meter_required"} if user_input is not None and not user_input.get(CONF_METER_POWER) else None
        return self._page("meter", schema, user_input, errors)

    async def async_step_tariff(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        schema = vol.Schema(
            {
                vol.Required(CONF_TARIFF_MODE): _MODE,
                vol.Required(CONF_PRICE): _PRICE,
                vol.Optional(CONF_PRICE_ENTITY): _PRICE_ENTITY,
                vol.Required(CONF_PRICE_F1): _PRICE,
                vol.Required(CONF_PRICE_F2): _PRICE,
                vol.Required(CONF_PRICE_F3): _PRICE,
                vol.Optional(CONF_ENTITY_F1): _PRICE_ENTITY,
                vol.Optional(CONF_ENTITY_F2): _PRICE_ENTITY,
                vol.Optional(CONF_ENTITY_F3): _PRICE_ENTITY,
            }
        )
        errors = None
        if user_input is not None and user_input.get(CONF_TARIFF_MODE) == "entity" and not user_input.get(CONF_PRICE_ENTITY):
            errors = {CONF_PRICE_ENTITY: "entity_required"}
        return self._page("tariff", schema, user_input, errors)

    async def async_step_bill(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        schema = vol.Schema(
            {
                vol.Required(CONF_BILL): selector.BooleanSelector(),
                vol.Required(CONF_FULL_COST): selector.BooleanSelector(),
                vol.Required(CONF_ENERGY_FIXED): _number(0, 10000, 0.01, "€/anno"),
                vol.Required(CONF_TRANSPORT_FIXED): _number(0, 10000, 0.01, "€/anno"),
                vol.Required(CONF_TRANSPORT_POWER): _number(0, 10000, 0.01, "€/kW/anno"),
                vol.Required(CONF_TRANSPORT_KWH): _PRICE,
                vol.Required(CONF_CHARGES_KWH): _PRICE,
                vol.Required(CONF_EXCISE_KWH): _PRICE,
                vol.Required(CONF_VAT): _number(0, 100, 0.1, "%"),
            }
        )
        return self._page("bill", schema, user_input)

    async def async_step_alerts(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        services = sorted(f"notify.{name}" for name in self.hass.services.async_services().get("notify", {}))
        for chosen in self._current().get(CONF_NOTIFY) or []:
            if chosen not in services:
                services.append(chosen)
        for chosen in self._current().get(CONF_OVERLOAD_NOTIFY) or []:
            if chosen not in services:
                services.append(chosen)
        who = selector.SelectSelector(selector.SelectSelectorConfig(options=services, multiple=True, custom_value=True, mode=selector.SelectSelectorMode.DROPDOWN))
        schema = vol.Schema(
            {
                vol.Optional(CONF_NOTIFY): who,
                vol.Required(CONF_REPORT): selector.BooleanSelector(),
                vol.Required(CONF_OVERLOAD): selector.BooleanSelector(),
                vol.Optional(CONF_OVERLOAD_NOTIFY): who,
                vol.Required(CONF_OVERLOAD_MINUTES): _number(1, 60, 1, "min"),
            }
        )
        return self._page("alerts", schema, user_input)


class ConsumerFlow(ConfigSubentryFlow):
    """Aggiunge o modifica un consumatore: nome, icona, sensore di potenza e/o di energia."""

    def _parents(self, own_id: str | None) -> list[selector.SelectOptionDict]:
        """Dove può stare un consumatore: sotto il contatore, sotto una linea (un altro consumatore) o da nessuna parte. Un solo livello."""
        italian = self.hass.config.language.startswith("it")
        subs = {sid: sub for sid, sub in self._get_entry().subentries.items() if sub.subentry_type == SUBENTRY_CONSUMER}
        has_children = any(sub.data.get(CONF_PARENT) == own_id for sub in subs.values()) if own_id else False
        options = [selector.SelectOptionDict(value=PARENT_METER, label="Contatore generale" if italian else "Main meter")]
        if not has_children:
            for sid, sub in subs.items():
                if sid != own_id and sub.data.get(CONF_PARENT, PARENT_METER) in (PARENT_METER, PARENT_NONE):
                    options.append(selector.SelectOptionDict(value=sid, label=sub.title))
        options.append(selector.SelectOptionDict(value=PARENT_NONE, label="Nessuno: linea separata dal contatore" if italian else "None: a line outside the meter"))
        return options

    def _schema(self, own_id: str | None = None) -> vol.Schema:
        return vol.Schema(
            {
                vol.Required(CONF_NAME): selector.TextSelector(),
                vol.Optional(CONF_ICON): selector.IconSelector(),
                vol.Optional(CONF_POWER_ENTITY): _POWER,
                vol.Optional(CONF_ENERGY_ENTITY): _ENERGY,
                vol.Required(CONF_PARENT, default=PARENT_METER): selector.SelectSelector(
                    selector.SelectSelectorConfig(options=self._parents(own_id), mode=selector.SelectSelectorMode.DROPDOWN)
                ),
            }
        )

    def _validate(self, user_input: dict[str, Any], own_id: str | None) -> tuple[dict[str, Any], dict[str, str]]:
        data = {
            CONF_NAME: str(user_input.get(CONF_NAME) or "").strip(),
            CONF_ICON: user_input.get(CONF_ICON) or DEFAULT_ICON,
            CONF_POWER_ENTITY: user_input.get(CONF_POWER_ENTITY) or "",
            CONF_ENERGY_ENTITY: user_input.get(CONF_ENERGY_ENTITY) or "",
            CONF_PARENT: user_input.get(CONF_PARENT) or PARENT_METER,
        }
        errors: dict[str, str] = {}
        if not data[CONF_NAME]:
            errors[CONF_NAME] = "name_required"
        elif any(
            sub.subentry_id != own_id and str(sub.data.get(CONF_NAME, "")).strip().lower() == data[CONF_NAME].lower()
            for sub in self._get_entry().subentries.values()
        ):
            errors[CONF_NAME] = "name_exists"
        if not data[CONF_POWER_ENTITY] and not data[CONF_ENERGY_ENTITY]:
            errors["base"] = "sensor_required"
        if data[CONF_PARENT] not in {o["value"] for o in self._parents(own_id)}:
            errors[CONF_PARENT] = "parent_invalid"
        return data, errors

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            data, errors = self._validate(user_input, None)
            if not errors:
                return self.async_create_entry(title=data[CONF_NAME], data=data)
        return self.async_show_form(step_id="user", data_schema=self.add_suggested_values_to_schema(self._schema(), user_input or {}), errors=errors)

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        subentry = self._get_reconfigure_subentry()
        errors: dict[str, str] = {}
        if user_input is not None:
            data, errors = self._validate(user_input, subentry.subentry_id)
            if not errors:
                return self.async_update_and_abort(self._get_entry(), subentry, title=data[CONF_NAME], data=data)
        return self.async_show_form(
            step_id="reconfigure", data_schema=self.add_suggested_values_to_schema(self._schema(subentry.subentry_id), user_input or dict(subentry.data)), errors=errors
        )
