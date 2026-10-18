"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowDownUp, CalendarClock, CheckCircle2, FileText, Flame, Layers, PenLine, Search, Star } from "lucide-react";
import type { ArticleStatus, Opportunity } from "@/lib/types";
import { formatDate, nf, tomorrowIso } from "@/lib/format";
import { DifficultyMeter, OpportunityBadge, StatusBadge } from "@/components/ui";
import { Popover } from "@/components/popover";
import { rescheduleArticle, toggleStar } from "./actions";
import { Hint } from "@/components/hint";
import { HELP } from "@/lib/help";

export type FolderId = "todos" | "recomendados" | "favoritos" | "agendados" | "rascunhos" | "publicados";

export type ArticleRow = {
  id: string;
  title: string;
  keyword: string | null;
  status: ArticleStatus;
  starred: boolean;
  volume: number | null;
  difficulty: number | null;
  opportunity: Opportunity | null;
  scheduled_for: string | null;
  published_at: string | null;
  word_count: number;
  updated_at: string;
};

const OPP_RANK: Record<string, number> = { alta: 3, media: 2, baixa: 1 };

const FOLDERS: { id: FolderId; label: string; icon: React.ReactNode; tint: string; filter: (r: ArticleRow) => boolean }[] = [
  { id: "todos", label: "Todos os artigos", icon: <Layers />, tint: "#005dff", filter: () => true },
  {
    id: "recomendados",
    label: "Recomendados",
    icon: <Flame />,
    tint: "#ea580c",
    // Ainda não escritos e com boa oportunidade (ou sem dado ainda, mas com palavra-chave)
    filter: (r) => ["ideia", "rascunho"].includes(r.status) && (r.opportunity === "alta" || r.opportunity === "media"),
  },
  { id: "favoritos", label: "Favoritos", icon: <Star />, tint: "#d97706", filter: (r) => r.starred },
  { id: "agendados", label: "Agendados", icon: <CalendarClock />, tint: "#7c3aed", filter: (r) => r.status === "agendado" },
  { id: "rascunhos", label: "Em produção", icon: <PenLine />, tint: "#a15c07", filter: (r) => ["ideia", "rascunho", "aprovado"].includes(r.status) },
  { id: "publicados", label: "Publicados", icon: <CheckCircle2 />, tint: "#12805c", filter: (r) => r.status === "publicado" },
];

type SortKey = "recentes" | "oportunidade" | "volume" | "dificuldade" | "data";

export function ArticlesBrowser({ rows: initialRows, initialFolder }: { rows: ArticleRow[]; initialFolder: FolderId }) {
  const [rows, setRows] = useState(initialRows);
  const [folder, setFolder] = useState<FolderId>(initialFolder);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>(initialFolder === "recomendados" ? "oportunidade" : "recentes");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const current = FOLDERS.find((f) => f.id === folder)!;
  const shown = useMemo(() => {
    const list = rows.filter(current.filter).filter((r) => !q || `${r.title} ${r.keyword ?? ""}`.toLowerCase().includes(q.toLowerCase()));
    const by: Record<SortKey, (a: ArticleRow, b: ArticleRow) => number> = {
      recentes: (a, b) => b.updated_at.localeCompare(a.updated_at),
      oportunidade: (a, b) => (OPP_RANK[b.opportunity ?? ""] ?? 0) - (OPP_RANK[a.opportunity ?? ""] ?? 0) || (b.volume ?? 0) - (a.volume ?? 0),
      volume: (a, b) => (b.volume ?? -1) - (a.volume ?? -1),
      dificuldade: (a, b) => (a.difficulty ?? 99) - (b.difficulty ?? 99),
      data: (a, b) => (a.scheduled_for ?? a.published_at ?? "9999").localeCompare(b.scheduled_for ?? b.published_at ?? "9999"),
    };
    return [...list].sort(by[sort]);
  }, [rows, current, q, sort]);

  const update = (id: string, patch: Partial<ArticleRow>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  function star(r: ArticleRow) {
    update(r.id, { starred: !r.starred });
    startTransition(async () => {
      const res = await toggleStar(r.id, !r.starred);
      if (res?.error) {
        update(r.id, { starred: r.starred });
        setError(res.error);
      }
    });
  }

  function schedule(r: ArticleRow, date: string | null) {
    const prev = { scheduled_for: r.scheduled_for, status: r.status };
    update(r.id, { scheduled_for: date, status: date ? "agendado" : r.status === "agendado" ? "aprovado" : r.status });
    startTransition(async () => {
      const res = await rescheduleArticle(r.id, date);
      if (res?.error) {
        update(r.id, prev);
        setError(res.error);
      }
    });
  }

  return (
    <>
      {/* Pastas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {FOLDERS.map((f) => {
          const count = rows.filter(f.filter).length;
          const active = f.id === folder;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFolder(f.id);
                if (f.id === "recomendados") setSort("oportunidade");
                window.history.replaceState(null, "", f.id === "todos" ? "/artigos" : `/artigos?pasta=${f.id}`);
              }}
              aria-pressed={active}
              className={`flex flex-col items-center rounded-2xl border bg-surface px-3 pb-4 pt-5 text-center transition ${
                active ? "border-brand shadow-md shadow-brand/10 ring-1 ring-brand" : "border-line hover:border-brand/40"
              }`}
            >
              <FolderGlyph tint={f.tint} icon={f.icon} open={active} peek={f.id === "todos" || active} />
              <span className="mt-3 text-sm font-semibold">{f.label}</span>
              <span className="text-xs tabular-nums text-muted">
                {count} {count === 1 ? "artigo" : "artigos"}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <section className="card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <h2 className="mr-auto font-semibold">
            {current.label} <span className="font-normal text-muted">· {shown.length}</span>
          </h2>
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar título ou palavra-chave" className="field w-64 py-1.5 pl-8" />
          </label>
          <label className="flex items-center gap-1.5 text-sm text-muted">
            <ArrowDownUp className="size-4" />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="field w-auto py-1.5" aria-label="Ordenar">
              <option value="recentes">Mais recentes</option>
              <option value="oportunidade">Maior oportunidade</option>
              <option value="volume">Maior volume</option>
              <option value="dificuldade">Menor dificuldade</option>
              <option value="data">Data de publicação</option>
            </select>
          </label>
        </div>

        {error && <p className="border-b border-line bg-bad-soft px-4 py-2 text-sm text-bad">{error}</p>}

        {shown.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <FileText className="size-8 text-muted" />
            <p className="mt-3 font-medium">{rows.length === 0 ? "Nenhum artigo ainda" : "Nada nesta pasta"}</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {folder === "recomendados"
                ? "Recomendados são ideias com oportunidade média ou alta. Elas aparecem quando as keywords tiverem dados do Google."
                : "Comece por uma pergunta que seus clientes fazem com frequência."}
            </p>
            <Link href="/artigos/novo" className="btn-primary mt-5">
              Criar artigo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="w-10 px-4 py-3" />
                  <th className="px-2 py-3 font-medium">Artigo</th>
                  <th className="px-3 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Oportunidade <Hint>{HELP.oportunidade}</Hint>
                    </span>
                  </th>
                  <th className="px-3 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Dificuldade <Hint>{HELP.dificuldade}</Hint>
                    </span>
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      Volume <Hint>{HELP.volume}</Hint>
                    </span>
                  </th>
                  <th className="px-3 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      Status <Hint>{HELP.status}</Hint>
                    </span>
                  </th>
                  <th className="px-3 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => star(r)} aria-label={r.starred ? "Remover dos favoritos" : "Favoritar"} className={r.starred ? "text-amber-500" : "text-line hover:text-amber-500"}>
                        <Star className={`size-4 ${r.starred ? "fill-current" : ""}`} />
                      </button>
                    </td>
                    <td className="max-w-[360px] px-2 py-3">
                      <Link href={`/artigos/${r.id}`} className="line-clamp-1 font-semibold hover:text-brand">
                        {r.title}
                      </Link>
                      <span className="line-clamp-1 text-xs text-muted">
                        {r.keyword ?? "sem palavra-chave"} · {nf.format(r.word_count)} palavras
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <OpportunityBadge value={r.opportunity} />
                    </td>
                    <td className="px-3 py-3">
                      <DifficultyMeter value={r.difficulty} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{r.volume != null ? nf.format(r.volume) : <span className="text-muted">—</span>}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-muted">
                      {r.status === "publicado" && r.published_at ? formatDate(r.published_at) : r.scheduled_for ? formatDate(r.scheduled_for) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "publicado" ? (
                        <Link href={`/artigos/${r.id}`} className="btn-ghost px-2.5 py-1.5 text-xs">
                          Ver
                        </Link>
                      ) : (
                        <ScheduleButton date={r.scheduled_for} onPick={(d) => schedule(r, d)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <p className="mt-3 text-xs text-muted">Volume, dificuldade e oportunidade vêm do Google pela keyword do artigo. Enquanto os dados não forem conectados, aparecem como “—”.</p>
    </>
  );
}

function ScheduleButton({ date, onPick }: { date: string | null; onPick: (d: string | null) => void }) {
  const [value, setValue] = useState(() => date ?? tomorrowIso());
  return (
    <Popover
      align="right"
      panelClassName="w-60 p-3 text-left"
      trigger={({ toggle }) => (
        <button type="button" onClick={toggle} className={date ? "btn-ghost px-2.5 py-1.5 text-xs" : "btn-primary px-2.5 py-1.5 text-xs"}>
          <CalendarClock className="size-3.5" /> {date ? "Reagendar" : "Agendar"}
        </button>
      )}
    >
      {(close) => (
        <div className="space-y-3">
          <label className="label" htmlFor="row-date">
            Publicar em
          </label>
          <input id="row-date" type="date" value={value} onChange={(e) => setValue(e.target.value)} className="field" />
          <div className="flex gap-2">
            {date && (
              <button type="button" onClick={() => (onPick(null), close())} className="btn-ghost flex-1 text-xs">
                Tirar data
              </button>
            )}
            <button type="button" disabled={!value} onClick={() => (onPick(value), close())} className="btn-primary flex-1">
              Agendar
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}

/** Pasta desenhada em SVG, com a cor e o ícone de cada grupo. */
function FolderGlyph({ tint, icon, open, peek }: { tint: string; icon: React.ReactNode; open: boolean; peek: boolean }) {
  return (
    <span className="relative block h-16 w-20" aria-hidden>
      <svg viewBox="0 0 80 64" className="absolute inset-0 h-full w-full">
        <path d="M6 10a6 6 0 0 1 6-6h18l6 6h32a6 6 0 0 1 6 6v38a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill={tint} opacity="0.35" />
        {peek && (
          <g style={{ transition: "transform 200ms" }} transform={open ? "translate(0 -4)" : undefined}>
            <rect x="16" y="12" width="44" height="30" rx="3" fill="#fff" stroke="#e3e7ef" />
            <rect x="21" y="18" width="24" height="2.5" rx="1" fill="#c9d0dc" />
            <rect x="21" y="24" width="32" height="2.5" rx="1" fill="#dde2ea" />
          </g>
        )}
        <path d="M4 24a6 6 0 0 1 6-6h60a6 6 0 0 1 6 6l-2 30a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill={tint} opacity={open ? 1 : 0.8} />
      </svg>
      <span className="absolute bottom-2 left-3 text-white [&>svg]:size-4">{icon}</span>
    </span>
  );
}
