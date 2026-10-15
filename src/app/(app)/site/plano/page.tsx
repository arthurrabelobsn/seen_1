import type { Metadata } from "next";
import { Check } from "lucide-react";
import { requireSite } from "@/lib/session";
import { ProBadge } from "@/components/brand";
import { SoonTag } from "@/components/ui";

export const metadata: Metadata = { title: "Plano" };

// Planos ainda em definição: recursos e preços aqui são provisórios.
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Para começar a aparecer",
    features: ["1 site", "8 artigos por mês", "Keywords sugeridas", "Exportar Word e PDF"],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para crescer todo mês",
    features: ["1 site", "30 artigos por mês", "Imagens geradas por IA", "Publicação automática", "Search Console e resultados"],
  },
  {
    id: "agencia",
    name: "Agência",
    tagline: "Para quem cuida de vários clientes",
    features: ["Vários sites", "Artigos por site", "Relatórios com a sua marca", "Acesso para a equipe"],
  },
];

export default async function PlanPage() {
  const { site } = await requireSite();
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold">Plano do site</h2>
        <SoonTag>Preços em definição</SoonTag>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => {
          const current = p.id === (site.plan ?? "pro");
          return (
            <div key={p.id} className={`card flex flex-col p-6 ${current ? "border-brand ring-1 ring-brand" : ""}`}>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{p.name}</h3>
                {p.id === "pro" && <ProBadge />}
              </div>
              <p className="mt-1 text-sm text-muted">{p.tagline}</p>
              <p className="mt-5 text-2xl font-bold text-muted">R$ —</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <button type="button" disabled className={`mt-6 ${current ? "btn-primary" : "btn-ghost"}`}>
                {current ? "Plano atual" : "Escolher plano"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
