import type { Metadata } from "next";
import { Suspense } from "react";
import { supabaseConfigured } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <Logo />
            <span className="text-lg font-semibold tracking-tight">Rankflow</span>
          </div>

          {!supabaseConfigured && (
            <p className="mb-6 rounded-lg border border-warn/30 bg-warn-soft px-3 py-2.5 text-sm text-warn">
              Falta configurar o Supabase: preencha <code className="font-mono">.env.local</code> com a URL e a
              chave do projeto.
            </p>
          )}

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-brand text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-white/5" />
        <div aria-hidden className="absolute -bottom-32 right-24 size-[28rem] rounded-full bg-white/5" />
        <p className="relative text-sm font-medium uppercase tracking-[0.14em] text-white/70">SEO no piloto automático</p>
        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Planeje, escreva e publique artigos que trazem clientes pelo Google.
          </h1>
          <ul className="mt-8 space-y-3 text-white/85">
            <li>Calendário editorial com os termos que seu público busca</li>
            <li>Artigos no tom da sua marca, com SEO on-page pronto</li>
            <li>Cliques e posições de cada artigo, direto do Search Console</li>
          </ul>
        </div>
        <p className="relative text-sm text-white/60">© Rankflow</p>
      </aside>
    </main>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-brand" />
      <path d="M8 22l5-6 4 3 7-9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
