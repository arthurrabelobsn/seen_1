"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowDownUp,
  Ban,
  KeyRound,
  Loader2,
  PenLine,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import type { Keyword } from "@/lib/types";
import { nf } from "@/lib/format";
import { DifficultyMeter, OpportunityBadge, PageHeader, SoonTag } from "@/components/ui";
import { addKeywords, deleteKeywords, generateKeywords, refreshKeywordMetrics, setKeywordStatus } from "./actions";

type Tab = "salva" | "em_uso" | "sugerida" | "descartada";
const TABS: { id: Tab; label: string }[] = [
  { id: "salva", label: "Salvas" },
  { id: "em_uso", label: "Em uso" },
  { id: "sugerida", label: "Sugeridas" },
  { id: "descartada", label: "Descartadas" },
];
const INTENT: Record<string, string> = { informacional: "Informar", comercial: "Comparar", transacional: "Comprar", navegacional: "Marca" };
const SOURCE: Record<string, string> = { manual: "Manual", sugerida: "Sugerida", gerada: "IA", search_console: "Search Console" };
const OPP_RANK: Record<string, number> = { alta: 3, media: 2, baixa: 1 };
type SortKey = "recentes" | "oportunidade" | "volume" | "dificuldade" | "az";

export function KeywordsBoard({ keywords, siteName, niche }: { keywords: Keyword[]; siteName: string; niche: string | null }) {
  const [tab, setTab] = useState<Tab>("salva");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("recentes");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<{ kind: "ok" | "info" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const counts = Object.fromEntries(TABS.map((t) => [t.id, keywords.filter((k) => k.status === t.id).length])) as Record<Tab, number>;
  const shown = useMemo(() => {
    const list = keywords.filter((k) => k.status === tab && (!q || k.term.includes(q.toLowerCase())));
    const by: Record<SortKey, (a: Keyword, b: Keyword) => number> = {
      recentes: (a, b) => b.created_at.localeCompare(a.created_at),
      oportunidade: (a, b) => (OPP_RANK[b.opportunity ?? ""] ?? 0) - (OPP_RANK[a.opportunity ?? ""] ?? 0) || (b.volume ?? 0) - (a.volume ?? 0),
      volume: (a, b) => (b.volume ?? -1) - (a.volume ?? -1),
      dificuldade: (a, b) => (a.difficulty ?? 99) - (b.difficulty ?? 99),
      az: (a, b) => a.term.localeCompare(b.term, "pt-BR"),
    };
    return [...list].sort(by[sort]);
  }, [keywords, tab, q, sort]);

  const selectedIds = [...selected].filter((id) => shown.some((k) => k.id === id));
  const allChecked = shown.length > 0 && selectedIds.length === shown.length;

  const run = (fn: () => Promise<{ error?: string; ok?: boolean; notConfigured?: boolean } | undefined>, okText?: string) =>
    startTransition(async () => {
      const res = await fn();
      if (res?.error) setNotice({ kind: res.notConfigured ? "info" : "error", text: res.error });
      else {
        setSelected(new Set());
        if (okText) setNotice({ kind: "ok", text: okText });
      }
    });

  return (
    <>
      <PageHeader title="Keywords" description={`Os termos que o público de ${siteName} busca no Google. Cada keyword vira um artigo.`} />

      {/* Entrada */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AddCard
          pending={pending}
          onAdd={(text) =>
            run(async () => {
              const res = await addKeywords(text);
              if ("added" in res && res.ok) {
                setTab("salva");
                setNotice({ kind: "ok", text: `${res.added} adicionadas${res.skipped ? `, ${res.skipped} já existiam` : ""}.` });
              }
              return res;
            })
          }
        />
        <GenerateCard
          pending={pending}
          defaultSeed={niche ?? ""}
          selectedTerms={keywords.filter((k) => selectedIds.includes(k.id)).map((k) => k.term)}
          onGenerate={(seeds) => run(() => generateKeywords(seeds))}
        />
      </div>

      {/* Em alta */}
      <section className="card mt-4 flex flex-wrap items-center gap-4 p-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff1e8] text-[#ea580c]">
          <TrendingUp className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Em alta no seu nicho</h2>
            <SoonTag />
          </div>
          <p className="text-sm text-muted">
            Termos com busca crescendo nos últimos meses, com volume, dificuldade e oportunidade. Aparecem em “Sugeridas” quando os dados do Google forem conectados.
          </p>
        </div>
      </section>

      {notice && (
        <div
          role="status"
          className={`mt-4 flex items-start gap-2 rounded-xl px-4 py-2.5 text-sm ${
            notice.kind === "ok" ? "bg-good-soft text-good" : notice.kind === "info" ? "bg-brand-soft text-brand-strong" : "bg-bad-soft text-bad"
          }`}
        >
          <span className="flex-1">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Fechar">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Tabela */}
      <section className="card mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <nav className="mr-auto flex gap-1 rounded-lg border border-line p-1 text-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setSelected(new Set());
                }}
                className={`rounded-md px-2.5 py-1 ${tab === t.id ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:text-ink"}`}
              >
                {t.label} <span className="tabular-nums opacity-70">{counts[t.id]}</span>
              </button>
            ))}
          </nav>
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" className="field w-48 py-1.5 pl-8" />
          </label>
          <label className="flex items-center gap-1.5 text-sm text-muted">
            <ArrowDownUp className="size-4" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="field w-auto py-1.5" aria-label="Ordenar">
              <option value="recentes">Mais recentes</option>
              <option value="oportunidade">Maior oportunidade</option>
              <option value="volume">Maior volume</option>
              <option value="dificuldade">Menor dificuldade</option>
              <option value="az">A–Z</option>
            </select>
          </label>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-brand-soft/60 px-4 py-2 text-sm">
            <span className="mr-2 font-semibold">{selectedIds.length} selecionadas</span>
            <button type="button" disabled={pending} onClick={() => run(() => generateKeywords(keywords.filter((k) => selectedIds.includes(k.id)).map((k) => k.term)))} className="btn-ghost py-1 text-xs">
              <Sparkles className="size-3.5" /> Gerar parecidas
            </button>
            <button type="button" disabled={pending} onClick={() => run(() => refreshKeywordMetrics(selectedIds))} className="btn-ghost py-1 text-xs">
              <RefreshCw className="size-3.5" /> Atualizar dados
            </button>
            {tab === "descartada" ? (
              <button type="button" disabled={pending} onClick={() => run(() => setKeywordStatus(selectedIds, "salva"), "Restauradas.")} className="btn-ghost py-1 text-xs">
                <RotateCcw className="size-3.5" /> Restaurar
              </button>
            ) : (
              <button type="button" disabled={pending} onClick={() => run(() => setKeywordStatus(selectedIds, "descartada"), "Descartadas.")} className="btn-ghost py-1 text-xs">
                <Ban className="size-3.5" /> Descartar
              </button>
            )}
            {tab === "sugerida" && (
              <button type="button" disabled={pending} onClick={() => run(() => setKeywordStatus(selectedIds, "salva"), "Salvas.")} className="btn-primary py-1 text-xs">
                Salvar
              </button>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => confirm(`Excluir ${selectedIds.length} keywords?`) && run(() => deleteKeywords(selectedIds), "Excluídas.")}
              className="btn-ghost py-1 text-xs text-bad"
            >
              <Trash2 className="size-3.5" /> Excluir
            </button>
            {pending && <Loader2 className="size-4 animate-spin text-muted" />}
          </div>
        )}

        {shown.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <KeyRound className="size-8 text-muted" />
            <p className="mt-3 font-medium">{tab === "sugerida" ? "Nenhuma sugestão ainda" : tab === "salva" ? "Nenhuma keyword salva" : "Nada aqui"}</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {tab === "salva" ? "Adicione os termos que seus clientes digitam no Google, um por linha." : "As keywords aparecem aqui conforme você as organiza."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={() => setSelected(allChecked ? new Set() : new Set(shown.map((k) => k.id)))}
                      className="size-4 accent-brand"
                      aria-label="Selecionar todas"
                    />
                  </th>
                  <th className="px-2 py-3 font-medium">Keyword</th>
                  <th className="px-3 py-3 font-medium">Intenção</th>
                  <th className="px-3 py-3 text-right font-medium">Volume/mês</th>
                  <th className="px-3 py-3 font-medium">Tendência</th>
                  <th className="px-3 py-3 font-medium">Dificuldade</th>
                  <th className="px-3 py-3 font-medium">Oportunidade</th>
                  <th className="px-3 py-3 font-medium">Origem</th>
                  <th className="px-4 py-3 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((k) => (
                  <tr key={k.id} className={`border-b border-line last:border-0 ${selected.has(k.id) ? "bg-brand-soft/40" : "hover:bg-canvas/60"}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(k.id)}
                        onChange={() => {
                          const next = new Set(selected);
                          if (next.has(k.id)) next.delete(k.id);
                          else next.add(k.id);
                          setSelected(next);
                        }}
                        className="size-4 accent-brand"
                        aria-label={`Selecionar ${k.term}`}
                      />
                    </td>
                    <td className="px-2 py-3">
                      <span className="font-semibold">{k.term}</span>
                      {k.seed && <span className="block text-xs text-muted">tema: {k.seed}</span>}
                    </td>
                    <td className="px-3 py-3 text-muted">{k.intent ? INTENT[k.intent] : "—"}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{k.volume != null ? nf.format(k.volume) : <span className="text-muted">—</span>}</td>
                    <td className="px-3 py-3">
                      <Sparkline values={k.trend} />
                    </td>
                    <td className="px-3 py-3">
                      <DifficultyMeter value={k.difficulty} />
                    </td>
                    <td className="px-3 py-3">
                      <OpportunityBadge value={k.opportunity} />
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">{SOURCE[k.source] ?? k.source}</td>
                    <td className="px-4 py-3 text-right">
                      {k.status === "em_uso" ? (
                        <span className="text-xs text-muted">Já tem artigo</span>
                      ) : (
                        <Link href={`/artigos/novo?keyword=${k.id}`} className="btn-primary px-2.5 py-1.5 text-xs">
                          <PenLine className="size-3.5" /> Criar artigo
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="mt-3 text-xs text-muted">
        Volume, tendência, dificuldade (0 a 10) e oportunidade são preenchidos pela fonte de dados do Google quando ela for conectada.
        Oportunidade combina muito volume com pouca dificuldade.
      </p>
    </>
  );
}

function AddCard({ pending, onAdd }: { pending: boolean; onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  const n = text.split(/[\n,;]/).filter((t) => t.trim()).length;
  return (
    <section className="card flex flex-col p-5">
      <div className="flex items-center gap-2">
        <Plus className="size-4 text-brand" />
        <h2 className="font-semibold">Adicionar keywords</h2>
      </div>
      <p className="mt-1 text-sm text-muted">Uma por linha, ou separadas por vírgula. Cole de uma planilha se quiser.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="field mt-3 flex-1 font-mono text-xs"
        placeholder={"como escolher blush\nblush para pele morena\nmelhor blush vegano"}
      />
      <button
        type="button"
        disabled={pending || n === 0}
        onClick={() => {
          onAdd(text);
          setText("");
        }}
        className="btn-primary mt-3 self-start"
      >
        Adicionar {n > 0 && `(${n})`}
      </button>
    </section>
  );
}

function GenerateCard({
  pending,
  defaultSeed,
  selectedTerms,
  onGenerate,
}: {
  pending: boolean;
  defaultSeed: string;
  selectedTerms: string[];
  onGenerate: (seeds: string[]) => void;
}) {
  const [seeds, setSeeds] = useState<string[]>(defaultSeed ? [defaultSeed] : []);
  const [input, setInput] = useState("");
  const all = [...new Set([...seeds, ...selectedTerms])];
  const addSeed = () => {
    const v = input.trim();
    if (v && !seeds.includes(v)) setSeeds([...seeds, v]);
    setInput("");
  };

  return (
    <section className="card flex flex-col p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-brand" />
        <h2 className="font-semibold">Gerar ideias com IA</h2>
        <SoonTag />
      </div>
      <p className="mt-1 text-sm text-muted">A partir de palavras, grupos de palavras ou temas. Selecionar keywords na tabela também as usa como base.</p>
      <div className="field mt-3 flex min-h-[84px] flex-1 flex-wrap content-start gap-1.5">
        {all.map((s) => (
          <span key={s} className="pill border-brand/20 bg-brand-soft text-brand">
            {s}
            {seeds.includes(s) && (
              <button type="button" onClick={() => setSeeds(seeds.filter((x) => x !== s))} aria-label={`Remover ${s}`}>
                <X className="size-3" />
              </button>
            )}
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addSeed();
            }
          }}
          onBlur={addSeed}
          className="min-w-32 flex-1 bg-transparent text-sm outline-none"
          placeholder={all.length ? "Mais um tema…" : "Ex.: maquiagem vegana, pele oleosa"}
        />
      </div>
      <button type="button" disabled={pending || all.length === 0} onClick={() => onGenerate(all)} className="btn-primary mt-3 self-start">
        <Sparkles className="size-4" /> Gerar keywords
      </button>
    </section>
  );
}

function Sparkline({ values }: { values: number[] | null }) {
  if (!values || values.length < 2) return <span className="text-xs text-muted">—</span>;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const w = 64, h = 20;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 2 - ((v - min) / (max - min || 1)) * (h - 4)}`).join(" ");
  const up = values[values.length - 1] >= values[0];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={up ? "Tendência de alta" : "Tendência de queda"}>
      <polyline points={pts} fill="none" stroke={up ? "var(--color-good)" : "var(--color-bad)"} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
