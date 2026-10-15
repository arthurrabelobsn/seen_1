"use server";

import { revalidatePath } from "next/cache";
import { requireSite } from "@/lib/session";
import type { Keyword } from "@/lib/types";

const STATUSES: Keyword["status"][] = ["sugerida", "salva", "em_uso", "descartada"];

function clean(term: string) {
  return term.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 120);
}

export async function addKeywords(raw: string, seed?: string) {
  const { supabase, site } = await requireSite();
  const terms = [...new Set(raw.split(/[\n,;]/).map(clean).filter((t) => t.length >= 2))].slice(0, 200);
  if (terms.length === 0) return { error: "Digite pelo menos uma keyword." };

  const { data, error } = await supabase
    .from("keywords")
    .upsert(
      terms.map((term) => ({ site_id: site.id, term, source: "manual", status: "salva", seed: seed || null })),
      { onConflict: "site_id,term", ignoreDuplicates: true },
    )
    .select("id");
  if (error) return { error: error.message };
  revalidatePath("/keywords");
  const added = data?.length ?? 0;
  return { ok: true, added, skipped: terms.length - added };
}

export async function setKeywordStatus(ids: string[], status: Keyword["status"]) {
  const { supabase } = await requireSite();
  if (!STATUSES.includes(status) || ids.length === 0) return { error: "Nada para atualizar." };
  const { error } = await supabase.from("keywords").update({ status }).in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/keywords");
  return { ok: true };
}

export async function deleteKeywords(ids: string[]) {
  const { supabase } = await requireSite();
  if (ids.length === 0) return { error: "Nada selecionado." };
  const { error } = await supabase.from("keywords").delete().in("id", ids);
  if (error) return { error: error.message };
  revalidatePath("/keywords");
  return { ok: true };
}

/**
 * Gera keywords a partir de palavras, grupos ou temas.
 * Ligar aqui: IA para expandir os temas + fonte de dados (volume/dificuldade) para cada termo.
 */
export async function generateKeywords(seeds: string[]) {
  await requireSite();
  if (seeds.filter(Boolean).length === 0) return { error: "Informe pelo menos um tema ou keyword." };
  return {
    error: "A geração de keywords fica disponível quando a IA e os dados do Google forem conectados. Por enquanto, adicione os termos manualmente.",
    notConfigured: true,
  };
}

/** Atualiza volume, dificuldade, tendência e oportunidade. Ligar à fonte de dados do Google. */
export async function refreshKeywordMetrics(ids: string[]) {
  await requireSite();
  if (ids.length === 0) return { error: "Nada selecionado." };
  return { error: "Os dados de volume e dificuldade chegam quando a fonte do Google for conectada.", notConfigured: true };
}
