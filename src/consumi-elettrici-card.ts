import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import "./bars";
import "./card-editor";
import "./detail-dialog";
import {
  METER, PREVIOUS, TABS, UNMONITORED, cardSize, chartRange, colorFor, fmtEur, fmtKwh, fmtPct, fmtPrice, fmtWatt, livePowers, meterModel, monthName, ranking, rgba,
  segments, type Row,
} from "./card-logic";
import type { ConsumiDetailDialog } from "./detail-dialog";
import type { CardConfig, ConsumiInfo, ConsumiStats, HomeAssistant, Tab } from "./types";

const INFO_EVERY = 30_000;
const STATS_EVERY = 5 * 60_000;

/** Scheda dei consumi elettrici: potenza di adesso, classifica dei consumatori, energia e costo per periodo, grafico e bolletta.
 *  Un solo impianto per telefono e tablet: tutto si tocca, niente dipende dal passaggio del mouse. */
export class ConsumiElettriciCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config: CardConfig = { type: "custom:consumi-elettrici-card" };
  @state() private _info: ConsumiInfo | null = null;
  @state() private _stats: ConsumiStats | null = null;
  @state() private _error = "";
  @state() private _tab: Tab = "now";
  @state() private _expanded = false;
  private _infoAt = 0;
  private _statsAt = 0;
  private _statsFor = "";
  private _loading = false;
  private _loadingStats = false;
  private _timer?: number;
  private _dialog?: ConsumiDetailDialog;

  setConfig(config: CardConfig): void {
    this._config = { ...config };
    this._tab = config.default_tab && TABS.some((t) => t.id === config.default_tab) ? config.default_tab : "now";
    this._info = null;
    this._infoAt = 0;
  }
  getCardSize(): number {
    const rows = this._config.max_rows && this._config.max_rows > 0 ? this._config.max_rows : (this._info?.consumers.length ?? 4) + 1;
    return cardSize(rows, this._config.show_chart !== false, this._config.show_bill !== false && !!this._info?.bill.enabled, this._config.header !== false);
  }
  getGridOptions(): Record<string, number | string> {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: 3 };
  }
  static getStubConfig(): CardConfig {
    return { type: "custom:consumi-elettrici-card" };
  }
  static getConfigElement(): HTMLElement {
    return document.createElement("consumi-elettrici-card-editor");
  }

  connectedCallback(): void {
    super.connectedCallback();
    // periodi e grafico si rileggono a intervalli; la potenza arriva da sola con gli stati di Home Assistant
    this._timer = window.setInterval(() => this.requestUpdate(), 10_000);
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timer) window.clearInterval(this._timer);
  }

  protected updated(): void {
    if (!this.hass) return;
    const now = Date.now();
    if (!this._loading && now - this._infoAt > INFO_EVERY) void this._loadInfo();
    if (this._info && this._tab !== "now" && this._config.show_chart !== false) {
      const range = chartRange(this._tab);
      const want = `${range.granularity}:${range.count}`;
      if (!this._loadingStats && (this._statsFor !== want || now - this._statsAt > STATS_EVERY)) void this._loadStats(want, range);
    }
    if (this._dialog?.isConnected && this._info) {
      this._dialog.hass = this.hass;
      this._dialog.info = this._info;
      this._dialog.power = this._powerOf(this._dialog.target);
    }
  }

  private _message(err: unknown): string {
    return err instanceof Error ? err.message : ((err as { message?: string })?.message ?? String(err));
  }
  private async _loadInfo(): Promise<void> {
    this._loading = true;
    try {
      const msg: Record<string, unknown> = { type: "consumi_elettrici/info" };
      if (this._config.entry_id) msg.entry_id = this._config.entry_id;
      this._info = await this.hass.callWS<ConsumiInfo>(msg);
      this._error = "";
    } catch (err) {
      this._error = `Consumi elettrici non è configurato o l'integrazione non è caricata (${this._message(err)}).`;
    } finally {
      this._infoAt = Date.now();
      this._loading = false;
    }
  }
  private async _loadStats(want: string, range: { granularity: "day" | "month"; count: number }): Promise<void> {
    this._loadingStats = true;
    try {
      this._stats = await this.hass.callWS<ConsumiStats>({ type: "consumi_elettrici/stats", entry_id: this._info?.entry_id, ...range });
    } catch {
      this._stats = null;
    } finally {
      this._statsFor = want;
      this._statsAt = Date.now();
      this._loadingStats = false;
    }
  }

  private get _dark(): boolean {
    return !!this.hass?.themes?.darkMode;
  }
  private _powerOf(key: string): number | null {
    if (!this._info || key === "bill") return null;
    const live = livePowers(this._info, this.hass.states);
    return key === METER ? live.meter : key === UNMONITORED ? live.unmonitored : (live.consumers[key] ?? null);
  }
  private _colorOf(key: string): string {
    const i = this._info?.consumers.findIndex((c) => c.key === key) ?? -1;
    if (key === METER) return this._dark ? "#3987e5" : "#2a78d6";
    return key === UNMONITORED ? (this._dark ? "#8d8d88" : "#8a8a86") : colorFor(i, this._dark);
  }

  /** Apre il dettaglio (attaccato al body, così non resta tagliato dalla scheda). */
  private _open(target: string): void {
    if (!this._info) return;
    this._dialog?.remove();
    const el = document.createElement("consumi-detail-dialog") as ConsumiDetailDialog;
    el.hass = this.hass;
    el.info = this._info;
    el.target = target;
    el.color = this._colorOf(target);
    el.power = this._powerOf(target);
    el.moreInfo = (entityId: string) => this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
    el.addEventListener("closed", () => (this._dialog = undefined));
    document.body.appendChild(el);
    this._dialog = el;
  }
  private _setTab(tab: Tab): void {
    this._tab = tab;
    this._expanded = false;
  }

  private _row(r: Row, now: boolean) {
    const idle = now && (r.value ?? 0) < 1;
    const secondary = now
      ? r.value === null ? "Senza sensore di potenza" : r.outside ? "Fuori dal contatore" : idle ? "Fermo" : `${fmtPct(r.share)} del totale`
      : [fmtEur(r.cost), r.outside ? "fuori dal contatore" : fmtPct(r.share)].filter(Boolean).join(" · ");
    return html`<button class="row ${idle ? "idle" : ""}" @click=${() => this._open(r.key)}>
      <span class="shape" style="background:${rgba(r.color, r.kind === "unmonitored" ? 0.35 : 0.2)};color:${r.kind === "unmonitored" ? "var(--secondary-text-color)" : r.color}"><ha-icon .icon=${r.icon}></ha-icon></span>
      <span class="main">
        <span class="top"><span class="name">${r.name}</span><span class="value">${now ? fmtWatt(r.value) : fmtKwh(r.value)}</span></span>
        <span class="secondary">${secondary}</span>
        <span class="track"><span class="fill ${r.kind === "unmonitored" ? "hatched" : ""}" style="width:${r.bar * 100}%;background-color:${r.color}"></span></span>
      </span>
    </button>`;
  }

  render() {
    if (!this.hass) return nothing;
    const info = this._info;
    if (!info) {
      return html`<ha-card><div class="pad msg">${this._error || "Carico i consumi…"}</div></ha-card>`;
    }
    const cfg = this._config;
    const now = this._tab === "now";
    const live = livePowers(info, this.hass.states);
    const rank = ranking(info, this._tab, live, this._dark, cfg, this._expanded);
    const allRows = ranking(info, this._tab, live, this._dark).rows;
    const segs = segments(allRows);
    const meter = meterModel(live.meter, info.contract_kw, info.available_kw, info.overload);
    const period = now ? null : info.meter.periods[this._tab as Exclude<Tab, "now">];
    const prev = now ? null : PREVIOUS[this._tab as Exclude<Tab, "now">];
    const bands = !now && cfg.show_bands !== false ? info.meter.bands[this._tab as Exclude<Tab, "now">] : undefined;
    const series = this._stats?.series[METER];
    return html`<ha-card>
      ${cfg.header !== false
        ? html`<div class="header">
            <span class="shape accent"><ha-icon icon="mdi:lightning-bolt"></ha-icon></span>
            <span class="htitle">${cfg.title || "Consumi elettrici"}</span>
            <span class="chip" title="Fascia oraria e prezzo dell'energia"><b>F${info.tariff.band}</b>${fmtPrice(info.tariff.price)}</span>
          </div>`
        : nothing}

      <button class="hero" @click=${() => this._open(METER)} aria-label="Dettaglio di tutta la casa">
        ${now
          ? html`<span class="big">${fmtWatt(live.meter)}</span><span class="sub">in questo momento</span>`
          : html`<span class="big">${fmtKwh(period!.k)}</span><span class="sub">${fmtEur(period!.c)}<span class="dot">·</span>${prev!.label.toLowerCase()} ${fmtKwh(info.meter.periods[prev!.period].k)}</span>`}
        ${now && meter
          ? html`<span class="meter ${meter.level}">
                <span class="mtrack"><span class="mfill" style="width:${meter.pct}%"></span><span class="mmark" style="left:${meter.mark}%"></span></span>
                <span class="mtext">${meter.level !== "ok" ? html`<ha-icon icon="mdi:alert"></ha-icon>` : nothing}${meter.text}</span>
              </span>`
          : nothing}
      </button>

      <div class="tabs" role="tablist">
        ${TABS.map((t) => html`<button role="tab" aria-selected=${this._tab === t.id} class=${this._tab === t.id ? "on" : ""} @click=${() => this._setTab(t.id)}>${t.label}</button>`)}
      </div>

      ${segs.length > 1
        ? html`<div class="segbar" role="img" aria-label="Ripartizione: ${segs.map((s) => `${s.name} ${Math.round(s.pct)}%`).join(", ")}">
            ${segs.map((s) => html`<span class="segpart ${s.hatched ? "hatched" : ""}" style="flex-grow:${s.pct};background-color:${s.color}"></span>`)}
          </div>`
        : nothing}

      <div class="rows">
        ${info.consumers.length === 0
          ? html`<div class="msg">Nessun consumatore: aggiungili da Impostazioni → Dispositivi e servizi → Consumi elettrici.</div>`
          : rank.rows.map((r) => this._row(r, now))}
        ${rank.hidden > 0 || this._expanded
          ? html`<button class="more" @click=${() => (this._expanded = !this._expanded)}>${this._expanded ? "Mostra meno" : `Mostra tutti (${rank.hidden} in più)`}</button>`
          : nothing}
      </div>

      ${bands && bands.some((b) => b > 0)
        ? html`<div class="bands">${bands.map((k, i) => html`<span><b>F${i + 1}</b>${fmtKwh(k)}</span>`)}</div>`
        : nothing}

      ${!now && cfg.show_chart !== false
        ? html`<div class="block">
            <div class="btitle">${this._tab === "year" ? "Ultimi 12 mesi" : this._tab === "month" ? "Ultimi 30 giorni" : "Ultimi 14 giorni"}</div>
            ${series && this._stats ? html`<consumi-bars .labels=${this._stats.labels} .values=${series.k} .costs=${series.c} .color=${this._colorOf(METER)}></consumi-bars>` : html`<div class="msg">Carico…</div>`}
          </div>`
        : nothing}

      ${cfg.show_bill !== false && info.bill.enabled && info.bill.month
        ? html`<button class="bill" @click=${() => this._open("bill")}>
            <span class="shape neutral"><ha-icon icon="mdi:receipt-text-outline"></ha-icon></span>
            <span class="main">
              <span class="top"><span class="name">Bolletta stimata di ${monthName(info.now)}</span><span class="value">${fmtEur(info.bill.month.totale)}</span></span>
              <span class="secondary">${info.bill.forecast ? `A questo ritmo ${fmtEur(info.bill.forecast.totale)} a fine mese` : ""}</span>
            </span>
          </button>`
        : nothing}
    </ha-card>`;
  }

  static styles = css`
    :host { display: block; }
    ha-card { padding: 12px; display: flex; flex-direction: column; gap: 12px; overflow: hidden; color: var(--primary-text-color, #212121); }
    button { font: inherit; color: inherit; -webkit-tap-highlight-color: transparent; }
    .pad { padding: 8px; }
    .msg { color: var(--secondary-text-color, #727272); font-size: 14px; line-height: 1.4; padding: 8px 4px; }
    .shape { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none; --mdc-icon-size: 20px; }
    .shape.accent { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.2); color: var(--primary-color, #03a9f4); }
    .shape.neutral { background: rgba(127, 127, 127, 0.18); color: var(--primary-text-color, #212121); }

    .header { display: flex; align-items: center; gap: 12px; }
    .htitle { flex: 1; min-width: 0; font-size: 16px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; border: 1px solid var(--divider-color, #e0e0e0); font-size: 12.5px; font-variant-numeric: tabular-nums; color: var(--secondary-text-color, #727272); white-space: nowrap; }
    .chip b { color: var(--primary-text-color, #212121); font-weight: 600; }

    .hero { border: 0; background: transparent; text-align: left; padding: 4px; margin: 0; cursor: pointer; display: flex; flex-direction: column; gap: 2px; border-radius: 12px; }
    .hero:active { background: var(--secondary-background-color, #f5f5f5); }
    .big { font-size: 40px; line-height: 1.1; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
    .sub { font-size: 14px; color: var(--secondary-text-color, #727272); font-variant-numeric: tabular-nums; }
    .dot { margin: 0 6px; }
    .meter { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; --level: var(--primary-color, #03a9f4); }
    .meter.warning { --level: var(--warning-color, #ffa600); }
    .meter.critical { --level: var(--error-color, #db4437); }
    .mtrack { position: relative; height: 8px; border-radius: 4px; background: rgba(127, 127, 127, 0.2); }
    .mfill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 4px; background: var(--level); transition: width 0.4s; }
    .mmark { position: absolute; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; background: var(--primary-text-color, #212121); opacity: 0.55; border-radius: 1px; }
    .mtext { display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--secondary-text-color, #727272); --mdc-icon-size: 16px; }
    .meter.warning .mtext ha-icon, .meter.critical .mtext ha-icon { color: var(--level); }
    .meter.warning .mtext, .meter.critical .mtext { color: var(--primary-text-color, #212121); font-weight: 500; }

    .tabs { display: flex; background: var(--secondary-background-color, #f0f0f0); border-radius: 12px; padding: 4px; gap: 2px; overflow-x: auto; scrollbar-width: none; }
    .tabs::-webkit-scrollbar { display: none; }
    .tabs button { flex: 1 0 auto; border: 0; background: transparent; color: var(--secondary-text-color, #727272); font-size: 13.5px; font-weight: 500; min-height: 40px; padding: 0 10px; border-radius: 9px; cursor: pointer; white-space: nowrap; }
    .tabs button.on { background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18); }

    .segbar { display: flex; gap: 2px; height: 12px; }
    .segpart { flex: 1 1 0; min-width: 2px; border-radius: 3px; }
    .hatched { background-image: repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.45) 0 2px, transparent 2px 6px); }

    .rows { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 2px 20px; }
    .rows .msg, .rows .more { grid-column: 1 / -1; }
    .row, .bill { display: flex; align-items: center; gap: 12px; width: 100%; border: 0; background: transparent; text-align: left; padding: 8px 4px; border-radius: 12px; cursor: pointer; min-height: 56px; }
    .row:active, .bill:active { background: var(--secondary-background-color, #f5f5f5); }
    .main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
    .name { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
    .value { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .secondary { font-size: 12px; color: var(--secondary-text-color, #727272); font-variant-numeric: tabular-nums; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-height: 15px; }
    .track { display: block; height: 4px; border-radius: 2px; background: rgba(127, 127, 127, 0.16); margin-top: 5px; overflow: hidden; }
    .fill { display: block; height: 100%; border-radius: 2px; transition: width 0.4s; }
    .row.idle .name, .row.idle .value { color: var(--secondary-text-color, #727272); font-weight: 400; }
    .row.idle .shape { opacity: 0.55; }
    .more { border: 0; background: transparent; color: var(--primary-color, #03a9f4); font-size: 14px; font-weight: 500; min-height: 44px; border-radius: 12px; cursor: pointer; }
    .more:active { background: var(--secondary-background-color, #f5f5f5); }

    .bands { display: flex; gap: 8px; }
    .bands span { flex: 1; min-width: 0; display: flex; flex-direction: column; background: var(--secondary-background-color, #f5f5f5); border-radius: 10px; padding: 8px 10px; font-size: 13px; font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bands b { font-size: 11.5px; font-weight: 500; color: var(--secondary-text-color, #727272); }

    .block { border-top: 1px solid var(--divider-color, #e0e0e0); padding: 12px 4px 0; }
    .btitle { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--secondary-text-color, #727272); margin-bottom: 8px; }
    .bill { border-top: 1px solid var(--divider-color, #e0e0e0); border-radius: 0 0 12px 12px; padding-top: 12px; }

    @media (prefers-reduced-motion: reduce) { .mfill, .fill { transition: none; } }
  `;
}

if (!customElements.get("consumi-elettrici-card")) customElements.define("consumi-elettrici-card", ConsumiElettriciCard);

const w = window as unknown as { customCards?: { type: string; name: string; description: string; preview?: boolean }[] };
w.customCards = w.customCards ?? [];
if (!w.customCards.some((c) => c.type === "consumi-elettrici-card")) {
  w.customCards.push({ type: "consumi-elettrici-card", name: "Consumi elettrici", description: "Potenza di adesso, classifica dei consumatori, energia e costo per periodo, bolletta stimata.", preview: false });
}
