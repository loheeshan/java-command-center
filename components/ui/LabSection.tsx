import Link from "next/link";
import type { ReactNode } from "react";
import { Lightbulb, Target } from "lucide-react";
import { Card } from "./primitives";
import { Markdown } from "@/components/content/Markdown";

/** A lab visualizer with explicit guidance: what it shows, what to try, and how it maps to the exam. */
export function LabSection({
  id,
  step,
  title,
  teaches,
  tryThis,
  exam,
  lesson,
  children,
}: {
  id: string;
  step: number;
  title: string;
  teaches: string;
  tryThis: string[];
  exam: string;
  lesson?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-16">
      <div className="grid gap-4 border-b border-line p-4 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-mono text-[11px] text-accent">STEP {step}</p>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink-2"><Markdown text={teaches} inline /></p>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-ink-3"><Target size={13} className="mt-0.5 shrink-0 text-warn" /> <span><span className="text-ink-2">In the exam:</span> {exam}</span></p>
          {lesson && <Link href={lesson.href} className="mt-2 inline-block text-xs text-accent hover:underline">Read the lesson first: {lesson.label} →</Link>}
        </div>
        <div className="rounded-lg border border-line bg-surface-2 p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink"><Lightbulb size={13} className="text-warn" /> Try this</p>
          <ol className="space-y-1 text-xs text-ink-2">
            {tryThis.map((t, i) => <li key={i}><span className="font-mono text-ink-3">{i + 1}.</span> {t}</li>)}
          </ol>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}
