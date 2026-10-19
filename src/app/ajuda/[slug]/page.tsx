import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Lightbulb } from "lucide-react";
import { ARTICLES, categoryName, getArticle, type Block } from "@/lib/ajuda";
import { ArticleCard, ArticleCover, ContactSection } from "../help-ui";
import { Feedback } from "./feedback";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ajuda/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  return a ? { title: a.title, description: a.excerpt } : {};
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function HelpArticlePage({ params }: PageProps<"/ajuda/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = ARTICLES.filter((a) => a.slug !== slug && a.category === article.category)
    .concat(ARTICLES.filter((a) => a.slug !== slug && a.category !== article.category))
    .slice(0, 3);

  return (
    <article>
      <div className="mx-auto max-w-3xl px-5 pt-10">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <Link href="/ajuda" className="hover:text-brand">
            Central de ajuda
          </Link>
          <ChevronRight className="size-4" />
          <Link href="/ajuda#artigos" className="hover:text-brand">
            {categoryName(article.category)}
          </Link>
        </nav>
        <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-[40px]">{article.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">{article.excerpt}</p>
        <p className="mt-4 text-sm text-muted">
          {article.kind} · {article.minutes} min de leitura · Atualizado em {dateFmt.format(new Date(article.date + "T12:00:00Z"))}
        </p>
        <ArticleCover article={article} className="mt-8 aspect-[16/6] rounded-2xl" />

        <div className="article-body mt-10">
          {article.body.map((b, i) => (
            <BlockView key={i} block={b} />
          ))}
        </div>

        <Feedback />
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-16">
        <h2 className="text-2xl font-black tracking-tight">Leia também</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {related.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="rounded-3xl bg-canvas p-6 sm:p-10">
          <h2 className="text-2xl font-black tracking-tight">Ainda precisa de ajuda?</h2>
          <ContactSection />
        </div>
      </section>
    </article>
  );
}

function BlockView({ block }: { block: Block }) {
  if ("h2" in block) return <h2>{block.h2}</h2>;
  if ("p" in block) return <p>{block.p}</p>;
  if ("ul" in block)
    return (
      <ul>
        {block.ul.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    );
  if ("steps" in block)
    return (
      <ol className="!list-none !pl-0">
        {block.steps.map((t, i) => (
          <li key={t} className="flex gap-3">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>
    );
  return (
    <div className="flex gap-3 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3.5 text-[15px] text-brand-strong">
      <Lightbulb className="mt-1 size-4 shrink-0" />
      <p className="!m-0">{block.tip}</p>
    </div>
  );
}
