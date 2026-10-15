"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, ImagePlus, Link2, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { uploadImage } from "@/lib/supabase/client";
import { blobToDataUrl, chartSvg, svgToPng, type ChartRow } from "./chart";

/** Janela modal com o visual do app. */
export function Modal({
  title,
  icon,
  onClose,
  children,
  footer,
  width = 520,
}: {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      style={{ width: `min(${width}px, calc(100vw - 32px))` }}
      className="m-auto rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
        {icon && <span className="text-brand [&>svg]:size-5">{icon}</span>}
        <h2 className="flex-1 font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-canvas" aria-label="Fechar">
          <X className="size-4" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
    </dialog>
  );
}

/* ---------------------------------------------------------------- */

export function LinkDialog({
  initial,
  onSubmit,
  onRemove,
  onClose,
}: {
  initial: string;
  onSubmit: (href: string, newTab: boolean) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [href, setHref] = useState(initial);
  const [newTab, setNewTab] = useState(false);
  const submit = () => {
    const v = href.trim();
    if (!v) return;
    onSubmit(v.startsWith("/") || /^[a-z]+:/i.test(v) ? v : `https://${v}`, newTab);
  };
  return (
    <Modal
      title="Link"
      icon={<Link2 />}
      onClose={onClose}
      footer={
        <>
          {initial && (
            <button type="button" onClick={onRemove} className="btn-ghost mr-auto text-bad">
              Remover link
            </button>
          )}
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="button" onClick={submit} className="btn-primary">
            Aplicar
          </button>
        </>
      }
    >
      <label htmlFor="link-href" className="label">
        Endereço
      </label>
      <input
        id="link-href"
        value={href}
        onChange={(e) => setHref(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submit())}
        className="field"
        placeholder="/produtos/blush  ou  https://fonte.com/estudo"
        autoFocus
      />
      <p className="hint">Comece com “/” para links internos do seu site.</p>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} className="size-4 accent-brand" />
        Abrir em nova aba
      </label>
    </Modal>
  );
}

/* ---------------------------------------------------------------- */

export function ImageDialog({
  userId,
  onInsert,
  onAiGenerate,
  onClose,
}: {
  userId: string;
  onInsert: (src: string, alt: string) => void;
  onAiGenerate: (description: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"enviar" | "url" | "ia">("enviar");
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      setSrc(await uploadImage(file, userId, "articles"));
      if (!alt) setAlt(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Imagem"
      icon={<ImagePlus />}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          {tab === "ia" ? (
            <button type="button" disabled={!desc.trim()} onClick={() => onAiGenerate(desc.trim())} className="btn-primary">
              <Sparkles className="size-4" /> Gerar imagem
            </button>
          ) : (
            <button type="button" disabled={!src || !alt.trim()} onClick={() => onInsert(src, alt.trim())} className="btn-primary">
              Inserir
            </button>
          )}
        </>
      }
    >
      <div className="mb-4 flex gap-1 rounded-lg border border-line p-1 text-sm">
        {(
          [
            ["enviar", "Enviar arquivo"],
            ["url", "Por link"],
            ["ia", "Gerar com IA"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`flex-1 rounded-md px-2.5 py-1.5 ${tab === k ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "ia" ? (
        <div>
          <label htmlFor="img-desc" className="label">
            Descreva a imagem
          </label>
          <textarea id="img-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="field" placeholder="Mulher aplicando blush em frente ao espelho, luz natural, tons rosados" autoFocus />
          <p className="hint">Usa o estilo de imagem padrão definido em Site → Marca e IA.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tab === "enviar" ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFile(e.dataTransfer.files[0]);
              }}
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed border-line bg-canvas text-sm text-muted hover:text-ink"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element -- prévia
                <img src={src} alt="" className="h-full w-full object-contain" />
              ) : busy ? (
                <>
                  <Loader2 className="size-6 animate-spin" /> Enviando…
                </>
              ) : (
                <>
                  <ImagePlus className="size-6" /> Clique ou arraste uma imagem (até 5 MB)
                </>
              )}
            </button>
          ) : (
            <div>
              <label htmlFor="img-url" className="label">
                Endereço da imagem
              </label>
              <input id="img-url" value={src} onChange={(e) => setSrc(e.target.value)} className="field" placeholder="https://…/foto.jpg" autoFocus />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <div>
            <label htmlFor="img-alt" className="label">
              Texto alternativo (alt)
            </label>
            <input id="img-alt" value={alt} onChange={(e) => setAlt(e.target.value)} className="field" placeholder="Descreva o que aparece na imagem" />
            <p className="hint">Obrigatório: ajuda no Google Imagens e na acessibilidade.</p>
          </div>
          {error && <p className="text-sm text-bad">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------------------- */

export function ChartDialog({
  userId,
  onInsert,
  onClose,
}: {
  userId: string;
  onInsert: (src: string, alt: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"barras" | "linha">("barras");
  const [unit, setUnit] = useState("");
  const [rows, setRows] = useState<{ label: string; value: string }[]>([
    { label: "Jan", value: "" },
    { label: "Fev", value: "" },
    { label: "Mar", value: "" },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed: ChartRow[] = rows
    .filter((r) => r.label.trim() && r.value.trim() !== "")
    .map((r) => ({ label: r.label.trim(), value: Number(r.value.replace(",", ".")) }))
    .filter((r) => Number.isFinite(r.value));
  const preview = parsed.length >= 2 ? chartSvg({ title: title || "Título do gráfico", kind, rows: parsed, unit }) : null;

  async function insert() {
    if (!preview) return;
    setBusy(true);
    setError(null);
    try {
      const png = await svgToPng(chartSvg({ title, kind, rows: parsed, unit }));
      let src: string;
      try {
        src = await uploadImage(png, userId, "charts", "png");
      } catch {
        src = await blobToDataUrl(png); // sem Storage: embute a imagem no próprio artigo
      }
      const alt = `${title}: ${parsed.map((r) => `${r.label} ${r.value}${unit}`).join(", ")}`;
      onInsert(src, alt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao gerar o gráfico.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Gráfico"
      icon={<BarChart3 />}
      onClose={onClose}
      width={760}
      footer={
        <>
          {error && <p className="mr-auto text-sm text-bad">{error}</p>}
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="button" disabled={!preview || !title.trim() || busy} onClick={insert} className="btn-primary">
            {busy ? "Gerando…" : "Inserir gráfico"}
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-[260px_1fr]">
        <div className="space-y-3">
          <div>
            <label htmlFor="ch-title" className="label">
              Título
            </label>
            <input id="ch-title" value={title} onChange={(e) => setTitle(e.target.value)} className="field" placeholder="Buscas por blush em 2026" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="ch-kind" className="label">
                Tipo
              </label>
              <select id="ch-kind" value={kind} onChange={(e) => setKind(e.target.value as "barras" | "linha")} className="field">
                <option value="barras">Barras</option>
                <option value="linha">Linha</option>
              </select>
            </div>
            <div>
              <label htmlFor="ch-unit" className="label">
                Unidade
              </label>
              <input id="ch-unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="field" placeholder="%, mil…" />
            </div>
          </div>
          <div>
            <p className="label">Dados</p>
            <div className="space-y-1.5">
              {rows.map((r, i) => (
                <div key={i} className="flex gap-1.5">
                  <input
                    value={r.label}
                    onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    className="field py-1.5"
                    placeholder="Rótulo"
                    aria-label={`Rótulo ${i + 1}`}
                  />
                  <input
                    value={r.value}
                    onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    className="field w-24 py-1.5 text-right tabular-nums"
                    inputMode="decimal"
                    placeholder="0"
                    aria-label={`Valor ${i + 1}`}
                  />
                  <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="rounded-lg px-1.5 text-muted hover:text-bad" aria-label="Remover linha">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            {rows.length < 12 && (
              <button type="button" onClick={() => setRows([...rows, { label: "", value: "" }])} className="mt-2 flex items-center gap-1 text-sm text-brand hover:underline">
                <Plus className="size-4" /> Linha
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-line bg-canvas p-3">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- prévia local do SVG
            <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(preview)}`} alt="Prévia do gráfico" className="w-full rounded-lg" />
          ) : (
            <p className="p-8 text-center text-sm text-muted">Preencha pelo menos 2 linhas para ver a prévia.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
