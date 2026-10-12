import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { requireSite } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { isoDay } from "@/lib/format";
import type { ArticleStatus } from "@/lib/types";
import { CalendarBoard, type CalendarItem } from "./calendar-board";

export const metadata: Metadata = { title: "Calendário" };

function parseMonth(value: unknown) {
  const now = new Date();
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month: m - 1 };
  }
  return { year: now.getFullYear(), month: now.getMonth() };
}

const monthKey = (y: number, m: number) => {
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default async function CalendarPage({ searchParams }: PageProps<"/calendario">) {
  const params = await searchParams;
  const { year, month } = parseMonth(params.mes);
  const { supabase, site } = await requireSite();

  // A grade mostra semanas completas: do domingo antes do dia 1 ao sábado depois do último dia.
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const gridStart = new Date(year, month, 1 - first.getDay());
  const gridEnd = new Date(year, month, last.getDate() + (6 - last.getDay()));
  const from = isoDay(gridStart);
  const to = isoDay(gridEnd);

  const [{ data: dated }, { data: undated }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, status, scheduled_for, published_at, focus_keyword")
      .eq("site_id", site.id)
      .or(
        `and(scheduled_for.gte.${from},scheduled_for.lte.${to}),and(published_at.gte.${from}T00:00:00,published_at.lte.${to}T23:59:59)`,
      ),
    supabase
      .from("articles")
      .select("id, title, status, scheduled_for, published_at, focus_keyword")
      .eq("site_id", site.id)
      .is("scheduled_for", null)
      .neq("status", "publicado")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  type Row = { id: string; title: string; status: ArticleStatus; scheduled_for: string | null; published_at: string | null; focus_keyword: string | null };
  const toItem = (a: Row): CalendarItem => ({
    id: a.id,
    title: a.title,
    status: a.status,
    keyword: a.focus_keyword,
    date: a.scheduled_for ?? (a.published_at ? isoDay(new Date(a.published_at)) : null),
  });

  const items = ((dated ?? []) as Row[]).map(toItem);
  const backlog = ((undated ?? []) as Row[]).map(toItem);

  const inMonth = items.filter((i) => i.date && i.date.slice(0, 7) === monthKey(year, month)).length;
  const target = Math.round((site.posts_per_week * last.getDate()) / 7);
  const label = first.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        title="Calendário"
        description={`${inMonth} de ${target} artigos planejados para o mês · meta de ${site.posts_per_week} por semana`}
        actions={
          <Link href="/artigos/novo" className="btn-primary">
            <Plus className="size-4" /> Criar artigo
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Link href={`/calendario?mes=${monthKey(year, month - 1)}`} className="btn-ghost px-2" aria-label="Mês anterior">
          <ChevronLeft className="size-4" />
        </Link>
        <Link href={`/calendario?mes=${monthKey(year, month + 1)}`} className="btn-ghost px-2" aria-label="Próximo mês">
          <ChevronRight className="size-4" />
        </Link>
        <h2 className="ml-2 text-lg font-semibold capitalize">{label}</h2>
        <Link href="/calendario" className="ml-auto text-sm text-muted hover:text-ink">
          Hoje
        </Link>
      </div>

      <CalendarBoard
        key={`${from}:${items.map((i) => i.id + i.date).join()}:${backlog.map((b) => b.id).join()}`}
        start={from}
        month={month}
        today={isoDay(new Date())}
        items={items}
        backlog={backlog}
      />
    </>
  );
}
