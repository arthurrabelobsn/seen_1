"use server";

import { revalidatePath } from "next/cache";
import { requireSite } from "@/lib/session";
import { isoDay } from "@/lib/format";

const DEMO_PREFIX = "[Exemplo] ";
const DEMO_TITLES = [
  "Como organizar o closet em 7 passos",
  "Quanto custa um personal organizer em 2026",
  "Caixas organizadoras: quais valem a pena",
  "Organização de cozinha pequena: guia completo",
  "Como dobrar roupas para ganhar espaço",
];

/** Gera 56 dias de métricas fictícias para ver o painel funcionando antes do Search Console. */
export async function loadDemoData() {
  const { supabase, site } = await requireSite();

  const { data: published } = await supabase
    .from("articles")
    .select("id")
    .eq("site_id", site.id)
    .eq("status", "publicado");

  let ids = (published ?? []).map((a) => a.id as string);
  if (ids.length === 0) {
    const start = new Date();
    start.setDate(start.getDate() - 70);
    const { data: created } = await supabase
      .from("articles")
      .insert(
        DEMO_TITLES.map((t, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i * 4);
          return {
            site_id: site.id,
            title: DEMO_PREFIX + t,
            status: "publicado",
            published_at: d.toISOString(),
            content: "Artigo de exemplo para demonstrar o painel de resultados.",
            word_count: 1200,
          };
        }),
      )
      .select("id");
    ids = (created ?? []).map((a) => a.id as string);
  }

  const rows = [];
  const today = new Date();
  for (const [k, id] of ids.entries()) {
    const base = 4 + k * 3;
    let position = 28 - k * 3;
    for (let d = 55; d >= 0; d--) {
      const day = new Date(today);
      day.setDate(today.getDate() - d);
      const growth = (56 - d) / 56;
      position = Math.max(2.5, position - 0.25 + Math.random() * 0.3);
      const impressions = Math.round(base * 18 * growth + Math.random() * 25);
      const ctr = position < 5 ? 0.09 : position < 10 ? 0.04 : 0.012;
      rows.push({
        site_id: site.id,
        article_id: id,
        date: isoDay(day),
        impressions,
        clicks: Math.round(impressions * ctr * (0.7 + Math.random() * 0.6)),
        position: Number(position.toFixed(2)),
      });
    }
  }

  await supabase.from("article_metrics").upsert(rows, { onConflict: "article_id,date" });
  revalidatePath("/resultados");
}

export async function clearDemoData() {
  const { supabase, site } = await requireSite();
  await supabase.from("article_metrics").delete().eq("site_id", site.id);
  await supabase.from("articles").delete().eq("site_id", site.id).like("title", `${DEMO_PREFIX}%`);
  revalidatePath("/resultados");
  revalidatePath("/artigos");
  revalidatePath("/calendario");
}
