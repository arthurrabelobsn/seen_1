"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Calculator,
  Check,
  ChevronDown,
  Columns3,
  Download,
  GripVertical,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { Metric } from "@/lib/types";
import { daily, totals } from "@/lib/metrics";
import { Hint } from "@/components/hint";
import { Popover, MenuItem } from "@/components/popover";
import { Modal } from "@/components/editor/dialogs";
import { Sparkline } from "@/components/line-chart";
import { usePersistentState } from "@/lib/use-persistent";
import type { ArticleInfo } from "./results-dashboard";

/* ------------------------------------------------------------------ */
/* Linhas: um artigo com todas as métricas calculadas                  */
/* ------------------------------------------------------------------ */

type Row = ArticleInfo & {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
  prevClicks: number;
  prevImpressions: number;
  prevPosition: number | null;
  trend: number[];
  daysLive: number | null;
};

type Format = "numero" | "porcentagem" | "moeda" | "decimal" | "texto" | "data" | "tendencia";

type Column = {
  id: string;
  label: string;
  group: "Desempenho" | "Comparação" | "Palavra-chave" | "Artigo" | "Personalizadas";
  help: string;
  format: Format;
  /** Valor da linha (número para métricas, texto para colunas descritivas). */
  get: (r: Row) => number | string | null | number[];
  /** Total da coluna, quando faz sentido somar ou calcular para o conjunto. */
  total?: (rows: Row[]) => number | null;
  /** Menor é melhor (para a cor da variação e a ordenação padrão). */
  lowerIsBetter?: boolean;
};

const sum = (rows: Row[], f: (r: Row) => number) => rows.reduce((s, r) => s + f(r), 0);
const weightedPosition = (rows: Row[]) => {
  const w = rows.filter((r) => r.position != null && r.impressions > 0);
  const imp = sum(w, (r) => r.impressions);
  return imp ? w.reduce((s, r) => s + (r.position ?? 0) * r.impressions, 0) / imp : null;
};
const pct = (now: number | null, before: number | null) => (now == null || before == null || before === 0 ? null : (now - before) / before);

const BASE_COLUMNS: Column[] = [
  // Desempenho
  { id: "visitas", label: "Visitas", group: "Desempenho", format: "numero", help: "Cliques vindos da busca do Google no período.", get: (r) => r.clicks, total: (rs) => sum(rs, (r) => r.clicks) },
  { id: "aparicoes", label: "Aparições", group: "Desempenho", format: "numero", help: "Quantas vezes o artigo apareceu nos resultados do Google (impressões).", get: (r) => r.impressions, total: (rs) => sum(rs, (r) => r.impressions) },
  {
    id: "taxa_cliques",
    label: "Taxa de cliques",
    group: "Desempenho",
    format: "porcentagem",
    help: "De cada 100 pessoas que viram o artigo no Google, quantas clicaram (CTR).",
    get: (r) => r.ctr,
    total: (rs) => {
      const imp = sum(rs, (r) => r.impressions);
      return imp ? sum(rs, (r) => r.clicks) / imp : null;
    },
  },
  { id: "posicao", label: "Posição média", group: "Desempenho", format: "decimal", help: "Lugar médio no Google. 1 é o primeiro; até 10 é a primeira página.", get: (r) => r.position, total: weightedPosition, lowerIsBetter: true },
  { id: "visitas_dia", label: "Visitas por dia", group: "Desempenho", format: "decimal", help: "Média de visitas por dia no período.", get: (r) => (r.trend.length ? r.clicks / r.trend.length : null), total: (rs) => (rs[0]?.trend.length ? sum(rs, (r) => r.clicks) / rs[0].trend.length : null) },
  { id: "tendencia", label: "Tendência", group: "Desempenho", format: "tendencia", help: "Visitas por dia no período, em miniatura.", get: (r) => r.trend },

  // Comparação
  { id: "visitas_ant", label: "Visitas (período anterior)", group: "Comparação", format: "numero", help: "Visitas no período anterior de mesmo tamanho.", get: (r) => r.prevClicks, total: (rs) => sum(rs, (r) => r.prevClicks) },
  { id: "var_visitas", label: "Variação de visitas", group: "Comparação", format: "porcentagem", help: "Quanto as visitas mudaram em relação ao período anterior.", get: (r) => pct(r.clicks, r.prevClicks), total: (rs) => pct(sum(rs, (r) => r.clicks), sum(rs, (r) => r.prevClicks)) },
  { id: "aparicoes_ant", label: "Aparições (período anterior)", group: "Comparação", format: "numero", help: "Aparições no período anterior.", get: (r) => r.prevImpressions, total: (rs) => sum(rs, (r) => r.prevImpressions) },
  { id: "var_aparicoes", label: "Variação de aparições", group: "Comparação", format: "porcentagem", help: "Quanto as aparições mudaram em relação ao período anterior.", get: (r) => pct(r.impressions, r.prevImpressions), total: (rs) => pct(sum(rs, (r) => r.impressions), sum(rs, (r) => r.prevImpressions)) },
  {
    id: "var_posicao",
    label: "Mudança de posição",
    group: "Comparação",
    format: "decimal",
    help: "Quantas posições o artigo subiu (positivo) ou caiu (negativo) em relação ao período anterior.",
    get: (r) => (r.position != null && r.prevPosition != null ? r.prevPosition - r.position : null),
  },

  // Palavra-chave
  { id: "palavra_chave", label: "Palavra-chave", group: "Palavra-chave", format: "texto", help: "O termo principal que o artigo quer ranquear.", get: (r) => r.keyword },
  { id: "volume", label: "Volume de busca", group: "Palavra-chave", format: "numero", help: "Buscas por mês da palavra-chave no Google.", get: (r) => r.volume },
  { id: "dificuldade", label: "Dificuldade", group: "Palavra-chave", format: "numero", help: "De 0 a 10, o quanto é disputado aparecer na 1ª página.", get: (r) => r.difficulty, lowerIsBetter: true },
  { id: "oportunidade", label: "Oportunidade", group: "Palavra-chave", format: "texto", help: "Combina volume e dificuldade: alta, média ou baixa.", get: (r) => (r.opportunity ? { alta: "Alta", media: "Média", baixa: "Baixa" }[r.opportunity] ?? r.opportunity : null) },
  { id: "cpc", label: "Custo por clique", group: "Palavra-chave", format: "moeda", help: "Quanto um anunciante paga, em média, por clique nessa palavra no Google Ads.", get: (r) => r.cpc },
  {
    id: "valor_anuncios",
    label: "Valor em anúncios",
    group: "Palavra-chave",
    format: "moeda",
    help: "Quanto custaria comprar essas visitas no Google Ads (visitas × custo por clique).",
    get: (r) => (r.cpc != null ? r.clicks * r.cpc : null),
    total: (rs) => (rs.some((r) => r.cpc != null) ? sum(rs, (r) => (r.cpc != null ? r.clicks * r.cpc : 0)) : null),
  },

  // Artigo
  { id: "status", label: "Status", group: "Artigo", format: "texto", help: "Situação do artigo na Seen.", get: (r) => ({ ideia: "Ideia", rascunho: "Rascunho", aprovado: "Aprovado", agendado: "Agendado", publicado: "Publicado" })[r.status] ?? r.status },
  { id: "publicado_em", label: "Publicado em", group: "Artigo", format: "data", help: "Data em que o artigo foi ao ar.", get: (r) => r.published_at },
  { id: "dias_no_ar", label: "Dias no ar", group: "Artigo", format: "numero", help: "Há quantos dias o artigo está publicado.", get: (r) => r.daysLive },
  { id: "palavras", label: "Palavras", group: "Artigo", format: "numero", help: "Tamanho do texto.", get: (r) => r.words, total: (rs) => sum(rs, (r) => r.words) },
];

const PRESETS: { id: string; name: string; columns: string[] }[] = [
  { id: "desempenho", name: "Desempenho", columns: ["visitas", "aparicoes", "taxa_cliques", "posicao", "tendencia"] },
  { id: "comparacao", name: "Comparação de períodos", columns: ["visitas", "visitas_ant", "var_visitas", "aparicoes", "var_aparicoes", "var_posicao"] },
  { id: "palavra", name: "Palavra-chave", columns: ["palavra_chave", "volume", "dificuldade", "oportunidade", "posicao", "visitas"] },
  { id: "retorno", name: "Retorno", columns: ["visitas", "cpc", "valor_anuncios", "dias_no_ar", "visitas_dia"] },
];

/* ------------------------------------------------------------------ */
/* Métricas personalizadas                                              */
/* ------------------------------------------------------------------ */

type Op = "+" | "-" | "*" | "/";
type Operand = { kind: "coluna"; id: string } | { kind: "numero"; value: number };
type CustomMetric = { id: string; name: string; a: Operand; op: Op; b: Operand; multiplier: number; format: "numero" | "porcentagem" | "moeda" | "decimal" };

const OP_LABEL: Record<Op, string> = { "+": "+ mais", "-": "− menos", "*": "× vezes", "/": "÷ dividido por" };

function applyOp(a: number | null, op: Op, b: number | null) {
  if (a == null || b == null) return null;
  if (op === "/") return b === 0 ? null : a / b;
  return op === "+" ? a + b : op === "-" ? a - b : a * b;
}

function customColumn(m: CustomMetric, base: Column[]): Column {
  const operand = (o: Operand, r: Row) => (o.kind === "numero" ? o.value : numeric(base.find((c) => c.id === o.id)?.get(r)));
  const operandTotal = (o: Operand, rs: Row[]) => (o.kind === "numero" ? o.value : base.find((c) => c.id === o.id)?.total?.(rs) ?? null);
  const calc = (a: number | null, b: number | null) => {
    const v = applyOp(a, m.op, b);
    return v == null ? null : v * (m.multiplier || 1);
  };
  return {
    id: m.id,
    label: m.name,
    group: "Personalizadas",
    format: m.format,
    help: `Métrica criada por você: ${describe(m, base)}.`,
    get: (r) => calc(operand(m.a, r), operand(m.b, r)),
    total: (rs) => calc(operandTotal(m.a, rs), operandTotal(m.b, rs)),
  };
}

function describe(m: CustomMetric, base: Column[]) {
  const name = (o: Operand) => (o.kind === "numero" ? String(o.value).replace(".", ",") : base.find((c) => c.id === o.id)?.label ?? "?");
  const sym = { "+": "+", "-": "−", "*": "×", "/": "÷" }[m.op];
  return `${name(m.a)} ${sym} ${name(m.b)}${m.multiplier && m.multiplier !== 1 ? ` × ${String(m.multiplier).replace(".", ",")}` : ""}`;
}

const numeric = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/* ------------------------------------------------------------------ */
/* Formatação                                                           */
/* ------------------------------------------------------------------ */

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function show(v: ReturnType<Column["get"]>, f: Format) {
  if (v == null || (typeof v === "number" && !Number.isFinite(v))) return "—";
  if (Array.isArray(v)) return "";
  if (typeof v === "string") {
    if (f === "data") return new Date(v).toLocaleDateString("pt-BR");
    return v;
  }
  if (f === "porcentagem") return `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
  if (f === "moeda") return brl.format(v);
  if (f === "decimal") return v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return Math.round(v).toLocaleString("pt-BR");
}

/* ------------------------------------------------------------------ */
/* Componente                                                           */
/* ------------------------------------------------------------------ */

export function ResultsManager({
  articles,
  current,
  previous,
  dates,
  endDate,
  onOpenArticle,
}: {
  articles: ArticleInfo[];
  current: Metric[];
  previous: Metric[];
  dates: string[];
  endDate: string;
  onOpenArticle: (id: string) => void;
}) {
  const [customMetrics, setCustomMetrics] = usePersistentState<CustomMetric[]>("seen.gerenciador.metricas", []);
  const [savedPresets, setSavedPresets] = usePersistentState<{ id: string; name: string; columns: string[] }[]>("seen.gerenciador.predefinicoes", []);
  const [columns, setColumns] = usePersistentState<string[]>("seen.gerenciador.colunas", PRESETS[0].columns);
  const [presetName, setPresetName] = usePersistentState<string>("seen.gerenciador.nome", PRESETS[0].name);
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" }>({ id: "visitas", dir: "desc" });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("todos");
  const [editing, setEditing] = useState(false);

  const allColumns = [...BASE_COLUMNS, ...customMetrics.map((m) => customColumn(m, BASE_COLUMNS))];
  const shownColumns = columns.map((id) => allColumns.find((c) => c.id === id)).filter(Boolean) as Column[];

  const end = new Date(`${endDate}T12:00:00`).getTime();
  const rows: Row[] = articles
    .map((a) => {
      const cur = current.filter((m) => m.article_id === a.id);
      const prev = previous.filter((m) => m.article_id === a.id);
      const t = totals(cur);
      const p = totals(prev);
      return {
        ...a,
        ...t,
        prevClicks: p.clicks,
        prevImpressions: p.impressions,
        prevPosition: p.position,
        trend: daily(cur, dates, "clicks").map((d) => d.value),
        daysLive: a.published_at ? Math.max(0, Math.floor((end - new Date(a.published_at).getTime()) / 86400000)) : null,
      };
    })
    .filter((r) => (status === "todos" ? r.status === "publicado" || r.impressions > 0 : status === "todos_mesmo" ? true : r.status === status))
    .filter((r) => !q || `${r.title} ${r.keyword ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  const sortCol = allColumns.find((c) => c.id === sort.id);
  const sorted = [...rows].sort((a, b) => {
    if (!sortCol) return 0;
    const va = sortCol.get(a), vb = sortCol.get(b);
    if (Array.isArray(va) || Array.isArray(vb)) return 0;
    if (va == null && vb == null) return 0;
    if (va == null) return 1; // vazios sempre no fim
    if (vb == null) return -1;
    const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "pt-BR");
    return sort.dir === "asc" ? cmp : -cmp;
  });

  function toggleSort(c: Column) {
    if (c.format === "tendencia") return;
    setSort((s) => (s.id === c.id ? { id: c.id, dir: s.dir === "desc" ? "asc" : "desc" } : { id: c.id, dir: c.lowerIsBetter || c.format === "texto" ? "asc" : "desc" }));
  }

  function exportCsv() {
    const head = ["Artigo", ...shownColumns.filter((c) => c.format !== "tendencia").map((c) => c.label)];
    const lines = sorted.map((r) => [r.title, ...shownColumns.filter((c) => c.format !== "tendencia").map((c) => show(c.get(r), c.format))]);
    const csv = [head, ...lines].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `seen-resultados-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const allPresets = [...PRESETS, ...savedPresets];

  return (
    <section className="card overflow-hidden">
      {/* Barra de ferramentas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <Popover
          trigger={({ toggle }) => (
            <button type="button" onClick={toggle} className="btn-ghost">
              <Columns3 className="size-4" /> Colunas: <span className="font-semibold">{presetName}</span> <ChevronDown className="size-3.5" />
            </button>
          )}
          panelClassName="w-72"
        >
          {(close) => (
            <>
              <p className="px-2.5 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Predefinições</p>
              {allPresets.map((p) => (
                <MenuItem
                  key={p.id}
                  icon={presetName === p.name ? <Check /> : <span className="block size-4" />}
                  onClick={() => {
                    setColumns(p.columns);
                    setPresetName(p.name);
                    close();
                  }}
                >
                  <span className="flex items-center justify-between gap-2">
                    {p.name}
                    {savedPresets.some((s) => s.id === p.id) && (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={`Apagar ${p.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSavedPresets(savedPresets.filter((s) => s.id !== p.id));
                        }}
                        className="rounded p-0.5 text-muted hover:text-bad"
                      >
                        <Trash2 className="size-3.5" />
                      </span>
                    )}
                  </span>
                </MenuItem>
              ))}
              <div className="my-1 border-t border-line" />
              <MenuItem
                icon={<Columns3 />}
                onClick={() => {
                  close();
                  setEditing(true);
                }}
              >
                Personalizar colunas…
              </MenuItem>
            </>
          )}
        </Popover>

        <label className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar artigo" className="field w-52 py-1.5 pl-8" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field w-auto py-1.5" aria-label="Filtrar por status">
          <option value="todos">Publicados e com dados</option>
          <option value="todos_mesmo">Todos os artigos</option>
          <option value="publicado">Só publicados</option>
          <option value="agendado">Agendados</option>
          <option value="rascunho">Rascunhos</option>
        </select>

        <span className="ml-auto text-sm text-muted">{sorted.length} artigos</span>
        <button type="button" onClick={exportCsv} className="btn-ghost">
          <Download className="size-4" /> Exportar
        </button>
      </div>

      {/* Tabela */}
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full min-w-[760px] border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="text-left text-xs text-muted">
              <th className="sticky left-0 z-20 min-w-[280px] border-b border-r border-line bg-surface px-4 py-2.5 font-medium">Artigo</th>
              {shownColumns.map((c) => {
                const active = sort.id === c.id;
                const right = c.format !== "texto" && c.format !== "data" && c.format !== "tendencia";
                return (
                  <th key={c.id} className={`whitespace-nowrap border-b border-line px-3 py-2.5 font-medium ${right ? "text-right" : ""}`}>
                    <span className={`inline-flex items-center gap-1 ${right ? "flex-row-reverse" : ""}`}>
                      <button type="button" onClick={() => toggleSort(c)} className={`inline-flex items-center gap-1 ${active ? "text-ink" : "hover:text-ink"} ${c.format === "tendencia" ? "cursor-default" : ""}`}>
                        {c.label}
                        {c.format !== "tendencia" &&
                          (active ? sort.dir === "desc" ? <ArrowDown className="size-3.5" /> : <ArrowUp className="size-3.5" /> : <ArrowDownUp className="size-3 opacity-40" />)}
                      </button>
                      <Hint size={12}>{c.help}</Hint>
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Linha de total, como no gerenciador de anúncios */}
            <tr className="bg-canvas/70 font-semibold">
              <td className="sticky left-0 z-[5] border-b border-r border-line bg-[#f8f9fc] px-4 py-2.5">Total · {sorted.length} artigos</td>
              {shownColumns.map((c) => (
                <td key={c.id} className="border-b border-line px-3 py-2.5 text-right tabular-nums">
                  {c.total ? show(c.total(sorted), c.format) : ""}
                </td>
              ))}
            </tr>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={shownColumns.length + 1} className="px-4 py-12 text-center text-muted">
                  Nenhum artigo com esse filtro.
                </td>
              </tr>
            )}
            {sorted.map((r) => (
              <tr key={r.id} className="group cursor-pointer hover:bg-canvas/60" onClick={() => onOpenArticle(r.id)}>
                <td className="sticky left-0 z-[5] max-w-[340px] border-b border-r border-line bg-surface px-4 py-2.5 group-hover:bg-[#f8f9fc]">
                  <span className="line-clamp-1 font-medium group-hover:text-brand">{r.title}</span>
                </td>
                {shownColumns.map((c) => {
                  const v = c.get(r);
                  const right = c.format !== "texto" && c.format !== "data" && c.format !== "tendencia";
                  const isChange = c.id.startsWith("var_") && typeof v === "number";
                  return (
                    <td key={c.id} className={`whitespace-nowrap border-b border-line px-3 py-2.5 tabular-nums ${right ? "text-right" : ""} ${isChange ? ((v as number) >= 0 ? "text-good" : "text-bad") : ""}`}>
                      {c.format === "tendencia" ? (
                        <Sparkline values={v as number[]} />
                      ) : c.format === "texto" ? (
                        <span className="block max-w-[200px] truncate" title={String(v ?? "")}>
                          {show(v, c.format)}
                        </span>
                      ) : (
                        `${isChange && (v as number) > 0 ? "+" : ""}${show(v, c.format)}`
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ColumnsEditor
          allColumns={allColumns}
          selected={columns}
          customMetrics={customMetrics}
          onCreateMetric={(m) => setCustomMetrics([...customMetrics, m])}
          onDeleteMetric={(id) => {
            setCustomMetrics(customMetrics.filter((m) => m.id !== id));
            setColumns(columns.filter((c) => c !== id));
          }}
          onApply={(cols, saveAs) => {
            setColumns(cols);
            if (saveAs) {
              const id = `p-${Date.now()}`;
              setSavedPresets([...savedPresets, { id, name: saveAs, columns: cols }]);
              setPresetName(saveAs);
            } else {
              setPresetName("Personalizado");
            }
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Janela de colunas                                                    */
/* ------------------------------------------------------------------ */

function ColumnsEditor({
  allColumns,
  selected: initial,
  customMetrics,
  onCreateMetric,
  onDeleteMetric,
  onApply,
  onClose,
}: {
  allColumns: Column[];
  selected: string[];
  customMetrics: CustomMetric[];
  onCreateMetric: (m: CustomMetric) => void;
  onDeleteMetric: (id: string) => void;
  onApply: (cols: string[], saveAs: string | null) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(initial);
  const [filter, setFilter] = useState("");
  const [creating, setCreating] = useState(false);
  const [saveAs, setSaveAs] = useState("");
  const groups = ["Desempenho", "Comparação", "Palavra-chave", "Artigo", "Personalizadas"] as const;

  const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= selected.length) return;
    const next = [...selected];
    [next[i], next[j]] = [next[j], next[i]];
    setSelected(next);
  };

  return (
    <Modal
      title="Personalizar colunas"
      icon={<Columns3 />}
      onClose={onClose}
      width={880}
      footer={
        <>
          <input value={saveAs} onChange={(e) => setSaveAs(e.target.value)} placeholder="Salvar como predefinição (opcional)" className="field mr-auto max-w-xs py-1.5" />
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button type="button" disabled={selected.length === 0} onClick={() => onApply(selected, saveAs.trim() || null)} className="btn-primary">
            Aplicar
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
        {/* Métricas disponíveis */}
        <div>
          <div className="flex items-center gap-2">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar métrica" className="field py-1.5 pl-8" autoFocus />
            </label>
            <button type="button" onClick={() => setCreating(true)} className="btn-ghost py-1.5">
              <Calculator className="size-4" /> Criar métrica
            </button>
          </div>

          {creating && (
            <MetricBuilder
              columns={allColumns.filter((c) => c.group !== "Personalizadas" && !["texto", "data", "tendencia"].includes(c.format))}
              onCancel={() => setCreating(false)}
              onCreate={(m) => {
                onCreateMetric(m);
                setSelected([...selected, m.id]);
                setCreating(false);
              }}
            />
          )}

          <div className="mt-3 max-h-[46vh] space-y-4 overflow-y-auto pr-1">
            {groups.map((g) => {
              const cols = allColumns.filter((c) => c.group === g && (!filter || c.label.toLowerCase().includes(filter.toLowerCase())));
              if (cols.length === 0) return null;
              return (
                <div key={g}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{g}</p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {cols.map((c) => {
                      const on = selected.includes(c.id);
                      const custom = customMetrics.some((m) => m.id === c.id);
                      return (
                        <div key={c.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-canvas">
                          <button type="button" onClick={() => toggle(c.id)} className="flex flex-1 items-start gap-2 text-left">
                            <span className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${on ? "border-brand bg-brand text-white" : "border-line"}`}>
                              {on && <Check className="size-3" />}
                            </span>
                            <span>
                              <span className="block text-sm font-medium">{c.label}</span>
                              <span className="block text-xs leading-snug text-muted">{c.help}</span>
                            </span>
                          </button>
                          {custom && (
                            <button type="button" onClick={() => onDeleteMetric(c.id)} className="rounded p-1 text-muted hover:text-bad" aria-label={`Apagar ${c.label}`}>
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Colunas escolhidas, em ordem */}
        <div className="rounded-xl border border-line bg-canvas/50 p-3">
          <p className="text-sm font-semibold">Colunas na tabela ({selected.length})</p>
          <p className="text-xs text-muted">Use as setas para mudar a ordem.</p>
          <ul className="mt-3 max-h-[46vh] space-y-1 overflow-y-auto">
            {selected.map((id, i) => {
              const c = allColumns.find((x) => x.id === id);
              if (!c) return null;
              return (
                <li key={id} className="flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm">
                  <GripVertical className="size-3.5 text-muted" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{c.label}</span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30" aria-label="Subir">
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30" aria-label="Descer">
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => toggle(id)} className="rounded p-0.5 text-muted hover:text-bad" aria-label={`Remover ${c.label}`}>
                    <X className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function MetricBuilder({ columns, onCancel, onCreate }: { columns: Column[]; onCancel: () => void; onCreate: (m: CustomMetric) => void }) {
  const [name, setName] = useState("");
  const [a, setA] = useState(columns[0]?.id ?? "");
  const [op, setOp] = useState<Op>("/");
  const [bKind, setBKind] = useState<"coluna" | "numero">("coluna");
  const [b, setB] = useState(columns[1]?.id ?? "");
  const [bNum, setBNum] = useState("1");
  const [multiplier, setMultiplier] = useState("1");
  const [format, setFormat] = useState<CustomMetric["format"]>("decimal");

  const num = (s: string) => Number(s.replace(",", "."));
  const valid = name.trim() && a && (bKind === "coluna" ? b : Number.isFinite(num(bNum))) && Number.isFinite(num(multiplier));
  const metric: CustomMetric = {
    id: `m-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${columns.length}`,
    name: name.trim(),
    a: { kind: "coluna", id: a },
    op,
    b: bKind === "coluna" ? { kind: "coluna", id: b } : { kind: "numero", value: num(bNum) },
    multiplier: num(multiplier) || 1,
    format,
  };

  return (
    <div className="mt-3 rounded-xl border border-brand/30 bg-brand-soft/40 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <Calculator className="size-4 text-brand" /> Nova métrica personalizada
      </p>
      <p className="text-xs text-muted">Combine duas métricas (ou uma métrica e um número). Ex.: Visitas ÷ Palavras × 1.000 = visitas a cada mil palavras.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da métrica" className="field py-1.5 sm:col-span-2" />
        <select value={a} onChange={(e) => setA(e.target.value)} className="field py-1.5" aria-label="Primeira métrica">
          {columns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select value={op} onChange={(e) => setOp(e.target.value as Op)} className="field py-1.5" aria-label="Operação">
          {(Object.keys(OP_LABEL) as Op[]).map((o) => (
            <option key={o} value={o}>
              {OP_LABEL[o]}
            </option>
          ))}
        </select>
        <div className="flex gap-2 sm:col-span-2">
          <select value={bKind} onChange={(e) => setBKind(e.target.value as "coluna" | "numero")} className="field w-36 py-1.5" aria-label="Tipo do segundo valor">
            <option value="coluna">Métrica</option>
            <option value="numero">Número fixo</option>
          </select>
          {bKind === "coluna" ? (
            <select value={b} onChange={(e) => setB(e.target.value)} className="field py-1.5" aria-label="Segunda métrica">
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          ) : (
            <input value={bNum} onChange={(e) => setBNum(e.target.value)} inputMode="decimal" className="field py-1.5" aria-label="Número" />
          )}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="whitespace-nowrap text-muted">Multiplicar por</span>
          <input value={multiplier} onChange={(e) => setMultiplier(e.target.value)} inputMode="decimal" className="field py-1.5" />
        </label>
        <select value={format} onChange={(e) => setFormat(e.target.value as CustomMetric["format"])} className="field py-1.5" aria-label="Formato">
          <option value="decimal">Número com decimais</option>
          <option value="numero">Número inteiro</option>
          <option value="porcentagem">Porcentagem</option>
          <option value="moeda">Reais (R$)</option>
        </select>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost py-1.5">
          Cancelar
        </button>
        <button type="button" disabled={!valid} onClick={() => onCreate({ ...metric, id: `m-${Date.now()}` })} className="btn-primary py-1.5">
          <Plus className="size-4" /> Criar e adicionar
        </button>
      </div>
    </div>
  );
}

