import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COURSES, getCourse } from "@/lib/trilhas";
import { CourseView } from "./course-view";

export function generateStaticParams() {
  return COURSES.map((c) => ({ curso: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/trilhas/[curso]">): Promise<Metadata> {
  const { curso } = await params;
  return { title: getCourse(curso)?.title ?? "Trilhas" };
}

export default async function CoursePage({ params }: PageProps<"/trilhas/[curso]">) {
  const { curso } = await params;
  if (!getCourse(curso)) notFound();
  return <CourseView id={curso} />;
}
