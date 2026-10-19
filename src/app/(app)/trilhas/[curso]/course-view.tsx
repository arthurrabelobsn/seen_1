"use client";

import Link from "next/link";
import { ArrowLeft, Check, Play } from "lucide-react";
import { CoursePoster } from "@/components/course-poster";
import { COURSES, getCourse } from "@/lib/trilhas";
import { useProgress } from "../progress";
import { CourseCard, Meta, Row } from "../trilhas-home";

export function CourseView({ id }: { id: string }) {
  const course = getCourse(id)!;
  const progress = useProgress();
  const done = progress.done(course);
  const next = progress.nextEpisode(course);
  const others = COURSES.filter((c) => c.id !== course.id);

  return (
    <div className="-mx-5 -mb-16 -mt-6 min-h-[calc(100vh-56px)] bg-[#07090f] pb-16 text-white lg:-mx-8 lg:-mt-8 lg:min-h-screen">
      <section className="relative overflow-hidden">
        <CoursePoster course={course} showTitle={false} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090f] via-[#07090f]/80 to-[#07090f]/20" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#07090f] to-transparent" />
        <div className="relative px-5 pb-12 pt-6 lg:px-10 lg:pb-16 lg:pt-8">
          <Link href="/trilhas" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
            <ArrowLeft className="size-4" /> Trilhas
          </Link>
          <div className="mt-8 max-w-2xl">
            {course.badge && <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#07090f]">{course.badge}</span>}
            <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">{course.title}</h1>
            <p className="mt-3 text-lg font-medium text-white/85">{course.tagline}</p>
            <Meta course={course} className="mt-3 text-white/60" />
            <p className="mt-4 text-sm leading-relaxed text-white/70">{course.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href={`/trilhas/${course.id}/${next.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#07090f] transition hover:bg-white/85"
              >
                <Play className="size-4 fill-current" />
                {done === 0 ? "Assistir episódio 1" : done === course.episodes.length ? "Assistir de novo" : `Continuar: episódio ${course.episodes.indexOf(next) + 1}`}
              </Link>
              {done > 0 && (
                <div className="w-44">
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${progress.pct(course)}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-white/60">
                    {done} de {course.episodes.length} assistidos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 lg:px-10">
        <h2 className="text-lg font-bold tracking-tight">Episódios</h2>
        <ol className="mt-3 max-w-4xl divide-y divide-white/10 border-y border-white/10">
          {course.episodes.map((ep, i) => {
            const watched = progress.isWatched(course, ep.slug);
            return (
              <li key={ep.slug}>
                <Link href={`/trilhas/${course.id}/${ep.slug}`} className="group flex items-center gap-4 rounded-lg px-2 py-4 transition hover:bg-white/[0.06] sm:gap-5 sm:px-3">
                  <span className="hidden w-6 shrink-0 text-center text-xl font-bold text-white/50 sm:block">{i + 1}</span>
                  <div className="relative w-32 shrink-0 overflow-hidden rounded-md sm:w-40">
                    <CoursePoster course={course} label={String(i + 1).padStart(2, "0")} className="aspect-video" />
                    <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <Play className="size-6 fill-white" />
                    </span>
                    {watched && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-snug">{ep.title}</p>
                      <span className="shrink-0 text-xs text-white/55">{ep.minutes} min</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/60">{ep.summary}</p>
                    {watched && (
                      <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#7fb0ff]">
                        <Check className="size-3.5" /> Assistido
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-12">
        <Row title="Mais trilhas">
          {others.map((c) => (
            <CourseCard key={c.id} course={c} href={`/trilhas/${c.id}`} />
          ))}
        </Row>
      </div>
    </div>
  );
}
