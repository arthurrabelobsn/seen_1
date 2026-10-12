"use client";

import { useActionState } from "react";
import { CheckCircle2, Plug } from "lucide-react";
import { PLATFORM_LABEL, type Platform, type Site } from "@/lib/types";
import { saveSite, type SiteFormState } from "./actions";

const TONES = [
  { value: "profissional", label: "Profissional" },
  { value: "proximo", label: "Próximo e acolhedor" },
  { value: "tecnico", label: "Técnico e detalhado" },
  { value: "descontraido", label: "Descontraído" },
  { value: "vendedor", label: "Persuasivo" },
];

export function SiteForm({ site }: { site: Site | null }) {
  const [state, action, pending] = useActionState<SiteFormState, FormData>(saveSite, {});

  return (
    <form action={action} className="space-y-6">
      {site && <input type="hidden" name="id" value={site.id} />}

      <Section title="Site" description="Onde os artigos vão ser publicados.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="name">
            <input id="name" name="name" className="field" defaultValue={site?.name} placeholder="Loja da Paula" required />
          </Field>
          <Field label="Endereço" htmlFor="url">
            <input id="url" name="url" className="field" defaultValue={site?.url} placeholder="lojadapaula.com.br" required />
          </Field>
          <Field label="Plataforma" htmlFor="platform">
            <select id="platform" name="platform" className="field" defaultValue={site?.platform ?? "wordpress"}>
              {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_LABEL[p]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Conexão" htmlFor="">
            <div className="flex h-[38px] items-center gap-2 text-sm text-muted">
              {site?.connection_status === "conectado" ? (
                <>
                  <CheckCircle2 className="size-4 text-brand" /> Conectado
                </>
              ) : (
                <>
                  <Plug className="size-4" /> Conector na próxima fase
                </>
              )}
            </div>
          </Field>
        </div>
      </Section>

      <Section
        title="Negócio"
        description="Isto alimenta a IA. Fatos concretos (preços, diferenciais, dúvidas reais de clientes) são o que separa um artigo útil de um genérico."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nicho" htmlFor="niche">
            <input id="niche" name="niche" className="field" defaultValue={site?.niche ?? ""} placeholder="Organização pessoal de luxo" />
          </Field>
          <Field label="Público" htmlFor="audience">
            <input id="audience" name="audience" className="field" defaultValue={site?.audience ?? ""} placeholder="Mulheres 30–50, classe A, São Paulo" />
          </Field>
        </div>
        <Field label="Fatos do negócio" htmlFor="business_facts" hint="Produtos, preços, diferenciais, perguntas que clientes fazem, histórias reais.">
          <textarea id="business_facts" name="business_facts" rows={5} className="field" defaultValue={site?.business_facts ?? ""} />
        </Field>
        <Field label="Concorrentes" htmlFor="competitors" hint="Um site por linha. Usado para comparar o que eles já ranqueiam.">
          <textarea id="competitors" name="competitors" rows={3} className="field font-mono text-xs" defaultValue={site?.competitors.join("\n") ?? ""} placeholder={"concorrente1.com.br\nconcorrente2.com.br"} />
        </Field>
      </Section>

      <Section title="Publicação" description="Ritmo e aprovação dos artigos.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tom de voz" htmlFor="tone">
            <select id="tone" name="tone" className="field" defaultValue={site?.tone ?? "profissional"}>
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Artigos por semana" htmlFor="posts_per_week" hint="Recomendado: 2 a 4. Volume alto sem qualidade é punido pelo Google.">
            <input id="posts_per_week" name="posts_per_week" type="number" min={1} max={7} className="field" defaultValue={site?.posts_per_week ?? 2} />
          </Field>
        </div>
        <label className="flex items-start gap-3 rounded-lg border border-line p-4">
          <input type="checkbox" name="autopublish" defaultChecked={site?.autopublish ?? false} className="mt-0.5 size-4 accent-brand" />
          <span>
            <span className="block text-sm font-medium">Publicar automaticamente</span>
            <span className="block text-sm text-muted">
              Desligado: todo artigo espera sua aprovação. Ligado: artigos agendados vão ao ar na data, sem revisão.
            </span>
          </span>
        </label>
      </Section>

      <div className="sticky bottom-0 -mx-1 flex items-center gap-3 bg-canvas/90 px-1 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvando…" : site ? "Salvar alterações" : "Cadastrar site"}
        </button>
        {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
        {state.saved && <p role="status" className="text-sm text-brand">Alterações salvas.</p>}
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="card grid gap-6 p-6 lg:grid-cols-[220px_1fr]">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor || undefined} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
