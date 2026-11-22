# Consumi elettrici

Integrazione per Home Assistant (HACS) con la sua scheda Lovelace per seguire i **consumi elettrici di casa**: il contatore generale e tutti i
**consumatori** che hanno un sensore (prese intelligenti, linee, wallbox). Si configura tutto dall'interfaccia, senza YAML.

Per ogni consumatore e per il totale: potenza di adesso, energia e costo di **oggi, settimana, mese e anno** (con il periodo precedente),
quota **non monitorata**, kWh per fascia F1/F2/F3, **bolletta stimata**, report di fine mese e avviso di sovraccarico.

## Come funziona

* **Contatore generale**: uno o più sensori di potenza (W) e, meglio, di energia (kWh) che misurano tutta la casa. Più sensori si sommano.
* **Consumatori**: ognuno ha un nome, un'icona e un sensore di potenza e/o di energia già presente in Home Assistant.
  * Con il sensore di **energia** (un contatore che cresce) i conti sono i più precisi e lo **storico arriva subito**: i giorni passati si
    leggono dalle statistiche di Home Assistant.
  * Con il solo sensore di **potenza** l'energia si calcola da lì, da quando aggiungi il consumatore.
* **Non monitorato** = contatore generale meno la somma dei consumatori: luci, prese senza sensore, apparecchi in attesa.
* **Linee con il loro sensore**: un consumatore può stare *sotto* un altro. Se una linea intera ha già una sonda (per esempio
  «Appartamento») e dentro ci sono prese con il loro sensore, per quelle prese si sceglie *Si trova sotto → Appartamento*: non vengono
  contate due volte, e in classifica la linea compare con il suo **resto** (quello che misura meno i consumatori che contiene).
  Un solo livello: una linea che contiene altri consumatori non può stare sotto un'altra.
* **Costo**: ogni kWh si paga al prezzo del momento in cui è stato consumato. Se il prezzo cambia, il passato non si ricalcola.
* I dati sono salvati dall'integrazione giorno per giorno: sopravvivono ai riavvii e non dipendono dalla durata del recorder.

L'integrazione **misura soltanto**: non accende e non spegne nulla.

## Installazione

1. HACS → menu ⋮ → *Repository personalizzati* → `https://github.com/hubcasale/consumi-elettrici` (Integrazione).
2. Scarica e riavvia Home Assistant.
3. Impostazioni → Dispositivi e servizi → *Aggiungi integrazione* → **Consumi elettrici**: scegli i sensori del contatore, la potenza del
   contratto e il prezzo dell'energia.
4. Nella pagina dell'integrazione, **Aggiungi consumatore** per ognuno dei tuoi consumatori. Si modificano e si tolgono dalla stessa pagina.
5. Aggiungi la scheda **Consumi elettrici** alla dashboard: la carica l'integrazione, non c'è nessuna risorsa da registrare.
   Su Fully Kiosk svuota la cache dopo ogni aggiornamento.

Serve Home Assistant 2025.7 o più recente.

## Opzioni

Dalla pagina dell'integrazione, **Configura**:

| Pagina | Cosa contiene |
| --- | --- |
| **Contatore generale** | sensori di potenza e di energia, potenza del contratto e, se diversa, potenza in fascia F3 |
| **Tariffa** | prezzo fisso, prezzo letto da un'entità (per esempio il sensore del fornitore) oppure prezzi per fascia F1/F2/F3 |
| **Bolletta** | quota fissa, trasporto, oneri, accise, IVA; se i costi devono comprendere queste voci |
| **Avvisi e report** | a chi mandare il report mensile e a chi l'avviso di sovraccarico (due elenchi distinti) |

### Fasce orarie

Le fasce seguono il calendario ARERA, festività nazionali comprese:

| Fascia | Quando |
| --- | --- |
| **F1** | lunedì-venerdì 8-19 |
| **F2** | lunedì-venerdì 7-8 e 19-23, sabato 7-23 |
| **F3** | tutti i giorni 23-7, domeniche e festivi |

I kWh del contatore generale si contano sempre per fascia, anche con il prezzo fisso: servono per capire se una tariffa a fasce conviene.

### Costi e bolletta

Con la stima della bolletta attiva, il **costo** di contatore e consumatori comprende le quote variabili (trasporto, oneri, accise) e l'IVA,
cioè quanto quei kWh pesano davvero in bolletta; le quote fisse entrano solo nella bolletta stimata. Disattivando *Costi comprensivi…* il
costo torna a essere energia × prezzo.

La bolletta stimata usa le voci che inserisci: è una stima, non sostituisce quella del fornitore. Si trovano nella pagina
«Elementi di dettaglio» della bolletta:

| Campo | Dove si legge |
| --- | --- |
| Quota fissa materia energia | commercializzazione e altre quote fisse al mese × 12 |
| Altri corrispettivi dell'energia al kWh | dispacciamento (CdispD) e, se il prezzo non le comprende, le perdite di rete |
| Quota fissa trasporto | trasporto quota fissa al mese × 12 |
| Quota potenza | (trasporto quota potenza + UC6 fisso) al kW al mese × 12 |
| Trasporto, quota energia | trasporto quota energia + UC3 + UC6 variabile |
| Oneri di sistema | ASOS + ARIM |
| Accise | imposta erariale al kWh |
| Altre partite al mese | sconti o addebiti fissi, con il segno |

### Sovraccarico

Con la **sperimentazione ARERA** per la ricarica dei veicoli elettrici la potenza sale (di solito a 6 kW) di notte dalle 23 alle 7, la
domenica e i festivi: sono esattamente le ore della fascia F3. Indica quella potenza in *Potenza in fascia F3*: l'avviso e la barra della
scheda seguono la potenza valida in quel momento, così alle 7 di un giorno feriale vieni avvisato se la ricarica è ancora in corso.
La quota potenza della bolletta resta calcolata sulla potenza di contratto.

Quando il prelievo supera la potenza disponibile (contratto + 10%) per i minuti scelti arriva un avviso con chi sta consumando di più;
un secondo avviso parte se il prelievo sale oltre il 33% del contratto, quando il contatore stacca in un paio di minuti.
I tempi di intervento del contatore dipendono dal distributore: prendi le soglie come indicazione.

## Entità

Dispositivo **Consumi elettrici** (contatore generale):

* `sensor.consumi_elettrici_potenza`, `…_picco_di_oggi`
* `…_energia_oggi`, `_settimana`, `_mese`, `_anno` (attributi: periodo precedente e kWh per fascia `f1`, `f2`, `f3`)
* `…_costo_oggi`, `_settimana`, `_mese`, `_anno`
* `…_non_monitorato_potenza`, `…_non_monitorato_energia_oggi` / `_mese`, `…_non_monitorato_quota_oggi` (%)
* `…_prezzo_energia`, `…_fascia_oraria`
* `…_bolletta_stimata_mese`, `_mese_scorso`, `_anno` (con le voci tra gli attributi e la previsione a fine mese)
* `binary_sensor.consumi_elettrici_sovraccarico`

Un dispositivo **Consumi *nome*** per ogni consumatore, con energia e costo di oggi, settimana, mese e anno
(per esempio `sensor.consumi_lavatrice_energia_mese`). Alcune entità nascono disattivate: si accendono dalla pagina del dispositivo.

Gli identificativi seguono la lingua di Home Assistant: quelli qui sopra valgono per l'italiano.

## La scheda

```yaml
type: custom:consumi-elettrici-card
# facoltativi (si impostano anche dall'editor visuale):
title: Consumi
header: false          # senza titolo, fascia e prezzo
default_tab: today     # now (predefinito) | today | week | month | year
max_rows: 5            # consumatori visibili prima di «Mostra tutti»
hide_idle: true        # in «Adesso» nasconde i consumatori fermi
show_chart: false
show_bands: false
show_bill: false
```

* In alto la **potenza di adesso** con la barra rispetto al contratto, oppure i kWh e il costo del periodo scelto.
* **Adesso / Oggi / Settimana / Mese / Anno**: la classifica dei consumatori con valore, costo e quota del totale. La barra a segmenti
  mostra di cosa è fatto il totale; il non monitorato è tratteggiato. Ogni riga è una fetta diversa: una linea che contiene altri
  consumatori compare come «*nome* · resto», e nel suo dettaglio si vedono il totale della linea e chi c'è dentro.
* **Grafico** dei kWh per giorno o per mese: toccando una colonna si leggono data, kWh e costo.
* Toccando un consumatore (o il totale) si apre il **dettaglio**: tutti i periodi, andamento a 30 giorni e 12 mesi.
* **Bolletta stimata** del mese, con le voci e la previsione a fine mese.

Funziona allo stesso modo su telefono e tablet a muro: tutto si tocca, niente dipende dal passaggio del mouse. Su una scheda larga i
consumatori si dispongono su due colonne.

## Servizi ed eventi

| Servizio | Cosa fa |
| --- | --- |
| `consumi_elettrici.import_history` | riempie i giorni mancanti dalle statistiche di Home Assistant (`days` facoltativo). I giorni già misurati non si toccano |
| `consumi_elettrici.send_report` | manda subito il report (`period`: `last_month` o `month`) e ne restituisce i dati |

| Evento | Quando |
| --- | --- |
| `consumi_elettrici_report` | con ogni report: mese, kWh, costo, bolletta, fasce, consumatori, `title` e `message` |
| `consumi_elettrici_sovraccarico` | a ogni nuovo livello di sovraccarico: `level` (1 o 2), `power`, `consumers`, `title` e `message` |

Esempio: far leggere il report ad Alexa.

```yaml
automation:
  - alias: Report consumi su Alexa
    triggers:
      - trigger: event
        event_type: consumi_elettrici_report
    actions:
      - action: notify.alexa_media_echo_cucina
        data:
          message: "{{ trigger.event.data.message }}"
          data: { type: tts }
```

## Limiti da conoscere

* Un contatore di energia che resta fermo mentre Home Assistant è spento per più di sei ore riparte da capo: i giorni mancanti si
  recuperano dalle statistiche, quando ci sono.
* I salti impossibili di un contatore (più di 25 kW medi) si scartano: capita con le prese che ogni tanto mandano valori sbagliati.
* Lo storico importato usa il prezzo di oggi, perché quello di allora non è noto.
* Le accise si contano su tutti i kWh: l'esenzione dei primi kWh per i residenti fino a 3 kW (che sparisce sopra i 370 kWh al mese)
  non è calcolata.
* Le voci regolate (trasporto, oneri) cambiano ogni trimestre: vanno aggiornate a mano quando cambiano in bolletta.
* Dal nono consumatore in poi il colore nei grafici è un grigio comune: otto tinte sono il massimo che si distingue bene.

## Sviluppo

```bash
npm ci
npm test            # logica della scheda
npm run build       # custom_components/consumi_elettrici/frontend/consumi-elettrici-card.js
npm run build:dev   # dev/bundle.js, poi apri dev/index.html (dati finti; parametri in cima al file)

pip install pytest-homeassistant-custom-component home-assistant-frontend
python -m pytest -q tests
python scripts/translations.py   # rigenera strings.json e translations/ dalla tabella unica
```

Il motore (`engine.py`: fasce, tariffa, accumulo, periodi, bolletta) non dipende da Home Assistant e ha le sue prove in `tests/test_engine.py`.

## Licenza

MIT
