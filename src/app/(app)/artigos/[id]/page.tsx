import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireSite } from "@/lib/session";
import type { Article } from "@/lib/types";
import { ArticleEditor } from "./article-editor";

export const metadata: Metadata = { title: "Editar artigo" };

export default async function ArticlePage({ params }: PageProps<"/artigos/[id]">) {
  const { id } = await params;
  const { supabase, site } = await requireSite();

  const { data } = await supabase.from("articles").select("*").eq("id", id).eq("site_id", site.id).maybeSingle();
  if (!data) notFound();

  return (
    <>
      <Link href="/artigos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Artigos
      </Link>
      <ArticleEditor article={data as Article} siteUrl={site.url} />
    </>
  );
}
