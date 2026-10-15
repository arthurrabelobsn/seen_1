import type { Metadata } from "next";
import { requireSite } from "@/lib/session";
import { computeOpportunity } from "@/lib/content";
import type { Keyword } from "@/lib/types";
import { KeywordsBoard } from "./keywords-board";

export const metadata: Metadata = { title: "Keywords" };

export default async function KeywordsPage() {
  const { supabase, site } = await requireSite();
  const [{ data }, { data: used }] = await Promise.all([
    supabase.from("keywords").select("*").eq("site_id", site.id).order("created_at", { ascending: false }).limit(1000),
    supabase.from("articles").select("keyword_id, focus_keyword").eq("site_id", site.id),
  ]);

  // Uma keyword está "em uso" se algum artigo aponta para ela ou usa o mesmo termo
  const usedIds = new Set((used ?? []).map((a) => a.keyword_id).filter(Boolean));
  const usedTerms = new Set((used ?? []).map((a) => a.focus_keyword?.toLowerCase()).filter(Boolean));

  const keywords = ((data ?? []) as Keyword[]).map((k) => ({
    ...k,
    opportunity: k.opportunity ?? computeOpportunity(k.volume, k.difficulty),
    status: k.status === "salva" && (usedIds.has(k.id) || usedTerms.has(k.term)) ? ("em_uso" as const) : k.status,
  }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <KeywordsBoard keywords={keywords} siteName={site.name} niche={site.niche} />
    </div>
  );
}
