"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Clock, Play, PlayCircle } from "lucide-react";
import { CoursePoster } from "@/components/course-poster";
import { COURSES, courseMinutes, FEATURED_ID, getCourse, ROWS, type Course } from "@/lib/trilhas";
import { useProgress } from "./progress";

export function TrilhasHome() {
  const progress = useProgress();
  const featured = getCourse(FEATURED_ID)!;
  const continuing = progress.inProgress(COURSES);
  const next = progress.nextEpisode(featured);
  const started = progress.done(featured) > 0;

  return (
    <div className="-mx-5 -mb-16 -mt-6 min-h-[calc(100vh-56px)] bg-[#07090f] pb-16 text-white lg:-mx-8 lg:-mt-8 lg:min-h-screen">
      {/* Destaque */}
      <section className="relative overflow-hidden">
        <CoursePoster course={featured} showTitle={false} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090f] via-[#07090f]/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07090f] to-transparent" />
        <div className="relative max-w-2xl px-5 pb-16 pt-12 lg:px-10 lg:pb-20 lg:pt-16">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">Seen Trilhas · Em destaque</p>
          <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">{featured.title}</h1>
          <p className="mt-3 text-lg font-medium text-white/85">{featured.tagline}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">{featured.description}</p>
          <Meta course={featured} className="mt-4 text-white/60" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/trilhas/${featured.id}/${next.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#07090f] transition hover:bg-white/85"
            >
              <Play className="size-4 fill-current" /> {started ? "Continuar" : "Assistir"}
            </Link>
            <Link
              href={`/trilhas/${featured.id}`}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white/15 px-5 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
            >
              Ver episódios
            </Link>
          </div>
        </div>
      </section>

      <div className="relative -mt-6 space-y-10">
        {continuing.length > 0 && (
          <Row title="Continuar assistindo">
            {continuing.map((c) => (
              <CourseCard key={c.id} course={c} href={`/trilhas/${c.id}/${progress.nextEpisode(c).slug}`} continueLabel={progress.nextEpisode(c).title} />
            ))}
          </Row>
        )}
        {ROWS.map((row) => (
          <Row key={row.title} title={row.title}>
            {row.ids.map((id) => {
              const c = getCourse(id);
              return c ? <CourseCard key={id} course={c} href={`/trilhas/${c.id}`} /> : null;
            })}
          </Row>
        ))}
      </div>
    </div>
  );
}

export function Meta({ course, className = "" }: { course: Course; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium ${className}`}>
      <span>{course.level}</span>
      <span aria-hidden>•</span>
      <span>{course.episodes.length} episódios</span>
      <span aria-hidden>•</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" /> {courseMinutes(course)} min
      </span>
    </p>
  );
}

/** Fileira com rolagem horizontal e setas (como na Netflix). */
export function Row({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <section className="group/row relative">
      <h2 className="px-5 text-lg font-bold tracking-tight lg:px-10">{title}</h2>
      <div
        ref={ref}
        className="mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:scroll-px-10 lg:gap-4 lg:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Voltar"
        className="absolute bottom-10 left-0 top-10 hidden w-10 place-items-center bg-gradient-to-r from-[#07090f] to-transparent opacity-0 transition group-hover/row:opacity-100 lg:grid"
      >
        <ChevronLeft className="size-7" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Avançar"
        className="absolute bottom-10 right-0 top-10 hidden w-10 place-items-center bg-gradient-to-l from-[#07090f] to-transparent opacity-0 transition group-hover/row:opacity-100 lg:grid"
      >
        <ChevronRight className="size-7" />
      </button>
    </section>
  );
}

export function CourseCard({ course, href, continueLabel }: { course: Course; href: string; continueLabel?: string }) {
  const progress = useProgress();
  const pct = progress.pct(course);
  return (
    <Link href={href} className="group/card w-[260px] shrink-0 snap-start sm:w-[300px]">
      <div className="relative overflow-hidden rounded-xl ring-1 ring-white/10 transition duration-300 group-hover/card:-translate-y-1 group-hover/card:ring-white/40 group-hover/card:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)]">
        <CoursePoster course={course} className="aspect-video transition duration-500 group-hover/card:scale-[1.04]" />
        <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition group-hover/card:opacity-100">
          <PlayCircle className="size-12 drop-shadow" strokeWidth={1.4} />
        </span>
        {pct > 0 && (
          <span className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <span className="block h-full bg-brand" style={{ width: `${pct}%` }} />
          </span>
        )}
      </div>
      <p className="mt-2.5 truncate text-sm font-semibold">{continueLabel ?? course.tagline}</p>
      <p className="mt-0.5 text-xs text-white/55">
        {continueLabel ? `${course.title} · ${pct}% concluído` : `${course.episodes.length} episódios · ${courseMinutes(course)} min · ${course.level}`}
      </p>
    </Link>
  );
}
