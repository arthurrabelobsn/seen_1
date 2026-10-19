import type { Metadata } from "next";
import { Suspense } from "react";
import { siGoogle } from "simple-icons";
import { supabaseConfigured } from "@/lib/supabase/env";
import { SeenIcon } from "@/components/brand";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef2fb] px-4 py-8 sm:px-8">
      {/* Brilho suave de fundo */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[520px] rounded-full bg-[#c9d8ff] opacity-70 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-32 size-[560px] rounded-full bg-[#d6e4ff] opacity-80 blur-3xl" />

      <div className="relative grid w-full max-w-[1080px] overflow-hidden rounded-[28px] bg-surface p-3 shadow-[0_30px_80px_-20px_rgba(0,61,180,0.28)] lg:grid-cols-[1fr_1.05fr]">
        {/* Painel com gradiente */}
        <aside className="relative hidden min-h-[620px] overflow-hidden rounded-[22px] p-9 text-white lg:flex lg:flex-col lg:justify-between">
          <Gradient />
          <SeenIcon variant="white" className="relative h-9 w-auto self-start" />
          <div className="relative">
            <p className="text-sm font-medium text-white/80">Com a Seen, você</p>
            <h1 className="mt-2 text-[34px] font-black leading-[1.08] tracking-tight">
              aparece no Google para quem procura o que você vende.
            </h1>
          </div>
        </aside>

        {/* Formulário */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-[380px]">
            <SeenIcon variant="blue" className="h-7 w-auto" />

            {!supabaseConfigured && (
              <p className="mt-6 rounded-lg border border-warn/30 bg-warn-soft px-3 py-2.5 text-sm text-warn">
                Falta configurar o Supabase: preencha <code className="font-mono">.env.local</code> com a URL e a chave do projeto.
              </p>
            )}

            <Suspense>
              <LoginForm googlePath={siGoogle.path} />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}

/** Gradiente em "malha": manchas de azul da marca, ciano e lavanda que se misturam. */
function Gradient() {
  return (
    <div aria-hidden className="absolute inset-0 bg-[#0a3ad6]">
      <div className="absolute -left-20 top-1/4 h-[70%] w-[75%] rounded-full bg-[#001a73] blur-[70px]" />
      <div className="absolute -right-10 -top-16 h-[55%] w-[70%] rounded-full bg-[#7cc6ff] opacity-90 blur-[80px]" />
      <div className="absolute -bottom-24 right-0 h-[60%] w-[80%] rounded-full bg-[#9db8ff] opacity-90 blur-[90px]" />
      <div className="absolute left-1/4 top-0 h-[40%] w-[40%] rounded-full bg-[#005dff] blur-[60px]" />
      <div className="absolute bottom-10 left-6 h-[30%] w-[45%] rounded-full bg-[#4f7dff] opacity-80 blur-[70px]" />
      {/* granulado leve para não parecer chapado */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.12] mix-blend-overlay">
        <filter id="seen-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#seen-grain)" />
      </svg>
    </div>
  );
}
