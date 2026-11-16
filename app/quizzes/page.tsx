import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizArena } from "@/components/quizzes/QuizArena";
import { PageHeader } from "@/components/ui/primitives";
import { QUESTIONS } from "@/content/questions";

export const metadata: Metadata = { title: "Quiz Arena" };

export default function QuizzesPage() {
  const types = new Set(QUESTIONS.map((q) => q.type)).size;
  return (
    <>
      <PageHeader eyebrow="Quiz Arena" title={`${QUESTIONS.length} questions · ${types} question types`}>
        Answers are graded exactly (no keyword matching for code). Predict-the-output answers can be verified on the real JDK. Wrong answers explain the misconception and return for spaced review.
      </PageHeader>
      <Suspense fallback={<p className="text-sm text-ink-3">Loading…</p>}>
        <QuizArena />
      </Suspense>
    </>
  );
}
