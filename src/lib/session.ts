import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Site } from "@/lib/types";

export const SITE_COOKIE = "site_atual";

/** Usuário logado + perfil + sites. Uma consulta por requisição (cache do React). */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: sites }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, company").eq("id", user.id).maybeSingle(),
    supabase.from("sites").select("*").order("created_at", { ascending: true }),
  ]);

  const cookieStore = await cookies();
  const chosen = cookieStore.get(SITE_COOKIE)?.value;
  const list = (sites ?? []) as Site[];
  const currentSite = list.find((s) => s.id === chosen) ?? list[0] ?? null;

  return {
    supabase,
    user,
    profile: (profile ?? { id: user.id, full_name: null, company: null }) as Profile,
    sites: list,
    currentSite,
  };
});

/** Para telas que só fazem sentido com um site cadastrado. */
export async function requireSite() {
  const session = await getSession();
  if (!session.currentSite) redirect("/configuracoes?novo=1");
  return { ...session, site: session.currentSite };
}
