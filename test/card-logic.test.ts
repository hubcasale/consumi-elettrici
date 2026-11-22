import test from "node:test";
import assert from "node:assert/strict";
import {
  METER, UNMONITORED, axisTicks, cardSize, chartRange, colorFor, dateLabel, fmt, fmtAxis, fmtEur, fmtKwh, fmtPct, fmtPrice, fmtWatt, livePowers, meterModel, monthName,
  niceMax, parseWatt, ranking, rgba, segments, SERIES_DARK, SERIES_LIGHT,
} from "../src/card-logic";
import type { Amount, ConsumiInfo, ConsumerInfo, HassState, Period } from "../src/types";

const PERIODS: Period[] = ["today", "yesterday", "week", "last_week", "month", "last_month", "year", "last_year"];
const amounts = (k: number, c = k * 0.2): Record<Period, Amount> => Object.fromEntries(PERIODS.map((p) => [p, { k, c }])) as Record<Period, Amount>;
const st = (state: string, unit = "W"): HassState => ({ state, attributes: { unit_of_measurement: unit } });

function consumer(key: string, name: string, k: number, over: Partial<ConsumerInfo> = {}): ConsumerInfo {
  return { key, name, icon: "mdi:power-plug", power_entity: `sensor.${key}_power`, energy_entity: null, parent: METER, in_meter: true, power: null, periods: amounts(k), ...over };
}
function info(over: Partial<ConsumiInfo> = {}): ConsumiInfo {
  return {
    entry_id: "e", version: "0.1.0", now: "2026-11-22T10:00:00+01:00", tariff: { mode: "fixed", band: 3, price: 0.099, full_price: 0.19 }, contract_kw: 6, available_kw: 6.6,
    overload: 0, bill: { enabled: false }, peak: { w: 5000, at: "09:12" },
    meter: { key: METER, name: "Contatore", icon: "mdi:meter-electric", power_entities: ["sensor.linea_power"], energy_entities: [], power: 3000, periods: amounts(10), bands: {} },
    unmonitored: { key: UNMONITORED, power: 500, periods: amounts(3) },
    consumers: [consumer("lav", "Lavatrice", 2), consumer("wb", "Wallbox", 5), consumer("caf", "Caffè", 0)],
    ...over,
  };
}
const STATES = { "sensor.linea_power": st("3000"), "sensor.lav_power": st("400"), "sensor.wb_power": st("2.1", "kW"), "sensor.caf_power": st("0") };

test("formati", () => {
  assert.equal(fmt(1234.5, 1), "1.234,5");
  assert.equal(fmt(null), "–");
  assert.equal(fmtWatt(850.4), "850 W");
  assert.equal(fmtWatt(5887), "5,89 kW");
  assert.equal(fmtWatt(null), "–");
  assert.equal(fmtKwh(1.234), "1,23 kWh");
  assert.equal(fmtKwh(38.94), "38,9 kWh");
  assert.equal(fmtKwh(856.79), "857 kWh");
  assert.equal(fmtKwh(8147.35), "8.147 kWh");
  assert.equal(fmtEur(7.4), "7,40 €");
  assert.equal(fmtPct(0.234), "23%");
  assert.equal(fmtPct(0.004), "<1%");
  assert.equal(fmtPct(0), "0%");
  assert.equal(fmtPct(null), "");
  assert.equal(fmtPrice(0.099), "0,099 €/kWh");
  assert.equal(fmtPrice(0.25), "0,25 €/kWh");
  assert.equal(fmtPrice(0.2289), "0,229 €/kWh");
});

test("etichette di giorni e mesi", () => {
  assert.equal(dateLabel("2026-11-22"), "22");
  assert.equal(dateLabel("2026-11-22", true), "dom 22 nov");
  assert.equal(dateLabel("2026-11"), "nov");
  assert.equal(dateLabel("2026-11", true), "novembre 2026");
  assert.equal(monthName("2026-11-22T10:00:00+01:00"), "novembre");
  assert.equal(monthName("2026-01-05T10:00:00+01:00", -1), "dicembre");
});

test("colori: fissi per posizione nell'elenco, grigio dal nono", () => {
  assert.equal(colorFor(0, false), SERIES_LIGHT[0]);
  assert.equal(colorFor(7, true), SERIES_DARK[7]);
  assert.equal(colorFor(8, false), "#8a8a86");
  assert.equal(colorFor(-1, true), "#8d8d88");
  assert.equal(rgba("#2a78d6", 0.2), "rgba(42, 120, 214, 0.2)");
});

test("potenze dal vivo", () => {
  assert.equal(parseWatt(st("2.1", "kW")), 2100);
  assert.equal(parseWatt(st("unavailable")), null);
  assert.equal(parseWatt(st("3284256")), null);              // valore impossibile di una presa
  assert.equal(parseWatt(undefined), null);
  const live = livePowers(info(), STATES);
  assert.equal(live.meter, 3000);
  assert.deepEqual(live.consumers, { lav: 400, wb: 2100, caf: 0 });
  assert.equal(live.unmonitored, 500);
  // sensore non disponibile: niente potenza, ma il resto regge
  const down = livePowers(info(), { ...STATES, "sensor.wb_power": st("unavailable") });
  assert.equal(down.consumers.wb, null);
  assert.equal(down.unmonitored, 2600);
  // più consumatori della potenza del contatore: mai negativo
  assert.equal(livePowers(info(), { ...STATES, "sensor.linea_power": st("1000") }).unmonitored, 0);
  // senza lo stato del contatore vale l'ultimo dato dell'integrazione
  assert.equal(livePowers(info(), {}).meter, 3000);
  // chi è fuori dal contatore non riduce il non monitorato
  const outside = info({ consumers: [consumer("wb", "Wallbox", 5, { parent: null, in_meter: false })] });
  assert.equal(livePowers(outside, STATES).unmonitored, 3000);
});

test("classifica di adesso", () => {
  const i = info();
  const r = ranking(i, "now", livePowers(i, STATES), false);
  assert.equal(r.total, 3000);
  assert.deepEqual(r.rows.map((x) => x.name), ["Wallbox", "Non monitorato", "Lavatrice", "Caffè"]);
  assert.equal(r.rows[0].value, 2100);
  assert.equal(r.rows[0].bar, 1);
  assert.equal(r.rows[0].share, 0.7);
  assert.equal(r.rows[0].color, SERIES_LIGHT[1]);          // il colore segue il consumatore, non il posto in classifica
  assert.equal(r.rows[2].color, SERIES_LIGHT[0]);
  assert.equal(r.rows[1].kind, "unmonitored");
  assert.equal(r.rows[3].bar, 0);
  assert.equal(r.hidden, 0);
});

test("classifica: righe limitate e consumatori fermi nascosti", () => {
  const i = info();
  const live = livePowers(i, STATES);
  const limited = ranking(i, "now", live, false, { max_rows: 2 });
  assert.equal(limited.rows.length, 2);
  assert.equal(limited.hidden, 2);
  assert.equal(ranking(i, "now", live, false, { max_rows: 2 }, true).rows.length, 4);
  const idle = ranking(i, "now", live, false, { hide_idle: true });
  assert.deepEqual(idle.rows.map((x) => x.name), ["Wallbox", "Non monitorato", "Lavatrice"]);
  assert.equal(idle.hidden, 1);
  assert.equal(ranking(i, "now", live, false, { hide_idle: true }, true).rows.length, 4);
  // nei periodi i fermi non si nascondono
  assert.equal(ranking(i, "today", live, false, { hide_idle: true }).rows.length, 4);
});

test("classifica di un periodo", () => {
  const i = info();
  const r = ranking(i, "month", livePowers(i, STATES), true);
  assert.equal(r.total, 10);
  assert.equal(r.totalCost, 2);
  assert.deepEqual(r.rows.map((x) => [x.name, x.value]), [["Wallbox", 5], ["Non monitorato", 3], ["Lavatrice", 2], ["Caffè", 0]]);
  assert.equal(r.rows[0].share, 0.5);
  assert.equal(r.rows[0].cost, 1);
  assert.equal(r.rows[0].color, SERIES_DARK[1]);
});

test("classifica: senza consumatori sotto il contatore non c'è il non monitorato", () => {
  const i = info({ consumers: [consumer("wb", "Wallbox", 5, { parent: null, in_meter: false })] });
  const r = ranking(i, "today", livePowers(i, STATES), false);
  assert.deepEqual(r.rows.map((x) => x.name), ["Wallbox"]);
  assert.equal(r.rows[0].share, null);
  assert.equal(r.rows[0].outside, true);
});

test("linea che contiene altri consumatori: in classifica va il suo resto", () => {
  const app = consumer("app", "Appartamento", 6, { rest: { power: 300, periods: amounts(4) } });
  const i = info({ consumers: [app, consumer("lav", "Lavatrice", 2, { parent: "app" }), consumer("wb", "Wallbox", 3)], unmonitored: { key: UNMONITORED, power: 0, periods: amounts(1) } });
  const states = { ...STATES, "sensor.app_power": st("900"), "sensor.lav_power": st("600"), "sensor.wb_power": st("2000") };
  const live = livePowers(i, states);
  assert.equal(live.rest.app, 300);
  assert.equal(live.unmonitored, 100);                       // 3000 - 900 (linea) - 2000 (wallbox): la lavatrice è già nella linea
  const now = ranking(i, "now", live, false);
  assert.deepEqual(now.rows.map((x) => [x.name, x.value]), [["Wallbox", 2000], ["Lavatrice", 600], ["Appartamento · resto", 300], ["Non monitorato", 100]]);
  assert.equal(now.rows.reduce((a, x) => a + (x.value ?? 0), 0), 3000);
  assert.equal(now.rows[2].key, "app");
  assert.equal(now.rows[2].rest, true);
  const month = ranking(i, "month", live, false);
  assert.deepEqual(month.rows.map((x) => [x.name, x.value, Math.round((x.cost ?? 0) * 100) / 100]), [["Appartamento · resto", 4, 0.8], ["Wallbox", 3, 0.6], ["Lavatrice", 2, 0.4], ["Non monitorato", 1, 0.2]]);
  assert.equal(Math.round(segments(month.rows).reduce((a, x) => a + x.pct, 0)), 100);
});

test("barra a segmenti", () => {
  const i = info();
  const s = segments(ranking(i, "month", livePowers(i, STATES), false).rows);
  assert.deepEqual(s.map((x) => [x.name, Math.round(x.pct), x.hatched]), [["Wallbox", 50, false], ["Non monitorato", 30, true], ["Lavatrice", 20, false]]);
  assert.equal(Math.round(s.reduce((a, x) => a + x.pct, 0)), 100);
  // chi è fuori dal contatore non entra nella barra
  const out = info({ consumers: [consumer("lav", "Lavatrice", 2), consumer("wb", "Wallbox", 50, { parent: null, in_meter: false })] });
  assert.deepEqual(segments(ranking(out, "month", livePowers(out, STATES), false).rows).map((x) => x.name), ["Non monitorato", "Lavatrice"]);
  assert.deepEqual(segments([]), []);
});

test("potenza rispetto al contratto", () => {
  assert.equal(meterModel(null, 6, 6.6, 0), null);
  const ok = meterModel(3000, 6, 6.6, 0)!;
  assert.equal(ok.level, "ok");
  assert.equal(ok.text, "50% di 6,0 kW");
  assert.equal(Math.round(ok.pct), 45);
  assert.equal(Math.round(ok.mark), 91);
  assert.equal(meterModel(6300, 6, 6.6, 0)!.level, "warning");
  assert.equal(meterModel(6300, 6, 6.6, 0)!.text, "Oltre il contratto di 6,0 kW");
  const crit = meterModel(7000, 6, 6.6, 0)!;
  assert.equal(crit.level, "critical");
  assert.equal(crit.pct, 100);
  assert.equal(meterModel(3000, 6, 6.6, 2)!.level, "critical");      // l'integrazione dice che è ancora in sovraccarico
});

test("grafico", () => {
  assert.deepEqual(chartRange("today"), { granularity: "day", count: 14 });
  assert.deepEqual(chartRange("month"), { granularity: "day", count: 30 });
  assert.deepEqual(chartRange("year"), { granularity: "month", count: 12 });
  assert.equal(niceMax(38.9), 40);
  assert.equal(niceMax(55), 60);
  assert.equal(niceMax(1.7), 2);
  assert.equal(niceMax(230), 300);
  assert.ok(Math.abs(niceMax(0.07) - 0.08) < 1e-9);
  assert.equal(fmtAxis(0.04), "0,04");
  assert.equal(niceMax(0), 1);
  assert.equal(fmtAxis(25), "25");
  assert.equal(fmtAxis(2.5), "2,5");
  assert.deepEqual(axisTicks(4), [0, 1, 2, 3]);
  assert.deepEqual(axisTicks(14), [0, 3, 7, 10, 13]);
  assert.deepEqual(axisTicks(30, 6), [0, 6, 12, 17, 23, 29]);
});

test("altezza della scheda", () => {
  assert.equal(cardSize(5, true, true, true), 15);
  assert.equal(cardSize(3, false, false, false), 7);
});
