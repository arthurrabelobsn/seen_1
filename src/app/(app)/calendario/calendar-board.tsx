"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowUpRight,
  BarChart2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Inbox,
  PanelRightClose,
  PanelRightOpen,
  Plus,
} from "lucide-react";
import type { ArticleStatus } from "@/lib/types";
import { isoDay, nf, toDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui";
import { Hint } from "@/components/hint";
import { Popover } from "@/components/popover";
import { usePersistentState } from "@/lib/use-persistent";
import { rescheduleArticle } from "../artigos/actions";

export type CalendarItem = {
  id: string;
  title: string;
  status: ArticleStatus;
  keyword: string | null;
  excerpt: string;
  volume: number | null;
  date: string | null;
};

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const STATUS_BAR: Record<ArticleStatus, string> = {
  ideia: "border-l-line",
  rascunho: "border-l-warn",
  aprovado: "border-l-sky-500",
  agendado: "border-l-brand",
  publicado: "border-l-good",
};

const monthKey = (y: number, m: number) => {
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const signature = (list: CalendarItem[]) => list.map((i) => `${i.id}:${i.date}:${i.status}:${i.title}`).join("|");

export function CalendarBoard({
  year,
  month,
  start,
  weeks,
  today,
  perWeek,
  items: serverItems,
  backlog: serverBacklog,
}: {
  year: number;
  month: number;
  start: string;
  weeks: number;
  today: string;
  perWeek: number;
  items: CalendarItem[];
  backlog: CalendarItem[];
}) {
  const [items, setItems] = useState(serverItems);
  const [backlog, setBacklog] = useState(serverBacklog);
  // Quando o servidor manda dados novos, atualiza sem remontar (o painel lateral continua como estava)
  const [seen, setSeen] = useState(signature(serverItems) + "#" + signature(serverBacklog));
  const incoming = signature(serverItems) + "#" + signature(serverBacklog);
  if (incoming !== seen) {
    setSeen(incoming);
    setItems(serverItems);
    setBacklog(serverBacklog);
  }

  const [showSide, setShowSide] = usePersistentState("seen.calendario.painel", true);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const startDate = toDate(start);
  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });
  const monthPrefix = monthKey(year, month);
  const inMonth = items.filter((i) => i.date?.startsWith(monthPrefix)).length;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const target = Math.round((perWeek * daysInMonth) / 7);
  const rawLabel = new Date(year, month, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1); // "Outubro de 2026"

  const todayItems = items.filter((i) => i.date === today);
  const next = items
    .filter((i) => i.date && i.date > today && i.status !== "publicado")
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))[0];

  function move(id: string, date: string | null) {
    const all = [...items, ...backlog];
    const article = all.find((a) => a.id === id);
    if (!article || article.date === date) return;
    if (article.status === "publicado") {
      setError("Artigos publicados não podem ser reagendados.");
      return;
    }
    const prev = { items, backlog };
    const updated: CalendarItem = {
      ...article,
      date,
      status: date ? "agendado" : article.status === "agendado" ? "aprovado" : article.status,
    };
    const rest = all.filter((a) => a.id !== id);
    setItems([...rest.filter((a) => a.date), ...(date ? [updated] : [])]);
    setBacklog([...rest.filter((a) => !a.date), ...(date ? [] : [updated])]);
    setError(null);

    startTransition(async () => {
      const res = await rescheduleArticle(id, date);
      if (res?.error) {
        setItems(prev.items);
        setBacklog(prev.backlog);
        setError(res.error);
      }
    });
  }

  const dropProps = (key: string, date: string | null) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(key);
    },
    onDragLeave: () => setDragOver((k) => (k === key ? null : k)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(null);
      move(e.dataTransfer.getData("text/plain"), date);
    },
  });

  return (
    // Altura exata da tela: o mês inteiro aparece sem rolar a página
    <div className="flex min-h-[calc(100dvh-144px)] flex-col lg:h-[calc(100dvh-96px)] lg:min-h-[560px]">
      <header className="mb-3 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight">{label}</h1>
          <p className="flex items-center gap-1 text-sm text-muted">
            {inMonth} {inMonth === 1 ? "artigo" : "artigos"} neste mês · meta de {target} ({perWeek} por semana)
            <Hint>A meta vem do ritmo de publicação definido em Site → Avançado. Publicar com constância ajuda o Google a visitar seu site com mais frequência.</Hint>
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
          <Link href={`/calendario?mes=${monthKey(year, month - 1)}`} className="rounded-md p-1.5 hover:bg-canvas" aria-label="Mês anterior">
            <ChevronLeft className="size-4" />
          </Link>
          <Link href="/calendario" className="rounded-md px-3 py-1 text-sm font-medium hover:bg-canvas">
            Hoje
          </Link>
          <Link href={`/calendario?mes=${monthKey(year, month + 1)}`} className="rounded-md p-1.5 hover:bg-canvas" aria-label="Próximo mês">
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <button type="button" onClick={() => setShowSide(!showSide)} aria-pressed={showSide} className={`btn-ghost ${showSide ? "border-brand text-brand" : ""}`}>
          {showSide ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
          Hoje e sem data
          {backlog.length > 0 && <span className="rounded-full bg-canvas px-1.5 text-xs tabular-nums text-muted">{backlog.length}</span>}
        </button>
        <Link href="/artigos/novo" className="btn-primary">
          <Plus className="size-4" /> Criar artigo
        </Link>
      </header>

      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">
          {error}
        </p>
      )}

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Grade do mês */}
        <div className="card flex min-w-0 flex-1 flex-col overflow-x-auto">
          <div className="flex min-h-0 min-w-[840px] flex-1 flex-col">
            <div className="grid grid-cols-7 border-b border-line bg-canvas/60 text-xs font-semibold uppercase tracking-wider text-muted">
              {WEEKDAYS.map((w) => (
                <div key={w} className="px-3 py-1.5">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-7" style={{ gridTemplateRows: `repeat(${weeks}, minmax(104px, 1fr))` }}>
              {days.map((d) => {
                const key = isoDay(d);
                return (
                  <DayCell
                    key={key}
                    date={d}
                    dayKey={key}
                    outside={d.getMonth() !== month}
                    isToday={key === today}
                    past={key < today}
                    items={items.filter((i) => i.date === key)}
                    highlighted={dragOver === key}
                    dropProps={dropProps(key, key)}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Painel lateral: Hoje + Sem data */}
        {showSide && (
          <aside className="fixed inset-y-4 right-4 z-40 flex w-72 shrink-0 flex-col gap-3 lg:static lg:inset-auto lg:z-auto">
            <section className="card shrink-0 p-4 shadow-2xl lg:shadow-none">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-brand text-white">
                  <CalendarCheck className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold leading-tight">Hoje</h2>
                  <p className="text-xs text-muted">{cap(toDate(today).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }))}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {todayItems.length > 0 ? (
                  todayItems.map((a) => <FullCard key={a.id} item={a} />)
                ) : (
                  <div className="rounded-lg border border-dashed border-line p-3 text-center">
                    <p className="text-sm text-muted">Nenhum artigo para hoje.</p>
                    {next && (
                      <p className="mt-1 text-xs text-muted">
                        Próximo: <span className="font-medium text-ink">{toDate(next.date!).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span> ·{" "}
                        <Link href={`/artigos/${next.id}`} className="text-brand hover:underline">
                          {next.title.length > 40 ? next.title.slice(0, 40) + "…" : next.title}
                        </Link>
                      </p>
                    )}
                    <Link href={`/artigos/novo?data=${today}`} className="btn-ghost mt-2 w-full py-1.5 text-xs">
                      <Plus className="size-3.5" /> Criar para hoje
                    </Link>
                  </div>
                )}
              </div>
            </section>

            <section
              {...dropProps("backlog", null)}
              className={`card flex min-h-0 flex-1 flex-col p-4 shadow-2xl transition lg:shadow-none ${dragOver === "backlog" ? "border-brand bg-brand-soft" : ""}`}
            >
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-canvas text-muted">
                  <Inbox className="size-4" />
                </span>
                <h2 className="text-sm font-semibold">Sem data</h2>
                <span className="text-xs tabular-nums text-muted">{backlog.length}</span>
                <Hint>Artigos ainda sem dia marcado. Arraste um card para o calendário para agendar, ou de volta para cá para tirar a data.</Hint>
              </div>
              <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                {backlog.length === 0 && <p className="py-6 text-center text-sm text-muted">Nenhum artigo sem data.</p>}
                {backlog.map((a) => (
                  <FullCard key={a.id} item={a} />
                ))}
              </div>
            </section>
          </aside>
        )}
      </div>

      <Legend />
    </div>
  );
}

/* ------------------------------------------------------------------ */

const MINI_H = 46; // altura de um card compacto + espaço
const FULL_H = 132; // altura de um card completo + espaço

/** Um dia da grade. Mede o próprio tamanho e mostra só os cards que cabem, com "+N mais". */
function DayCell({
  date,
  dayKey,
  outside,
  isToday,
  past,
  items,
  highlighted,
  dropProps,
}: {
  date: Date;
  dayKey: string;
  outside: boolean;
  isToday: boolean;
  past: boolean;
  items: CalendarItem[];
  highlighted: boolean;
  dropProps: Record<string, unknown>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [space, setSpace] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSpace(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Cards completos quando a célula é alta; compactos quando é baixa
  const full = space >= FULL_H + 4;
  const unit = full ? FULL_H : MINI_H;
  const fits = space === 0 || items.length <= Math.floor(space / unit);
  // Sem espaço para todos: reserva uma linha para o "+N"
  const visible = fits ? items : items.slice(0, Math.max(0, Math.floor((space - 22) / unit)));
  const hidden = items.length - visible.length;

  return (
    <div
      {...dropProps}
      className={`group flex min-h-0 min-w-0 flex-col overflow-hidden border-b border-r border-line p-1.5 transition [&:nth-child(7n)]:border-r-0 ${
        outside ? "bg-canvas/50" : ""
      } ${highlighted ? "bg-brand-soft" : ""}`}
    >
      <div className="flex shrink-0 items-center justify-between">
        <span
          className={`flex size-6 items-center justify-center rounded-full text-[13px] tabular-nums ${
            isToday ? "bg-brand font-bold text-white" : outside ? "text-muted/50" : past ? "text-muted" : "font-medium"
          }`}
        >
          {date.getDate()}
        </span>
        <Link
          href={`/artigos/novo?data=${dayKey}`}
          className="rounded-md p-0.5 text-muted opacity-0 transition hover:bg-canvas hover:text-brand focus:opacity-100 group-hover:opacity-100"
          aria-label={`Criar artigo em ${date.toLocaleDateString("pt-BR")}`}
        >
          <Plus className="size-4" />
        </Link>
      </div>

      <div ref={ref} className="mt-1 flex min-h-0 flex-1 flex-col gap-1">
        {visible.map((a) => (full ? <FullCard key={a.id} item={a} /> : <MiniCard key={a.id} item={a} />))}
        {hidden > 0 && (
          <Popover
            panelClassName="w-72 max-h-96 overflow-y-auto p-2"
            trigger={({ toggle }) => (
              <button type="button" onClick={toggle} className="w-full rounded-md py-0.5 text-left text-xs font-semibold text-brand hover:bg-brand-soft">
                +{hidden} {hidden === 1 ? "artigo" : "artigos"}
              </button>
            )}
          >
            {() => (
              <div className="space-y-2">
                <p className="px-1 text-xs font-semibold text-muted">
                  {date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                {items.map((a) => (
                  <FullCard key={a.id} item={a} />
                ))}
              </div>
            )}
          </Popover>
        )}
      </div>
    </div>
  );
}

function dragHandlers(item: CalendarItem) {
  const draggable = item.status !== "publicado";
  return {
    draggable,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", item.id);
      e.dataTransfer.effectAllowed = "move";
    },
  };
}

/** Card compacto: cor do status + título. Usado quando o dia é baixo. */
function MiniCard({ item }: { item: CalendarItem }) {
  const drag = dragHandlers(item);
  return (
    <Link
      href={`/artigos/${item.id}`}
      {...drag}
      title={`${item.title}${item.excerpt ? ` — ${item.excerpt}` : ""}`}
      className={`block h-[42px] shrink-0 rounded-md border border-line border-l-[3px] bg-surface px-1.5 py-1 shadow-sm shadow-ink/[0.03] transition hover:border-brand/40 hover:shadow-md ${STATUS_BAR[item.status]} ${
        drag.draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <span className="line-clamp-2 text-[12px] font-semibold leading-[1.25]">{item.title}</span>
    </Link>
  );
}

/** Card completo: status, volume, título, início do texto e "Ver artigo". */
function FullCard({ item }: { item: CalendarItem }) {
  const drag = dragHandlers(item);
  return (
    <div
      {...drag}
      className={`group/card relative shrink-0 rounded-lg border border-line bg-surface p-2.5 shadow-sm shadow-ink/[0.03] transition hover:border-brand/40 hover:shadow-md ${
        drag.draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <StatusBadge status={item.status} upper />
        {item.volume != null ? (
          <span className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] tabular-nums text-muted" title={`${nf.format(item.volume)} buscas por mês`}>
            <BarChart2 className="size-3" />
            {compact(item.volume)}
          </span>
        ) : (
          drag.draggable && <GripVertical className="size-3.5 text-muted opacity-0 transition group-hover/card:opacity-100" aria-hidden />
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug" title={item.title}>
        {item.title}
      </p>
      {(item.excerpt || item.keyword) && <p className="mt-1 line-clamp-1 text-xs leading-snug text-muted">{item.excerpt || item.keyword}</p>}
      <Link href={`/artigos/${item.id}`} draggable={false} className="mt-1.5 inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-brand hover:underline">
        <ArrowUpRight className="size-3.5" /> Ver artigo
      </Link>
    </div>
  );
}

/** "domingo, 18 de outubro" → "Domingo, 18 de outubro" */
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** 2400 → "2,4 mil" */
function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : nf.format(n);
}

function Legend() {
  const entries: ArticleStatus[] = ["ideia", "rascunho", "aprovado", "agendado", "publicado"];
  return (
    <div className="mt-2 flex shrink-0 flex-wrap items-center gap-2 text-xs text-muted">
      {entries.map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
      <span className="ml-1">Arraste os cards para mudar a data.</span>
    </div>
  );
}
