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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  return {
    supabase,
    user,
    profile: p,
    avatarUrl: avatarFor(user.email, p.avatar_url),
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
