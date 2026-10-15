"use client";

import { useActionState } from "react";
import { ImageInput } from "@/components/image-input";
import { changePassword, saveProfile, type ProfileState } from "./actions";

export function ProfileForm({
  fullName,
  company,
  email,
  userId,
  avatarUrl,
}: {
  fullName: string;
  company: string;
  email: string;
  userId: string;
  avatarUrl: string | null;
}) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, {});
  return (
    <form action={action} className="card space-y-4 p-6">
      <h2 className="font-semibold">Dados pessoais</h2>
      <div className="flex items-center gap-4">
        <ImageInput name="avatar_url" userId={userId} folder="avatar" defaultValue={avatarUrl} className="size-20 shrink-0" compact />
        <p className="text-sm text-muted">Sua foto aparece no menu. Sem foto, usamos a do Gravatar ligada ao seu e-mail, ou as suas iniciais.</p>
      </div>
      <div>
        <label htmlFor="full_name" className="label">Nome</label>
        <input id="full_name" name="full_name" defaultValue={fullName} className="field" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="company" className="label">Empresa ou agência</label>
        <input id="company" name="company" defaultValue={company} className="field" autoComplete="organization" />
      </div>
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" value={email} readOnly className="field bg-canvas text-muted" />
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Salvando…" : "Salvar"}</button>
    </form>
  );
}

export function PasswordForm({ highlight }: { highlight: boolean }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(changePassword, {});
  return (
    <form action={action} className={`card space-y-4 p-6 ${highlight ? "ring-2 ring-brand" : ""}`}>
      <h2 className="font-semibold">Trocar senha</h2>
      {highlight && <p className="text-sm text-brand">Crie sua nova senha abaixo.</p>}
      <div>
        <label htmlFor="password" className="label">Nova senha</label>
        <input id="password" name="password" type="password" minLength={8} className="field" autoComplete="new-password" required />
      </div>
      <div>
        <label htmlFor="confirm" className="label">Confirmar nova senha</label>
        <input id="confirm" name="confirm" type="password" minLength={8} className="field" autoComplete="new-password" required />
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Salvando…" : "Trocar senha"}</button>
    </form>
  );
}

function Feedback({ state }: { state: ProfileState }) {
  if (state.error) return <p role="alert" className="text-sm text-bad">{state.error}</p>;
  if (state.message) return <p role="status" className="text-sm text-brand">{state.message}</p>;
  return null;
}
