import type { Metadata } from "next";
import { Search } from "lucide-react";
import { requireSite } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { isoDay } from "@/lib/format";
import type { Metric } from "@/lib/types";
import { loadDemoData } from "./actions";
import { ResultsDashboard, type ArticleInfo } from "./results-dashboard";

export const metadata: Metadata = { title: "Resultados" };

const RANGES = [7, 28, 90] as const;

export default async function ResultsPage({ searchParams }: PageProps<"/resultados">) {
  const params = await searchParams;
  const days = RANGES.find((r) => String(r) === params.dias) ?? 28;
  const focus = typeof params.artigo === "string" ? params.artigo : null;
  const { supabase, site } = await requireSite();

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (days * 2 - 1)); // período atual + anterior, para comparar

  const [{ data: metricRows }, { data: articleRows }, { data: keywordRows }] = await Promise.all([
    supabase
      .from("article_metrics")
      .select("article_id, date, clicks, impressions, position")
      .eq("site_id", site.id)
      .gte("date", isoDay(start))
      .order("date"),
    supabase.from("articles").select("id, title, status, published_at, focus_keyword, keyword_id").eq("site_id", site.id),
    supabase.from("keywords").select("id, term, cpc").eq("site_id", site.id).not("cpc", "is", null),
  ]);

  const metrics = (metricRows ?? []) as Metric[];
  const cpcById = new Map((keywordRows ?? []).map((k) => [k.id as string, Number(k.cpc)]));
  const cpcByTerm = new Map((keywordRows ?? []).map((k) => [String(k.term).toLowerCase(), Number(k.cpc)]));
  const articles: ArticleInfo[] = (articleRows ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    status: a.status,
    published_at: a.published_at,
    keyword: a.focus_keyword,
    cpc: (a.keyword_id && cpcById.get(a.keyword_id)) || (a.focus_keyword && cpcByTerm.get(a.focus_keyword.toLowerCase())) || null,
  }));

  if (metrics.length === 0) {
    const published = articles.filter((a) => a.status === "publicado").length;
    return (
      <div className="mx-auto max-w-[1400px]">
        <PageHeader title="Resultados" description={`Como o Google está mostrando ${site.name}`} />
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <Search className="size-8 text-muted" />
          <h2 className="mt-3 font-semibold">Nenhum dado ainda</h2>
          <p className="mt-1 max-w-md text-sm text-muted">
            As visitas e posições vêm do Google Search Console, que será conectado na próxima fase. Enquanto isso, carregue dados de
            exemplo para ver o painel funcionando.
          </p>
          <form action={loadDemoData} className="mt-5">
            <button type="submit" className="btn-primary">
              Carregar dados de exemplo
            </button>
          </form>
          <p className="mt-3 text-xs text-muted">{published} artigos publicados neste site.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <ResultsDashboard
        siteName={site.name}
        days={days}
        endDate={isoDay(today)}
        metrics={metrics}
        articles={articles}
        focusArticleId={focus}
        isDemo={articles.some((a) => a.title.startsWith("[Exemplo] "))}
      />
    </div>
  );
}
