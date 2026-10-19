"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type AuthState = {
  error?: string;
  message?: string;
  /** O e-mail já tem conta: a tela oferece ir para o login. */
  exists?: boolean;
  /** E-mail para onde mandamos o link de confirmação. */
  sent?: string;
  /** Valores digitados (menos senhas), para não apagar o formulário quando der erro. */
  values?: Record<string, string>;
};

const NOT_CONFIGURED = "Supabase não configurado. Preencha o .env.local (veja o README).";

function translate(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (m.includes("already registered") || m.includes("already exists")) return "Já existe uma conta com este e-mail.";
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
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: String(formData.get("password")) });
  if (error) return { error: translate(error.message), values: { email } };
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return { error: NOT_CONFIGURED };
  const values = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
  };
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres.", values };
  if (password !== confirm) return { error: "As senhas não conferem.", values };
  if (values.phone.replace(/\D/g, "").length < 10) return { error: "Confira o telefone: coloque o DDD e o número.", values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password,
    options: {
      data: { full_name: values.full_name, phone: values.phone, company: values.company },
      emailRedirectTo: `${await origin()}/auth/callback?next=/novo-site`,
    },
  });
  if (error) {
    const msg = translate(error.message);
    return { error: msg, exists: msg.startsWith("Já existe"), values };
  }
  // Com confirmação de e-mail ligada, o Supabase não acusa erro para e-mail repetido
  // (para não revelar quem tem conta): devolve um usuário sem identidades.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "Já existe uma conta com este e-mail.", exists: true, values };
  }

  // Com confirmação de e-mail desligada no Supabase, a sessão já vem pronta.
  if (data.session) redirect("/novo-site");
  return { sent: values.email };
}

export async function resetPassword(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/perfil?senha=1`,
  });
  if (error) return { error: translate(error.message), values: { email } };
  return { message: "Se o e-mail tiver conta, você vai receber um link para criar uma nova senha." };
}

/** Entrar ou criar conta com o Google (precisa estar ativado no Supabase → Authentication → Sign In / Providers → Google). */
export async function signInWithGoogle(): Promise<AuthState> {
  if (!supabaseConfigured) return { error: NOT_CONFIGURED };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=/calendario` },
  });
  if (error || !data.url) return { error: "Não foi possível abrir o login do Google. " + (error?.message ?? "") };
  redirect(data.url);
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
