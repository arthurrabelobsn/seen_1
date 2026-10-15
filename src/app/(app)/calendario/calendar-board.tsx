"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Inbox,
  Plus,
  X,
} from "lucide-react";
import type { ArticleStatus } from "@/lib/types";
import { isoDay, nf, toDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui";
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

const monthKey = (y: number, m: number) => {
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function CalendarBoard({
  year,
  month,
  start,
  weeks,
  today,
  perWeek,
  items: initialItems,
  backlog: initialBacklog,
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
  const [items, setItems] = useState(initialItems);
  const [backlog, setBacklog] = useState(initialBacklog);
  const [showBacklog, setShowBacklog] = useState(false);
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
  const rawLabel = new Date(year, month, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1); // "Outubro de 2026"

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
      status: date
        ? "agendado"
        : article.status === "agendado"
          ? "aprovado"
          : article.status,
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
    <div className="flex min-h-[calc(100vh-112px)] flex-col lg:min-h-[calc(100vh-64px)]">
      {/* Cabeçalho */}
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">
            {label}
          </h1>
          <p className="text-sm text-muted">
            {inMonth} {inMonth === 1 ? "artigo" : "artigos"} neste mês · meta de{" "}
            {target} ({perWeek} por semana)
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
          <Link
            href={`/calendario?mes=${monthKey(year, month - 1)}`}
            className="rounded-md p-1.5 hover:bg-canvas"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <Link
            href="/calendario"
            className="rounded-md px-3 py-1 text-sm font-medium hover:bg-canvas"
          >
            Hoje
          </Link>
          <Link
            href={`/calendario?mes=${monthKey(year, month + 1)}`}
            className="rounded-md p-1.5 hover:bg-canvas"
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setShowBacklog((v) => !v)}
          aria-pressed={showBacklog}
          className={`btn-ghost ${showBacklog ? "border-brand text-brand" : ""}`}
        >
          <Inbox className="size-4" /> Sem data
          <span className="rounded-full bg-canvas px-1.5 text-xs tabular-nums text-muted">
            {backlog.length}
          </span>
        </button>
        <Link href="/artigos/novo" className="btn-primary">
          <Plus className="size-4" /> Criar artigo
        </Link>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad"
        >
          {error}
        </p>
      )}

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Grade */}
        <div className="card flex min-w-0 flex-1 flex-col overflow-x-auto">
          <div className="flex min-w-[840px] flex-1 flex-col">
            <div className="grid grid-cols-7 border-b border-line bg-canvas/60 text-xs font-semibold uppercase tracking-wider text-muted">
              {WEEKDAYS.map((w) => (
                <div key={w} className="px-3 py-2">
                  {w}
                </div>
              ))}
            </div>
            <div
              className="grid flex-1 grid-cols-7"
              style={{
                gridTemplateRows: `repeat(${weeks}, minmax(150px, 1fr))`,
              }}
            >
              {days.map((d) => {
                const key = isoDay(d);
                const outside = d.getMonth() !== month;
                const past = key < today;
                const dayItems = items.filter((i) => i.date === key);
                return (
                  <div
                    key={key}
                    {...dropProps(key, key)}
                    className={`group flex min-w-0 flex-col gap-1.5 border-b border-r border-line p-2 transition [&:nth-child(7n)]:border-r-0 ${
                      outside ? "bg-canvas/50" : ""
                    } ${dragOver === key ? "bg-brand-soft" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex size-7 items-center justify-center rounded-full text-sm tabular-nums ${
                          key === today
                            ? "bg-brand font-bold text-white"
                            : outside
                              ? "text-muted/50"
                              : past
                                ? "text-muted"
                                : "font-medium"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                      <Link
                        href={`/artigos/novo?data=${key}`}
                        className="rounded-md p-1 text-muted opacity-0 transition hover:bg-canvas hover:text-brand focus:opacity-100 group-hover:opacity-100"
                        aria-label={`Criar artigo em ${d.toLocaleDateString("pt-BR")}`}
                      >
                        <Plus className="size-4" />
                      </Link>
                    </div>
                    {dayItems.map((a) => (
                      <ArticleCard key={a.id} item={a} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Artigos sem data */}
        {showBacklog && (
          <aside
            {...dropProps("backlog", null)}
            className={`card fixed inset-y-4 right-4 z-40 flex w-72 shrink-0 flex-col p-4 shadow-2xl transition lg:static lg:shadow-none ${dragOver === "backlog" ? "border-brand bg-brand-soft" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-semibold">Sem data</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Arraste para um dia para agendar, ou de volta para cá para
                  tirar a data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBacklog(false)}
                className="rounded-md p-1 text-muted hover:bg-canvas"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
              {backlog.length === 0 && (
                <p className="py-8 text-center text-sm text-muted">
                  Nenhum artigo sem data.
                </p>
              )}
              {backlog.map((a) => (
                <ArticleCard key={a.id} item={a} />
              ))}
            </div>
          </aside>
        )}
      </div>

      <Legend />
    </div>
  );
}

function ArticleCard({ item }: { item: CalendarItem }) {
  const draggable = item.status !== "publicado";
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`group/card relative rounded-lg border border-line bg-surface p-2.5 shadow-sm shadow-ink/[0.03] transition hover:border-brand/40 hover:shadow-md ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <StatusBadge status={item.status} upper />
        {item.volume != null ? (
          <span
            className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] tabular-nums text-muted"
            title={`${nf.format(item.volume)} buscas por mês`}
          >
            <BarChart2 className="size-3" />
            {compact(item.volume)}
          </span>
        ) : (
          draggable && (
            <GripVertical
              className="size-3.5 text-muted opacity-0 transition group-hover/card:opacity-100"
              aria-hidden
            />
          )
        )}
      </div>
      <p
        className="mt-1.5 line-clamp-2 text-[13px] font-semibold leading-snug"
        title={item.title}
      >
        {item.title}
      </p>
      {(item.excerpt || item.keyword) && (
        <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted">
          {item.excerpt || item.keyword}
        </p>
      )}
      <Link
        href={`/artigos/${item.id}`}
        draggable={false}
        className="mt-2 inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-brand hover:underline"
      >
        <ArrowUpRight className="size-3.5" /> Ver artigo
      </Link>
    </div>
  );
}

/** 2400 → "2,4 mil" */
function compact(n: number) {
  return n >= 1000
    ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`
    : nf.format(n);
}

function Legend() {
  const entries: ArticleStatus[] = [
    "ideia",
    "rascunho",
    "aprovado",
    "agendado",
    "publicado",
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
      {entries.map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
      <span className="ml-1">Arraste os cards para mudar a data.</span>
    </div>
  );
}
