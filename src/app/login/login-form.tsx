"use client";

import { useActionState, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { resetPassword, signIn, signInWithGoogle, signUp, type AuthState } from "./actions";

type Mode = "entrar" | "criar" | "recuperar";

const TITLES: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  entrar: { title: "Entrar na sua conta", subtitle: "Bem-vindo de volta. Seus artigos e resultados estão te esperando.", cta: "Entrar" },
  criar: { title: "Criar uma conta", subtitle: "Planeje, escreva e publique artigos que trazem clientes pelo Google.", cta: "Começar agora" },
  recuperar: { title: "Recuperar senha", subtitle: "Enviamos um link para o seu e-mail para você criar uma nova senha.", cta: "Enviar link" },
};

export function LoginForm({ googlePath }: { googlePath: string }) {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("modo") === "criar" ? "criar" : "entrar");
  const reason = params.get("motivo") ?? "";
  const providerOff = /provider is not enabled|unsupported provider/i.test(reason);

  return (
    <div>
      <h2 className="mt-6 text-[30px] font-bold leading-tight tracking-tight">{TITLES[mode].title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{TITLES[mode].subtitle}</p>

      {params.get("trocar") && <Notice tone="info">Sessão encerrada. Entre com a outra conta.</Notice>}
      {params.get("erro") && (
        <Notice tone="error">
          {providerOff ? "O login com Google ainda não foi ativado. Use e-mail e senha por enquanto." : "O link expirou ou é inválido. Tente de novo."}
          {reason && !providerOff && <span className="mt-1 block text-xs opacity-80">Detalhe: {reason}</span>}
        </Notice>
      )}

      {/* key reinicia o formulário ao trocar de modo */}
      <AuthForm key={mode} mode={mode} next={params.get("next") ?? ""} onForgot={() => setMode("recuperar")} />

      {mode !== "recuperar" && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            ou continue com
            <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton path={googlePath} />
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        {mode === "entrar" ? (
          <>
            Ainda não tem conta?{" "}
            <button type="button" onClick={() => setMode("criar")} className="font-semibold text-brand hover:underline">
              Criar conta
            </button>
          </>
        ) : mode === "criar" ? (
          <>
            Já tem conta?{" "}
            <button type="button" onClick={() => setMode("entrar")} className="font-semibold text-brand hover:underline">
              Entrar
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setMode("entrar")} className="font-semibold text-brand hover:underline">
            Voltar para Entrar
          </button>
        )}
      </p>
    </div>
  );
}

function AuthForm({ mode, next, onForgot }: { mode: Mode; next: string; onForgot: () => void }) {
  const action = mode === "entrar" ? signIn : mode === "criar" ? signUp : resetPassword;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />

      {mode === "criar" && (
        <div>
          <label htmlFor="full_name" className="mb-2 block text-sm font-medium">
            Seu nome
          </label>
          <input id="full_name" name="full_name" className="field h-12 rounded-xl px-4" autoComplete="name" required />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Seu e-mail
        </label>
        <input id="email" name="email" type="email" className="field h-12 rounded-xl px-4" autoComplete="email" placeholder="voce@empresa.com.br" required />
      </div>

      {mode !== "recuperar" && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            {mode === "entrar" && (
              <button type="button" onClick={onForgot} className="text-xs text-muted hover:text-brand hover:underline">
                Esqueci minha senha
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              className="field h-12 rounded-xl px-4 pr-12"
              minLength={mode === "criar" ? 8 : undefined}
              autoComplete={mode === "criar" ? "new-password" : "current-password"}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink"
              aria-label={show ? "Esconder senha" : "Mostrar senha"}
            >
              {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
          {mode === "criar" && <p className="hint">Mínimo de 8 caracteres.</p>}
        </div>
      )}

      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.message && <Notice tone="info">{state.message}</Notice>}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary h-12 w-full rounded-xl text-[15px] shadow-[0_12px_28px_-10px_rgba(0,93,255,0.75)] hover:shadow-[0_14px_32px_-10px_rgba(0,93,255,0.9)]"
      >
        {pending ? <Loader2 className="size-5 animate-spin" /> : TITLES[mode].cta}
      </button>
    </form>
  );
}

function GoogleButton({ path }: { path: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await signInWithGoogle();
            if (res?.error) setError(res.error);
          })
        }
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface text-sm font-semibold transition hover:border-brand/40 hover:bg-canvas disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-5 animate-spin text-muted" />
        ) : (
          <svg viewBox="0 0 24 24" width={18} height={18} fill="#4285F4" aria-hidden>
            <path d={path} />
          </svg>
        )}
        Continuar com Google
      </button>
      {error && <Notice tone="error">{error}</Notice>}
    </>
  );
}

function Notice({ tone, children }: { tone: "error" | "info"; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl px-3.5 py-2.5 text-sm ${tone === "error" ? "bg-bad-soft text-bad" : "bg-brand-soft text-brand-strong"}`}>
      {children}
    </p>
  );
}
