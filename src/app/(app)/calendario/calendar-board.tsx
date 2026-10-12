"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import type { ArticleStatus } from "@/lib/types";
import { isoDay, toDate } from "@/lib/format";
import { rescheduleArticle } from "../artigos/actions";

export type CalendarItem = {
  id: string;
  title: string;
  status: ArticleStatus;
  keyword: string | null;
  date: string | null;
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const CHIP: Record<ArticleStatus, string> = {
  ideia: "border-line bg-canvas text-muted",
  rascunho: "border-warn/25 bg-warn-soft text-warn",
  aprovado: "border-sky-200 bg-sky-50 text-sky-800",
  agendado: "border-violet-200 bg-violet-50 text-violet-800",
  publicado: "border-brand/25 bg-brand-soft text-brand-strong",
};

export function CalendarBoard({
  start,
  month,
  today,
  items: initialItems,
  backlog: initialBacklog,
}: {
  start: string;
  month: number;
  today: string;
  items: CalendarItem[];
  backlog: CalendarItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [backlog, setBacklog] = useState(initialBacklog);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const startDate = toDate(start);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d;
  });
  // Corta a última semana se ela for toda do mês seguinte
  const weeks = days.slice(35).every((d) => d.getMonth() !== month) ? days.slice(0, 35) : days;

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
    <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
      <div>
        {error && <p role="alert" className="mb-3 rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}

        <div className="card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-line bg-canvas/60 text-xs font-medium uppercase tracking-wide text-muted">
            {WEEKDAYS.map((w) => (
              <div key={w} className="px-2 py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weeks.map((d) => {
              const key = isoDay(d);
              const outside = d.getMonth() !== month;
              const dayItems = items.filter((i) => i.date === key);
              return (
                <div
                  key={key}
                  {...dropProps(key, key)}
                  className={`group min-h-28 border-b border-r border-line p-1.5 transition [&:nth-child(7n)]:border-r-0 ${
                    outside ? "bg-canvas/50" : ""
                  } ${dragOver === key ? "bg-brand-soft" : ""}`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs tabular-nums ${
                        key === today ? "bg-brand font-semibold text-white" : outside ? "text-muted/60" : "text-muted"
                      }`}
                    >
                      {d.getDate()}
                    </span>
                    <Link
                      href={`/artigos/novo?data=${key}`}
                      className="rounded p-0.5 text-muted opacity-0 transition hover:bg-canvas hover:text-ink group-hover:opacity-100 focus:opacity-100"
                      aria-label={`Criar artigo em ${d.toLocaleDateString("pt-BR")}`}
                    >
                      <Plus className="size-3.5" />
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {dayItems.map((a) => (
                      <Chip key={a.id} item={a} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Legend />
      </div>

      <aside
        {...dropProps("backlog", null)}
        className={`card self-start p-4 transition ${dragOver === "backlog" ? "border-brand bg-brand-soft" : ""}`}
      >
        <h3 className="text-sm font-semibold">Sem data</h3>
        <p className="mt-0.5 text-xs text-muted">Arraste para um dia para agendar, ou de volta para cá para tirar a data.</p>
        <div className="mt-3 space-y-1.5">
          {backlog.length === 0 && <p className="py-6 text-center text-sm text-muted">Nenhuma ideia pendente.</p>}
          {backlog.map((a) => (
            <Chip key={a.id} item={a} large />
          ))}
        </div>
      </aside>
    </div>
  );
}

function Chip({ item, large }: { item: CalendarItem; large?: boolean }) {
  const draggable = item.status !== "publicado";
  return (
    <Link
      href={`/artigos/${item.id}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      title={item.keyword ? `${item.title} · ${item.keyword}` : item.title}
      className={`block rounded-md border px-1.5 py-1 text-xs leading-snug ${CHIP[item.status]} ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${large ? "px-2 py-1.5 text-sm" : ""}`}
    >
      <span className="line-clamp-2">{item.title}</span>
    </Link>
  );
}

function Legend() {
  const entries: [ArticleStatus, string][] = [
    ["ideia", "Ideia"],
    ["rascunho", "Rascunho"],
    ["aprovado", "Aprovado"],
    ["agendado", "Agendado"],
    ["publicado", "Publicado"],
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
      {entries.map(([s, l]) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className={`size-2.5 rounded-sm border ${CHIP[s]}`} /> {l}
        </span>
      ))}
    </div>
  );
}
