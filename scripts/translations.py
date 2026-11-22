"""Genera translations/it.json, translations/en.json e strings.json da un'unica tabella (così le chiavi restano allineate)."""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "custom_components" / "consumi_elettrici"
PERIODS = {"oggi": ("oggi", "today"), "settimana": ("settimana", "this week"), "mese": ("mese", "this month"), "anno": ("anno", "this year")}


def T(it, en):
    return {"it": it, "en": en}


consumer_fields = {
    "data": {
        "name": T("Nome", "Name"),
        "icon": T("Icona", "Icon"),
        "power_entity": T("Sensore di potenza (W)", "Power sensor (W)"),
        "energy_entity": T("Sensore di energia (kWh)", "Energy sensor (kWh)"),
        "parent": T("Si trova sotto", "It sits behind"),
    },
    "data_description": {
        "power_entity": T("Serve per la potenza dal vivo. Se manca il sensore di energia, l'energia si calcola da qui.", "Used for live power. Without an energy sensor, energy is computed from it."),
        "energy_entity": T("Contatore che cresce nel tempo (kWh o Wh): è la misura più precisa, e porta con sé lo storico.", "A counter that grows over time (kWh or Wh): the most accurate source, and it brings its history."),
        "parent": T("Di solito il contatore generale. Se questo consumatore è su una linea che ha già il suo sensore (per esempio «Appartamento»), scegli quella linea: così non viene contato due volte.", "Usually the main meter. If this consumer is on a line that already has its own sensor (for example \"Apartment\"), choose that line: it will not be counted twice."),
    },
}
meter_fields = {
    "data": {
        "meter_power": T("Sensori di potenza del contatore (W)", "Meter power sensors (W)"),
        "meter_energy": T("Sensori di energia del contatore (kWh)", "Meter energy sensors (kWh)"),
        "contract_kw": T("Potenza del contratto", "Contract power"),
        "contract_kw_f3": T("Potenza in fascia F3 (0 = uguale)", "Power in band F3 (0 = same)"),
        "price_entity": T("Entità con il prezzo dell'energia (€/kWh)", "Entity with the energy price (€/kWh)"),
        "price": T("Prezzo fisso dell'energia", "Fixed energy price"),
    },
    "data_description": {
        "meter_power": T("Il totale di casa. Con più sensori i valori si sommano.", "The whole-house total. Several sensors are summed."),
        "meter_energy": T("Facoltativo ma consigliato: senza, l'energia si calcola dalla potenza.", "Optional but recommended: without it energy is computed from power."),
        "contract_kw": T("Potenza impegnata (per esempio 3, 4,5 o 6 kW): serve per l'avviso di sovraccarico e per la bolletta.", "Committed power (for example 3, 4.5 or 6 kW): used by the overload alert and the bill."),
        "contract_kw_f3": T("Per chi aderisce alla sperimentazione ARERA per la ricarica dei veicoli elettrici: 6 kW di notte (23-7), la domenica e i festivi. L'avviso di sovraccarico segue la potenza valida in quel momento.", "For the Italian ARERA electric-vehicle trial: 6 kW at night (23-7), on Sundays and holidays. The overload alert follows the power valid at that time."),
        "price_entity": T("Per esempio il sensore del fornitore. Se manca o non è disponibile vale il prezzo fisso.", "For example your supplier's sensor. When missing or unavailable the fixed price is used."),
    },
}

DATA = {
    "config": {
        "step": {"user": {"title": T("Consumi elettrici", "Electricity consumption"), "description": T("Scegli il contatore generale e il prezzo dell'energia. I consumatori si aggiungono dopo, dalla pagina dell'integrazione.", "Choose the main meter and the energy price. Consumers are added afterwards, from the integration page."), **meter_fields}},
        "error": {"meter_required": T("Scegli almeno un sensore di potenza.", "Choose at least one power sensor.")},
        "abort": {"already_configured": T("Consumi elettrici è già configurato.", "Electricity consumption is already configured.")},
    },
    "options": {
        "step": {
            "init": {"title": T("Consumi elettrici", "Electricity consumption"), "menu_options": {"meter": T("Contatore generale", "Main meter"), "tariff": T("Tariffa", "Tariff"), "bill": T("Bolletta", "Bill"), "alerts": T("Avvisi e report", "Alerts and report")}},
            "meter": {"title": T("Contatore generale", "Main meter"), "data": {k: v for k, v in meter_fields["data"].items() if k in ("meter_power", "meter_energy", "contract_kw", "contract_kw_f3")}, "data_description": {k: v for k, v in meter_fields["data_description"].items() if k in ("meter_power", "meter_energy", "contract_kw", "contract_kw_f3")}},
            "tariff": {
                "title": T("Tariffa", "Tariff"),
                "description": T("Le fasce seguono il calendario ARERA: F1 lun-ven 8-19; F2 lun-ven 7-8 e 19-23, sabato 7-23; F3 notte, domeniche e festivi. I kWh per fascia si contano sempre, anche con il prezzo fisso.", "Bands follow the Italian ARERA calendar: F1 Mon-Fri 8-19; F2 Mon-Fri 7-8 and 19-23, Saturday 7-23; F3 nights, Sundays and holidays. kWh per band are always counted, even with a fixed price."),
                "data": {
                    "tariff_mode": T("Tipo di prezzo", "Price type"),
                    "price": T("Prezzo fisso", "Fixed price"),
                    "price_entity": T("Entità con il prezzo", "Price entity"),
                    "price_f1": T("Prezzo F1", "F1 price"), "price_f2": T("Prezzo F2", "F2 price"), "price_f3": T("Prezzo F3", "F3 price"),
                    "entity_f1": T("Entità con il prezzo F1", "F1 price entity"), "entity_f2": T("Entità con il prezzo F2", "F2 price entity"), "entity_f3": T("Entità con il prezzo F3", "F3 price entity"),
                },
                "data_description": {
                    "price": T("Vale anche quando l'entità del prezzo non è disponibile.", "Also used when the price entity is unavailable."),
                    "entity_f1": T("Facoltative: se indicate, hanno la precedenza sui prezzi scritti sopra.", "Optional: when set they take precedence over the prices above."),
                },
            },
            "bill": {
                "title": T("Bolletta", "Bill"),
                "description": T("Le voci oltre al prezzo dell'energia: le trovi nella bolletta o nelle condizioni del contratto.", "The items beyond the energy price: you find them on your bill or contract."),
                "data": {
                    "bill_enabled": T("Stima la bolletta", "Estimate the bill"),
                    "full_cost": T("Costi comprensivi di trasporto, oneri, accise e IVA", "Costs include transport, charges, excise and VAT"),
                    "energy_fixed_year": T("Quota fissa materia energia", "Energy fixed fee"),
                    "energy_extra_kwh": T("Altri corrispettivi dell'energia al kWh", "Other energy charges per kWh"),
                    "other_month": T("Altre partite al mese", "Other items per month"),
                    "transport_fixed_year": T("Quota fissa trasporto", "Transport fixed fee"),
                    "transport_power_year": T("Quota potenza", "Power fee"),
                    "transport_kwh": T("Trasporto, quota energia", "Transport, per kWh"),
                    "charges_kwh": T("Oneri di sistema, quota energia", "System charges, per kWh"),
                    "excise_kwh": T("Accise", "Excise"),
                    "vat": T("IVA", "VAT"),
                },
                "data_description": {
                    "energy_fixed_year": T("Commercializzazione e altre quote fisse della materia energia, sommate su un anno.", "Retail fee and other fixed energy items, summed over a year."),
                    "energy_extra_kwh": T("Voci della materia energia che non sono nel prezzo, per esempio il dispacciamento (CdispD). Se il prezzo non comprende le perdite di rete, aggiungile qui.", "Energy items not included in the price, such as dispatching. If the price excludes grid losses, add them here."),
                    "transport_fixed_year": T("Trasporto quota fissa, su un anno.", "Transport fixed fee, over a year."),
                    "transport_power_year": T("Trasporto quota potenza più UC6 fisso, per kW e su un anno.", "Transport power fee, per kW and over a year."),
                    "transport_kwh": T("Trasporto quota energia più UC3 e UC6 variabile.", "Transport energy fee plus the variable UC components."),
                    "charges_kwh": T("ASOS più ARIM.", "ASOS plus ARIM."),
                    "excise_kwh": T("Imposta erariale: 0,0227 €/kWh. Sotto i 370 kWh al mese, per residenti fino a 3 kW, una parte è esente: qui non se ne tiene conto.", "Excise duty per kWh. The exemption for low monthly consumption is not modelled."),
                    "other_month": T("Sconti o addebiti fissi mensili, con il segno: uno sconto di 7,80 € si scrive -7,80.", "Fixed monthly discounts or charges, signed: a 7.80 discount is -7.80."),
                    "full_cost": T("Se attivo, i costi di contatore e consumatori sono quelli veri in bolletta (senza le quote fisse); altrimenti solo l'energia.", "When on, meter and consumer costs are the real billed ones (without fixed fees); otherwise energy only."),
                },
            },
            "alerts": {
                "title": T("Avvisi e report", "Alerts and report"),
                "data": {
                    "notify_services": T("A chi mandare il report", "Who receives the report"),
                    "overload_notify": T("A chi mandare l'avviso di sovraccarico", "Who receives the overload alert"),
                    "monthly_report": T("Report del mese, il primo giorno del mese", "Monthly report, on the first day of the month"),
                    "overload_alert": T("Avvisa quando si supera la potenza disponibile", "Alert when available power is exceeded"),
                    "overload_minutes": T("Minuti oltre la soglia prima dell'avviso", "Minutes above the threshold before alerting"),
                },
                "data_description": {
                    "overload_notify": T("Vuoto = gli stessi del report.", "Empty = same as the report."),
                    "notify_services": T("Servizi di notifica. Gli eventi consumi_elettrici_report e consumi_elettrici_sovraccarico partono comunque.", "Notify services. The consumi_elettrici_report and consumi_elettrici_sovraccarico events are fired anyway."),
                    "overload_alert": T("La soglia è la potenza del contratto più il 10%. L'integrazione avvisa soltanto: non spegne nulla.", "The threshold is contract power plus 10%. The integration only alerts: it switches nothing off."),
                },
            },
        },
        "error": {"meter_required": T("Scegli almeno un sensore di potenza.", "Choose at least one power sensor."), "entity_required": T("Scegli l'entità con il prezzo.", "Choose the price entity.")},
    },
    "config_subentries": {
        "consumer": {
            "initiate_flow": {"user": T("Aggiungi consumatore", "Add consumer")},
            "entry_type": T("Consumatore", "Consumer"),
            "step": {
                "user": {"title": T("Nuovo consumatore", "New consumer"), "description": T("Qualcosa che consuma e ha un sensore: una presa, una linea, la wallbox. Basta uno dei due sensori.", "Something that draws power and has a sensor: a plug, a line, the wallbox. One of the two sensors is enough."), **consumer_fields},
                "reconfigure": {"title": T("Modifica consumatore", "Edit consumer"), **consumer_fields},
            },
            "error": {
                "name_required": T("Scrivi un nome.", "Enter a name."),
                "name_exists": T("C'è già un consumatore con questo nome.", "A consumer with this name already exists."),
                "sensor_required": T("Scegli almeno un sensore, di potenza o di energia.", "Choose at least one sensor, power or energy."),
                "parent_invalid": T("Questa scelta non è possibile: una linea che contiene altri consumatori non può stare sotto un'altra.", "This choice is not possible: a line that contains other consumers cannot sit behind another one."),
            },
            "abort": {"reconfigure_successful": T("Consumatore aggiornato.", "Consumer updated.")},
        }
    },
    "selector": {
        "tariff_mode": {"options": {"fixed": T("Prezzo fisso", "Fixed price"), "entity": T("Prezzo da un'entità", "Price from an entity"), "bands": T("Prezzo per fasce F1, F2, F3", "Price per band F1, F2, F3")}},
        "report_period": {"options": {"last_month": T("Mese scorso", "Last month"), "month": T("Mese in corso", "Current month")}},
    },
    "entity": {
        "sensor": {
            "potenza": {"name": T("Potenza", "Power")},
            "non_monitorato_potenza": {"name": T("Non monitorato potenza", "Unmonitored power")},
            "non_monitorato_quota_oggi": {"name": T("Non monitorato quota oggi", "Unmonitored share today")},
            "prezzo": {"name": T("Prezzo energia", "Energy price")},
            "fascia": {"name": T("Fascia oraria", "Time band"), "state": {"f1": T("F1", "F1"), "f2": T("F2", "F2"), "f3": T("F3", "F3")}},
            "picco_oggi": {"name": T("Picco di oggi", "Peak today")},
            "bolletta_mese": {"name": T("Bolletta stimata mese", "Estimated bill this month")},
            "bolletta_mese_scorso": {"name": T("Bolletta stimata mese scorso", "Estimated bill last month")},
            "bolletta_anno": {"name": T("Bolletta stimata anno", "Estimated bill this year")},
        },
        "binary_sensor": {"sovraccarico": {"name": T("Sovraccarico", "Overload")}},
    },
    "services": {
        "import_history": {
            "name": T("Importa lo storico", "Import history"),
            "description": T("Riempie i giorni mancanti con le statistiche di Home Assistant dei sensori di energia. I giorni già misurati non si toccano.", "Fills missing days from Home Assistant statistics of the energy sensors. Measured days are left untouched."),
            "fields": {"days": {"name": T("Giorni", "Days"), "description": T("Quanti giorni indietro. Vuoto: dall'anno scorso per i sensori nuovi, dieci giorni per gli altri.", "How many days back. Empty: from last year for new sensors, ten days for the others.")}},
        },
        "send_report": {
            "name": T("Invia il report", "Send report"),
            "description": T("Manda subito il report del mese ai servizi di notifica scelti e lancia l'evento consumi_elettrici_report.", "Sends the monthly report now to the chosen notify services and fires the consumi_elettrici_report event."),
            "fields": {"period": {"name": T("Periodo", "Period"), "description": T("Mese scorso o mese in corso.", "Last month or current month.")}},
        },
    },
}
for key, (it, en) in PERIODS.items():
    s = DATA["entity"]["sensor"]
    s[f"energia_{key}"] = {"name": T(f"Energia {it}", f"Energy {en}")}
    s[f"costo_{key}"] = {"name": T(f"Costo {it}", f"Cost {en}")}
    s[f"non_monitorato_energia_{key}"] = {"name": T(f"Non monitorato energia {it}", f"Unmonitored energy {en}")}


def pick(node, lang):
    if isinstance(node, dict):
        if set(node) == {"it", "en"}:
            return node[lang]
        return {k: pick(v, lang) for k, v in node.items()}
    return node


def dump(path, lang):
    path.write_text(json.dumps(pick(DATA, lang), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


dump(OUT / "translations" / "it.json", "it")
dump(OUT / "translations" / "en.json", "en")
dump(OUT / "strings.json", "en")
print("ok")
