"use client";

import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import type { Metric } from "@/lib/types";
import { change, daily, formatMetric, lastDays, METRIC_HELP, METRIC_LABEL, totals, value, type MetricKey } from "@/lib/metrics";
import { Sparkline } from "./line-chart";
import { Hint } from "./hint";

/** Resultados de um artigo publicado, em versão compacta para a lateral do editor (últimos 28 dias). */
export function ArticleResults({ articleId, rows, endDate }: { articleId: string; rows: Metric[]; endDate: string }) {
  const end = new Date(`${endDate}T12:00:00`);
  const dates = lastDays(28, end);
  const current = rows.filter((r) => r.date >= dates[0]);
  const previous = rows.filter((r) => r.date < dates[0]);
  const now = totals(current);
  const before = totals(previous);
  const keys: MetricKey[] = ["clicks", "impressions", "ctr", "position"];

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <BarChart3 className="size-4 text-brand" /> Resultados do artigo
          <Hint>Como o Google mostrou este artigo nos últimos 28 dias, comparado aos 28 anteriores.</Hint>
        </h3>
        <span className="text-xs text-muted">28 dias</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Ainda sem dados. Artigos novos levam algumas semanas para aparecer no Google, e os números chegam quando o Search Console for conectado.
        </p>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
            <span className="text-xs text-muted">Visitas por dia</span>
            <Sparkline values={daily(current, dates, "clicks").map((p) => p.value)} width={150} height={28} />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2">
            {keys.map((k) => {
              const d = change(value(now, k), value(before, k), k);
              return (
                <div key={k} className="rounded-lg border border-line p-2.5">
                  <dt className="flex items-center gap-1 text-[11px] text-muted">
                    {METRIC_LABEL[k]}
                    <Hint size={12}>{METRIC_HELP[k]}</Hint>
                  </dt>
                  <dd className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-base font-bold tabular-nums">{formatMetric(value(now, k), k)}</span>
                    {d != null && (
                      <span className={`text-[11px] font-semibold tabular-nums ${d >= 0 ? "text-good" : "text-bad"}`}>
                        {d >= 0 ? "▲" : "▼"} {Math.abs(d * 100).toFixed(0)}%
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </>
      )}
      <Link href={`/resultados?artigo=${articleId}`} className="mt-3 flex items-center gap-1 text-sm font-medium text-brand hover:underline">
        Ver análise completa <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
