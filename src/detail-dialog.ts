import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import "./bars";
import { METER, PREVIOUS, UNMONITORED, childrenOf, fmt, fmtEur, fmtKwh, fmtWatt, monthName, rgba } from "./card-logic";
import type { BillEstimate, ConsumiInfo, ConsumiStats, HomeAssistant, SourceData, Tab } from "./types";

type BillPeriod = "month" | "last_month" | "year";

/** Finestra di dettaglio, attaccata a document.body: un consumatore (o il contatore, o il non monitorato) oppure la bolletta.
 *  Si chiude toccando fuori, la ✕ o Esc. */
export class ConsumiDetailDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) info!: ConsumiInfo;
  /** chiave della sorgente da mostrare, oppure "bill" */
  @property() target = METER;
  @property() color = "#2a78d6";
  @property({ attribute: false }) power: number | null = null;
  /** chiesto dalla scheda per aprire la finestra «maggiori informazioni» di un'entità */
  @property({ attribute: false }) moreInfo?: (entityId: string) => void;
  @state() private _granularity: "day" | "month" = "day";
  @state() private _stats: ConsumiStats | null = null;
  @state() private _billPeriod: BillPeriod = "month";
  private _loadedFor = "";

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKey);
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKey);
  }
  private _onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") this._close();
  };
  private _close(): void {
    this.dispatchEvent(new CustomEvent("closed"));
    this.remove();
  }

  protected updated(): void {
    if (this.target !== "bill" && this.hass && this._loadedFor !== this._granularity) void this._load();
  }
  private async _load(): Promise<void> {
    const granularity = this._granularity;
    this._loadedFor = granularity;
    try {
      this._stats = await this.hass.callWS<ConsumiStats>({ type: "consumi_elettrici/stats", entry_id: this.info.entry_id, granularity, count: granularity === "day" ? 30 : 12 });
    } catch {
      this._stats = null;
    }
  }

  private _source(): { data: SourceData; name: string; icon: string; entity: string | null } {
    const i = this.info;
    if (this.target === METER) return { data: i.meter, name: "Tutta la casa", icon: "mdi:home-lightning-bolt-outline", entity: i.meter.power_entities[0] ?? i.meter.energy_entities[0] ?? null };
    if (this.target === UNMONITORED) return { data: i.unmonitored, name: "Non monitorato", icon: "mdi:help-circle-outline", entity: null };
    const c = i.consumers.find((x) => x.key === this.target) ?? i.consumers[0];
    return { data: c, name: c.name, icon: c.icon, entity: c.power_entity ?? c.energy_entity };
  }

  private _renderSource() {
    const { data, name, icon, entity } = this._source();
    const tabs: Exclude<Tab, "now">[] = ["today", "week", "month", "year"];
    const titles = { today: "Oggi", week: "Settimana", month: "Mese", year: "Anno" };
    const series = this._stats?.series[this.target];
    const bands = this.target === METER ? this.info.meter.bands.month : undefined;
    const bandSum = bands ? bands.reduce((a, b) => a + b, 0) : 0;
    const line = this.info.consumers.find((c) => c.key === this.target);
    const kids = line ? this.info.consumers.filter((c) => childrenOf(this.info, line.key).includes(c.key)) : [];
    return html`
      <div class="head">
        <span class="shape" style="background:${rgba(this.color, 0.2)};color:${this.color}"><ha-icon .icon=${icon}></ha-icon></span>
        <div class="title">${name}</div>
        <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
      </div>
      <div class="body">
        ${this.power !== null ? html`<div class="now"><span class="big">${fmtWatt(this.power)}</span><span class="sub">adesso</span></div>` : nothing}
        ${this.target === UNMONITORED
          ? html`<p class="note">È quello che il contatore misura e nessun consumatore spiega: luci, prese senza sensore, apparecchi in attesa. Per ridurlo aggiungi altri consumatori.</p>`
          : nothing}
        <div class="tiles">
          ${tabs.map(
            (t) => html`<div class="tile">
              <div class="label">${titles[t]}</div>
              <div class="value">${fmtKwh(data.periods[t].k)}</div>
              <div class="cost">${fmtEur(data.periods[t].c)}</div>
              <div class="prev">${PREVIOUS[t].label}: ${fmtKwh(data.periods[PREVIOUS[t].period].k)}</div>
            </div>`,
          )}
        </div>
        ${bands && bandSum > 0
          ? html`<div class="sec">Fasce del mese</div>
              <div class="bands">
                ${bands.map((k, i) => html`<div class="band"><span class="label">F${i + 1}</span><span class="value">${fmtKwh(k)}</span><span class="prev">${Math.round((k / bandSum) * 100)}%</span></div>`)}
              </div>`
          : nothing}
        ${line && kids.length
          ? html`<div class="sec">Dentro questa linea, questo mese</div>
              <div class="table">
                ${kids.map((c) => html`<div class="line"><span>${c.name}</span><span>${fmtKwh(c.periods.month.k)}</span></div>`)}
                <div class="line"><span>Resto della linea</span><span>${fmtKwh(line.rest?.periods.month.k)}</span></div>
              </div>`
          : nothing}
        ${this.target === METER && this.info.peak.w
          ? html`<div class="line"><span>Picco di oggi</span><span>${fmtWatt(this.info.peak.w)}${this.info.peak.at ? ` alle ${this.info.peak.at}` : ""}</span></div>`
          : nothing}
        <div class="sec row">
          <span>Andamento</span>
          <span class="seg" role="group" aria-label="Intervallo del grafico">
            <button class=${this._granularity === "day" ? "on" : ""} aria-pressed=${this._granularity === "day"} @click=${() => (this._granularity = "day")}>30 giorni</button>
            <button class=${this._granularity === "month" ? "on" : ""} aria-pressed=${this._granularity === "month"} @click=${() => (this._granularity = "month")}>12 mesi</button>
          </span>
        </div>
        ${series && this._stats
          ? html`<consumi-bars .labels=${this._stats.labels} .values=${series.k} .costs=${series.c} .color=${this.color}></consumi-bars>`
          : html`<div class="note">Carico…</div>`}
        ${entity && this.moreInfo
          ? html`<div class="foot"><button class="btn" @click=${() => { this.moreInfo?.(entity); this._close(); }}>Apri il sensore</button></div>`
          : nothing}
      </div>
    `;
  }

  private _renderBill() {
    const bill = this.info.bill;
    const periods: { id: BillPeriod; label: string }[] = [
      { id: "month", label: monthName(this.info.now) },
      { id: "last_month", label: monthName(this.info.now, -1) },
      { id: "year", label: "Anno" },
    ];
    const est: BillEstimate | undefined = bill[this._billPeriod];
    const rows: [string, number][] = est
      ? [["Energia", est.energia], ["Trasporto e contatore", est.trasporto], ["Oneri di sistema", est.oneri], ["Accise", est.accise], ["IVA", est.iva]]
      : [];
    return html`
      <div class="head">
        <span class="shape neutral"><ha-icon icon="mdi:receipt-text-outline"></ha-icon></span>
        <div class="title">Bolletta stimata</div>
        <button class="x" aria-label="Chiudi" @click=${() => this._close()}>✕</button>
      </div>
      <div class="body">
        <span class="seg wide" role="group" aria-label="Periodo">
          ${periods.map((p) => html`<button class=${this._billPeriod === p.id ? "on" : ""} aria-pressed=${this._billPeriod === p.id} @click=${() => (this._billPeriod = p.id)}>${p.label.charAt(0).toUpperCase() + p.label.slice(1)}</button>`)}
        </span>
        ${est
          ? html`<div class="now"><span class="big">${fmtEur(est.totale)}</span><span class="sub">${fmtKwh(est.kwh)}</span></div>
              <div class="table">
                ${rows.map(([label, value]) => html`<div class="line"><span>${label}</span><span>${fmtEur(value)}</span></div>`)}
                <div class="line total"><span>Totale</span><span>${fmtEur(est.totale)}</span></div>
              </div>`
          : nothing}
        ${this._billPeriod === "month" && bill.forecast
          ? html`<p class="note">A questo ritmo il mese chiude a circa <b>${fmtEur(bill.forecast.totale)}</b> (${fmt(bill.forecast.kwh, 0)} kWh).</p>`
          : nothing}
        <p class="note">Stima fatta con le voci inserite nelle opzioni dell'integrazione: le quote fisse contano per un mese intero${this._billPeriod === "year" ? " per ogni mese iniziato" : ""}.</p>
      </div>
    `;
  }

  render() {
    if (!this.info) return nothing;
    return html`<div class="backdrop" @click=${(e: Event) => e.target === e.currentTarget && this._close()}>
      <div class="panel" role="dialog" aria-modal="true">${this.target === "bill" ? this._renderBill() : this._renderSource()}</div>
    </div>`;
  }

  static styles = css`
    :host { position: fixed; inset: 0; z-index: 10000; color: var(--primary-text-color, #212121); font-family: var(--paper-font-body1_-_font-family, Roboto, Helvetica, Arial, sans-serif); }
    .backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.55); display: flex; align-items: center; justify-content: center; padding: 12px; box-sizing: border-box; }
    .panel { background: var(--card-background-color, #fff); border-radius: 16px; width: 100%; max-width: 520px; max-height: min(90vh, 780px); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4); }
    .head { display: flex; align-items: center; gap: 12px; padding: 12px 12px 12px 16px; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
    .title { flex: 1; min-width: 0; font-size: 17px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .shape { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; --mdc-icon-size: 22px; }
    .shape.neutral { background: rgba(127, 127, 127, 0.18); color: var(--primary-text-color, #212121); }
    .x { border: 0; background: transparent; color: inherit; font-size: 18px; cursor: pointer; width: 44px; height: 44px; border-radius: 50%; flex: none; }
    .x:active { background: var(--secondary-background-color, #f0f0f0); }
    .body { overflow: auto; padding: 14px 16px 18px; -webkit-overflow-scrolling: touch; }
    .now { display: flex; align-items: baseline; gap: 8px; margin: 2px 0 12px; }
    .big { font-size: 30px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
    .sub { font-size: 13px; color: var(--secondary-text-color, #727272); }
    .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .tile, .band { background: var(--secondary-background-color, #f5f5f5); border-radius: 12px; padding: 10px 12px; min-width: 0; }
    .label { font-size: 12px; color: var(--secondary-text-color, #727272); }
    .value { font-size: 17px; font-weight: 600; font-variant-numeric: tabular-nums; margin-top: 2px; }
    .cost { font-size: 13px; font-variant-numeric: tabular-nums; }
    .prev { font-size: 11.5px; color: var(--secondary-text-color, #727272); margin-top: 4px; font-variant-numeric: tabular-nums; }
    .bands { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .band { display: flex; flex-direction: column; }
    .band .value { font-size: 14px; }
    .band .prev { margin-top: 0; }
    .sec { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--secondary-text-color, #727272); margin: 18px 0 8px; }
    .sec.row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .seg { display: inline-flex; background: var(--secondary-background-color, #f0f0f0); border-radius: 10px; padding: 3px; text-transform: none; letter-spacing: 0; }
    .seg.wide { display: flex; margin-bottom: 12px; }
    .seg button { flex: 1; border: 0; background: transparent; color: var(--secondary-text-color, #727272); font: inherit; font-size: 13px; font-weight: 500; padding: 8px 12px; min-height: 36px; border-radius: 8px; cursor: pointer; white-space: nowrap; }
    .seg button.on { background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18); }
    .line { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; font-size: 14px; border-bottom: 1px solid var(--divider-color, #e0e0e0); font-variant-numeric: tabular-nums; }
    .line.total { font-weight: 600; border-bottom: 0; }
    .table { margin-top: 4px; }
    .note { font-size: 13px; line-height: 1.4; color: var(--secondary-text-color, #727272); margin: 10px 0 0; }
    .foot { display: flex; justify-content: flex-end; margin-top: 14px; }
    .btn { border: 0; background: var(--secondary-background-color, #f0f0f0); color: var(--primary-text-color, #212121); font: inherit; font-size: 14px; font-weight: 500; padding: 0 16px; min-height: 44px; border-radius: 12px; cursor: pointer; }
    @media (max-width: 420px) { .big { font-size: 26px; } }
  `;
}

if (!customElements.get("consumi-detail-dialog")) customElements.define("consumi-detail-dialog", ConsumiDetailDialog);
