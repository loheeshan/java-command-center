"use client";

import Link from "next/link";
import { CheckCircle2, Circle, FlaskConical } from "lucide-react";
import { LESSON_MAP, MODULES } from "@/content/modules";
import { CODING_TASKS } from "@/content/coding-tasks";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { Badge, Card, cn } from "@/components/ui/primitives";

export function LearnIndex() {
  const p = useProgress();
  const hydrated = useHydrated();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {MODULES.map((m) => {
        const done = m.lessons.filter((l) => p.lessons[l]?.completedAt).length;
        return (
          <Card key={m.id} className="flex flex-col p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] text-accent">MODULE {m.code}</p>
                <h2 className="text-base font-semibold text-ink">{m.title}</h2>
                <p className="text-xs text-ink-3">{m.goal}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge tone={m.priority === "P0" ? "bad" : "neutral"}>{m.priority}</Badge>
                {m.lessons.length > 0 && hydrated && <Badge tone={done === m.lessons.length ? "ok" : "neutral"}>{done}/{m.lessons.length}</Badge>}
              </div>
            </div>
            <ul className="space-y-1">
              {m.lessons.map((id) => {
                const l = LESSON_MAP[id];
                const complete = Boolean(p.lessons[id]?.completedAt);
                const task = CODING_TASKS.find((t) => t.lessonId === id);
                return (
                  <li key={id}>
                    <Link href={`/learn/${id}`} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-3">
                      {complete ? <CheckCircle2 size={15} className="shrink-0 text-ok" /> : <Circle size={15} className="shrink-0 text-ink-3" />}
                      <span className={cn("flex-1 text-sm", complete ? "text-ink-2" : "text-ink")}>{l.title}</span>
                      {task && p.coding[task.id]?.passedAt && <FlaskConical size={13} className="text-ok" aria-label="challenge solved" />}
                      <span className="font-mono text-[11px] text-ink-3">{l.minutes}m</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {m.labs && (
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {m.labs.map((lab) => (
                  <Link key={lab.href} href={lab.href} className="rounded-md border border-line px-2 py-1 text-xs text-accent hover:border-accent/50">{lab.label} →</Link>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
