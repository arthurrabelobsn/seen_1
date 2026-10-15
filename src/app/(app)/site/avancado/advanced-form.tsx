"use client";

import { useActionState } from "react";
import type { Site } from "@/lib/types";
import { Field, SavedNote } from "@/components/ui";
import { updateSite, type FormState } from "../actions";

export function AdvancedForm({ site }: { site: Site }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateSite, {});
  return (
    <form action={action} className="card space-y-5 p-6">
      <input type="hidden" name="section" value="avancado" />
      <div>
        <h2 className="text-lg font-bold">Ritmo e publicação</h2>
        <p className="text-sm text-muted">Quantos artigos por semana e se eles vão ao ar sem revisão.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Artigos por semana" htmlFor="posts_per_week" hint="Recomendado: 2 a 4. Volume alto sem qualidade é punido pelo Google.">
          <input id="posts_per_week" name="posts_per_week" type="number" min={1} max={7} defaultValue={site.posts_per_week} className="field" />
        </Field>
        <Field label="Idioma dos artigos" htmlFor="language">
          <select id="language" name="language" defaultValue={site.language} className="field">
            <option value="pt-BR">Português (Brasil)</option>
            <option value="pt-PT">Português (Portugal)</option>
            <option value="es">Espanhol</option>
            <option value="en">Inglês</option>
          </select>
        </Field>
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-line p-4">
        <input type="checkbox" name="autopublish" defaultChecked={site.autopublish} className="mt-0.5 size-4 accent-brand" />
        <span>
          <span className="block text-sm font-medium">Publicar automaticamente</span>
          <span className="block text-sm text-muted">
            Desligado: todo artigo espera sua aprovação. Ligado: artigos agendados vão ao ar na data, sem revisão.
          </span>
        </span>
      </label>
      <Field label="Concorrentes" htmlFor="competitors" hint="Um domínio por linha. Usado para comparar o que eles já ranqueiam.">
        <textarea id="competitors" name="competitors" rows={3} defaultValue={site.competitors.join("\n")} className="field font-mono text-xs" placeholder={"concorrente1.com.br\nconcorrente2.com.br"} />
      </Field>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <SavedNote {...state} />
      </div>
    </form>
  );
}
