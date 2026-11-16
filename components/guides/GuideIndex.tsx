"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { GUIDES, guideDoneKey } from "@/content/guides";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { Badge, Card, Notice } from "@/components/ui/primitives";
import { Markdown } from "@/components/content/Markdown";

export function GuideIndex() {
  const p = useProgress();
  const hydrated = useHydrated();
  const isDone = (id: string) => hydrated && p.code[guideDoneKey(id)] === "1";
  const doneCount = GUIDES.filter((g) => isDone(g.id)).length;
  const nextGuide = GUIDES.find((g) => !isDone(g.id));

  return (
    <div className="space-y-5">
      <Notice title="How to use these guides">
        Go in order: each lecture builds on the one before. For each step, read the explanation, <strong>predict</strong> what the code prints, press <strong>Run on JDK</strong>, then do the small &quot;Try this&quot; change. Finish with the viva questions out loud. Then use the lessons, quizzes and the Exam Practice projects to practise. {hydrated && <>You have finished <strong>{doneCount}/{GUIDES.length}</strong> guides.</>}
      </Notice>

      <ol className="space-y-3">
        {GUIDES.map((g, i) => {
          const done = isDone(g.id);
          const isNext = nextGuide?.id === g.id;
          return (
            <li key={g.id}>
              <Link href={`/lectures/${g.id}`} className="block">
                <Card className={`flex gap-4 p-4 transition hover:border-accent ${isNext ? "border-accent" : ""}`}>
                  <div className="mt-0.5 shrink-0">{done ? <CheckCircle2 size={20} className="text-ok" /> : <Circle size={20} className="text-ink-3" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-accent">{i + 1}. {g.week}</span>
                      <Badge tone="neutral">~{g.minutes} min</Badge>
                      {isNext && <Badge tone="accent">{doneCount === 0 ? "Start here" : "Next"}</Badge>}
                    </div>
                    <p className="mt-1 font-semibold text-ink">{g.title}</p>
                    <p className="mt-0.5 text-sm text-ink-2"><Markdown text={g.goal} inline /></p>
                    <p className="mt-1 text-xs text-ink-3">Follows: {g.lecture}</p>
                  </div>
                  <ArrowRight size={16} className="mt-1 shrink-0 text-ink-3" />
                </Card>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
