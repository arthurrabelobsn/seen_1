"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Mail, MessageCircle, Search } from "lucide-react";
import { ARTICLES, CATEGORIES, categoryName, CONTATO, searchArticles, type CategoryId, type HelpArticle } from "@/lib/ajuda";
import { OPEN_CHAT } from "./chat-widget";
import { CATEGORY_STYLE } from "./category-style";


export function HelpSearch() {
  const [q, setQ] = useState("");
  const results = q.trim().length > 2 ? searchArticles(q, 6) : [];
  return (
    <div className="relative mx-auto mt-8 max-w-xl">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busque por um assunto: senha, WordPress, resultados…"
        className="h-14 w-full rounded-2xl border-0 bg-surface pl-12 pr-4 text-[15px] text-ink shadow-[0_18px_40px_-16px_rgba(0,20,80,0.6)] outline-none ring-2 ring-transparent placeholder:text-muted/80 focus:ring-white/60"
        aria-label="Buscar na central de ajuda"
      />
      {q.trim().length > 2 && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-line bg-surface text-left text-ink shadow-xl">
          {results.length ? (
            results.map((a) => (
              <Link key={a.slug} href={`/ajuda/${a.slug}`} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-canvas">
                <BookOpen className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>
                  <span className="block text-sm font-semibold">{a.title}</span>
                  <span className="block text-xs text-muted">{a.excerpt}</span>
                </span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-muted">
              Nada encontrado.{" "}
              <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT))} className="font-semibold text-brand hover:underline">
                Pergunte ao assistente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ArticleCover({ article, className = "" }: { article: HelpArticle; className?: string }) {
  const { icon: Icon, colors } = CATEGORY_STYLE[article.category];
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `radial-gradient(120% 140% at 100% 0%, ${colors[1]} 0%, ${colors[0]} 70%)` }}
    >
      <Icon className="absolute -bottom-4 -right-3 size-28 text-white/20" strokeWidth={1.2} />
      <span className="absolute left-3 top-3 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">{article.kind}</span>
    </div>
  );
}

export function ArticleCard({ article }: { article: HelpArticle }) {
  return (
    <Link href={`/ajuda/${article.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-18px_rgba(0,40,120,0.35)]">
      <ArticleCover article={article} className="aspect-[16/8]" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-brand">{categoryName(article.category)}</p>
        <h3 className="mt-1.5 font-bold leading-snug tracking-tight group-hover:text-brand">{article.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{article.excerpt}</p>
        <p className="mt-4 text-xs text-muted">{article.minutes} min de leitura</p>
      </div>
    </Link>
  );
}

const PICK_CATEGORY = "seen:categoria";

/** Cartão de categoria: rola até os artigos já filtrados */
export function CategoryLink({ id, className, children }: { id: CategoryId; className: string; children: React.ReactNode }) {
  return (
    <a href="#artigos" onClick={() => window.dispatchEvent(new CustomEvent(PICK_CATEGORY, { detail: id }))} className={className}>
      {children}
    </a>
  );
}

/** Lista de artigos com filtro por categoria */
export function ArticleBrowser() {
  const [cat, setCat] = useState<CategoryId | "todos">("todos");
  useEffect(() => {
    const on = (e: Event) => setCat((e as CustomEvent<CategoryId>).detail);
    window.addEventListener(PICK_CATEGORY, on);
    return () => window.removeEventListener(PICK_CATEGORY, on);
  }, []);
  const list = [...ARTICLES].filter((a) => cat === "todos" || a.category === cat).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {[{ id: "todos" as const, name: "Todos" }, ...CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
              cat === c.id ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </>
  );
}

export function ContactSection() {
  const cards = [
    {
      icon: MessageCircle,
      title: "Assistente da Seen",
      desc: "Respostas na hora para as dúvidas mais comuns.",
      action: (
        <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT))} className="btn-primary w-full">
          Abrir chat
        </button>
      ),
    },
    {
      icon: Mail,
      title: "E-mail",
      desc: `Fale com a equipe: ${CONTATO.email}. Respondemos em até 1 dia útil.`,
      action: (
        <a href={`mailto:${CONTATO.email}`} className="btn-ghost w-full">
          Enviar e-mail
        </a>
      ),
    },
    ...(CONTATO.whatsapp
      ? [
          {
            icon: MessageCircle,
            title: "WhatsApp",
            desc: `${CONTATO.horario}.`,
            action: (
              <a href={`https://wa.me/${CONTATO.whatsapp}`} target="_blank" rel="noreferrer" className="btn-ghost w-full">
                Chamar no WhatsApp
              </a>
            ),
          },
        ]
      : []),
  ];
  return (
    <div className={`mt-8 grid gap-5 ${cards.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {cards.map(({ icon: Icon, title, desc, action }) => (
        <div key={title} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
            <Icon className="size-5" />
          </span>
          <h3 className="mt-4 font-bold">{title}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{desc}</p>
          <div className="mt-5">{action}</div>
        </div>
      ))}
    </div>
  );
}
