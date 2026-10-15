"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, requireSite, SITE_COOKIE } from "@/lib/session";
import { IMAGE_STYLES, TONES } from "@/lib/types";

export type FormState = { error?: string; saved?: boolean };

const PLATFORMS = ["wordpress", "github", "webhook", "shopify", "nuvemshop", "outro"];
const text = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim() || null;
const list = (fd: FormData, k: string) =>
  String(fd.get(k) ?? "")
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean);

function normalizeUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return "";
    return url.origin + url.pathname.replace(/\/$/, "");
  } catch {
    return "";
  }
}

async function setCurrentSite(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(SITE_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
}

/* ------------------------------------------------------------------ */
/* Site                                                                */
/* ------------------------------------------------------------------ */

export async function createSite(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await getSession();
  const name = text(fd, "name");
  const url = normalizeUrl(String(fd.get("url") ?? ""));
  const platform = String(fd.get("platform") ?? "wordpress");
  if (!name) return { error: "Dê um nome ao site." };
  if (!url) return { error: "Informe um domínio válido, como meusite.com.br." };
  if (!PLATFORMS.includes(platform)) return { error: "Plataforma inválida." };

  const { data, error } = await supabase
    .from("sites")
    .insert({ name, url, platform, description: text(fd, "description") })
    .select("id")
    .single();
  if (error) return { error: "Não foi possível criar o site. " + error.message };

  await setCurrentSite(data.id);
  revalidatePath("/", "layout");
  redirect("/site?bemvindo=1");
}

/** Atualiza um grupo de campos do site. Cada aba envia `section` e só os campos dela são aceitos. */
export async function updateSite(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase, site } = await requireSite();
  const section = String(fd.get("section"));
  let patch: Record<string, unknown>;

  switch (section) {
    case "dominio": {
      const name = text(fd, "name");
      const url = normalizeUrl(String(fd.get("url") ?? ""));
      if (!name) return { error: "Dê um nome ao site." };
      if (!url) return { error: "Informe um domínio válido, como meusite.com.br." };
      patch = { name, url };
      break;
    }
    case "marca": {
      const tone = String(fd.get("tone") ?? "profissional");
      const imageStyle = String(fd.get("image_style") ?? "realista");
      if (!TONES.some((t) => t.value === tone)) return { error: "Tom de voz inválido." };
      if (!IMAGE_STYLES.some((s) => s.value === imageStyle)) return { error: "Estilo de imagem inválido." };
      patch = {
        description: text(fd, "description"),
        niche: text(fd, "niche"),
        audience: text(fd, "audience"),
        business_facts: text(fd, "business_facts"),
        tone,
        image_style: imageStyle,
        brand_words: list(fd, "brand_words"),
        banned_words: list(fd, "banned_words"),
        cta_text: text(fd, "cta_text"),
      };
      break;
    }
    case "avancado": {
      const perWeek = Number(fd.get("posts_per_week") ?? 2);
      patch = {
        posts_per_week: Math.min(7, Math.max(1, perWeek || 2)),
        autopublish: fd.get("autopublish") === "on",
        language: String(fd.get("language") ?? "pt-BR"),
        competitors: list(fd, "competitors"),
      };
      break;
    }
    default:
      return { error: "Seção inválida." };
  }

  const { error } = await supabase.from("sites").update(patch).eq("id", site.id);
  if (error) return { error: "Não foi possível salvar. " + error.message };
  revalidatePath("/", "layout");
  return { saved: true };
}

export async function setPlatform(platform: string) {
  const { supabase, site } = await requireSite();
  if (!PLATFORMS.includes(platform)) return { error: "Plataforma inválida." };
  const { error } = await supabase.from("sites").update({ platform }).eq("id", site.id);
  if (error) return { error: error.message };
  revalidatePath("/site", "layout");
  return { ok: true };
}

export async function deleteSite(fd: FormData) {
  const { supabase, site } = await requireSite();
  if (String(fd.get("confirm") ?? "") !== "EXCLUIR") return;
  await supabase.from("sites").delete().eq("id", site.id);
  const cookieStore = await cookies();
  cookieStore.delete(SITE_COOKIE);
  revalidatePath("/", "layout");
  redirect("/novo-site");
}

/* ------------------------------------------------------------------ */
/* Produtos e serviços                                                 */
/* ------------------------------------------------------------------ */

export async function saveProduct(_: FormState, fd: FormData): Promise<FormState> {
  const { supabase, site } = await requireSite();
  const id = text(fd, "id");
  const name = text(fd, "name");
  if (!name) return { error: "Dê um nome ao produto ou serviço." };

  const priceRaw = String(fd.get("price") ?? "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const price = priceRaw ? Number(priceRaw) : null;
  if (price !== null && (Number.isNaN(price) || price < 0)) return { error: "Preço inválido." };

  const rawUrl = text(fd, "url");
  const url = rawUrl ? normalizeUrl(rawUrl) : null;
  if (rawUrl && !url) return { error: "Link inválido." };

  const kind = fd.get("kind") === "servico" ? "servico" : "produto";
  const payload = {
    site_id: site.id,
    kind,
    name,
    description: text(fd, "description"),
    price,
    url,
    image_url: text(fd, "image_url"),
    active: fd.get("active") === "on",
  };

  const { error } = id
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);
  if (error) return { error: "Não foi possível salvar. " + error.message };
  revalidatePath("/site/produtos");
  revalidatePath("/site");
  return { saved: true };
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireSite();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/site/produtos");
  revalidatePath("/site");
}
