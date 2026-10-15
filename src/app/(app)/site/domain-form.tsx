"use client";

import { useActionState } from "react";
import { Field, SavedNote } from "@/components/ui";
import { updateSite, type FormState } from "./actions";

export function DomainForm({ name, url }: { name: string; url: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateSite, {});
  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="section" value="dominio" />
      <Field label="Nome do site" htmlFor="name">
        <input id="name" name="name" defaultValue={name} className="field" required />
      </Field>
      <Field label="Domínio" htmlFor="url" hint="Ex.: meusite.com.br ou meusite.com.br/blog">
        <input id="url" name="url" defaultValue={url} className="field" required />
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
