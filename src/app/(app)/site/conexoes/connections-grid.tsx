"use client";

import { useTransition } from "react";
import { BarChart3, Check, Code2, GitBranch, Globe, ShoppingBag, Store, Webhook } from "lucide-react";
import type { Platform } from "@/lib/types";
import { SoonTag } from "@/components/ui";
import { setPlatform } from "../actions";

const PUBLISHERS: { id: Platform; name: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { id: "wordpress", name: "WordPress", desc: "Publica posts com imagem, categoria e SEO (Yoast, Rank Math).", icon: <Globe />, color: "bg-[#21759b]" },
  { id: "shopify", name: "Shopify", desc: "Cria artigos no blog da loja e linka seus produtos.", icon: <ShoppingBag />, color: "bg-[#5e8e3e]" },
  { id: "nuvemshop", name: "Nuvemshop", desc: "Publica no blog da loja Nuvemshop.", icon: <Store />, color: "bg-[#2c3357]" },
  { id: "github", name: "GitHub + Vercel", desc: "Faz commit do artigo no repositório; a Vercel publica.", icon: <GitBranch />, color: "bg-[#0b0d12]" },
  { id: "webhook", name: "Webhook", desc: "Envia o artigo pronto para qualquer URL (Make, n8n, Zapier).", icon: <Webhook />, color: "bg-[#7c3aed]" },
  { id: "outro", name: "Outra plataforma", desc: "Você copia o HTML ou exporta em Word/PDF.", icon: <Code2 />, color: "bg-muted" },
];

export function ConnectionsGrid({ platform, status }: { platform: Platform; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold">Publicação</h2>
        <p className="text-sm text-muted">Onde a Seen publica os artigos. Escolha a plataforma do seu site.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PUBLISHERS.map((p) => {
            const selected = p.id === platform;
            return (
              <div key={p.id} className={`card flex flex-col p-5 ${selected ? "border-brand ring-1 ring-brand" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex size-11 items-center justify-center rounded-xl text-white [&>svg]:size-5 ${p.color}`}>{p.icon}</span>
                  {selected && (
                    <span className="pill border-brand/20 bg-brand-soft text-brand">
                      <Check className="size-3" /> Sua plataforma
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-semibold">{p.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{p.desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  {selected ? (
                    p.id === "outro" ? null : (
                      <button type="button" disabled className="btn-primary flex-1" title="A conexão automática chega na próxima fase">
                        {status === "conectado" ? "Conectado" : "Conectar"}
                      </button>
                    )
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => startTransition(async () => void (await setPlatform(p.id)))}
                      className="btn-ghost flex-1"
                    >
                      Usar esta plataforma
                    </button>
                  )}
                  {selected && p.id !== "outro" && <SoonTag />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">Dados do Google</h2>
        <p className="text-sm text-muted">De onde vêm cliques, posições, volume de busca e dificuldade.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card flex items-start gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#4285f4] text-white">
              <BarChart3 className="size-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Google Search Console</h3>
                <SoonTag />
              </div>
              <p className="mt-1 text-sm text-muted">Cliques, impressões e posição de cada artigo, direto da sua conta Google.</p>
              <button type="button" disabled className="btn-ghost mt-4">
                Conectar com Google
              </button>
            </div>
          </div>
          <div className="card flex items-start gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <Globe className="size-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Volume e dificuldade das keywords</h3>
                <SoonTag />
              </div>
              <p className="mt-1 text-sm text-muted">
                Ativado pela Seen para todos os sites. Alimenta oportunidade, dificuldade e volume em Keywords e Artigos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
