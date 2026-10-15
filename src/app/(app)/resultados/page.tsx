import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Search, Target } from "lucide-react";
import { requireSite } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { LineChart } from "@/components/line-chart";
import { isoDay, nf } from "@/lib/format";
import type { Metric } from "@/lib/types";
import { clearDemoData, loadDemoData } from "./actions";

export const metadata: Metadata = { title: "Resultados" };

const RANGES = [7, 28, 90] as const;

export default async function ResultsPage({ searchParams }: PageProps<"/resultados">) {
  const params = await searchParams;
  const days = RANGES.find((r) => String(r) === params.dias) ?? 28;
  const { supabase, site } = await requireSite();

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (days * 2 - 1)); // período atual + anterior, para comparar
  const split = new Date(today);
  split.setDate(today.getDate() - (days - 1));
  const splitKey = isoDay(split);

  const [{ data: metricRows }, { data: articleRows }] = await Promise.all([
    supabase
      .from("article_metrics")
      .select("article_id, date, clicks, impressions, position")
      .eq("site_id", site.id)
      .gte("date", isoDay(start))
      .order("date"),
    supabase.from("articles").select("id, title, status, published_url").eq("site_id", site.id),
  ]);

  const metrics = (metricRows ?? []) as Metric[];
  const articles = (articleRows ?? []) as { id: string; title: string; status: string; published_url: string | null }[];
  const published = articles.filter((a) => a.status === "publicado").length;

  if (metrics.length === 0) {
    return (
      <>
        <PageHeader title="Resultados" description={`Desempenho orgânico de ${site.name}`} />
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <Search className="size-8 text-muted" />
          <h2 className="mt-3 font-semibold">Nenhum dado ainda</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            Os cliques e posições vêm do Google Search Console, que será conectado na próxima fase. Enquanto isso, carregue
            dados de exemplo para ver o painel funcionando.
          </p>
          <form action={loadDemoData} className="mt-5">
            <button type="submit" className="btn-primary">Carregar dados de exemplo</button>
          </form>
          <p className="mt-3 text-xs text-muted">{published} artigos publicados neste site.</p>
        </div>
      </>
    );
  }

  const current = metrics.filter((m) => m.date >= splitKey);
  const previous = metrics.filter((m) => m.date < splitKey);
  const sum = (rows: Metric[], k: "clicks" | "impressions") => rows.reduce((s, r) => s + r[k], 0);
  const avgPos = (rows: Metric[]) => {
    const w = rows.filter((r) => r.position !== null && r.impressions > 0);
    const imp = w.reduce((s, r) => s + r.impressions, 0);
    return imp ? w.reduce((s, r) => s + Number(r.position) * r.impressions, 0) / imp : null;
  };

  const kpi = {
    clicks: [sum(current, "clicks"), sum(previous, "clicks")],
    impressions: [sum(current, "impressions"), sum(previous, "impressions")],
    position: [avgPos(current), avgPos(previous)],
  };
  const ctr = kpi.impressions[0] ? kpi.clicks[0] / kpi.impressions[0] : 0;
  const ctrPrev = kpi.impressions[1] ? kpi.clicks[1] / kpi.impressions[1] : 0;

  // Série diária do período atual (dias sem dado viram zero)
  const byDay = new Map<string, Metric[]>();
  current.forEach((m) => byDay.set(m.date, [...(byDay.get(m.date) ?? []), m]));
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(split);
    d.setDate(split.getDate() + i);
    return isoDay(d);
  });
  const clicksSeries = dates.map((date) => ({ date, value: sum(byDay.get(date) ?? [], "clicks") }));
  const impressionsSeries = dates.map((date) => ({ date, value: sum(byDay.get(date) ?? [], "impressions") }));

  // Tabela por artigo
  const perArticle = articles
    .map((a) => {
      const rows = current.filter((m) => m.article_id === a.id);
      const clicks = sum(rows, "clicks");
      const impressions = sum(rows, "impressions");
      return { ...a, clicks, impressions, ctr: impressions ? clicks / impressions : 0, position: avgPos(rows) };
    })
    .filter((a) => a.impressions > 0)
    .sort((a, b) => b.clicks - a.clicks);
  const opportunities = perArticle.filter((a) => a.position !== null && a.position >= 5 && a.position <= 20).length;
  const isDemo = articles.some((a) => a.title.startsWith("[Exemplo] "));

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Resultados"
        description={`Desempenho orgânico de ${site.name} nos últimos ${days} dias, comparado aos ${days} anteriores`}
        actions={
          <nav className="flex gap-1 rounded-lg border border-line bg-surface p-1 text-sm">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/resultados?dias=${r}`}
                className={`rounded-md px-2.5 py-1 ${r === days ? "bg-brand-soft font-medium text-brand-strong" : "text-muted hover:text-ink"}`}
              >
                {r} dias
              </Link>
            ))}
          </nav>
        }
      />

      {isDemo && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warn/25 bg-warn-soft px-4 py-2.5 text-sm text-warn">
          <span>Você está vendo dados de exemplo.</span>
          <form action={clearDemoData}>
            <button type="submit" className="font-medium underline underline-offset-2">Remover dados de exemplo</button>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Cliques" value={nf.format(kpi.clicks[0])} delta={change(kpi.clicks[0], kpi.clicks[1])} />
        <Kpi label="Impressões" value={nf.format(kpi.impressions[0])} delta={change(kpi.impressions[0], kpi.impressions[1])} />
        <Kpi label="CTR média" value={`${(ctr * 100).toFixed(1).replace(".", ",")}%`} delta={change(ctr, ctrPrev)} />
        <Kpi
          label="Posição média"
          value={kpi.position[0] ? kpi.position[0].toFixed(1).replace(".", ",") : "—"}
          delta={kpi.position[0] && kpi.position[1] ? change(kpi.position[1], kpi.position[0]) : null}
          hint="Menor é melhor"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <LineChart title="Cliques por dia" points={clicksSeries} />
        <LineChart title="Impressões por dia" points={impressionsSeries} />
      </div>

      <section className="card mt-6 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <h2 className="font-semibold">Por artigo</h2>
          {opportunities > 0 && (
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Target className="size-4 text-warn" /> {opportunities} artigos entre as posições 5 e 20: bons candidatos a atualização
            </p>
          )}
        </div>
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-5 py-3 font-medium">Artigo</th>
              <th className="px-5 py-3 text-right font-medium">Cliques</th>
              <th className="px-5 py-3 text-right font-medium">Impressões</th>
              <th className="px-5 py-3 text-right font-medium">CTR</th>
              <th className="px-5 py-3 text-right font-medium">Posição</th>
            </tr>
          </thead>
          <tbody>
            {perArticle.map((a) => {
              const opp = a.position !== null && a.position >= 5 && a.position <= 20;
              return (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <Link href={`/artigos/${a.id}`} className="font-medium hover:text-brand">{a.title}</Link>
                    {opp && <span className="ml-2 rounded-full bg-warn-soft px-2 py-0.5 text-xs text-warn">oportunidade</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{nf.format(a.clicks)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted">{nf.format(a.impressions)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted">{(a.ctr * 100).toFixed(1).replace(".", ",")}%</td>
                  <td className="px-5 py-3 text-right tabular-nums text-muted">{a.position ? a.position.toFixed(1).replace(".", ",") : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function change(now: number | null, before: number | null) {
  if (now === null || before === null || before === 0) return null;
  return (now - before) / before;
}

function Kpi({ label, value, delta, hint }: { label: string; value: string; delta: number | null; hint?: string }) {
  const up = delta !== null && delta >= 0;
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {delta !== null && (
          <span className={`flex items-center gap-0.5 font-medium ${up ? "text-brand" : "text-bad"}`}>
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta * 100).toFixed(0)}%
          </span>
        )}
        {hint && <span className="text-muted">{hint}</span>}
        {delta === null && !hint && <span className="text-muted">sem período anterior</span>}
      </div>
    </div>
  );
}
