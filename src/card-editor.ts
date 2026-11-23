import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { TABS } from "./card-logic";
import type { CardConfig, HomeAssistant, Tab } from "./types";

interface FormSchema {
  name: string;
  selector: Record<string, unknown>;
}

const MANAGED = ["title", "header", "default_tab", "max_rows", "hide_idle", "show_chart", "show_bands", "show_bill", "color"];
const LABELS: Record<string, string> = {
  title: "Titolo",
  header: "Mostra titolo, fascia e prezzo",
  default_tab: "Scheda aperta all'inizio",
  max_rows: "Consumatori visibili (0 = tutti)",
  hide_idle: "In «Adesso» nascondi i consumatori fermi",
  show_chart: "Mostra il grafico",
  show_bands: "Mostra i kWh per fascia",
  show_bill: "Mostra la bolletta stimata",
  color: "Colore della scheda",
};
const HELP: Record<string, string> = {
  max_rows: "Gli altri si vedono con «Mostra tutti».",
  show_bill: "Compare solo se la stima è attiva nelle opzioni dell'integrazione.",
  color: "Tinge lo sfondo e il bordo della scheda, come un blocco colorato della plancia. Nessuno lascia l'aspetto del tema.",
};

/** Editor visuale della scheda: solo quello che riguarda l'aspetto. Contatore, tariffa e consumatori stanno nell'integrazione. */
export class ConsumiElettriciCardEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config: CardConfig = { type: "custom:consumi-elettrici-card" };

  setConfig(config: CardConfig): void {
    this._config = { ...config };
  }

  private _schema(): FormSchema[] {
    return [
      { name: "title", selector: { text: {} } },
      { name: "header", selector: { boolean: {} } },
      { name: "default_tab", selector: { select: { mode: "dropdown", options: TABS.map((t) => ({ value: t.id, label: t.label })) } } },
      { name: "max_rows", selector: { number: { min: 0, max: 30, step: 1, mode: "box" } } },
      { name: "hide_idle", selector: { boolean: {} } },
      { name: "show_chart", selector: { boolean: {} } },
      { name: "show_bands", selector: { boolean: {} } },
      { name: "show_bill", selector: { boolean: {} } },
      { name: "color", selector: { ui_color: { include_none: true } } },
    ];
  }

  private _onForm(ev: CustomEvent<{ value: Record<string, unknown> }>): void {
    ev.stopPropagation();
    const v = ev.detail.value;
    // si scrive solo quello che è diverso dal comportamento normale: la configurazione resta corta.
    // Le chiavi che non sono di questo editor (grid_options, visibility, entry_id...) restano come sono.
    const next: CardConfig = { ...this._config };
    for (const key of MANAGED) delete (next as unknown as Record<string, unknown>)[key];
    if (typeof v.title === "string" && v.title.trim()) next.title = v.title.trim();
    if (v.header === false) next.header = false;
    if (typeof v.default_tab === "string" && v.default_tab !== "now" && TABS.some((t) => t.id === v.default_tab)) next.default_tab = v.default_tab as Tab;
    const rows = Math.round(Number(v.max_rows));
    if (Number.isFinite(rows) && rows > 0) next.max_rows = Math.min(rows, 30);
    if (v.hide_idle === true) next.hide_idle = true;
    if (v.show_chart === false) next.show_chart = false;
    if (v.show_bands === false) next.show_bands = false;
    if (v.show_bill === false) next.show_bill = false;
    // il selettore del colore, svuotato, non manda la chiave; «nessuno» vuol dire senza colore
    if (typeof v.color === "string" && v.color.trim() && v.color !== "none") next.color = v.color.trim();
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }

  render() {
    if (!this.hass) return nothing;
    const c = this._config;
    const data = {
      title: c.title ?? "",
      header: c.header !== false,
      default_tab: c.default_tab ?? "now",
      max_rows: c.max_rows ?? 0,
      hide_idle: c.hide_idle === true,
      show_chart: c.show_chart !== false,
      show_bands: c.show_bands !== false,
      show_bill: c.show_bill !== false,
      color: typeof c.color === "string" && c.color !== "none" ? c.color : "",
    };
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${this._schema()}
        .computeLabel=${(s: FormSchema) => LABELS[s.name] ?? s.name}
        .computeHelper=${(s: FormSchema) => HELP[s.name] ?? ""}
        @value-changed=${(e: CustomEvent<{ value: Record<string, unknown> }>) => this._onForm(e)}
      ></ha-form>
      <p class="hint">
        Contatore, tariffa, bolletta, avvisi e l'elenco dei consumatori si gestiscono in
        <a href="/config/integrations/integration/consumi_elettrici">Impostazioni → Dispositivi e servizi → Consumi elettrici</a>: valgono per tutte le schede.
      </p>
    `;
  }

  static styles = css`
    :host { display: block; }
    .hint { font-size: 13px; line-height: 1.4; color: var(--secondary-text-color, #727272); margin: 16px 0 0; }
    a { color: var(--primary-color, #03a9f4); }
  `;
}

if (!customElements.get("consumi-elettrici-card-editor")) customElements.define("consumi-elettrici-card-editor", ConsumiElettriciCardEditor);
