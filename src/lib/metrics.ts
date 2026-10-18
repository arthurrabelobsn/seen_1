// Contas de desempenho usadas em Resultados e no editor de artigo.
import type { Metric } from "./types";

export type MetricKey = "clicks" | "impressions" | "ctr" | "position";

export const METRIC_LABEL: Record<MetricKey, string> = {
  clicks: "Visitas do Google",
  impressions: "Aparições no Google",
  ctr: "Taxa de cliques",
  position: "Posição média",
};

export const METRIC_HELP: Record<MetricKey, string> = {
  clicks: "Quantas vezes alguém clicou no seu site a partir da busca do Google (também chamado de cliques).",
  impressions: "Quantas vezes o seu site apareceu nos resultados do Google, mesmo sem clique (também chamado de impressões).",
  ctr: "De cada 100 pessoas que viram o seu site no Google, quantas clicaram (CTR). Títulos e descrições atraentes aumentam esse número.",
  position: "Em que lugar, em média, o seu site aparece no Google. 1 é o primeiro resultado; até 10 é a primeira página. Quanto menor, melhor.",
};

export type Totals = { clicks: number; impressions: number; ctr: number; position: number | null };

export function totals(rows: Metric[]): Totals {
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  // Posição média ponderada pelas aparições (é como o Google calcula)
  const withPos = rows.filter((r) => r.position != null && r.impressions > 0);
  const imp = withPos.reduce((s, r) => s + r.impressions, 0);
  const position = imp ? withPos.reduce((s, r) => s + Number(r.position) * r.impressions, 0) / imp : null;
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0, position };
}

export function value(t: Totals, k: MetricKey) {
  return k === "position" ? t.position : t[k];
}

/** Variação entre períodos. Para posição, cair é bom, então o sinal é invertido. */
export function change(now: number | null, before: number | null, k: MetricKey) {
  if (now == null || before == null || before === 0) return null;
  const d = (now - before) / before;
  return k === "position" ? -d : d;
}

export function formatMetric(v: number | null, k: MetricKey) {
  if (v == null) return "—";
  if (k === "ctr") return `${(v * 100).toFixed(1).replace(".", ",")}%`;
  if (k === "position") return v.toFixed(1).replace(".", ",");
  return Math.round(v).toLocaleString("pt-BR");
}

/** Série diária de uma métrica, preenchendo dias sem dado. */
export function daily(rows: Metric[], dates: string[], k: MetricKey) {
  const byDay = new Map<string, Metric[]>();
  for (const r of rows) byDay.set(r.date, [...(byDay.get(r.date) ?? []), r]);
  return dates.map((date) => {
    const t = totals(byDay.get(date) ?? []);
    const v = value(t, k);
    return { date, value: v ?? 0, missing: v == null };
  });
}

/** Faixas de posição: onde estão os artigos no Google. */
export function positionBands(byArticle: { position: number | null; impressions: number }[]) {
  const bands = [
    { id: "top3", label: "Top 3", hint: "Os 3 primeiros resultados: recebem a maior parte dos cliques.", count: 0 },
    { id: "p1", label: "4º a 10º", hint: "Ainda na primeira página do Google.", count: 0 },
    { id: "p2", label: "11º a 20º", hint: "Segunda página: perto de subir. Bons candidatos a atualizar.", count: 0 },
    { id: "far", label: "Depois do 20º", hint: "Pouco visível. Precisa de mais conteúdo ou de links internos.", count: 0 },
  ];
  for (const a of byArticle) {
    if (a.position == null || a.impressions === 0) continue;
    const i = a.position <= 3 ? 0 : a.position <= 10 ? 1 : a.position <= 20 ? 2 : 3;
    bands[i].count++;
  }
  return bands;
}

export function lastDays(n: number, end = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}
