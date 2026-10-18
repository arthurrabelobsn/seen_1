import type { Metadata } from "next";
import { requireSite } from "@/lib/session";
import { isoDay } from "@/lib/format";
import { excerpt } from "@/lib/content";
import type { ArticleStatus, Opportunity } from "@/lib/types";
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

export default async function CalendarPage({ searchParams }: PageProps<"/calendario">) {
  const params = await searchParams;
  // Usuário primeiro: só depois a página pode ler a data de hoje
  const { supabase, site } = await requireSite();
  const { year, month } = parseMonth(params.mes);

  // A grade mostra semanas completas, de segunda a domingo.
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const lead = (first.getDay() + 6) % 7; // segunda = 0
  const trail = 6 - ((last.getDay() + 6) % 7);
  const gridStart = new Date(year, month, 1 - lead);
  const gridEnd = new Date(year, month, last.getDate() + trail);
  const from = isoDay(gridStart);
  const to = isoDay(gridEnd);

  const cols = "id, title, status, scheduled_for, published_at, focus_keyword, content, volume, opportunity";
  const [{ data: dated }, { data: undated }] = await Promise.all([
    supabase
      .from("articles")
      .select(cols)
      .eq("site_id", site.id)
      .or(`and(scheduled_for.gte.${from},scheduled_for.lte.${to}),and(published_at.gte.${from}T00:00:00,published_at.lte.${to}T23:59:59)`),
    supabase
      .from("articles")
      .select(cols)
      .eq("site_id", site.id)
      .is("scheduled_for", null)
      .neq("status", "publicado")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  type Row = {
    id: string;
    title: string;
    status: ArticleStatus;
    scheduled_for: string | null;
    published_at: string | null;
    focus_keyword: string | null;
    content: string;
    volume: number | null;
    opportunity: Opportunity | null;
  };
  const toItem = (a: Row): CalendarItem => ({
    id: a.id,
    title: a.title,
    status: a.status,
    keyword: a.focus_keyword,
    excerpt: excerpt(a.content ?? "", 90),
    volume: a.volume ?? null,
    date: a.status === "publicado" && a.published_at ? isoDay(new Date(a.published_at)) : a.scheduled_for,
  });

  const items = ((dated ?? []) as Row[]).map(toItem);
  const backlog = ((undated ?? []) as Row[]).map(toItem);

  return (
    <CalendarBoard
      year={year}
      month={month}
      start={from}
      weeks={Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000 + 1) / 7}
      today={isoDay(new Date())}
      perWeek={site.posts_per_week}
      items={items}
      backlog={backlog}
    />
  );
}
