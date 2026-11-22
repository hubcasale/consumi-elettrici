/** Logica della scheda senza DOM: formati, colori, righe della classifica, barra a segmenti, grafico. Provata in test/card-logic.test.ts. */
import type { CardConfig, ConsumiInfo, HassState, Period, Tab } from "./types";

export const METER = "_meter";
export const UNMONITORED = "_unmonitored";
export const TABS: { id: Tab; label: string }[] = [
  { id: "now", label: "Adesso" },
  { id: "today", label: "Oggi" },
  { id: "week", label: "Settimana" },
  { id: "month", label: "Mese" },
  { id: "year", label: "Anno" },
];
export const PREVIOUS: Record<Exclude<Tab, "now">, { period: Period; label: string }> = {
  today: { period: "yesterday", label: "Ieri" },
  week: { period: "last_week", label: "Settimana scorsa" },
  month: { period: "last_month", label: "Mese scorso" },
  year: { period: "last_year", label: "Anno scorso" },
};

// ------------------------------------------------------------------ formati
export function fmt(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "–";
  const [int, frac] = value.toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return frac ? `${grouped},${frac}` : grouped;
}
export function fmtWatt(w: number | null | undefined): string {
  if (w === null || w === undefined || !Number.isFinite(w)) return "–";
  return Math.abs(w) >= 1000 ? `${fmt(w / 1000, 2)} kW` : `${Math.round(w)} W`;
}
export function fmtKwh(k: number | null | undefined): string {
  if (k === null || k === undefined || !Number.isFinite(k)) return "–";
  return `${fmt(k, k < 10 ? 2 : k < 100 ? 1 : 0)} kWh`;
}
export function fmtEur(c: number | null | undefined): string {
  if (c === null || c === undefined || !Number.isFinite(c)) return "–";
  return `${fmt(c, 2)} €`;
}
export function fmtPct(share: number | null): string {
  if (share === null || !Number.isFinite(share)) return "";
  const p = share * 100;
  return p > 0 && p < 1 ? "<1%" : `${Math.round(p)}%`;
}
export function fmtPrice(p: number): string {
  return `${fmt(p, p < 0.1 ? 4 : 3).replace(/0$/, "")} €/kWh`;
}

const DAYS = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const MONTHS_LONG = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
/** Etichetta di un giorno ("2026-11-22") o di un mese ("2026-11"): corta per l'asse, lunga per il dettaglio. */
export function dateLabel(label: string, long = false): string {
  const [y, m, d] = label.split("-").map(Number);
  if (!d) return long ? `${MONTHS_LONG[m - 1]} ${y}` : MONTHS[m - 1];
  if (!long) return `${d}`;
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${DAYS[wd]} ${d} ${MONTHS[m - 1]}`;
}
export function monthName(iso: string, offset = 0): string {
  const d = new Date(iso);
  const m = (((Number.isNaN(d.getTime()) ? 0 : d.getMonth()) + offset) % 12 + 12) % 12;
  return MONTHS_LONG[m];
}

// ------------------------------------------------------------------ colori
/** Otto tinte in ordine fisso (verificate per daltonismo su fondo chiaro e scuro): il colore segue il consumatore, non la posizione. */
export const SERIES_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
export const SERIES_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#0ca30c", "#9085e9", "#e66767"];
export const OTHER_LIGHT = "#8a8a86";
export const OTHER_DARK = "#8d8d88";
export const UNMONITORED_LIGHT = "#c9c8c2";
export const UNMONITORED_DARK = "#55554f";

/** Colore del consumatore di posto `index` nell'elenco; dal nono in poi un grigio comune. */
export function colorFor(index: number, dark: boolean): string {
  const set = dark ? SERIES_DARK : SERIES_LIGHT;
  return index >= 0 && index < set.length ? set[index] : dark ? OTHER_DARK : OTHER_LIGHT;
}
export function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// ------------------------------------------------------------------ potenze dal vivo
export function parseWatt(state: HassState | undefined): number | null {
  if (!state) return null;
  const v = Number(state.state);
  if (state.state === "" || !Number.isFinite(v)) return null;
  const unit = String(state.attributes.unit_of_measurement ?? "W").toLowerCase();
  return unit === "kw" ? v * 1000 : unit === "mw" ? v * 1_000_000 : v;
}

export interface LivePowers {
  meter: number | null;
  unmonitored: number | null;
  consumers: Record<string, number | null>;
}
/** Potenze lette dagli stati di Home Assistant (aggiornati al secondo); dove manca il sensore vale l'ultimo dato dell'integrazione. */
export function livePowers(info: ConsumiInfo, states: Record<string, HassState | undefined>): LivePowers {
  const meterValues = info.meter.power_entities.map((e) => parseWatt(states[e])).filter((v): v is number => v !== null);
  const meter = meterValues.length ? meterValues.reduce((a, b) => a + b, 0) : info.meter.power;
  const consumers: Record<string, number | null> = {};
  let inside = 0;
  for (const c of info.consumers) {
    const live = c.power_entity ? parseWatt(states[c.power_entity]) : null;
    const w = c.power_entity ? (live ?? (states[c.power_entity] ? null : c.power)) : null;
    consumers[c.key] = w;
    if (w !== null && c.in_meter) inside += w;
  }
  return { meter, unmonitored: meter === null ? null : Math.max(meter - inside, 0), consumers };
}

// ------------------------------------------------------------------ classifica
export interface Row {
  key: string;
  name: string;
  icon: string;
  color: string;
  /** valore della scheda aperta: W in «Adesso», kWh negli altri periodi */
  value: number | null;
  cost: number | null;
  /** parte del totale del contatore (0-1); null se non confrontabile */
  share: number | null;
  /** lunghezza della barra rispetto alla riga più alta (0-1) */
  bar: number;
  kind: "consumer" | "unmonitored";
  outside: boolean;
}

export interface Ranking {
  total: number | null;
  totalCost: number | null;
  rows: Row[];
  hidden: number;
}

/** Righe ordinate dal consumo più alto; il non monitorato sta in classifica come gli altri. */
export function ranking(info: ConsumiInfo, tab: Tab, live: LivePowers, dark: boolean, config: Pick<CardConfig, "max_rows" | "hide_idle"> = {}, expanded = false): Ranking {
  const now = tab === "now";
  const total = now ? live.meter : info.meter.periods[tab].k;
  const totalCost = now ? null : info.meter.periods[tab].c;
  const rows: Row[] = info.consumers.map((c, i) => {
    const value = now ? live.consumers[c.key] : c.periods[tab].k;
    return {
      key: c.key, name: c.name, icon: c.icon || "mdi:power-plug", color: colorFor(i, dark), value, cost: now ? null : c.periods[tab].c,
      share: c.in_meter && value !== null && total ? Math.min(value / total, 1) : null, bar: 0, kind: "consumer", outside: !c.in_meter,
    };
  });
  const unmon = now ? live.unmonitored : info.unmonitored.periods[tab].k;
  if (info.consumers.some((c) => c.in_meter)) {
    rows.push({
      key: UNMONITORED, name: "Non monitorato", icon: "mdi:help-circle-outline", color: dark ? UNMONITORED_DARK : UNMONITORED_LIGHT, value: unmon,
      cost: now ? null : info.unmonitored.periods[tab].c, share: unmon !== null && total ? Math.min(unmon / total, 1) : null, bar: 0, kind: "unmonitored", outside: false,
    });
  }
  rows.sort((a, b) => (b.value ?? -1) - (a.value ?? -1) || a.name.localeCompare(b.name));
  const max = Math.max(0, ...rows.map((r) => r.value ?? 0));
  for (const r of rows) r.bar = max > 0 && r.value ? Math.max(r.value / max, 0) : 0;
  let visible = rows;
  if (now && config.hide_idle && !expanded) visible = rows.filter((r) => r.kind === "unmonitored" || (r.value ?? 0) >= 1);
  const limit = !expanded && config.max_rows && config.max_rows > 0 ? config.max_rows : visible.length;
  return { total, totalCost, rows: visible.slice(0, limit), hidden: Math.max(visible.length - limit, 0) + (rows.length - visible.length) };
}

export interface Segment {
  key: string;
  name: string;
  color: string;
  /** larghezza in percento (0-100) */
  pct: number;
  hatched: boolean;
}
/** Barra «di cosa è fatto il totale»: un segmento per consumatore sotto il contatore, più il non monitorato. Le fette sotto l'1% non si disegnano. */
export function segments(rows: Row[]): Segment[] {
  const inside = rows.filter((r) => !r.outside && (r.value ?? 0) > 0);
  const sum = inside.reduce((a, r) => a + (r.value ?? 0), 0);
  if (sum <= 0) return [];
  return inside
    .map((r) => ({ key: r.key, name: r.name, color: r.color, pct: ((r.value ?? 0) / sum) * 100, hatched: r.kind === "unmonitored" }))
    .filter((s) => s.pct >= 1);
}

// ------------------------------------------------------------------ potenza rispetto al contratto
export interface Meter {
  /** riempimento della barra (0-100), sulla scala della potenza disponibile */
  pct: number;
  /** dove cade la potenza di contratto sulla stessa scala (0-100) */
  mark: number;
  level: "ok" | "warning" | "critical";
  text: string;
}
export function meterModel(power: number | null, contractKw: number, availableKw: number, overload: number): Meter | null {
  if (power === null || !(contractKw > 0)) return null;
  const contract = contractKw * 1000;
  const available = Math.max(availableKw * 1000, contract);
  const scale = available;
  const level = overload >= 2 || power > available ? "critical" : overload >= 1 || power > contract ? "warning" : "ok";
  const text =
    level === "critical" ? `Oltre la potenza disponibile (${fmt(availableKw, 1)} kW)` : level === "warning" ? `Oltre il contratto di ${fmt(contractKw, 1)} kW` : `${Math.round((power / contract) * 100)}% di ${fmt(contractKw, 1)} kW`;
  return { pct: Math.min(Math.max((power / scale) * 100, 0), 100), mark: (contract / scale) * 100, level, text };
}

// ------------------------------------------------------------------ grafico
/** Quante barre e di che tipo per la scheda aperta. */
export function chartRange(tab: Tab): { granularity: "day" | "month"; count: number } {
  if (tab === "year") return { granularity: "month", count: 12 };
  if (tab === "month") return { granularity: "day", count: 30 };
  return { granularity: "day", count: 14 };
}
/** Massimo «tondo» dell'asse: un numero la cui metà è ancora tonda (1, 2, 3, 4, 5, 6, 8 × potenze di dieci). */
export function niceMax(value: number): number {
  if (!(value > 0)) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / exp;
  const step = [1, 2, 3, 4, 5, 6, 8, 10].find((x) => f <= x + 1e-9) ?? 10;
  return step * exp;
}
export function fmtAxis(value: number): string {
  return fmt(value, value >= 10 || Number.isInteger(value) ? 0 : value >= 1 ? 1 : 2);
}
/** Posizioni delle etichette dell'asse orizzontale: poche, equidistanti, sempre la prima e l'ultima. */
export function axisTicks(count: number, max = 5): number[] {
  if (count <= max) return Array.from({ length: count }, (_, i) => i);
  const out: number[] = [];
  for (let i = 0; i < max; i++) out.push(Math.round((i * (count - 1)) / (max - 1)));
  return [...new Set(out)];
}

// ------------------------------------------------------------------ dimensioni
export function cardSize(rows: number, chart: boolean, bill: boolean, header: boolean): number {
  return Math.ceil(((header ? 56 : 0) + 150 + rows * 56 + (chart ? 190 : 0) + (bill ? 70 : 0)) / 50);
}
