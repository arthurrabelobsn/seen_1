"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { createArticle, type ArticleFormState } from "../actions";

export function NewArticleForm({ defaultDate }: { defaultDate: string }) {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(createArticle, {});

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <form action={action} className="card space-y-5 p-6">
        <div>
          <label htmlFor="focus_keyword" className="label">Palavra-chave principal</label>
          <input id="focus_keyword" name="focus_keyword" className="field" placeholder="como organizar o closet" autoFocus />
          <p className="hint">O termo que a pessoa digita no Google. Um artigo por palavra-chave principal.</p>
        </div>

        <div>
          <label htmlFor="title" className="label">Título provisório</label>
          <input id="title" name="title" className="field" placeholder="Como organizar o closet em 7 passos (sem gastar com caixas)" required />
        </div>

        <div>
          <label htmlFor="secondary_keywords" className="label">Palavras-chave secundárias</label>
          <input id="secondary_keywords" name="secondary_keywords" className="field" placeholder="closet pequeno, organizar roupas, cabides" />
          <p className="hint">Separadas por vírgula. Variações e perguntas relacionadas.</p>
        </div>

        <div>
          <label htmlFor="brief" className="label">Briefing</label>
          <textarea
            id="brief"
            name="brief"
            rows={5}
            className="field"
            placeholder="Para quem é, que dúvida resolve, qual produto ou serviço mencionar no fim, o que não pode faltar."
          />
        </div>

        <div className="max-w-xs">
          <label htmlFor="scheduled_for" className="label">Agendar para</label>
          <input id="scheduled_for" name="scheduled_for" type="date" className="field" defaultValue={defaultDate} />
          <p className="hint">Opcional. Sem data, o artigo entra como ideia.</p>
        </div>

        {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Criando…" : "Criar e abrir o editor"}
          </button>
        </div>
      </form>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand" />
            <h2 className="text-sm font-semibold">Geração com IA</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            Na próxima fase, este passo vai analisar os 10 primeiros resultados do Google e montar o briefing e o texto
            sozinho. Por enquanto, você define o tema e escreve no editor.
          </p>
        </div>
        <div className="card p-5 text-sm text-muted">
          <h2 className="mb-2 font-semibold text-ink">Boa palavra-chave</h2>
          <ul className="list-disc space-y-1 pl-4">
            <li>É uma pergunta ou problema real do seu cliente</li>
            <li>Tem 3 palavras ou mais (cauda longa)</li>
            <li>Leva naturalmente a um produto ou serviço seu</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
