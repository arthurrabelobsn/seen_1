"use client";

import { useTransition } from "react";
import { BarChart3, Check, Code2, Store, Webhook } from "lucide-react";
import type { Platform } from "@/lib/types";
import { SoonTag } from "@/components/ui";
import { Hint } from "@/components/hint";
import { setPlatform } from "../actions";

export type BrandMark = { title: string; path: string; hex: string };
type Marks = Record<"wordpress" | "shopify" | "github" | "vercel" | "searchConsole" | "make" | "n8n" | "zapier", BrandMark>;

/** Logo oficial (caminho SVG do simple-icons) na cor da marca. */
function Logo({ m, size = 24 }: { m: BrandMark; size?: number }) {
  return (
    <svg role="img" aria-label={m.title} viewBox="0 0 24 24" width={size} height={size} fill={m.hex}>
      <path d={m.path} />
    </svg>
  );
}

function Tile({ children }: { children: React.ReactNode }) {
  return <span className="flex h-12 min-w-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3">{children}</span>;
}

export function ConnectionsGrid({
  platform,
  status,
  marks,
  nuvemshopLogo,
}: {
  platform: Platform;
  status: string;
  marks: Marks;
  nuvemshopLogo: string | null;
}) {
  const [pending, startTransition] = useTransition();

  const publishers: { id: Platform; name: string; desc: string; help?: string; logo: React.ReactNode }[] = [
    { id: "wordpress", name: "WordPress", desc: "Publica posts com imagem, categoria e as informações para o Google (Yoast, Rank Math).", logo: <Logo m={marks.wordpress} /> },
    { id: "shopify", name: "Shopify", desc: "Cria artigos no blog da loja e linka seus produtos.", logo: <Logo m={marks.shopify} /> },
    {
      id: "nuvemshop",
      name: "Nuvemshop",
      desc: "Publica no blog da loja Nuvemshop.",
      logo: nuvemshopLogo ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG oficial enviado pelo dono do site
        <img src={nuvemshopLogo} alt="Nuvemshop" className="h-6 w-auto" />
      ) : (
        <Store className="size-6 text-[#2c3357]" aria-label="Nuvemshop" />
      ),
    },
    {
      id: "github",
      name: "GitHub + Vercel",
      desc: "Para sites feitos em código: salva o artigo no repositório e a Vercel publica.",
      logo: (
        <>
          <Logo m={marks.github} size={22} />
          <span className="text-line">+</span>
          <Logo m={marks.vercel} size={18} />
        </>
      ),
    },
    {
      id: "webhook",
      name: "Webhook",
      desc: "Envia o artigo pronto para um endereço seu. Funciona com Make, n8n e Zapier.",
      help: "Webhook é um endereço que recebe dados automaticamente. Use se o seu site não estiver na lista: um desenvolvedor ou uma automação (Make, n8n, Zapier) recebe o artigo e publica.",
      logo: (
        <>
          <Webhook className="size-6 text-[#7c3aed]" aria-label="Webhook" />
          <span className="flex items-center gap-1 border-l border-line pl-2">
            <Logo m={marks.make} size={14} />
            <Logo m={marks.n8n} size={14} />
            <Logo m={marks.zapier} size={14} />
          </span>
        </>
      ),
    },
    { id: "outro", name: "Outra plataforma", desc: "Você copia o texto pronto ou exporta em Word/PDF e publica manualmente.", logo: <Code2 className="size-6 text-muted" aria-label="Outra plataforma" /> },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="flex items-center gap-1.5 text-lg font-bold">
          Publicação
          <Hint>Conectando a plataforma, a Seen publica os artigos no seu site sozinha, na data agendada. Sem conexão, você exporta e publica manualmente.</Hint>
        </h2>
        <p className="text-sm text-muted">Onde a Seen publica os artigos. Escolha a plataforma do seu site.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishers.map((p) => {
            const selected = p.id === platform;
            return (
              <div key={p.id} className={`card flex flex-col p-5 ${selected ? "border-brand ring-1 ring-brand" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <Tile>{p.logo}</Tile>
                  {selected && (
                    <span className="pill border-brand/20 bg-brand-soft text-brand">
                      <Check className="size-3" /> Sua plataforma
                    </span>
                  )}
                </div>
                <h3 className="mt-4 flex items-center gap-1.5 font-semibold">
                  {p.name}
                  {p.help && <Hint>{p.help}</Hint>}
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted">{p.desc}</p>
                <div className="mt-4 flex items-center gap-2">
                  {selected ? (
                    p.id === "outro" ? null : (
                      <button type="button" disabled className="btn-primary flex-1" title="A conexão automática chega na próxima fase">
                        {status === "conectado" ? "Conectado" : "Conectar"}
                      </button>
                    )
                  ) : (
                    <button type="button" disabled={pending} onClick={() => startTransition(async () => void (await setPlatform(p.id)))} className="btn-ghost flex-1">
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
        <p className="text-sm text-muted">De onde vêm as visitas, a posição dos artigos e o volume de busca.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card flex items-start gap-4 p-5">
            <Tile>
              <Logo m={marks.searchConsole} />
            </Tile>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Google Search Console</h3>
                <Hint>Ferramenta gratuita do Google que mostra quantas pessoas viram e clicaram no seu site na busca, e em que posição ele aparece.</Hint>
                <SoonTag />
              </div>
              <p className="mt-1 text-sm text-muted">Cliques, aparições no Google e posição de cada artigo, direto da sua conta Google.</p>
              <button type="button" disabled className="btn-ghost mt-4">
                Conectar com Google
              </button>
            </div>
          </div>
          <div className="card flex items-start gap-4 p-5">
            <Tile>
              <BarChart3 className="size-6 text-brand" />
            </Tile>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Volume e dificuldade das palavras</h3>
                <SoonTag />
              </div>
              <p className="mt-1 text-sm text-muted">Ativado pela Seen para todos os sites. Mostra quantas pessoas buscam cada termo e o quão disputado ele é.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
