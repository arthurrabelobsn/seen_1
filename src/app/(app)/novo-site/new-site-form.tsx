"use client";

import { useActionState } from "react";
import { PLATFORM_LABEL, type Platform } from "@/lib/types";
import { Field, SavedNote } from "@/components/ui";
import { createSite, type FormState } from "../site/actions";

export function NewSiteForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createSite, {});
  return (
    <form action={action} className="card mt-6 space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome do site" htmlFor="name">
          <input id="name" name="name" className="field" placeholder="Loja da Paula" required autoFocus />
        </Field>
        <Field label="Domínio" htmlFor="url">
          <input id="url" name="url" className="field" placeholder="lojadapaula.com.br" required />
        </Field>
      </div>
      <Field label="Plataforma" htmlFor="platform">
        <select id="platform" name="platform" className="field" defaultValue="wordpress">
          {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABEL[p]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Sobre o negócio" htmlFor="description" hint="Opcional agora. O que você vende e para quem.">
        <textarea id="description" name="description" rows={3} className="field" />
      </Field>
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Criando…" : "Cadastrar site"}
        </button>
        <SavedNote error={state.error} />
      </div>
    </form>
  );
}
