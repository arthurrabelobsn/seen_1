"use client";

import { useActionState, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { resetPassword, signIn, signInWithGoogle, signUp, type AuthState } from "./actions";

type Mode = "entrar" | "criar" | "recuperar";

const TITLES: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  entrar: { title: "Entrar na sua conta", subtitle: "Bem-vindo de volta. Seus artigos e resultados estão te esperando.", cta: "Entrar" },
  criar: { title: "Criar uma conta", subtitle: "Planeje, escreva e publique artigos que trazem clientes pelo Google.", cta: "Começar agora" },
  recuperar: { title: "Recuperar senha", subtitle: "Enviamos um link para o seu e-mail para você criar uma nova senha.", cta: "Enviar link" },
};

export function LoginForm() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get("modo") === "criar" ? "criar" : "entrar");
  // E-mail levado de uma tela para outra (ex.: "conta já existe" → Entrar)
  const [email, setEmail] = useState("");
  const reason = params.get("motivo") ?? "";
  const providerOff = /provider is not enabled|unsupported provider/i.test(reason);

  const go = (to: Mode, withEmail = "") => {
    setEmail(withEmail);
    setMode(to);
  };

  const notices = (
    <>
      {params.get("trocar") && <Notice tone="info">Sessão encerrada. Entre com a outra conta.</Notice>}
      {params.get("erro") && (
        <Notice tone="error">
          {providerOff ? "O login com Google ainda não foi ativado. Use e-mail e senha por enquanto." : "O link expirou ou é inválido. Tente de novo."}
          {reason && !providerOff && <span className="mt-1 block text-xs opacity-80">Detalhe: {reason}</span>}
        </Notice>
      )}
    </>
  );

  // key reinicia o formulário ao trocar de modo
  return <AuthForm key={mode + email} mode={mode} email={email} next={params.get("next") ?? ""} go={go} notices={notices} />;
}

function AuthForm({
  mode,
  email,
  next,
  go,
  notices,
}: {
  mode: Mode;
  email: string;
  next: string;
  go: (to: Mode, email?: string) => void;
  notices: React.ReactNode;
}) {
  const action = mode === "entrar" ? signIn : mode === "criar" ? signUp : resetPassword;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const v = state.values ?? {};

  if (state.sent) return <ConfirmationSent email={state.sent} onBack={() => go("entrar", state.sent)} />;

  return (
    <div>
      <h2 className="mt-6 text-[30px] font-bold leading-tight tracking-tight">{TITLES[mode].title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{TITLES[mode].subtitle}</p>
      {notices}

      <form action={formAction} className={`${mode === "criar" ? "mt-7 space-y-4" : "mt-8 space-y-5"}`}>
        <input type="hidden" name="next" value={next} />

        {mode === "criar" && (
          <Field id="full_name" label="Seu nome">
            <input id="full_name" name="full_name" defaultValue={v.full_name} className="field h-12 rounded-xl px-4" autoComplete="name" placeholder="Nome e sobrenome" required />
          </Field>
        )}

        <Field id="email" label="Seu e-mail">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={v.email ?? email}
            className="field h-12 rounded-xl px-4"
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            required
          />
        </Field>

        {mode === "criar" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="phone" label="Telefone">
              <PhoneInput defaultValue={v.phone} />
            </Field>
            <Field id="company" label="Empresa" optional>
              <input id="company" name="company" defaultValue={v.company} className="field h-12 rounded-xl px-4" autoComplete="organization" placeholder="Nome da empresa" />
            </Field>
          </div>
        )}

        {mode !== "recuperar" && <Passwords mode={mode} onForgot={() => go("recuperar")} />}

        {state.error && (
          <Notice tone="error">
            {state.error}
            {state.exists && (
              <>
                {" "}
                <button type="button" onClick={() => go("entrar", v.email)} className="font-semibold underline underline-offset-2">
                  Fazer login
                </button>{" "}
                ou{" "}
                <button type="button" onClick={() => go("recuperar", v.email)} className="font-semibold underline underline-offset-2">
                  recuperar a senha
                </button>
                .
              </>
            )}
          </Notice>
        )}
        {state.message && <Notice tone="info">{state.message}</Notice>}

        <button
          type="submit"
          disabled={pending}
          className="btn-primary h-12 w-full rounded-xl text-[15px] shadow-[0_12px_28px_-10px_rgba(0,93,255,0.75)] hover:shadow-[0_14px_32px_-10px_rgba(0,93,255,0.9)]"
        >
          {pending ? <Loader2 className="size-5 animate-spin" /> : TITLES[mode].cta}
        </button>
      </form>

      {mode !== "recuperar" && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            ou continue com
            <span className="h-px flex-1 bg-line" />
          </div>
          <GoogleButton />
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        {mode === "entrar" ? (
          <>
            Ainda não tem conta?{" "}
            <button type="button" onClick={() => go("criar")} className="font-semibold text-brand hover:underline">
              Criar conta
            </button>
          </>
        ) : mode === "criar" ? (
          <>
            Já tem conta?{" "}
            <button type="button" onClick={() => go("entrar")} className="font-semibold text-brand hover:underline">
              Entrar
            </button>
          </>
        ) : (
          <button type="button" onClick={() => go("entrar")} className="font-semibold text-brand hover:underline">
            Voltar para Entrar
          </button>
        )}
      </p>
    </div>
  );
}

function Field({ id, label, optional, children }: { id: string; label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(opcional)</span>}
      </label>
      {children}
    </div>
  );
}

/** Senha (e confirmação, ao criar conta) com botão de mostrar. */
function Passwords({ mode, onForgot }: { mode: Mode; onForgot: () => void }) {
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const creating = mode === "criar";
  const mismatch = creating && confirm.length > 0 && confirm !== password;
  const type = show ? "text" : "password";
  const cls = "field h-12 rounded-xl px-4 pr-12 placeholder:text-xl placeholder:tracking-[0.15em] placeholder:text-muted/50";
  const toggle = (
    <button
      type="button"
      onClick={() => setShow(!show)}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink"
      aria-label={show ? "Esconder senha" : "Mostrar senha"}
    >
      {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
    </button>
  );

  return (
    <>
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
            type={type}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cls}
            placeholder="••••••••"
            minLength={creating ? 8 : undefined}
            autoComplete={creating ? "new-password" : "current-password"}
            required
          />
          {toggle}
        </div>
        {creating && <p className="hint">Mínimo de 8 caracteres.</p>}
      </div>

      {creating && (
        <div>
          <label htmlFor="confirm" className="mb-2 block text-sm font-medium">
            Confirmar senha
          </label>
          <input
            id="confirm"
            name="confirm"
            type={type}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`${cls} ${mismatch ? "border-bad focus:border-bad focus:ring-bad/20" : ""}`}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={mismatch}
            required
          />
          {mismatch && <p className="mt-1.5 text-xs text-bad">As senhas não conferem.</p>}
        </div>
      )}
    </>
  );
}

/** Telefone com máscara brasileira: (11) 91234-5678. */
function PhoneInput({ defaultValue }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <input
      id="phone"
      name="phone"
      type="tel"
      inputMode="tel"
      value={value}
      onChange={(e) => setValue(maskPhone(e.target.value))}
      className="field h-12 rounded-xl px-4"
      autoComplete="tel-national"
      placeholder="(11) 91234-5678"
      required
    />
  );
}

function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Tela que substitui o formulário depois do cadastro. */
function ConfirmationSent({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="mt-8">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
        <MailCheck className="size-7" />
      </span>
      <h2 className="mt-6 text-[30px] font-bold leading-tight tracking-tight">E-mail de confirmação enviado</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Enviamos um link para <strong className="font-semibold text-ink">{email}</strong>. Abra o e-mail e clique no link para ativar sua conta.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">Não chegou em alguns minutos? Confira a caixa de spam ou promoções.</p>
      <button type="button" onClick={onBack} className="btn-ghost mt-8 h-12 w-full rounded-xl text-[15px]">
        Voltar para Entrar
      </button>
    </div>
  );
}

/** "G" oficial do Google, nas quatro cores. */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width={20} height={20} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function GoogleButton() {
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
          <GoogleLogo />
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
