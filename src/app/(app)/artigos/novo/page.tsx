import type { Metadata } from "next";
import { requireSite } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import type { Keyword } from "@/lib/types";
import { NewArticleForm } from "./new-article-form";

export const metadata: Metadata = { title: "Criar artigo" };

export default async function NewArticlePage({ searchParams }: PageProps<"/artigos/novo">) {
  const params = await searchParams;
  const { supabase, site } = await requireSite();
  const date = typeof params.data === "string" ? params.data : "";
  const keywordId = typeof params.keyword === "string" ? params.keyword : "";

  const { data } = await supabase
    .from("keywords")
    .select("id, term, volume, difficulty, opportunity, status")
    .eq("site_id", site.id)
    .neq("status", "descartada")
    .order("volume", { ascending: false, nullsFirst: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Criar artigo" description={`Escolha a palavra-chave e o tema. Depois você escreve no editor visual, ou gera com IA, em ${site.name}.`} />
      <NewArticleForm
        defaultDate={date}
        defaultKeywordId={keywordId}
        keywords={(data ?? []) as Pick<Keyword, "id" | "term" | "volume" | "difficulty" | "opportunity" | "status">[]}
      />
    </div>
  );
}
