"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export type ProfileState = { error?: string; message?: string };

export async function saveProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const { supabase, user } = await getSession();
  const row = {
    id: user.id,
    full_name: String(formData.get("full_name") ?? "").trim() || null,
    company: String(formData.get("company") ?? "").trim() || null,
    avatar_url: String(formData.get("avatar_url") ?? "").trim() || null,
  };
  const phone = String(formData.get("phone") ?? "").trim() || null;
  let { error } = await supabase.from("profiles").upsert({ ...row, phone });
  // Sem a migração 0003 ainda não existe a coluna phone: salva o resto e guarda o telefone na conta
  if (error && /phone/i.test(error.message)) {
    ({ error } = await supabase.from("profiles").upsert(row));
    if (!error) await supabase.auth.updateUser({ data: { phone } });
  }
  if (error) return { error: "Não foi possível salvar. " + error.message };
  revalidatePath("/", "layout");
  return { message: "Perfil atualizado." };
}

export async function changePassword(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const { supabase } = await getSession();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As senhas não conferem." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Não foi possível trocar a senha. " + error.message };
  return { message: "Senha alterada." };
}
