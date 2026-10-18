"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Check,
  LayoutGrid,
  Lightbulb,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { Metric } from "@/lib/types";
import { Hint } from "@/components/hint";
import { PageHeader } from "@/components/ui";
import { Popover } from "@/components/popover";
import { Sparkline, TrendChart } from "@/components/line-chart";
import { usePersistentState } from "@/lib/use-persistent";
import { change, daily, formatMetric, lastDays, METRIC_HELP, METRIC_LABEL, positionBands, totals, value, type MetricKey } from "@/lib/metrics";
import { clearDemoData } from "./actions";

export type ArticleInfo = {
  id: string;
  title: string;
  status: string;
  published_at: string | null;
  keyword: string | null;
  cpc: number | null;
};

type WidgetId = "kpis" | "impacto" | "grafico" | "top" | "distribuicao" | "oportunidades" | "tabela";
const WIDGETS: { id: WidgetId; label: string; hint: string }[] = [
  { id: "kpis", label: "Números principais", hint: "Visitas, aparições, taxa de cliques e posição" },
  { id: "impacto", label: "Impacto da Seen", hint: "O que os artigos da Seen trouxeram" },
  { id: "grafico", label: "Evolução por dia", hint: "Gráfico com comparação ao período anterior" },
  { id: "top", label: "Artigos que mais trazem visitas", hint: "Os 5 melhores do período" },
  { id: "distribuicao", label: "Posição no Google", hint: "Quantos artigos estão no topo, na 1ª e 2ª página" },
  { id: "oportunidades", label: "Oportunidades", hint: "Artigos perto da 1ª página" },
  { id: "tabela", label: "Todos os artigos", hint: "Tabela completa com tendência" },
];
const SIMPLE: WidgetId[] = ["kpis", "impacto", "grafico", "top"];
const FULL: WidgetId[] = WIDGETS.map((w) => w.id);
type View = "simples" | "completo" | "personalizado";

const METRICS: MetricKey[] = ["clicks", "impressions", "ctr", "position"];
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function ResultsDashboard({
  siteName,
  days,
  endDate,
  metrics,
  articles,
  focusArticleId,
  isDemo,
}: {
  siteName: string;
  days: number;
  endDate: string;
  metrics: Metric[];
  articles: ArticleInfo[];
  focusArticleId: string | null;
  isDemo: boolean;
}) {
  const [view, setView] = usePersistentState<View>("seen.resultados.modo", "simples");
  const [custom, setCustom] = usePersistentState<WidgetId[]>("seen.resultados.paineis", SIMPLE);
  const [focus, setFocus] = useState<string | null>(focusArticleId);
  const visible = new Set(view === "simples" ? SIMPLE : view === "completo" ? FULL : custom);

  const end = new Date(`${endDate}T12:00:00`);
  const dates = lastDays(days, end);
  const prevEnd = new Date(end);
  prevEnd.setDate(end.getDate() - days);
  const prevDates = lastDays(days, prevEnd);
  const split = dates[0];

  const current = metrics.filter((m) => m.date >= split);
  const previous = metrics.filter((m) => m.date < split);
  const now = totals(current);
  const before = totals(previous);

  const byArticle = articles
        .map((a) => {
          const rows = current.filter((m) => m.article_id === a.id);
          const prevRows = previous.filter((m) => m.article_id === a.id);
          const t = totals(rows);
          return { ...a, ...t, prev: totals(prevRows), trend: daily(rows, dates, "clicks").map((p) => p.value) };
        })
        .filter((a) => a.impressions > 0 || a.prev.impressions > 0)
        .sort((a, b) => b.clicks - a.clicks);

  const focusArticle = focus ? articles.find((a) => a.id === focus) : null;

  function openArticle(id: string | null) {
    setFocus(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("artigo", id);
    else url.searchParams.delete("artigo");
    window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const periodHref = (d: number) => `/resultados?dias=${d}${focus ? `&artigo=${focus}` : ""}`;

  return (
    <>
      <PageHeader
        title="Resultados"
        description={`Como o Google mostrou ${siteName} nos últimos ${days} dias, comparado aos ${days} dias anteriores.`}
        actions={
          <>
            <nav className="flex gap-1 rounded-lg border border-line bg-surface p-1 text-sm" aria-label="Período">
              {[7, 28, 90].map((r) => (
                <Link key={r} href={periodHref(r)} className={`rounded-md px-2.5 py-1 ${r === days ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"}`}>
                  {r} dias
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1 text-sm">
              {(["simples", "completo"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`rounded-md px-2.5 py-1 ${view === v ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"}`}
                >
                  {v === "simples" ? "Simples" : "Completo"}
                </button>
              ))}
              <Popover
                align="right"
                panelClassName="w-80 p-2"
                trigger={({ toggle }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${view === "personalizado" ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"}`}
                  >
                    <Settings2 className="size-4" /> Personalizar
                  </button>
                )}
              >
                {() => (
                  <div>
                    <p className="px-2 pb-2 pt-1 text-xs text-muted">Escolha os painéis que aparecem. Fica salvo neste navegador.</p>
                    {WIDGETS.map((w) => {
                      const on = (view === "personalizado" ? custom : [...visible]).includes(w.id);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            const base = view === "personalizado" ? custom : [...visible];
                            const next = on ? base.filter((x) => x !== w.id) : [...base, w.id];
                            setCustom(FULL.filter((id) => next.includes(id)));
                            setView("personalizado");
                          }}
                          className="flex w-full items-start gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-canvas"
                        >
                          <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${on ? "border-brand bg-brand text-white" : "border-line"}`}>
                            {on && <Check className="size-3" />}
                          </span>
                          <span>
                            <span className="block text-sm font-medium">{w.label}</span>
                            <span className="block text-xs text-muted">{w.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Popover>
            </div>
          </>
        }
      />

      {isDemo && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn/25 bg-warn-soft px-4 py-2.5 text-sm text-warn">
          <span>Você está vendo dados de exemplo.</span>
          <form action={clearDemoData}>
            <button type="submit" className="font-medium underline underline-offset-2">
              Remover dados de exemplo
            </button>
          </form>
        </div>
      )}

      {focusArticle ? (
        <ArticleAnalysis
          article={focusArticle}
          rows={metrics.filter((m) => m.article_id === focusArticle.id)}
          split={split}
          dates={dates}
          prevDates={prevDates}
          siteCtr={now.ctr}
          rank={byArticle.findIndex((a) => a.id === focusArticle.id) + 1}
          total={byArticle.length}
          onBack={() => openArticle(null)}
        />
      ) : (
        <div className="space-y-6">
          {visible.has("kpis") && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {METRICS.map((k) => (
                <Kpi key={k} k={k} now={value(now, k)} before={value(before, k)} />
              ))}
            </div>
          )}

          {(visible.has("impacto") || visible.has("grafico")) && (
            <div className={`grid gap-6 ${visible.has("impacto") && visible.has("grafico") ? "xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" : ""}`}>
              {visible.has("grafico") && <MetricChart rows={current} prevRows={previous} dates={dates} prevDates={prevDates} />}
              {visible.has("impacto") && <ImpactCard byArticle={byArticle} publishedCount={articles.filter((a) => a.status === "publicado").length} />}
            </div>
          )}

          {(visible.has("top") || visible.has("distribuicao")) && (
            <div className={`grid gap-6 ${visible.has("top") && visible.has("distribuicao") ? "xl:grid-cols-2" : ""}`}>
              {visible.has("top") && (
                <section className="card p-5">
                  <h2 className="flex items-center gap-1.5 font-semibold">
                    Artigos que mais trazem visitas
                    <Hint>Os artigos com mais cliques vindos do Google no período. Clique em um para ver a análise completa.</Hint>
                  </h2>
                  <ol className="mt-3 divide-y divide-line">
                    {byArticle.slice(0, 5).map((a, i) => (
                      <li key={a.id}>
                        <button type="button" onClick={() => openArticle(a.id)} className="flex w-full items-center gap-3 py-2.5 text-left hover:text-brand">
                          <span className="w-5 text-sm font-bold tabular-nums text-muted">{i + 1}</span>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{a.title}</span>
                          <span className="text-sm font-semibold tabular-nums">{formatMetric(a.clicks, "clicks")}</span>
                          <Delta d={change(a.clicks, a.prev.clicks, "clicks")} />
                        </button>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {visible.has("distribuicao") && <PositionBands byArticle={byArticle} />}
            </div>
          )}

          {visible.has("oportunidades") && <Opportunities byArticle={byArticle} siteCtr={now.ctr} onOpen={openArticle} />}

          {visible.has("tabela") && (
            <section className="card overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-line px-5 py-4">
                <h2 className="font-semibold">Todos os artigos</h2>
                <Hint>Clique em um artigo para ver a análise detalhada dele.</Hint>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                      <th className="px-5 py-3 font-medium">Artigo</th>
                      <th className="px-3 py-3 font-medium">Tendência</th>
                      <th className="px-3 py-3 text-right font-medium">Visitas</th>
                      <th className="px-3 py-3 text-right font-medium">Aparições</th>
                      <th className="px-3 py-3 text-right font-medium">Taxa de cliques</th>
                      <th className="px-5 py-3 text-right font-medium">Posição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byArticle.map((a) => (
                      <tr key={a.id} onClick={() => openArticle(a.id)} className="cursor-pointer border-b border-line last:border-0 hover:bg-canvas/60">
                        <td className="max-w-[360px] truncate px-5 py-3 font-medium">{a.title}</td>
                        <td className="px-3 py-3">
                          <Sparkline values={a.trend} />
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {formatMetric(a.clicks, "clicks")} <Delta d={change(a.clicks, a.prev.clicks, "clicks")} small />
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted">{formatMetric(a.impressions, "impressions")}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted">{formatMetric(a.ctr, "ctr")}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted">{formatMetric(a.position, "position")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {view === "simples" && (
            <button type="button" onClick={() => setView("completo")} className="btn-ghost mx-auto flex">
              <LayoutGrid className="size-4" /> Ver análise completa
            </button>
          )}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function Kpi({ k, now, before }: { k: MetricKey; now: number | null; before: number | null }) {
  return (
    <div className="card p-5">
      <p className="flex items-center gap-1.5 text-sm text-muted">
        {METRIC_LABEL[k]}
        <Hint>{METRIC_HELP[k]}</Hint>
      </p>
      <p className="mt-1 text-[28px] font-bold leading-tight tabular-nums tracking-tight">{formatMetric(now, k)}</p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        <Delta d={change(now, before, k)} />
        <span className="text-muted">{change(now, before, k) == null ? "sem período anterior" : "vs. período anterior"}</span>
      </div>
    </div>
  );
}

function Delta({ d, small }: { d: number | null; small?: boolean }) {
  if (d == null) return null;
  const up = d >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 font-semibold tabular-nums ${up ? "text-good" : "text-bad"} ${small ? "text-[11px]" : "text-xs"}`}>
      {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
      {Math.abs(d * 100).toFixed(0)}%
    </span>
  );
}

function MetricChart({ rows, prevRows, dates, prevDates }: { rows: Metric[]; prevRows: Metric[]; dates: string[]; prevDates: string[] }) {
  const [k, setK] = useState<MetricKey>("clicks");
  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-semibold">
          {METRIC_LABEL[k]} por dia
          <Hint>{METRIC_HELP[k]}</Hint>
        </h2>
        <div className="flex gap-1 rounded-lg border border-line p-1 text-xs">
          {METRICS.map((m) => (
            <button key={m} type="button" onClick={() => setK(m)} className={`rounded-md px-2 py-1 ${k === m ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"}`}>
              {METRIC_LABEL[m].replace(" do Google", "").replace(" no Google", "")}
            </button>
          ))}
        </div>
      </div>
      <TrendChart
        label={`${METRIC_LABEL[k]} por dia`}
        points={daily(rows, dates, k)}
        previous={daily(prevRows, prevDates, k)}
        format={(v) => formatMetric(v, k)}
        invert={k === "position"}
        height={220}
      />
    </section>
  );
}

type ArticleAgg = ArticleInfo & ReturnType<typeof totals> & { prev: ReturnType<typeof totals>; trend: number[] };

/** Impacto da Seen: números objetivos, só dos artigos criados na ferramenta. */
function ImpactCard({ byArticle, publishedCount }: { byArticle: ArticleAgg[]; publishedCount: number }) {
  const clicks = byArticle.reduce((s, a) => s + a.clicks, 0);
  const prevClicks = byArticle.reduce((s, a) => s + a.prev.clicks, 0);
  const withCpc = byArticle.filter((a) => a.cpc != null);
  const adValue = withCpc.reduce((s, a) => s + a.clicks * (a.cpc ?? 0), 0);
  const firstPage = byArticle.filter((a) => a.position != null && a.position <= 10).length;
  const showing = byArticle.filter((a) => a.impressions > 0).length;

  return (
    <section className="card relative overflow-hidden p-5">
      <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-brand-soft" />
      <div className="relative">
        <h2 className="flex items-center gap-1.5 font-semibold">
          <Sparkles className="size-4 text-brand" /> Impacto da Seen
          <Hint>
            Conta só os artigos criados na Seen, no período escolhido. Não inclui o resto do seu site. Assim você vê exatamente o que a ferramenta trouxe.
          </Hint>
        </h2>
        <p className="mt-4 text-sm text-muted">Visitas trazidas pelos artigos da Seen</p>
        <p className="flex items-baseline gap-2">
          <span className="text-[34px] font-bold leading-tight tabular-nums tracking-tight">{formatMetric(clicks, "clicks")}</span>
          <Delta d={change(clicks, prevClicks, "clicks")} />
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-canvas p-3">
            <dt className="flex items-center gap-1 text-xs text-muted">
              Valor em anúncios
              <Hint>
                Quanto custaria comprar essas mesmas visitas no Google Ads, usando o custo por clique de cada palavra-chave. Aparece quando os dados de custo forem conectados.
              </Hint>
            </dt>
            <dd className="mt-1 text-lg font-bold tabular-nums">{withCpc.length ? brl.format(adValue) : "—"}</dd>
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <dt className="flex items-center gap-1 text-xs text-muted">
              Na 1ª página
              <Hint>Artigos com posição média de 1 a 10: aparecem na primeira página do Google.</Hint>
            </dt>
            <dd className="mt-1 text-lg font-bold tabular-nums">
              {firstPage} <span className="text-sm font-normal text-muted">artigos</span>
            </dd>
          </div>
          <div className="col-span-2 rounded-xl bg-canvas p-3">
            <dt className="flex items-center gap-1 text-xs text-muted">
              Aparecendo no Google
              <Hint>Artigos publicados que apareceram pelo menos uma vez nos resultados de busca no período.</Hint>
            </dt>
            <dd className="mt-1 flex items-center gap-3">
              <span className="text-lg font-bold tabular-nums">
                {showing} <span className="text-sm font-normal text-muted">de {Math.max(publishedCount, showing)} publicados</span>
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${(showing / Math.max(publishedCount, showing, 1)) * 100}%` }} />
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function PositionBands({ byArticle }: { byArticle: ArticleAgg[] }) {
  const bands = positionBands(byArticle);
  const max = Math.max(...bands.map((b) => b.count), 1);
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-1.5 font-semibold">
        Posição no Google
        <Hint>Onde cada artigo aparece, em média, nos resultados. Quanto mais artigos no topo, mais visitas.</Hint>
      </h2>
      <ul className="mt-4 space-y-3">
        {bands.map((b, i) => (
          <li key={b.id} className="grid grid-cols-[110px_1fr_32px] items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              {b.label}
              <Hint>{b.hint}</Hint>
            </span>
            <span className="h-3 overflow-hidden rounded-full bg-canvas">
              <span
                className="block h-full rounded-full"
                style={{ width: `${(b.count / max) * 100}%`, background: ["#005dff", "#4d8dff", "#99bdff", "#c9d0dc"][i] }}
              />
            </span>
            <span className="text-right font-semibold tabular-nums">{b.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Opportunities({ byArticle, siteCtr, onOpen }: { byArticle: ArticleAgg[]; siteCtr: number; onOpen: (id: string) => void }) {
  const near = byArticle.filter((a) => a.position != null && a.position > 4 && a.position <= 20).slice(0, 6);
  const lowCtr = byArticle.filter((a) => a.impressions >= 200 && a.ctr < siteCtr * 0.6).slice(0, 4);
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-1.5 font-semibold">
        <Target className="size-4 text-warn" /> Oportunidades
        <Hint>Ajustes com mais chance de trazer visitas rápido, a partir dos dados do Google.</Hint>
      </h2>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Perto da primeira página</h3>
          <p className="text-xs text-muted">Posição entre 5 e 20. Atualizar o texto e adicionar links costuma fazer subir.</p>
          <ul className="mt-2 space-y-1">
            {near.length === 0 && <li className="text-sm text-muted">Nenhum agora.</li>}
            {near.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => onOpen(a.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-canvas">
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                  <span className="pill border-warn/20 bg-warn-soft text-warn">posição {formatMetric(a.position, "position")}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Aparecem, mas recebem poucos cliques</h3>
          <p className="text-xs text-muted">Taxa de cliques bem abaixo da média do site. Um título e uma descrição mais atraentes ajudam.</p>
          <ul className="mt-2 space-y-1">
            {lowCtr.length === 0 && <li className="text-sm text-muted">Nenhum agora.</li>}
            {lowCtr.map((a) => (
              <li key={a.id}>
                <button type="button" onClick={() => onOpen(a.id)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-canvas">
                  <span className="min-w-0 flex-1 truncate">{a.title}</span>
                  <span className="pill border-line bg-canvas text-muted">{formatMetric(a.ctr, "ctr")}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** Análise detalhada de um artigo. Também é usada (compacta) no editor. */
export function ArticleAnalysis({
  article,
  rows,
  split,
  dates,
  prevDates,
  siteCtr,
  rank,
  total,
  onBack,
}: {
  article: ArticleInfo;
  rows: Metric[];
  split: string;
  dates: string[];
  prevDates: string[];
  siteCtr: number;
  rank: number;
  total: number;
  onBack: () => void;
}) {
  const current = rows.filter((m) => m.date >= split);
  const previous = rows.filter((m) => m.date < split);
  const now = totals(current);
  const before = totals(previous);
  const [k, setK] = useState<MetricKey>("clicks");

  const tips: string[] = [];
  if (now.position != null && now.position > 4 && now.position <= 20)
    tips.push("Está perto do topo. Atualize o texto, aprofunde as seções mais curtas e adicione links de outros artigos para ele.");
  if (now.impressions >= 200 && now.ctr < siteCtr * 0.8)
    tips.push("Aparece bastante, mas recebe menos cliques que a média do site. Teste um título e uma descrição mais chamativos.");
  if (now.position != null && now.position <= 3) tips.push("Está entre os 3 primeiros. Mantenha atualizado e use-o para linkar artigos novos.");
  if (now.impressions === 0) tips.push("Ainda não apareceu no Google. Artigos novos costumam levar algumas semanas para começar a aparecer.");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <button type="button" onClick={onBack} className="btn-ghost px-2.5" aria-label="Voltar para todos os resultados">
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Análise do artigo</p>
          <h2 className="text-xl font-bold leading-snug">{article.title}</h2>
          <p className="text-sm text-muted">
            {article.keyword ? `Palavra-chave: ${article.keyword}` : "Sem palavra-chave"}
            {rank > 0 && ` · ${rank}º em visitas entre ${total} artigos`}
          </p>
        </div>
        <Link href={`/artigos/${article.id}`} className="btn-ghost">
          Abrir no editor
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <Kpi key={m} k={m} now={value(now, m)} before={value(before, m)} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">{METRIC_LABEL[k]} por dia</h3>
            <div className="flex gap-1 rounded-lg border border-line p-1 text-xs">
              {METRICS.map((m) => (
                <button key={m} type="button" onClick={() => setK(m)} className={`rounded-md px-2 py-1 ${k === m ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"}`}>
                  {METRIC_LABEL[m].replace(" do Google", "").replace(" no Google", "")}
                </button>
              ))}
            </div>
          </div>
          <TrendChart
            label={`${METRIC_LABEL[k]} do artigo por dia`}
            points={daily(current, dates, k)}
            previous={daily(previous, prevDates, k)}
            format={(v) => formatMetric(v, k)}
            invert={k === "position"}
            height={220}
          />
        </section>

        <section className="card p-5">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <Lightbulb className="size-4 text-warn" /> O que fazer agora
          </h3>
          {tips.length === 0 ? (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted">
              <TrendingUp className="mt-0.5 size-4 shrink-0 text-good" /> Nenhum ajuste urgente. Acompanhe a evolução nas próximas semanas.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {tips.map((t) => (
                <li key={t} className="rounded-lg border border-line p-3">
                  {t}
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted">
                Taxa de cliques do site
                <Hint>A média de todos os artigos, para comparar com este.</Hint>
              </dt>
              <dd className="font-semibold tabular-nums">{formatMetric(siteCtr, "ctr")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Publicado em</dt>
              <dd className="font-semibold">{article.published_at ? new Date(article.published_at).toLocaleDateString("pt-BR") : "—"}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
