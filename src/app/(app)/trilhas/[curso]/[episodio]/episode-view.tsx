"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Clapperboard, Play } from "lucide-react";
import { CoursePoster } from "@/components/course-poster";
import { getCourse } from "@/lib/trilhas";
import { useProgress } from "../../progress";

/** Converte links comuns do YouTube/Vimeo no endereço de incorporação */
function embedUrl(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

export function EpisodeView({ courseId, slug }: { courseId: string; slug: string }) {
  const course = getCourse(courseId)!;
  const index = course.episodes.findIndex((e) => e.slug === slug);
  const ep = course.episodes[index];
  const next = course.episodes[index + 1];
  const progress = useProgress();
  const watched = progress.isWatched(course, ep.slug);

  return (
    <div className="-mx-5 -mb-16 -mt-6 min-h-[calc(100vh-56px)] bg-[#07090f] px-5 pb-16 pt-6 text-white lg:-mx-8 lg:-mt-8 lg:min-h-screen lg:px-10 lg:pt-8">
      <Link href={`/trilhas/${course.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
        <ArrowLeft className="size-4" /> {course.title}
      </Link>

      <div className="mt-5 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {/* Player */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            {ep.video ? (
              <iframe
                src={embedUrl(ep.video)}
                title={ep.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : (
              <>
                <CoursePoster course={course} showTitle={false} className="absolute inset-0" />
                <div className="absolute inset-0 grid place-items-center bg-black/45 p-6 text-center">
                  <div>
                    <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur">
                      <Clapperboard className="size-7" />
                    </span>
                    <p className="mt-4 text-lg font-bold">Vídeo em produção</p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-white/70">Enquanto isso, o resumo do episódio está logo abaixo.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
            Episódio {index + 1} de {course.episodes.length} · {ep.minutes} min
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight">{ep.title}</h1>
          <p className="mt-3 max-w-3xl leading-relaxed text-white/75">{ep.summary}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => progress.toggle(course, ep.slug)}
              className={`inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition ${
                watched ? "bg-brand text-white hover:bg-brand-strong" : "bg-white/15 hover:bg-white/25"
              }`}
            >
              <Check className="size-4" /> {watched ? "Assistido" : "Marcar como assistido"}
            </button>
            {next ? (
              <Link
                href={`/trilhas/${course.id}/${next.slug}`}
                onClick={() => progress.toggle(course, ep.slug, true)}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#07090f] transition hover:bg-white/85"
              >
                Próximo episódio <ChevronRight className="size-4" />
              </Link>
            ) : (
              <Link
                href="/trilhas"
                onClick={() => progress.toggle(course, ep.slug, true)}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#07090f] transition hover:bg-white/85"
              >
                Concluir trilha <Check className="size-4" />
              </Link>
            )}
          </div>

          <section className="mt-10 max-w-3xl rounded-2xl bg-white/[0.05] p-6 ring-1 ring-white/10">
            <h2 className="font-bold">Neste episódio</h2>
            <ul className="mt-4 space-y-3">
              {ep.points.map((p) => (
                <li key={p} className="flex gap-3 text-sm leading-relaxed text-white/80">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#7fb0ff]" />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Lista de episódios */}
        <aside>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white/60">Episódios</h2>
          <ol className="mt-3 space-y-1.5">
            {course.episodes.map((e, i) => {
              const current = e.slug === ep.slug;
              const seen = progress.isWatched(course, e.slug);
              return (
                <li key={e.slug}>
                  <Link
                    href={`/trilhas/${course.id}/${e.slug}`}
                    aria-current={current ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl p-2 transition ${current ? "bg-white/[0.12] ring-1 ring-white/20" : "hover:bg-white/[0.06]"}`}
                  >
                    <div className="relative w-24 shrink-0 overflow-hidden rounded-md">
                      <CoursePoster course={course} label={String(i + 1).padStart(2, "0")} className="aspect-video" />
                      {current && (
                        <span className="absolute inset-0 grid place-items-center bg-black/40">
                          <Play className="size-5 fill-white" />
                        </span>
                      )}
                      {seen && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`line-clamp-2 text-sm leading-snug ${current ? "font-bold" : "font-medium text-white/85"}`}>{e.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
                        {e.minutes} min {seen && <Check className="size-3.5 text-[#7fb0ff]" />}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}
