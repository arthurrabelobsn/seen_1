import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { avatarFor } from "@/lib/avatar";
import type { Profile, Site } from "@/lib/types";

export const SITE_COOKIE = "site_atual";

/** Usuário logado + perfil + sites. Uma consulta por requisição (cache do React). */
export const getSession = cache(async () => {
  const supabase = await createClient();
  // Verificação local do token (rápida); o proxy já renovou a sessão nesta requisição.
  const { data: auth } = await supabase.auth.getClaims();
  const claims = auth?.claims;
  if (!claims?.sub) redirect("/login");
  const user = { id: claims.sub, email: (claims.email as string | undefined) ?? "" };
  // Quem entra com o Google já traz a foto da conta
  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const providerAvatar = (meta.avatar_url ?? meta.picture ?? null) as string | null;

  const [{ data: profile }, { data: sites }, schemaCheck] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("sites").select("*").order("created_at", { ascending: true }),
    // Detecta se a migração 0002 já foi aplicada (coluna nova em products)
    supabase.from("products").select("id").limit(1),
  ]);

  const cookieStore = await cookies();
  const chosen = cookieStore.get(SITE_COOKIE)?.value;
  const list = (sites ?? []) as Site[];
  const currentSite = list.find((s) => s.id === chosen) ?? list[0] ?? null;
  const p = (profile ?? { id: user.id, full_name: null, company: null, avatar_url: null }) as Profile;
  // Antes da migração 0003 o telefone fica só nos dados do cadastro
  p.phone = p.phone ?? ((meta.phone as string | undefined) || null);
  p.company = p.company ?? ((meta.company as string | undefined) || null);

  return {
    supabase,
    user,
    profile: p,
    avatarUrl: avatarFor(user.email, p.avatar_url ?? providerAvatar),
    sites: list,
    currentSite,
    needsMigration: Boolean(schemaCheck.error),
  };
});

/** Para telas que só fazem sentido com um site cadastrado. */
export async function requireSite() {
  const session = await getSession();
  if (!session.currentSite) redirect("/novo-site");
  return { ...session, site: session.currentSite };
}
