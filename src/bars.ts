import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { axisTicks, dateLabel, fmtAxis, fmtEur, fmtKwh, niceMax } from "./card-logic";

/** Grafico a colonne di una sola serie (kWh per giorno o per mese). Toccando una colonna si leggono data, kWh e costo:
 *  niente passaggio del mouse, così funziona sul tablet. Senza selezione si legge l'ultima colonna (il periodo in corso). */
export class ConsumiBars extends LitElement {
  @property({ attribute: false }) labels: string[] = [];
  @property({ attribute: false }) values: number[] = [];
  @property({ attribute: false }) costs: number[] = [];
  @property() color = "#2a78d6";
  @state() private _selected: number | null = null;

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("labels")) this._selected = null;
  }

  render() {
    const n = this.labels.length;
    if (!n) return html`<div class="empty">Nessun dato</div>`;
    const sel = this._selected !== null && this._selected < n ? this._selected : n - 1;
    const top = niceMax(Math.max(...this.values, 0));
    const ticks = new Set(axisTicks(n, n > 14 ? 6 : 5));
    return html`
      <div class="readout">
        <span class="when">${dateLabel(this.labels[sel], true)}</span>
        <span class="val">${fmtKwh(this.values[sel] ?? 0)}</span>
        <span class="cost">${fmtEur(this.costs[sel] ?? 0)}</span>
      </div>
      <div class="plot" role="group" aria-label="Consumo per periodo, in kWh">
        <div class="grid" aria-hidden="true">
          <span class="line" style="bottom:100%"><i>${fmtAxis(top)}</i></span>
          <span class="line" style="bottom:50%"><i>${fmtAxis(top / 2)}</i></span>
          <span class="line base" style="bottom:0"></span>
        </div>
        <div class="cols">
          ${this.labels.map((label, i) => {
            const v = this.values[i] ?? 0;
            const h = v > 0 ? Math.max((v / top) * 100, 1.5) : 0;
            return html`<button
              class="col ${i === sel ? "on" : ""}"
              aria-label="${dateLabel(label, true)}: ${fmtKwh(v)}, ${fmtEur(this.costs[i] ?? 0)}"
              aria-pressed=${i === sel}
              @click=${() => (this._selected = i)}
              @pointerenter=${(e: PointerEvent) => e.pointerType === "mouse" && (this._selected = i)}
            >
              <span class="bar" style="height:${h}%;background:${this.color}"></span>
            </button>`;
          })}
        </div>
      </div>
      <div class="axis" aria-hidden="true">${this.labels.map((label, i) => html`<span class="tick">${ticks.has(i) ? html`<i>${dateLabel(label)}</i>` : nothing}</span>`)}</div>
    `;
  }

  static styles = css`
    :host { display: block; }
    .empty { color: var(--secondary-text-color, #727272); font-size: 13px; padding: 16px 0; text-align: center; }
    .readout { display: flex; align-items: baseline; gap: 10px; font-size: 13px; color: var(--secondary-text-color, #727272); margin-bottom: 10px; flex-wrap: wrap; }
    .readout .val { color: var(--primary-text-color, #212121); font-weight: 600; font-size: 15px; font-variant-numeric: tabular-nums; }
    .readout .cost { font-variant-numeric: tabular-nums; }
    .plot { position: relative; height: 120px; margin-left: 30px; }
    .grid { position: absolute; inset: 0; pointer-events: none; }
    .line { position: absolute; left: 0; right: 0; height: 1px; background: var(--divider-color, #e0e0e0); opacity: 0.7; }
    .line.base { opacity: 1; }
    .line i { position: absolute; right: 100%; margin-right: 6px; top: -7px; font-style: normal; font-size: 11px; line-height: 14px; color: var(--secondary-text-color, #727272); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .cols { position: absolute; inset: 0; display: flex; align-items: stretch; }
    .col { flex: 1 1 0; min-width: 0; padding: 0 1px; margin: 0; border: 0; background: transparent; display: flex; align-items: flex-end; justify-content: center; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .col:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: -2px; border-radius: 4px; }
    .bar { display: block; width: 100%; max-width: 24px; border-radius: 4px 4px 0 0; opacity: 0.45; transition: opacity 0.15s; }
    .col.on .bar { opacity: 1; }
    .axis { display: flex; margin: 4px 0 0 30px; height: 16px; }
    .tick { flex: 1 1 0; min-width: 0; position: relative; }
    .tick i { position: absolute; left: 50%; transform: translateX(-50%); font-style: normal; font-size: 11px; line-height: 16px; color: var(--secondary-text-color, #727272); white-space: nowrap; font-variant-numeric: tabular-nums; }
    @media (prefers-reduced-motion: reduce) { .bar { transition: none; } }
  `;
}

if (!customElements.get("consumi-bars")) customElements.define("consumi-bars", ConsumiBars);
