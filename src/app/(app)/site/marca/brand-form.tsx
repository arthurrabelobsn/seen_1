"use client";

import { useActionState, useState } from "react";
import { Camera, Box, Brush, Droplets, Shapes, Smile } from "lucide-react";
import { IMAGE_STYLES, TONES, type Site } from "@/lib/types";
import { Field, SavedNote } from "@/components/ui";
import { updateSite, type FormState } from "../actions";
import { Hint } from "@/components/hint";
import { HELP } from "@/lib/help";

const STYLE_ICON: Record<string, React.ReactNode> = {
  realista: <Camera />,
  minimalista: <Shapes />,
  cartoon: <Smile />,
  ilustracao: <Brush />,
  "3d": <Box />,
  aquarela: <Droplets />,
};

export function BrandForm({ site }: { site: Site }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateSite, {});
  const [tone, setTone] = useState(site.tone);
  const [style, setStyle] = useState(site.image_style ?? "realista");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="section" value="marca" />
      <input type="hidden" name="tone" value={tone} />
      <input type="hidden" name="image_style" value={style} />

      <Block title="Sobre o negócio" description="O que a IA precisa saber para escrever como alguém de dentro.">
        <Field label="Descrição do site" htmlFor="description" hint="O que você vende, para quem, e o que te diferencia. 3 a 5 frases.">
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={site.description ?? ""}
            className="field"
            placeholder="Somos uma loja de maquiagem vegana em Curitiba. Atendemos mulheres de 25 a 45 anos que buscam produtos sem crueldade animal..."
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nicho" htmlFor="niche">
            <input id="niche" name="niche" defaultValue={site.niche ?? ""} className="field" placeholder="Maquiagem vegana" />
          </Field>
          <Field label="Público" htmlFor="audience">
            <input id="audience" name="audience" defaultValue={site.audience ?? ""} className="field" placeholder="Mulheres 25–45, classe B, Sul do Brasil" />
          </Field>
        </div>
        <Field label="Fatos que só você sabe" help={HELP.fatos} htmlFor="business_facts" hint="Perguntas que clientes fazem, histórias reais, números, garantias, prazos de entrega.">
          <textarea id="business_facts" name="business_facts" rows={4} defaultValue={site.business_facts ?? ""} className="field" />
        </Field>
      </Block>

      <Block title="Tom de voz" help={HELP.tom} description="Como os artigos soam. Clique para escolher.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              aria-pressed={tone === t.value}
              className={`rounded-xl border p-4 text-left transition ${
                tone === t.value ? "border-brand bg-brand-soft ring-1 ring-brand" : "border-line hover:border-brand/40"
              }`}
            >
              <span className="block text-sm font-semibold">{t.label}</span>
              <span className="mt-1 block text-sm italic text-muted">“{t.example}”</span>
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Palavras e expressões da marca" help={HELP.palavrasMarca} htmlFor="brand_words" hint="Separadas por vírgula. A IA usa sempre que fizer sentido.">
            <input id="brand_words" name="brand_words" defaultValue={site.brand_words?.join(", ") ?? ""} className="field" placeholder="cruelty-free, pele real" />
          </Field>
          <Field label="Palavras proibidas" help={HELP.palavrasProibidas} htmlFor="banned_words" hint="A IA nunca usa estes termos.">
            <input id="banned_words" name="banned_words" defaultValue={site.banned_words?.join(", ") ?? ""} className="field" placeholder="barato, milagroso" />
          </Field>
        </div>
        <Field label="Chamada no fim dos artigos" help={HELP.cta} htmlFor="cta_text">
          <input id="cta_text" name="cta_text" defaultValue={site.cta_text ?? ""} className="field" placeholder="Conheça a linha completa na nossa loja e ganhe 10% na primeira compra." />
        </Field>
      </Block>

      <Block title="Estilo das imagens" help={HELP.estiloImagem} description="Modelo padrão quando a IA gerar imagens para os artigos.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {IMAGE_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle(s.value)}
              aria-pressed={style === s.value}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
                style === s.value ? "border-brand bg-brand-soft ring-1 ring-brand" : "border-line hover:border-brand/40"
              }`}
            >
              <span className={`flex size-11 items-center justify-center rounded-full [&>svg]:size-5 ${style === s.value ? "bg-brand text-white" : "bg-canvas text-muted"}`}>
                {STYLE_ICON[s.value]}
              </span>
              <span className="text-sm font-semibold">{s.label}</span>
              <span className="text-xs leading-snug text-muted">{s.hint}</span>
            </button>
          ))}
        </div>
      </Block>

      <div className="sticky bottom-0 z-10 -mx-1 flex items-center gap-3 border-t border-line bg-canvas/90 px-1 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvando…" : "Salvar marca e IA"}
        </button>
        <SavedNote {...state} />
      </div>
    </form>
  );
}

function Block({ title, description, help, children }: { title: string; description: string; help?: string; children: React.ReactNode }) {
  return (
    <section className="card space-y-4 p-6">
      <div>
        <h2 className="flex items-center gap-1.5 text-lg font-bold">
          {title}
          {help && <Hint>{help}</Hint>}
        </h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
