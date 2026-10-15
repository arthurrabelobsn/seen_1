"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Circle,
  Code2,
  Download,
  FileText,
  Printer,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { RichEditor, type AiRequest } from "@/components/editor/rich-editor";
import { Modal } from "@/components/editor/dialogs";
import { MenuItem, Popover } from "@/components/popover";
import { ScoreGauge } from "@/components/score-gauge";
import { DifficultyMeter, OpportunityBadge } from "@/components/ui";
import { toHtml } from "@/lib/content";
import { AI_ACTIONS } from "@/lib/ai";
import { seoChecklist, seoScore, slugify } from "@/lib/seo";
import { nf, tomorrowIso } from "@/lib/format";
import { STATUS_LABEL, STATUS_ORDER, type Article } from "@/lib/types";
import { deleteArticle, saveArticle, toggleStar, type ArticleFormState } from "../actions";
import { runAiAction } from "../ai-actions";

export function ArticleEditor({ article, siteUrl, userId }: { article: Article; siteUrl: string; userId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ArticleFormState, FormData>(saveArticle, {});
  const [, startTransition] = useTransition();

  const initialHtml = useMemo(() => toHtml(article.content), [article.content]);
  const [content, setContent] = useState(initialHtml);
  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug ?? "");
  const [focusKeyword, setFocusKeyword] = useState(article.focus_keyword ?? "");
  const [metaTitle, setMetaTitle] = useState(article.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(article.meta_description ?? "");
  const [status, setStatus] = useState(article.status);
  const [date, setDate] = useState(article.scheduled_for ?? "");
  const [starred, setStarred] = useState(article.starred);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState<AiRequest | null>(null);

  const touch = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setDirty(true);
  };

  // Salvo com sucesso: limpa o "não salvo" (ajuste de estado durante a renderização, sem efeito)
  const [seenSave, setSeenSave] = useState(state.savedAt);
  if (state.savedAt !== seenSave) {
    setSeenSave(state.savedAt);
    setDirty(false);
  }

  // Ctrl+S salva; aviso ao sair com alterações pendentes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const checks = useMemo(
    () => seoChecklist({ title, slug, focusKeyword, metaTitle, metaDescription, content, siteUrl }),
    [title, slug, focusKeyword, metaTitle, metaDescription, content, siteUrl],
  );
  const score = seoScore(checks);
  const pendingChecks = checks.filter((c) => !c.ok).sort((a, b) => b.weight - a.weight);
  const host = siteUrl.replace(/^https?:\/\//, "");

  async function callAi(req: AiRequest) {
    const def = AI_ACTIONS.find((a) => a.id === req.action);
    if (def?.prompt && !req.prompt) {
      setAiPrompt(req);
      return;
    }
    const res = await runAiAction({ action: req.action, articleId: article.id, selection: req.selection, prompt: req.prompt });
    setToast(res.ok ? "Pronto." : res.error);
  }

  function schedule(d: string) {
    setDate(d);
    setStatus(d ? "agendado" : status === "agendado" ? "aprovado" : status);
    setDirty(true);
    // envia depois que os campos escondidos atualizarem
    setTimeout(() => formRef.current?.requestSubmit(), 0);
  }

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="id" value={article.id} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="scheduled_for" value={date} />

      {/* Barra superior */}
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <textarea
          name="title"
          value={title}
          onChange={(e) => touch(setTitle)(e.target.value.replace(/\n/g, ""))}
          rows={1}
          className="field-sizing-content min-w-0 flex-1 resize-none bg-transparent text-[28px] font-bold leading-tight tracking-tight outline-none placeholder:text-muted"
          placeholder="Título do artigo"
          aria-label="Título do artigo"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStarred(!starred);
              startTransition(async () => void (await toggleStar(article.id, !starred)));
            }}
            className={`btn-ghost px-2.5 ${starred ? "text-amber-500" : "text-muted"}`}
            aria-label={starred ? "Remover dos favoritos" : "Favoritar"}
            title={starred ? "Favorito" : "Favoritar"}
          >
            <Star className={`size-4 ${starred ? "fill-current" : ""}`} />
          </button>

          <select
            value={status}
            onChange={(e) => touch(setStatus)(e.target.value as Article["status"])}
            className="field w-auto py-2 pr-8"
            aria-label="Status"
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>

          <SchedulePopover date={date} disabled={status === "publicado"} onSchedule={schedule} />

          <Popover
            align="right"
            trigger={({ toggle }) => (
              <button type="button" onClick={toggle} className="btn-ghost">
                <Download className="size-4" /> Exportar <ChevronDown className="size-3.5" />
              </button>
            )}
          >
            {(close) => (
              <>
                <p className="px-2.5 pb-1 pt-1 text-xs text-muted">{dirty ? "Salve antes para exportar a versão atual." : "Versão salva do artigo"}</p>
                <MenuItem icon={<FileText />} onClick={() => (close(), window.open(`/artigos/${article.id}/exportar?formato=docx`, "_blank"))}>
                  Word (.docx)
                </MenuItem>
                <MenuItem icon={<Printer />} onClick={() => (close(), window.open(`/imprimir/${article.id}`, "_blank"))}>
                  PDF (imprimir)
                </MenuItem>
                <MenuItem
                  icon={<Code2 />}
                  onClick={() => {
                    close();
                    navigator.clipboard.writeText(content).then(() => setToast("HTML copiado."));
                  }}
                >
                  Copiar HTML
                </MenuItem>
              </>
            )}
          </Popover>

          <button type="submit" disabled={pending} className="btn-primary min-w-24">
            {pending ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
      <div className="mb-4 flex h-5 items-center gap-2 text-xs text-muted">
        {state.error ? (
          <span className="text-bad">{state.error}</span>
        ) : dirty ? (
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-warn" /> Alterações não salvas · Ctrl+S
          </span>
        ) : state.savedAt ? (
          <span>Salvo às {new Date(state.savedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        ) : (
          <span>Tudo salvo</span>
        )}
        {date && status === "agendado" && (
          <span className="flex items-center gap-1 text-brand">
            · <CalendarClock className="size-3.5" /> agendado para {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Editor */}
        <div className="min-w-0">
          <div className="card">
            <RichEditor
              initialHtml={initialHtml}
              userId={userId}
              onChange={(html) => {
                setContent(html);
                setDirty(true);
              }}
              onAi={callAi}
            />
          </div>

          <details className="card mt-4 p-5" open={!!article.brief}>
            <summary className="cursor-pointer text-sm font-semibold">Briefing e palavras secundárias</summary>
            <div className="mt-4 space-y-4">
              <textarea name="brief" defaultValue={article.brief ?? ""} onChange={() => setDirty(true)} rows={4} className="field" placeholder="Orientação para a redação" />
              <input
                name="secondary_keywords"
                defaultValue={article.secondary_keywords.join(", ")}
                onChange={() => setDirty(true)}
                className="field"
                placeholder="Palavras secundárias, separadas por vírgula"
              />
            </div>
          </details>
        </div>

        {/* Lateral */}
        <aside className="space-y-4 xl:sticky xl:top-6 xl:max-h-[calc(100vh-48px)] xl:self-start xl:overflow-y-auto xl:pb-6">
          <section className="card p-5">
            <ScoreGauge score={score} />
            <p className="mt-2 text-center text-xs text-muted">Score de SEO on-page: palavra-chave, conteúdo, metadados, links e imagens.</p>

            <h3 className="mt-5 text-sm font-semibold">Sugestões de otimização</h3>
            {pendingChecks.length === 0 ? (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-good/20 bg-good-soft p-3 text-sm text-good">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <span>
                  <strong className="block">Artigo otimizado</strong>
                  Nenhuma sugestão pendente.
                </span>
              </div>
            ) : (
              <ul className="mt-2 space-y-2">
                {pendingChecks.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-start gap-2 rounded-lg border border-line p-2.5 text-sm">
                    <Circle className="mt-0.5 size-4 shrink-0 text-warn" />
                    <span>
                      <span className="block font-medium">{c.label}</span>
                      <span className="block text-xs text-muted">
                        {c.tip}
                        {c.detail && ` (${c.detail})`}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-muted hover:text-ink">
                Ver todos os {checks.length} critérios
              </summary>
              <ul className="mt-2 space-y-1.5 text-xs">
                {checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-1.5">
                    {c.ok ? <CheckCircle2 className="size-3.5 shrink-0 text-good" /> : <Circle className="size-3.5 shrink-0 text-line" />}
                    <span className={c.ok ? "" : "text-muted"}>
                      {c.label}
                      {c.detail && <span className="text-muted"> · {c.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </section>

          <section className="card p-5">
            <h3 className="text-sm font-semibold">Dados da palavra-chave</h3>
            <p className="mt-0.5 truncate text-sm text-muted">{focusKeyword || "Sem palavra-chave"}</p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Metric label="Volume">{article.volume != null ? <span className="font-bold tabular-nums">{nf.format(article.volume)}</span> : "—"}</Metric>
              <Metric label="Dificuldade">
                <DifficultyMeter value={article.difficulty} />
              </Metric>
              <Metric label="Oportunidade">
                <OpportunityBadge value={article.opportunity} />
              </Metric>
            </dl>
            <p className="mt-3 flex justify-between border-t border-line pt-3 text-xs text-muted">
              <span>Palavras</span>
              <span className="tabular-nums">{checks.find((c) => c.id === "words")?.detail}</span>
            </p>
            {article.volume == null && <p className="mt-2 text-xs text-muted">Volume e dificuldade aparecem quando os dados do Google forem conectados.</p>}
          </section>

          <section className="card space-y-4 p-5">
            <h3 className="text-sm font-semibold">SEO</h3>
            <div>
              <label htmlFor="focus_keyword" className="label">
                Palavra-chave principal
              </label>
              <input id="focus_keyword" name="focus_keyword" value={focusKeyword} onChange={(e) => touch(setFocusKeyword)(e.target.value)} className="field" />
            </div>
            <div>
              <label htmlFor="slug" className="label">
                URL (slug)
              </label>
              <div className="flex gap-2">
                <input id="slug" name="slug" value={slug} onChange={(e) => touch(setSlug)(slugify(e.target.value))} className="field font-mono text-xs" />
                <button type="button" onClick={() => touch(setSlug)(slugify(focusKeyword || title))} className="btn-ghost px-2.5 text-xs" title="Gerar a partir da palavra-chave">
                  Gerar
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="meta_title" className="label">
                Título SEO <Counter n={(metaTitle || title).length} max={60} />
              </label>
              <input id="meta_title" name="meta_title" value={metaTitle} onChange={(e) => touch(setMetaTitle)(e.target.value)} className="field" placeholder={title} />
            </div>
            <div>
              <label htmlFor="meta_description" className="label">
                Meta description <Counter n={metaDescription.length} max={160} />
              </label>
              <textarea id="meta_description" name="meta_description" value={metaDescription} onChange={(e) => touch(setMetaDescription)(e.target.value)} rows={3} className="field" />
              <button type="button" onClick={() => callAi({ action: "gerar_meta", selection: "" })} className="mt-1 flex items-center gap-1 text-xs font-medium text-brand hover:underline">
                <Sparkles className="size-3.5" /> Gerar com IA
              </button>
            </div>

            <div className="rounded-lg border border-line p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Prévia no Google</p>
              <p className="truncate text-xs text-muted">
                {host} › {slug || "url-do-artigo"}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[15px] text-[#1a0dab]">{metaTitle || title || "Título do artigo"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted">{metaDescription || "A meta description aparece aqui, resumindo o que o leitor vai encontrar."}</p>
            </div>

            {status === "publicado" && (
              <div>
                <label htmlFor="published_url" className="label">
                  URL publicada
                </label>
                <input id="published_url" name="published_url" defaultValue={article.published_url ?? ""} onChange={() => setDirty(true)} className="field" placeholder={`${siteUrl}/blog/${slug}`} />
              </div>
            )}
          </section>

          <button
            type="submit"
            formAction={deleteArticle}
            formNoValidate
            onClick={(e) => {
              if (!confirm("Excluir este artigo? Isso não pode ser desfeito.")) e.preventDefault();
              else setDirty(false);
            }}
            className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted hover:text-bad"
          >
            <Trash2 className="size-4" /> Excluir artigo
          </button>
        </aside>
      </div>

      {aiPrompt && (
        <AiPromptDialog
          request={aiPrompt}
          onClose={() => setAiPrompt(null)}
          onSubmit={(prompt) => {
            setAiPrompt(null);
            callAi({ ...aiPrompt, prompt });
          }}
        />
      )}

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 flex max-w-md -translate-x-1/2 items-start gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-xl">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-soft" />
          <span className="flex-1">{toast}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Fechar" className="text-white/60 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}
    </form>
  );
}

function SchedulePopover({ date, disabled, onSchedule }: { date: string; disabled: boolean; onSchedule: (d: string) => void }) {
  const [value, setValue] = useState(() => date || tomorrowIso());
  return (
    <Popover
      align="right"
      panelClassName="w-64 p-3"
      trigger={({ toggle }) => (
        <button type="button" onClick={toggle} disabled={disabled} className="btn-ghost" title={disabled ? "Artigo já publicado" : undefined}>
          <CalendarClock className="size-4" /> {date ? "Reagendar" : "Agendar"}
        </button>
      )}
    >
      {(close) => (
        <div className="space-y-3">
          <label htmlFor="schedule-date" className="label">
            Publicar em
          </label>
          <input id="schedule-date" type="date" value={value} onChange={(e) => setValue(e.target.value)} className="field" />
          <div className="flex gap-2">
            {date && (
              <button
                type="button"
                onClick={() => {
                  onSchedule("");
                  close();
                }}
                className="btn-ghost flex-1 text-xs"
              >
                Tirar data
              </button>
            )}
            <button
              type="button"
              disabled={!value}
              onClick={() => {
                onSchedule(value);
                close();
              }}
              className="btn-primary flex-1"
            >
              Agendar
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}

function AiPromptDialog({ request, onSubmit, onClose }: { request: AiRequest; onSubmit: (p: string) => void; onClose: () => void }) {
  const def = AI_ACTIONS.find((a) => a.id === request.action)!;
  const [value, setValue] = useState("");
  return (
    <Modal
      title={def.label}
      icon={<Sparkles />}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="button" disabled={!value.trim()} onClick={() => onSubmit(value.trim())} className="btn-primary">
            <Sparkles className="size-4" /> Gerar
          </button>
        </>
      }
    >
      {request.selection && (
        <blockquote className="mb-3 line-clamp-4 border-l-4 border-brand/40 pl-3 text-sm italic text-muted">{request.selection}</blockquote>
      )}
      <label htmlFor="ai-prompt" className="label">
        {def.prompt}
      </label>
      <textarea id="ai-prompt" value={value} onChange={(e) => setValue(e.target.value)} rows={4} className="field" autoFocus />
    </Modal>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-canvas px-2 py-2.5">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="mt-1 flex justify-center text-sm">{children}</dd>
    </div>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  return (
    <span className={`ml-1 text-xs font-normal tabular-nums ${n > max ? "text-bad" : "text-muted"}`}>
      {n}/{max}
    </span>
  );
}
