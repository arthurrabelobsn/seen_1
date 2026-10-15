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
  const { supabase, site, user } = await requireSite();

  const { data } = await supabase.from("articles").select("*").eq("id", id).eq("site_id", site.id).maybeSingle();
  if (!data) notFound();

  const article = {
    starred: false,
    volume: null,
    difficulty: null,
    opportunity: null,
    cover_image: null,
    ...data,
  } as Article;

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link href="/artigos" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" /> Artigos
      </Link>
      <ArticleEditor article={article} siteUrl={site.url} userId={user.id} />
    </div>
  );
}
