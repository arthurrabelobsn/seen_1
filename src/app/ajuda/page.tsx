import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { ARTICLES, CATEGORIES } from "@/lib/ajuda";
import { COURSES } from "@/lib/trilhas";
import { CoursePoster } from "@/components/course-poster";
import { ArticleBrowser, ArticleCard, CategoryLink, ContactSection, HelpSearch } from "./help-ui";
import { CATEGORY_STYLE } from "./category-style";

export default function HelpHome() {
  const tutorials = ARTICLES.filter((a) => a.kind === "Tutorial").slice(0, 3);

  return (
    <>
      {/* Topo com busca */}
      <section className="relative overflow-hidden bg-[#0a3ad6] text-white">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute -left-24 top-10 h-[120%] w-[60%] rounded-full bg-[#001a73] blur-[80px]" />
          <div className="absolute -right-10 -top-24 h-[90%] w-[55%] rounded-full bg-[#7cc6ff] opacity-80 blur-[90px]" />
          <div className="absolute -bottom-32 right-1/4 h-[70%] w-[50%] rounded-full bg-[#4f7dff] opacity-80 blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 text-center sm:pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Central de ajuda</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Como podemos ajudar?</h1>
          <p className="mx-auto mt-3 max-w-lg text-white/80">Tutoriais, artigos sobre SEO e GEO e uma equipe pronta para te atender.</p>
          <HelpSearch />
        </div>
      </section>

      {/* Categorias */}
      <section className="mx-auto -mt-10 max-w-6xl px-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((c) => {
            const { icon: Icon } = CATEGORY_STYLE[c.id];
            const count = ARTICLES.filter((a) => a.category === c.id).length;
            return (
              <CategoryLink key={c.id} id={c.id} className="relative rounded-2xl border border-line bg-surface p-5 shadow-[0_14px_30px_-20px_rgba(0,40,120,0.4)] transition hover:-translate-y-0.5 hover:border-brand/40">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 font-bold">{c.name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">{c.desc}</p>
                <p className="mt-3 text-xs font-semibold text-brand">
                  {count} {count === 1 ? "artigo" : "artigos"}
                </p>
              </CategoryLink>
            );
          })}
        </div>
      </section>

      {/* Tutoriais */}
      <section className="mx-auto max-w-6xl px-5 pt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Comece por aqui</h2>
            <p className="mt-1 text-muted">Os tutoriais mais usados por quem está chegando.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {tutorials.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>

      {/* Chamada para as Trilhas */}
      <section className="mx-auto max-w-6xl px-5 pt-16">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-[#07090f] p-6 text-white sm:p-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">Seen Trilhas</p>
            <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight">Prefere aprender em vídeo?</h2>
            <p className="mt-3 max-w-md leading-relaxed text-white/70">
              Mini cursos de SEO, GEO e estratégia, com episódios de poucos minutos. Assista dentro da Seen e acompanhe seu progresso.
            </p>
            <Link href="/trilhas" className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#07090f] hover:bg-white/85">
              <PlayCircle className="size-4" /> Ver as trilhas
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {COURSES.slice(0, 4).map((c) => (
              <CoursePoster key={c.id} course={c} className="aspect-video rounded-xl ring-1 ring-white/10" />
            ))}
          </div>
        </div>
      </section>

      {/* Todos os artigos */}
      <section id="artigos" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-16">
        <h2 className="text-2xl font-black tracking-tight">Blog e artigos</h2>
        <p className="mt-1 text-muted">Guias práticos sobre a Seen, SEO e GEO.</p>
        <ArticleBrowser />
      </section>

      {/* Contato */}
      <section id="contato" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <div className="rounded-3xl bg-canvas p-6 sm:p-10">
          <h2 className="text-2xl font-black tracking-tight">Ainda precisa de ajuda?</h2>
          <p className="mt-1 text-muted">Fale com a gente pelo canal que preferir.</p>
          <ContactSection />
          <Link href="/ajuda#artigos" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            Ver todos os artigos <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
