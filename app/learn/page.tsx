import type { Metadata } from "next";
import { LearnIndex } from "@/components/lessons/LearnIndex";
import { PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Curriculum" };

export default function LearnPage() {
  return (
    <>
      <PageHeader eyebrow="Modules 00–10" title="Curriculum">
        Every lesson follows <span className="font-mono text-ink">understand → visualise → trace → code → experiment → quiz → apply → revise</span>. P0 lessons are exam-critical — do those first.
      </PageHeader>
      <LearnIndex />
    </>
  );
}
