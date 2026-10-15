"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSite } from "@/lib/session";
import { countWords, slugify } from "@/lib/seo";
import { computeOpportunity } from "@/lib/content";
import type { ArticleStatus } from "@/lib/types";

export type ArticleFormState = { error?: string; savedAt?: string };

const STATUSES: ArticleStatus[] = ["ideia", "rascunho", "aprovado", "agendado", "publicado"];
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const list = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/[\n,]/)
    .map((k) => k.trim())
    .filter(Boolean);

function refresh(id?: string) {
  revalidatePath("/artigos");
  revalidatePath("/calendario");
  revalidatePath("/keywords");
  if (id) revalidatePath(`/artigos/${id}`);
}

export async function createArticle(_: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const { supabase, site } = await requireSite();

  const title = String(formData.get("title") ?? "").trim();
  const focusKeyword = String(formData.get("focus_keyword") ?? "").trim();
  const keywordId = String(formData.get("keyword_id") ?? "") || null;
  const scheduled = String(formData.get("scheduled_for") ?? "");
  if (!title) return { error: "Dê um título provisório ao artigo." };

  // Se veio de uma keyword salva, copia as métricas dela para o artigo
  let metrics: { volume: number | null; difficulty: number | null; opportunity: string | null } = {
    volume: null,
    difficulty: null,
    opportunity: null,
  };
  if (keywordId) {
    const { data: kw } = await supabase.from("keywords").select("volume, difficulty, opportunity").eq("id", keywordId).maybeSingle();
    if (kw) metrics = { ...kw, opportunity: kw.opportunity ?? computeOpportunity(kw.volume, kw.difficulty) };
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({
      site_id: site.id,
      keyword_id: keywordId,
      title,
      slug: slugify(focusKeyword || title),
      focus_keyword: focusKeyword || null,
      secondary_keywords: list(formData.get("secondary_keywords")),
      brief: String(formData.get("brief") ?? "").trim() || null,
      scheduled_for: isDate(scheduled) ? scheduled : null,
      status: isDate(scheduled) ? "agendado" : "ideia",
      ...metrics,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível criar o artigo. " + error.message };
  if (keywordId) await supabase.from("keywords").update({ status: "em_uso" }).eq("id", keywordId);
  refresh();
  redirect(`/artigos/${data.id}`);
}

export async function saveArticle(_: ArticleFormState, formData: FormData): Promise<ArticleFormState> {
  const { supabase } = await requireSite();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ArticleStatus;
  const scheduled = String(formData.get("scheduled_for") ?? "");
  const content = String(formData.get("content") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!title) return { error: "O título não pode ficar vazio." };
  if (!STATUSES.includes(status)) return { error: "Status inválido." };
  if (status === "agendado" && !isDate(scheduled)) return { error: "Escolha a data para agendar." };

  const { data: current } = await supabase.from("articles").select("published_at").eq("id", id).maybeSingle();

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      slug: slugify(String(formData.get("slug") ?? "") || title),
      focus_keyword: String(formData.get("focus_keyword") ?? "").trim() || null,
      secondary_keywords: list(formData.get("secondary_keywords")),
      brief: String(formData.get("brief") ?? "").trim() || null,
      meta_title: String(formData.get("meta_title") ?? "").trim() || null,
      meta_description: String(formData.get("meta_description") ?? "").trim() || null,
      content,
      word_count: countWords(content),
      status,
      scheduled_for: isDate(scheduled) ? scheduled : null,
      published_url: String(formData.get("published_url") ?? "").trim() || null,
      // Só marca a data de publicação na primeira vez que o artigo vira "publicado"
      published_at: status === "publicado" ? current?.published_at ?? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { error: "Não foi possível salvar. " + error.message };
  refresh(id);
  return { savedAt: new Date().toISOString() };
}

export async function deleteArticle(formData: FormData) {
  const { supabase } = await requireSite();
  await supabase.from("articles").delete().eq("id", String(formData.get("id")));
  refresh();
  redirect("/artigos");
}

export async function toggleStar(id: string, starred: boolean) {
  const { supabase } = await requireSite();
  const { error } = await supabase.from("articles").update({ starred }).eq("id", id);
  if (error) return { error: error.message };
  refresh(id);
  return { ok: true };
}

/** Agenda (ou tira a data de) um artigo. Usado pelo calendário, pela lista e pelo editor. */
export async function rescheduleArticle(id: string, date: string | null) {
  const { supabase } = await requireSite();
  if (date !== null && !isDate(date)) return { error: "Data inválida." };

  const { data: current } = await supabase.from("articles").select("status").eq("id", id).single();
  if (!current) return { error: "Artigo não encontrado." };
  if (current.status === "publicado") return { error: "Artigos publicados não podem ser reagendados." };

  const status = date ? "agendado" : current.status === "agendado" ? "aprovado" : current.status;
  const { error } = await supabase.from("articles").update({ scheduled_for: date, status }).eq("id", id);
  if (error) return { error: error.message };
  refresh(id);
  return { ok: true };
}
