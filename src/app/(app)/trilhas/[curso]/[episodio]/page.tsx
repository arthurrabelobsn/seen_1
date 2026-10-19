import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COURSES, getCourse } from "@/lib/trilhas";
import { EpisodeView } from "./episode-view";

export function generateStaticParams() {
  return COURSES.flatMap((c) => c.episodes.map((e) => ({ curso: c.id, episodio: e.slug })));
}

export async function generateMetadata({ params }: PageProps<"/trilhas/[curso]/[episodio]">): Promise<Metadata> {
  const { curso, episodio } = await params;
  return { title: getCourse(curso)?.episodes.find((e) => e.slug === episodio)?.title ?? "Trilhas" };
}

export default async function EpisodePage({ params }: PageProps<"/trilhas/[curso]/[episodio]">) {
  const { curso, episodio } = await params;
  const course = getCourse(curso);
  if (!course?.episodes.some((e) => e.slug === episodio)) notFound();
  return <EpisodeView courseId={curso} slug={episodio} />;
}
