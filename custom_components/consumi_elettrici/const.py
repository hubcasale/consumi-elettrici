"""Costanti dell'integrazione Consumi elettrici."""
from homeassistant.const import Platform

DOMAIN = "consumi_elettrici"
PLATFORMS = [Platform.SENSOR, Platform.BINARY_SENSOR]
TITLE = "Consumi elettrici"

SUBENTRY_CONSUMER = "consumer"

# opzioni della voce di configurazione
CONF_METER_POWER = "meter_power"            # elenco di sensori di potenza del contatore generale (si sommano)
CONF_METER_ENERGY = "meter_energy"          # elenco di sensori di energia del contatore generale (si sommano)
CONF_CONTRACT_KW = "contract_kw"
CONF_CONTRACT_KW_F3 = "contract_kw_f3"      # potenza in fascia F3, se diversa (0 = uguale)
CONF_TARIFF_MODE = "tariff_mode"            # fixed | entity | bands
CONF_PRICE = "price"
CONF_PRICE_ENTITY = "price_entity"
CONF_PRICE_F1 = "price_f1"
CONF_PRICE_F2 = "price_f2"
CONF_PRICE_F3 = "price_f3"
CONF_ENTITY_F1 = "entity_f1"
CONF_ENTITY_F2 = "entity_f2"
CONF_ENTITY_F3 = "entity_f3"
CONF_BILL = "bill_enabled"
CONF_FULL_COST = "full_cost"
CONF_ENERGY_FIXED = "energy_fixed_year"
CONF_TRANSPORT_FIXED = "transport_fixed_year"
CONF_TRANSPORT_POWER = "transport_power_year"
CONF_TRANSPORT_KWH = "transport_kwh"
CONF_CHARGES_KWH = "charges_kwh"
CONF_EXCISE_KWH = "excise_kwh"
CONF_VAT = "vat"
CONF_NOTIFY = "notify_services"
CONF_OVERLOAD_NOTIFY = "overload_notify"    # destinatari dell'avviso di sovraccarico (vuoto = gli stessi del report)
CONF_REPORT = "monthly_report"
CONF_OVERLOAD = "overload_alert"
CONF_OVERLOAD_MINUTES = "overload_minutes"

# dati di un consumatore (sotto-voce)
CONF_NAME = "name"
CONF_ICON = "icon"
CONF_POWER_ENTITY = "power_entity"
CONF_ENERGY_ENTITY = "energy_entity"
CONF_PARENT = "parent"                      # "_meter", "_none" oppure l'id di un altro consumatore

DEFAULT_PRICE = 0.25
DEFAULT_ICON = "mdi:power-plug"
DEFAULTS = {
    CONF_METER_POWER: [],
    CONF_METER_ENERGY: [],
    CONF_CONTRACT_KW: 3.0,
    CONF_CONTRACT_KW_F3: 0.0,
    CONF_TARIFF_MODE: "fixed",
    CONF_PRICE: DEFAULT_PRICE,
    CONF_PRICE_ENTITY: "",
    CONF_PRICE_F1: DEFAULT_PRICE,
    CONF_PRICE_F2: DEFAULT_PRICE,
    CONF_PRICE_F3: DEFAULT_PRICE,
    CONF_ENTITY_F1: "",
    CONF_ENTITY_F2: "",
    CONF_ENTITY_F3: "",
    CONF_BILL: False,
    CONF_FULL_COST: True,
    CONF_ENERGY_FIXED: 0.0,
    CONF_TRANSPORT_FIXED: 0.0,
    CONF_TRANSPORT_POWER: 0.0,
    CONF_TRANSPORT_KWH: 0.0,
    CONF_CHARGES_KWH: 0.0,
    CONF_EXCISE_KWH: 0.0,
    CONF_VAT: 10.0,
    CONF_NOTIFY: [],
    CONF_OVERLOAD_NOTIFY: [],
    CONF_REPORT: True,
    CONF_OVERLOAD: True,
    CONF_OVERLOAD_MINUTES: 3,
}

STORAGE_VERSION = 1
CARD_URL = "/consumi_elettrici_static/consumi-elettrici-card.js"
CARD_FILE = "frontend/consumi-elettrici-card.js"

SIGNAL_UPDATE = f"{DOMAIN}_update_{{}}"     # formato con l'id della voce di configurazione
TICK_SECONDS = 60
SAVE_DELAY = 600
REFRESH_DELAY = 2                           # secondi: le letture ravvicinate aggiornano le entità una volta sola

EVENT_REPORT = f"{DOMAIN}_report"
EVENT_OVERLOAD = f"{DOMAIN}_sovraccarico"

SERVICE_IMPORT = "import_history"
SERVICE_REPORT = "send_report"
