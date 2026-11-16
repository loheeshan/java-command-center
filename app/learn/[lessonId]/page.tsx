import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LESSONS, LESSON_MAP } from "@/content/modules";
import { LessonView } from "@/components/lessons/LessonView";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lessonId: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: LESSON_MAP[lessonId]?.title ?? "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
