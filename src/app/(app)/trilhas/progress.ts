"use client";

import { usePersistentState } from "@/lib/use-persistent";
import { epKey, PROGRESS_KEY, type Course } from "@/lib/trilhas";

/** Episódios assistidos, guardados no navegador. */
export function useProgress() {
  const [watched, setWatched] = usePersistentState<string[]>(PROGRESS_KEY, []);
  const set = new Set(watched);

  const isWatched = (c: Course, slug: string) => set.has(epKey(c.id, slug));
  const done = (c: Course) => c.episodes.filter((e) => set.has(epKey(c.id, e.slug))).length;
  const pct = (c: Course) => Math.round((done(c) / c.episodes.length) * 100);
  /** Próximo episódio não assistido (ou o primeiro, se o curso já terminou) */
  const nextEpisode = (c: Course) => c.episodes.find((e) => !set.has(epKey(c.id, e.slug))) ?? c.episodes[0];
  const toggle = (c: Course, slug: string, value?: boolean) => {
    const k = epKey(c.id, slug);
    const on = value ?? !set.has(k);
    setWatched(on ? [...watched.filter((w) => w !== k), k] : watched.filter((w) => w !== k));
  };
  /** Cursos começados e não terminados, do mais recente para o mais antigo */
  const inProgress = (courses: Course[]) => {
    const order = [...watched].reverse().map((w) => w.split("/")[0]);
    return [...new Set(order)]
      .map((id) => courses.find((c) => c.id === id))
      .filter((c): c is Course => !!c && done(c) < c.episodes.length);
  };

  return { isWatched, done, pct, nextEpisode, toggle, inProgress };
}
