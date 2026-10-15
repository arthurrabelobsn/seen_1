"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { KeyRound, PenLine, Sparkles } from "lucide-react";
import type { Keyword } from "@/lib/types";
import { nf } from "@/lib/format";
import { DifficultyMeter, Field, OpportunityBadge, SavedNote, SoonTag } from "@/components/ui";
import { createArticle, type ArticleFormState } from "../actions";

type Kw = Pick<Keyword, "id" | "term" | "volume" | "difficulty" | "opportunity" | "status">;

function titleFor(term: string) {
  if (!term) return "";
  const t = term.charAt(0).toUpperCase() + term.slice(1);
  return /^(como|o que|qual|quais|quanto|por que|onde|quando)\b/i.test(term) ? `${t}: guia completo` : `${t}: tudo o que você precisa saber`;
}

export function NewArticleForm({ defaultDate, defaultKeywordId, keywords }: { defaultDate: string; defaultKeywordId: string; keywords: Kw[] }) {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(createArticle, {});
  const initial = keywords.find((k) => k.id === defaultKeywordId);
  const [keywordId, setKeywordId] = useState(initial?.id ?? "");
  const [term, setTerm] = useState(initial?.term ?? "");
  const [title, setTitle] = useState(titleFor(initial?.term ?? ""));
  const [titleEdited, setTitleEdited] = useState(false);
  const selected = keywords.find((k) => k.id === keywordId);

  const pick = (k: Kw | null, typed?: string) => {
    setKeywordId(k?.id ?? "");
    const t = k?.term ?? typed ?? "";
    setTerm(t);
    if (!titleEdited) setTitle(titleFor(t));
  };

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="keyword_id" value={keywordId} />
      <div className="card space-y-5 p-6">
        <Field label="Palavra-chave principal" htmlFor="focus_keyword" hint="O termo que a pessoa digita no Google. Escolha uma salva ou digite outra.">
          <input
            id="focus_keyword"
            name="focus_keyword"
            list="kw-list"
            value={term}
            onChange={(e) => {
              const match = keywords.find((k) => k.term.toLowerCase() === e.target.value.toLowerCase());
              pick(match ?? null, e.target.value);
            }}
            className="field"
            placeholder="como organizar o closet"
            autoFocus
          />
          <datalist id="kw-list">
            {keywords.map((k) => (
              <option key={k.id} value={k.term} />
            ))}
          </datalist>
        </Field>

        {selected && (
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-canvas p-3 text-center text-sm">
            <div>
              <p className="text-[11px] text-muted">Volume</p>
              <p className="mt-1 font-bold tabular-nums">{selected.volume != null ? `${nf.format(selected.volume)}/mês` : "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Dificuldade</p>
              <div className="mt-1 flex justify-center">
                <DifficultyMeter value={selected.difficulty} />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-muted">Oportunidade</p>
              <div className="mt-1 flex justify-center">
                <OpportunityBadge value={selected.opportunity} />
              </div>
            </div>
          </div>
        )}

        <Field label="Título" htmlFor="title">
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleEdited(true);
            }}
            className="field text-base font-semibold"
            placeholder="Como organizar o closet em 7 passos (sem gastar com caixas)"
            required
          />
        </Field>

        <Field label="Palavras-chave secundárias" htmlFor="secondary_keywords" hint="Separadas por vírgula. Variações e perguntas relacionadas.">
          <input id="secondary_keywords" name="secondary_keywords" className="field" placeholder="closet pequeno, organizar roupas, cabides" />
        </Field>

        <Field label="Briefing" htmlFor="brief">
          <textarea
            id="brief"
            name="brief"
            rows={5}
            className="field"
            placeholder="Para quem é, que dúvida resolve, qual produto ou serviço mencionar no fim, o que não pode faltar."
          />
        </Field>

        <div className="max-w-xs">
          <Field label="Agendar para" htmlFor="scheduled_for" hint="Opcional. Sem data, o artigo entra como ideia.">
            <input id="scheduled_for" name="scheduled_for" type="date" className="field" defaultValue={defaultDate} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button type="submit" disabled={pending} className="btn-primary">
            <PenLine className="size-4" /> {pending ? "Criando…" : "Criar e abrir o editor"}
          </button>
          <button type="button" disabled className="btn-ghost" title="Disponível quando a IA for conectada">
            <Sparkles className="size-4" /> Criar e gerar com IA
          </button>
          <SoonTag />
          <SavedNote error={state.error} />
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-brand" />
            <h2 className="text-sm font-semibold">Ainda sem keywords?</h2>
          </div>
          <p className="mt-2 text-sm text-muted">Na aba Keywords você adiciona termos, vê volume e dificuldade e gera ideias a partir de um tema.</p>
          <Link href="/keywords" className="btn-ghost mt-3 w-full">
            Abrir Keywords
          </Link>
        </div>
        <div className="card p-5 text-sm text-muted">
          <h2 className="mb-2 font-semibold text-ink">Boa palavra-chave</h2>
          <ul className="list-disc space-y-1 pl-4">
            <li>É uma pergunta ou problema real do seu cliente</li>
            <li>Tem 3 palavras ou mais (cauda longa)</li>
            <li>Leva naturalmente a um produto ou serviço seu</li>
            <li>Oportunidade média ou alta</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}
