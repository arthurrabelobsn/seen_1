import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { requireSite } from "@/lib/session";
import { PageHeader, StatusBadge } from "@/components/page-header";
import { STATUS_LABEL, STATUS_ORDER, type Article, type ArticleStatus } from "@/lib/types";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Artigos" };

export default async function ArticlesPage({ searchParams }: PageProps<"/artigos">) {
  const params = await searchParams;
  const filter = (typeof params.status === "string" ? params.status : "") as ArticleStatus | "";
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const { supabase, site } = await requireSite();

  const { data } = await supabase
    .from("articles")
    .select("id, title, focus_keyword, status, scheduled_for, published_at, word_count, updated_at")
    .eq("site_id", site.id)
    .order("updated_at", { ascending: false });

  const all = (data ?? []) as Pick<
    Article,
    "id" | "title" | "focus_keyword" | "status" | "scheduled_for" | "published_at" | "word_count" | "updated_at"
  >[];
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, all.filter((a) => a.status === s).length]));
  const rows = all.filter(
    (a) =>
      (!filter || a.status === filter) &&
      (!q || `${a.title} ${a.focus_keyword ?? ""}`.toLowerCase().includes(q.toLowerCase())),
  );

  const tabHref = (s: string) => {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    const qs = p.toString();
    return `/artigos${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Artigos"
        description={`${all.length} artigos em ${site.name}`}
        actions={
          <Link href="/artigos/novo" className="btn-primary">
            <Plus className="size-4" /> Criar artigo
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1 text-sm">
          <Tab href={tabHref("")} active={!filter} label="Todos" count={all.length} />
          {STATUS_ORDER.map((s) => (
            <Tab key={s} href={tabHref(s)} active={filter === s} label={STATUS_LABEL[s]} count={counts[s]} />
          ))}
        </nav>
        <form className="w-full sm:w-64">
          {filter && <input type="hidden" name="status" value={filter} />}
          <input name="q" defaultValue={q} placeholder="Buscar por título ou palavra-chave" className="field" />
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <FileText className="size-8 text-muted" />
          <p className="mt-3 font-medium">{all.length === 0 ? "Nenhum artigo ainda" : "Nada encontrado com esse filtro"}</p>
          {all.length === 0 && (
            <>
              <p className="mt-1 text-sm text-muted">Comece por uma pergunta que seus clientes fazem com frequência.</p>
              <Link href="/artigos/novo" className="btn-primary mt-5">
                Criar o primeiro artigo
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Palavra-chave</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 text-right font-medium">Palavras</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
                  <td className="px-4 py-3">
                    <Link href={`/artigos/${a.id}`} className="font-medium hover:text-brand">
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{a.focus_keyword ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {a.published_at ? formatDate(a.published_at) : a.scheduled_for ? formatDate(a.scheduled_for) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted">{a.word_count.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Tab({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-2.5 py-1 transition ${active ? "bg-brand-soft font-medium text-brand-strong" : "text-muted hover:text-ink"}`}
    >
      {label} <span className="tabular-nums opacity-70">{count}</span>
    </Link>
  );
}
