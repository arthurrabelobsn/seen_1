"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword, signIn, signUp, type AuthState } from "./actions";

type Mode = "entrar" | "criar" | "recuperar";

const TITLES: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  entrar: { title: "Entrar", subtitle: "Bem-vindo de volta.", cta: "Entrar" },
  criar: { title: "Criar conta", subtitle: "Comece com seu primeiro site em 2 minutos.", cta: "Criar conta" },
  recuperar: { title: "Recuperar senha", subtitle: "Enviamos um link para você criar outra.", cta: "Enviar link" },
};

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("entrar");
  const params = useSearchParams();
  const callbackError = params.get("erro");

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">{TITLES[mode].title}</h2>
      <p className="mt-1 text-sm text-muted">{TITLES[mode].subtitle}</p>

      {callbackError && (
        <p className="mt-5 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
          O link expirou ou é inválido. Tente de novo.
          {params.get("motivo") && <span className="mt-1 block text-xs opacity-80">Detalhe: {params.get("motivo")}</span>}
        </p>
      )}

      {/* key força o formulário a reiniciar o estado ao trocar de modo */}
      <AuthForm key={mode} mode={mode} next={params.get("next") ?? ""} />

      <div className="mt-6 space-y-2 text-center text-sm text-muted">
        {mode === "entrar" && (
          <>
            <p>
              Não tem conta?{" "}
              <button type="button" onClick={() => setMode("criar")} className="font-medium text-brand hover:underline">
                Criar conta
              </button>
            </p>
            <button type="button" onClick={() => setMode("recuperar")} className="hover:text-ink hover:underline">
              Esqueci minha senha
            </button>
          </>
        )}
        {mode !== "entrar" && (
          <button type="button" onClick={() => setMode("entrar")} className="font-medium text-brand hover:underline">
            Voltar para Entrar
          </button>
        )}
      </div>
    </div>
  );
}

function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const action = mode === "entrar" ? signIn : mode === "criar" ? signUp : resetPassword;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <input type="hidden" name="next" value={next} />

      {mode === "criar" && (
        <div>
          <label htmlFor="full_name" className="label">Seu nome</label>
          <input id="full_name" name="full_name" className="field" autoComplete="name" required />
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" className="field" autoComplete="email" required />
      </div>

      {mode !== "recuperar" && (
        <div>
          <label htmlFor="password" className="label">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            className="field"
            minLength={mode === "criar" ? 8 : undefined}
            autoComplete={mode === "criar" ? "new-password" : "current-password"}
            required
          />
          {mode === "criar" && <p className="hint">Mínimo de 8 caracteres.</p>}
        </div>
      )}

      {state.error && <p role="alert" className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{state.error}</p>}
      {state.message && <p role="status" className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand-strong">{state.message}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full py-2.5">
        {pending ? "Aguarde…" : TITLES[mode].cta}
      </button>
    </form>
  );
}
