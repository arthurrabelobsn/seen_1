"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type AuthState = { error?: string; message?: string };

const NOT_CONFIGURED = "Supabase não configurado. Preencha o .env.local (veja o README).";

function translate(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (m.includes("already registered")) return "Este e-mail já tem conta. Use a aba Entrar.";
  if (m.includes("password should be")) return "A senha precisa ter pelo menos 8 caracteres.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos.";
  return message;
}

async function origin() {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

function safeNext(value: FormDataEntryValue | null) {
  const next = String(value ?? "");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/calendario";
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password")),
  });
  if (error) return { error: translate(error.message) };
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return { error: NOT_CONFIGURED };
  const password = String(formData.get("password"));
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")).trim(),
    password,
    options: {
      data: { full_name: String(formData.get("full_name") ?? "").trim() },
      emailRedirectTo: `${await origin()}/auth/callback?next=/novo-site`,
    },
  });
  if (error) return { error: translate(error.message) };

  // Com confirmação de e-mail desligada no Supabase, a sessão já vem pronta.
  if (data.session) redirect("/novo-site");
  return { message: "Conta criada. Enviamos um link de confirmação para o seu e-mail." };
}

export async function resetPassword(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(String(formData.get("email")).trim(), {
    redirectTo: `${await origin()}/auth/callback?next=/perfil?senha=1`,
  });
  if (error) return { error: translate(error.message) };
  return { message: "Se o e-mail tiver conta, você vai receber um link para criar uma nova senha." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Encerra a sessão atual e abre o login pronto para outra conta. */
export async function switchUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?trocar=1");
}
