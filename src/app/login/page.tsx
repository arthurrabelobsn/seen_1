import type { Metadata } from "next";
import { Suspense } from "react";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SeenIcon, SeenLogo } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <SeenLogo className="mb-12 h-8 w-auto" />

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
        <SeenIcon variant="white" className="pointer-events-none absolute -bottom-16 -right-20 h-[420px] w-auto opacity-10" />
        <SeenIcon variant="white" className="relative h-10 w-auto" />
        <div className="relative max-w-md">
          <h1 className="text-[40px] font-black leading-[1.05] tracking-tight">
            Seja visto por quem procura o que você vende.
          </h1>
          <ul className="mt-8 space-y-3 text-white/85">
            <li>Keywords com volume, dificuldade e oportunidade</li>
            <li>Artigos no tom da sua marca, com SEO on-page pronto</li>
            <li>Calendário editorial e publicação no seu site</li>
            <li>Cliques e posições de cada artigo, direto do Google</li>
          </ul>
        </div>
        <p className="relative text-sm text-white/60">© Seen</p>
      </aside>
    </main>
  );
}
