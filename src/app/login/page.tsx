import type { Metadata } from "next";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SeenLogo } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* No computador o logo fica no painel azul; no celular, aqui */}
          <SeenLogo className="mb-12 h-8 w-auto lg:hidden" />

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

      <aside className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#2a7bff_0%,#005dff_45%,#0039b8_100%)] text-white lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-14">
        <AbstractShapes />

        <div className="relative flex max-w-md flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo estático */}
          <img src="/brand/logo-white.png" alt="Seen" width={1014} height={191} className="h-12 w-auto" />
          <h1 className="mt-10 text-[34px] font-black leading-[1.1] tracking-tight">Seja visto por quem procura o que você vende.</h1>
          <ul className="mt-8 space-y-3 text-left text-white/90">
            {[
              "Palavras certas para o seu público, com a busca de cada uma",
              "Artigos no tom da sua marca, prontos para o Google",
              "Calendário de publicação no seu site",
              "Visitas e posição de cada artigo, direto do Google",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="size-3.5" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="absolute bottom-8 text-sm text-white/60">© Seen</p>
      </aside>
    </main>
  );
}

/** Formas abstratas de fundo: luzes desfocadas e anéis que lembram os olhos do ícone. */
function AbstractShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -left-24 -top-24 size-[420px] rounded-full bg-[#5fa0ff] opacity-50 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 size-[520px] rounded-full bg-[#002a8f] opacity-60 blur-3xl" />
      <div className="absolute right-[12%] top-[18%] size-40 rounded-full bg-[#7fb4ff] opacity-30 blur-2xl" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 900" preserveAspectRatio="xMidYMid slice">
        <circle cx="690" cy="120" r="150" fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="2" />
        <circle cx="690" cy="120" r="95" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="2" />
        <circle cx="110" cy="800" r="190" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
        <circle cx="250" cy="800" r="190" fill="none" stroke="white" strokeOpacity="0.07" strokeWidth="2" />
        <circle cx="120" cy="170" r="6" fill="white" fillOpacity="0.35" />
        <circle cx="700" cy="720" r="8" fill="white" fillOpacity="0.25" />
        <circle cx="610" cy="560" r="4" fill="white" fillOpacity="0.35" />
        <path d="M-20 520 C 180 440, 320 620, 520 540 S 820 470, 860 520" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
      </svg>
    </div>
  );
}
