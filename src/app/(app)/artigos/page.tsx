import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSite } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { computeOpportunity } from "@/lib/content";
import type { Article } from "@/lib/types";
import { ArticlesBrowser, type ArticleRow, type FolderId } from "./articles-browser";

export const metadata: Metadata = { title: "Artigos" };

const FOLDERS: FolderId[] = ["todos", "recomendados", "favoritos", "agendados", "rascunhos", "publicados"];

export default async function ArticlesPage({ searchParams }: PageProps<"/artigos">) {
  const params = await searchParams;
  const folder = (FOLDERS.find((f) => f === params.pasta) ?? "todos") as FolderId;
  const { supabase, site } = await requireSite();

  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("site_id", site.id)
    .order("updated_at", { ascending: false });

  const rows: ArticleRow[] = ((data ?? []) as Article[]).map((a) => ({
    id: a.id,
    title: a.title,
    keyword: a.focus_keyword,
    status: a.status,
    starred: a.starred ?? false,
    volume: a.volume ?? null,
    difficulty: a.difficulty ?? null,
    opportunity: a.opportunity ?? computeOpportunity(a.volume ?? null, a.difficulty ?? null),
    scheduled_for: a.scheduled_for,
    published_at: a.published_at,
    word_count: a.word_count,
    updated_at: a.updated_at,
  }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Artigos"
        description={`${rows.length} artigos em ${site.name}`}
        actions={
          <Link href="/artigos/novo" className="btn-primary">
            <Plus className="size-4" /> Criar artigo
          </Link>
        }
      />
      <ArticlesBrowser rows={rows} initialFolder={folder} />
    </div>
  );
}
