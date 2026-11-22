/** Tipi condivisi tra scheda, finestre ed editor. */

export interface HassState {
  state: string;
  attributes: Record<string, unknown>;
}

export interface HomeAssistant {
  states: Record<string, HassState | undefined>;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  themes?: { darkMode?: boolean };
}

export type Period = "today" | "yesterday" | "week" | "last_week" | "month" | "last_month" | "year" | "last_year";
export type Tab = "now" | "today" | "week" | "month" | "year";

/** kWh (k) e costo in EUR (c) di un periodo. */
export interface Amount {
  k: number;
  c: number;
}

export interface SourceData {
  key: string;
  power: number | null;
  periods: Record<Period, Amount>;
}

export interface ConsumerInfo extends SourceData {
  name: string;
  icon: string;
  power_entity: string | null;
  energy_entity: string | null;
  /** "_meter" = sotto il contatore generale; chiave di un altro consumatore = sta su quella linea; null = linea separata */
  parent: string | null;
  /** misurato dal contatore generale, direttamente o attraverso una linea */
  in_meter: boolean;
  /** solo per una linea che contiene altri consumatori: quello che resta tolti i suoi */
  rest?: { power: number | null; periods: Record<Period, Amount> };
  entities?: Record<string, string>;
}

export interface MeterInfo extends SourceData {
  name: string;
  icon: string;
  power_entities: string[];
  energy_entities: string[];
  bands: Partial<Record<Period, number[]>>;
  entities?: Record<string, string>;
}

export interface BillEstimate {
  kwh: number;
  energia: number;
  trasporto: number;
  oneri: number;
  accise: number;
  altro?: number;
  iva: number;
  totale: number;
}

export interface BillInfo {
  enabled: boolean;
  month?: BillEstimate;
  last_month?: BillEstimate;
  year?: BillEstimate;
  last_year?: BillEstimate;
  forecast?: BillEstimate;
}

export interface ConsumiInfo {
  entry_id: string;
  version: string;
  now: string;
  tariff: { mode: string; band: number; price: number; full_price: number };
  /** potenza di contratto valida adesso (in F3 può essere più alta) */
  contract_kw: number;
  contract_base_kw?: number;
  contract_f3_kw?: number;
  available_kw: number;
  overload: number;
  bill: BillInfo;
  peak: { w: number | null; at: string | null };
  meter: MeterInfo;
  unmonitored: SourceData;
  consumers: ConsumerInfo[];
}

export interface ConsumiStats {
  granularity: "day" | "month";
  labels: string[];
  series: Record<string, { k: number[]; c: number[] }>;
}

export interface CardConfig {
  type: string;
  title?: string;
  entry_id?: string;
  /** false = senza intestazione (titolo, prezzo e fascia) */
  header?: boolean;
  /** scheda aperta all'inizio */
  default_tab?: Tab;
  /** quanti consumatori mostrare prima di «Mostra tutti»; 0 = tutti */
  max_rows?: number;
  /** in «Adesso» nasconde i consumatori fermi */
  hide_idle?: boolean;
  show_chart?: boolean;
  show_bill?: boolean;
  show_bands?: boolean;
}
