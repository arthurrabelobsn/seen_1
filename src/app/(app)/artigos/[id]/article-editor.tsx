"use client";

import { useActionState, useMemo, useState } from "react";
import { marked } from "marked";
import { CheckCircle2, Circle, Eye, PenLine, Sparkles, Trash2 } from "lucide-react";
import { seoChecklist, slugify } from "@/lib/seo";
import { STATUS_LABEL, STATUS_ORDER, type Article } from "@/lib/types";
import { deleteArticle, saveArticle, type ArticleFormState } from "../actions";

export function ArticleEditor({ article, siteUrl }: { article: Article; siteUrl: string }) {
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(saveArticle, {});
  const [tab, setTab] = useState<"editar" | "visualizar">("editar");

  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug ?? "");
  const [focusKeyword, setFocusKeyword] = useState(article.focus_keyword ?? "");
  const [metaTitle, setMetaTitle] = useState(article.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(article.meta_description ?? "");
  const [content, setContent] = useState(article.content);
  const [status, setStatus] = useState(article.status);

  const checks = useMemo(
    () => seoChecklist({ title, slug, focusKeyword, metaTitle, metaDescription, content, siteUrl }),
    [title, slug, focusKeyword, metaTitle, metaDescription, content, siteUrl],
  );
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  const html = useMemo(() => (tab === "visualizar" ? (marked.parse(content || "*Sem conteúdo ainda.*") as string) : ""), [tab, content]);
  const previewTitle = metaTitle || title;
  const host = siteUrl.replace(/^https?:\/\//, "");

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="id" value={article.id} />

      {/* Coluna principal */}
      <div className="min-w-0 space-y-4">
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted"
          placeholder="Título do artigo"
          aria-label="Título do artigo"
        />

        <div className="card">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <div className="flex gap-1 text-sm">
              <TabButton active={tab === "editar"} onClick={() => setTab("editar")} icon={<PenLine className="size-4" />} label="Editar" />
              <TabButton active={tab === "visualizar"} onClick={() => setTab("visualizar")} icon={<Eye className="size-4" />} label="Visualizar" />
            </div>
            <button type="button" disabled className="btn-ghost py-1 text-xs" title="Disponível na próxima fase">
              <Sparkles className="size-3.5" /> Gerar com IA · em breve
            </button>
          </div>

          {/* O textarea fica sempre no form para o conteúdo ser enviado mesmo na aba Visualizar */}
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`min-h-[60vh] w-full resize-y bg-transparent p-5 font-mono text-sm leading-relaxed outline-none ${tab === "editar" ? "" : "hidden"}`}
            placeholder={"Escreva em Markdown.\n\n## Subtítulo\n\nParágrafo com **negrito** e [link interno](/produto)."}
          />
          {tab === "visualizar" && (
            <article className="article-preview min-h-[60vh] p-6" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>

        <details className="card p-5" open={!!article.brief}>
          <summary className="cursor-pointer text-sm font-semibold">Briefing e palavras secundárias</summary>
          <div className="mt-4 space-y-4">
            <textarea name="brief" defaultValue={article.brief ?? ""} rows={4} className="field" placeholder="Orientação para a redação" />
            <input
              name="secondary_keywords"
              defaultValue={article.secondary_keywords.join(", ")}
              className="field"
              placeholder="Palavras secundárias, separadas por vírgula"
            />
          </div>
        </details>
      </div>

      {/* Coluna lateral */}
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="card space-y-4 p-5">
          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as Article["status"])} className="field">
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="scheduled_for" className="label">Data de publicação</label>
            <input id="scheduled_for" name="scheduled_for" type="date" defaultValue={article.scheduled_for ?? ""} className="field" />
          </div>
          {status === "publicado" && (
            <div>
              <label htmlFor="published_url" className="label">URL publicada</label>
              <input id="published_url" name="published_url" defaultValue={article.published_url ?? ""} className="field" placeholder={`${siteUrl}/blog/${slug}`} />
            </div>
          )}

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Salvando…" : "Salvar"}
          </button>
          {state.error && <p role="alert" className="text-sm text-bad">{state.error}</p>}
          {state.savedAt && !pending && (
            <p role="status" className="text-center text-xs text-muted">
              Salvo às {new Date(state.savedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="text-sm font-semibold">SEO</h2>
          <div>
            <label htmlFor="focus_keyword" className="label">Palavra-chave principal</label>
            <input id="focus_keyword" name="focus_keyword" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} className="field" />
          </div>
          <div>
            <label htmlFor="slug" className="label">URL (slug)</label>
            <div className="flex gap-2">
              <input id="slug" name="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className="field font-mono text-xs" />
              <button type="button" onClick={() => setSlug(slugify(focusKeyword || title))} className="btn-ghost px-2.5 text-xs" title="Gerar a partir da palavra-chave">
                Gerar
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="meta_title" className="label">Título SEO <Counter n={(metaTitle || title).length} max={60} /></label>
            <input id="meta_title" name="meta_title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="field" placeholder={title} />
          </div>
          <div>
            <label htmlFor="meta_description" className="label">Meta description <Counter n={metaDescription.length} max={160} /></label>
            <textarea id="meta_description" name="meta_description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="field" />
          </div>

          {/* Prévia do resultado no Google */}
          <div className="rounded-lg border border-line p-3">
            <p className="truncate text-xs text-muted">{host} › {slug || "url-do-artigo"}</p>
            <p className="mt-0.5 line-clamp-1 text-[15px] text-[#1a0dab]">{previewTitle || "Título do artigo"}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{metaDescription || "A meta description aparece aqui, resumindo o que o leitor vai encontrar."}</p>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Checklist on-page</h2>
            <span className={`text-sm font-semibold tabular-nums ${score >= 80 ? "text-brand" : score >= 50 ? "text-warn" : "text-bad"}`}>{score}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
            <div className={`h-full rounded-full ${score >= 80 ? "bg-brand" : score >= 50 ? "bg-warn" : "bg-bad"}`} style={{ width: `${score}%` }} />
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                {c.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" /> : <Circle className="mt-0.5 size-4 shrink-0 text-line" />}
                <span className={c.ok ? "" : "text-muted"}>
                  {c.label}
                  {c.detail && <span className="text-xs text-muted"> · {c.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <DeleteButton id={article.id} />
      </aside>
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <button
      type="submit"
      formAction={deleteArticle}
      formNoValidate
      name="id"
      value={id}
      onClick={(e) => {
        if (!confirm("Excluir este artigo? Isso não pode ser desfeito.")) e.preventDefault();
      }}
      className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted hover:text-bad"
    >
      <Trash2 className="size-4" /> Excluir artigo
    </button>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 ${active ? "bg-canvas font-medium text-ink" : "text-muted hover:text-ink"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`ml-1 text-xs font-normal tabular-nums ${n > max ? "text-bad" : "text-muted"}`}>{n}/{max}</span>;
}
