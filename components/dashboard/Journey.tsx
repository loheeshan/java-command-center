"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Circle, Flag, MapPin, Trophy, X } from "lucide-react";
import { JOURNEY, journeyStatus } from "@/content/journey";
import { progress, useHydrated, useProgress } from "@/lib/progress/store";
import { Badge, Button, Card, cn } from "@/components/ui/primitives";

const GUIDE_KEY = "ui:guide-dismissed";

/** First-visit explanation of how the Command Center works. */
export function HowItWorks({ compact }: { compact?: boolean }) {
  const p = useProgress();
  const hydrated = useHydrated();
  if (!hydrated || (compact && p.code[GUIDE_KEY])) return null;
  const steps = [
    ["Follow the path below", "Stages go from first Java program to exam-ready. Each one says why it matters and exactly when it counts as done."],
    ["Inside each lesson", "Read → run the example on the real JDK → trace the output → solve the coding challenge → quiz → mark complete."],
    ["Labs = see it move", "OOP Lab, Algorithms and Spring Boot Lab are interactive visualizers. Use them while doing the matching lesson."],
    ["Exam Practice = the real thing", "Two practice projects compiled with Maven and graded by JUnit tests. Then a timed 100-minute simulation."],
  ];
  return (
    <Card className="relative border-accent/30 p-5">
      {compact && (
        <button aria-label="Hide this guide" onClick={() => progress.saveCode(GUIDE_KEY, "1")} className="absolute right-3 top-3 rounded p-1 text-ink-3 hover:bg-surface-3 hover:text-ink">
          <X size={15} />
        </button>
      )}
      <p className="font-mono text-[11px] uppercase tracking-widest text-accent">New here? Read this first</p>
      <h2 className="mt-1 text-lg font-semibold text-ink">How the Command Center works</h2>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="rounded-lg border border-line bg-surface-2 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-ink"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] text-accent">{i + 1}</span>{t}</p>
            <p className="mt-1 text-xs text-ink-2">{d}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-ink-3">
        The green dot top-right means the Java runner is on. If it is red, run <code className="font-mono text-ink-2">npm run dev</code> — code is never pretended to run.
      </p>
    </Card>
  );
}

export function Journey() {
  const p = useProgress();
  const hydrated = useHydrated();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const st = journeyStatus(p);
  const current = st.currentIndex === -1 ? null : JOURNEY[st.currentIndex];
  const nextItem = current?.items.find((i) => !i.lessonId || !p.lessons[i.lessonId]?.completedAt) ?? current?.items[0];
  const visible = showAll ? JOURNEY : JOURNEY.filter((_, i) => st.currentIndex === -1 || Math.abs(i - st.currentIndex) <= 2 || i === JOURNEY.length - 1 || i === 0);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-ink"><Flag size={15} className="text-accent" /> Your path: start → exam-ready</p>
          <p className="text-xs text-ink-3">{JOURNEY.length} stages, in order. Times follow the study plan (Asia/Colombo).</p>
        </div>
        {hydrated && (
          <div className="flex items-center gap-3">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={st.completed} aria-valuemax={JOURNEY.length}>
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(st.completed / JOURNEY.length) * 100}%` }} />
            </div>
            <span className="font-mono text-xs text-ink-2">{st.completed}/{JOURNEY.length} stages</span>
          </div>
        )}
      </div>

      {hydrated && (st.finished ? (
        <div className="flex items-center gap-3 bg-ok-soft/40 px-5 py-4">
          <Trophy size={20} className="text-ok" />
          <p className="text-sm text-ink">Every stage is done. Keep the build green, sleep well, and explain your code calmly in the viva.</p>
        </div>
      ) : current && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-accent-soft/30 px-5 py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-accent"><MapPin size={13} /> You are here — stage {st.currentIndex + 1}</p>
            <p className="text-base font-semibold text-ink">{current.title}</p>
            <p className="text-xs text-ink-2">{current.why}</p>
          </div>
          {nextItem && (
            <Link href={nextItem.href}><Button variant="primary">{st.completed === 0 && st.currentIndex === 0 ? "Start here" : "Continue"}: {nextItem.label} <ArrowRight size={14} /></Button></Link>
          )}
        </div>
      ))}

      <ol className="relative px-5 py-4">
        {visible.map((s) => {
          const i = JOURNEY.indexOf(s);
          const done = hydrated && st.done[i];
          const isCurrent = hydrated && i === st.currentIndex;
          const open = expanded === s.id || (expanded === null && isCurrent);
          const prevHidden = !showAll && i > 0 && !visible.includes(JOURNEY[i - 1]);
          return (
            <li key={s.id}>
              {prevHidden && <p className="mb-2 ml-8 text-xs text-ink-3">⋮</p>}
              <div className="flex gap-3 pb-3">
                <div className="flex flex-col items-center">
                  {done ? <CheckCircle2 size={20} className="text-ok" /> : isCurrent ? <span className="pulse-ring flex h-5 w-5 items-center justify-center rounded-full bg-accent"><span className="h-2 w-2 rounded-full bg-slate-950" /></span> : <Circle size={20} className="text-line-strong" />}
                  {i < JOURNEY.length - 1 && <span className={cn("mt-1 w-px flex-1", done ? "bg-ok/50" : "bg-line")} />}
                </div>
                <div className="min-w-0 flex-1">
                  <button onClick={() => setExpanded(open ? "" : s.id)} className="flex w-full flex-wrap items-center gap-2 text-left">
                    <span className="font-mono text-[11px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("text-sm font-medium", done ? "text-ink-2" : isCurrent ? "text-ink" : "text-ink-2")}>{s.title}</span>
                    <Badge tone="neutral">{s.when}</Badge>
                    <span className="font-mono text-[11px] text-ink-3">~{Math.round(s.minutes / 5) * 5} min</span>
                    {open ? <ChevronUp size={13} className="text-ink-3" /> : <ChevronDown size={13} className="text-ink-3" />}
                  </button>
                  {open && (
                    <div className="mt-2 rounded-lg border border-line bg-surface-2 p-3">
                      <p className="text-xs text-ink-2">{s.why}</p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {s.items.map((it) => {
                          const itemDone = it.lessonId ? Boolean(p.lessons[it.lessonId]?.completedAt) : false;
                          return (
                            <li key={it.href}>
                              <Link href={it.href} className={cn("flex items-center gap-1 rounded-md border px-2 py-1 text-xs", itemDone ? "border-ok/40 text-ink-2" : "border-line text-accent hover:border-accent/50")}>
                                {it.lessonId && (itemDone ? <CheckCircle2 size={11} className="text-ok" /> : <Circle size={11} />)} {it.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-2 text-[11px] text-ink-3">Done when: {s.doneWhen}.</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        <li className="flex items-center gap-3 pl-0.5">
          <Trophy size={18} className={st.finished ? "text-ok" : "text-ink-3"} />
          <span className="text-sm text-ink-2">Finish: Lab-Based Practical — Fri 20 Nov, 13:30</span>
        </li>
      </ol>
      <div className="border-t border-line px-5 py-2">
        <button onClick={() => setShowAll((v) => !v)} className="text-xs text-accent hover:underline">{showAll ? "Show fewer stages" : `Show all ${JOURNEY.length} stages`}</button>
      </div>
    </Card>
  );
}
