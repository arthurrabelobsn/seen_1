import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, FileText, KeyRound, Package, PartyPopper } from "lucide-react";
import { requireSite } from "@/lib/session";
import { nf } from "@/lib/format";
import { DomainForm } from "./domain-form";

export const metadata: Metadata = { title: "Site" };

export default async function SiteOverview({ searchParams }: PageProps<"/site">) {
  const params = await searchParams;
  const { supabase, site } = await requireSite();

  const count = (table: string) =>
    supabase.from(table).select("id", { count: "exact", head: true }).eq("site_id", site.id);
  const [articles, published, keywords, products] = await Promise.all([
    count("articles"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("site_id", site.id).eq("status", "publicado"),
    count("keywords"),
    count("products"),
  ]);

  const steps = [
    { done: Boolean(site.description), label: "Descreva o seu negócio", hint: "A IA usa isso para não escrever genérico.", href: "/site/marca" },
    { done: site.tone !== "profissional" || Boolean(site.audience), label: "Defina público e tom de voz", hint: "Como a marca fala e com quem.", href: "/site/marca" },
    { done: (products.count ?? 0) > 0, label: "Cadastre produtos ou serviços", hint: "Eles são citados nos artigos, com link.", href: "/site/produtos" },
    { done: (keywords.count ?? 0) > 0, label: "Escolha as primeiras keywords", hint: "Os termos que seu cliente busca.", href: "/keywords" },
    { done: site.connection_status === "conectado", label: "Conecte a plataforma do site", hint: "Para publicar sem copiar e colar.", href: "/site/conexoes" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="space-y-6">
      {params.bemvindo && (
        <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm text-brand-strong">
          <PartyPopper className="size-5" />
          Site cadastrado. Complete os passos abaixo para a IA conhecer o seu negócio.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<FileText />} label="Artigos" value={articles.count ?? 0} href="/artigos" />
        <Stat icon={<CheckCircle2 />} label="Publicados" value={published.count ?? 0} href="/artigos?pasta=publicados" />
        <Stat icon={<KeyRound />} label="Keywords" value={keywords.count ?? 0} href="/keywords" />
        <Stat icon={<Package />} label="Produtos e serviços" value={products.count ?? 0} href="/site/produtos" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">Configuração do site</h2>
            <span className="text-sm tabular-nums text-muted">
              {doneCount} de {steps.length}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
          </div>
          <ul className="mt-5 divide-y divide-line">
            {steps.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className="group flex items-center gap-3 py-3">
                  {s.done ? <CheckCircle2 className="size-5 shrink-0 text-good" /> : <Circle className="size-5 shrink-0 text-line" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-medium ${s.done ? "text-muted line-through" : ""}`}>{s.label}</span>
                    {!s.done && <span className="block text-xs text-muted">{s.hint}</span>}
                  </span>
                  <ArrowRight className="size-4 text-muted opacity-0 transition group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold">Domínio</h2>
          <p className="mt-1 text-sm text-muted">Onde os artigos vão ser publicados e medidos.</p>
          <DomainForm name={site.name} url={site.url} />
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href: string }) {
  return (
    <Link href={href} className="card group flex items-center gap-4 p-5 transition hover:border-brand/40">
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand [&>svg]:size-5">{icon}</span>
      <span>
        <span className="block text-2xl font-bold tabular-nums leading-none">{nf.format(value)}</span>
        <span className="mt-1 block text-sm text-muted">{label}</span>
      </span>
    </Link>
  );
}
