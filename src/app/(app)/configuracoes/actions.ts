"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, SITE_COOKIE } from "@/lib/session";

export type SiteFormState = { error?: string; saved?: boolean };

const PLATFORMS = ["wordpress", "github", "webhook", "shopify", "nuvemshop", "outro"];

function normalizeUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    return url.origin + url.pathname.replace(/\/$/, "");
  } catch {
    return "";
  }
}

export async function saveSite(_: SiteFormState, formData: FormData): Promise<SiteFormState> {
  const { supabase } = await getSession();
  const id = String(formData.get("id") ?? "");

  const name = String(formData.get("name") ?? "").trim();
  const url = normalizeUrl(String(formData.get("url") ?? ""));
  const platform = String(formData.get("platform") ?? "wordpress");
  const postsPerWeek = Number(formData.get("posts_per_week") ?? 2);

  if (!name) return { error: "Dê um nome ao site." };
  if (!url) return { error: "Informe um endereço válido, como meusite.com.br." };
  if (!PLATFORMS.includes(platform)) return { error: "Plataforma inválida." };

  const payload = {
    name,
    url,
    platform,
    niche: String(formData.get("niche") ?? "").trim() || null,
    audience: String(formData.get("audience") ?? "").trim() || null,
    business_facts: String(formData.get("business_facts") ?? "").trim() || null,
    competitors: String(formData.get("competitors") ?? "")
      .split(/[\n,]/)
      .map((c) => c.trim())
      .filter(Boolean),
    tone: String(formData.get("tone") ?? "profissional"),
    posts_per_week: Math.min(7, Math.max(1, postsPerWeek || 2)),
    autopublish: formData.get("autopublish") === "on",
  };

  if (id) {
    const { error } = await supabase.from("sites").update(payload).eq("id", id);
    if (error) return { error: "Não foi possível salvar. " + error.message };
    revalidatePath("/", "layout");
    return { saved: true };
  }

  const { data, error } = await supabase.from("sites").insert(payload).select("id").single();
  if (error) return { error: "Não foi possível criar o site. " + error.message };

  const cookieStore = await cookies();
  cookieStore.set(SITE_COOKIE, data.id, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
  redirect("/calendario");
}

export async function deleteSite(formData: FormData) {
  const { supabase } = await getSession();
  const id = String(formData.get("id") ?? "");
  if (String(formData.get("confirm") ?? "") !== "EXCLUIR") return;
  await supabase.from("sites").delete().eq("id", id);
  const cookieStore = await cookies();
  cookieStore.delete(SITE_COOKIE);
  revalidatePath("/", "layout");
  redirect("/configuracoes");
}
