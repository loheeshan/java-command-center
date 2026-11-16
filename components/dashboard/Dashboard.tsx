"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, CalendarClock, Code2, Compass, FileCheck2, Flame, History, PlayCircle, Target, TriangleAlert } from "lucide-react";
import { countdown, colomboDateKey, EXAM_START, formatColombo, PREP_START } from "@/lib/exam";
import { LESSON_MAP, LESSON_ORDER, LESSONS, moduleOf } from "@/content/modules";
import { CODING_TASKS } from "@/content/coding-tasks";
import { QUESTIONS } from "@/content/questions";
import { STUDY_PLAN, blockState, catchUpLessons } from "@/lib/scheduling/plan";
import { weakConcepts } from "@/lib/progress/readiness";
import { JOURNEY, journeyStatus } from "@/content/journey";
import { useHydrated, useProgress } from "@/lib/progress/store";
import type { ProgressState } from "@/lib/progress/types";
import { Badge, Button, Card, CardHeader, cn } from "@/components/ui/primitives";
import { HowItWorks, Journey } from "./Journey";

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

interface Recommendation { title: string; reason: string; href: string; cta: string }

export function recommend(p: ProgressState, now: number): Recommendation {
  const completed = new Set(Object.keys(p.lessons).filter((id) => p.lessons[id].completedAt));
  const catchUp = catchUpLessons(now, p.schedule, completed);
  if (catchUp.length) {
    const l = LESSON_MAP[catchUp[0]];
    return { title: l.title, reason: `Catch-up: this lesson was scheduled in a block that has passed and is not marked complete (${catchUp.length} lesson${catchUp.length > 1 ? "s" : ""} to catch up).`, href: `/learn/${l.id}`, cta: "Catch up" };
  }
  const current = STUDY_PLAN.find((b) => blockState(b, now, p.schedule[b.id]) === "current");
  if (current) {
    const l = current.lessonIds.find((id) => !completed.has(id));
    if (l) return { title: LESSON_MAP[l].title, reason: `Scheduled now: “${current.title}”.`, href: `/learn/${l}`, cta: "Start" };
    if (current.href) return { title: current.title, reason: "This study block is happening now.", href: current.href, cta: "Open" };
  }
  const due = Object.values(p.review).filter((r) => r.dueAt <= now).length;
  if (due >= 3) return { title: `${due} questions due for review`, reason: "You answered these wrong earlier; spaced review now makes them stick.", href: "/quizzes?mode=review", cta: "Review" };
  const js = journeyStatus(p);
  if (js.currentIndex >= 0) {
    const stage = JOURNEY[js.currentIndex];
    const item = stage.items.find((i) => !i.lessonId || !completed.has(i.lessonId)) ?? stage.items[0];
    return { title: item.label, reason: `Next step on your path — stage ${js.currentIndex + 1}: ${stage.title}. Done when: ${stage.doneWhen}.`, href: item.href, cta: js.completed === 0 ? "Start here" : "Continue" };
  }
  return { title: "Repair weak areas in the Exam Lab", reason: "Re-run the mock with hints off and explain each method aloud (viva practice).", href: "/exam", cta: "Open" };
}

export function Dashboard() {
  const now = useNow();
  const hydrated = useHydrated();
  const p = useProgress();
  const ready = hydrated && now !== null;

  const c = now ? countdown(EXAM_START, new Date(now)) : null;
  const todayKey = now ? colomboDateKey(new Date(now)) : "";
  let todays = STUDY_PLAN.filter((b) => colomboDateKey(new Date(b.start)) === todayKey);
  const beforePrep = now !== null && now < PREP_START.getTime();
  if (now && todays.length === 0) {
    const next = STUDY_PLAN.find((b) => Date.parse(b.start) > now);
    if (next) todays = STUDY_PLAN.filter((b) => colomboDateKey(new Date(b.start)) === colomboDateKey(new Date(next.start)));
  }

  const completedCount = LESSONS.filter((l) => p.lessons[l.id]?.completedAt).length;
  const answered = QUESTIONS.filter((q) => p.questions[q.id]).length;
  const latestRight = QUESTIONS.filter((q) => p.questions[q.id]?.lastCorrect).length;
  const solved = CODING_TASKS.filter((t) => p.coding[t.id]?.passedAt).length;
  const best = p.exams.length ? Math.max(...p.exams.map((e) => e.total)) : null;
  const weak = weakConcepts(p, 5);
  const rec = ready ? recommend(p, now!) : null;
  const continueId = p.lastLessonId && !p.lessons[p.lastLessonId]?.completedAt ? p.lastLessonId : LESSON_ORDER.find((id) => !p.lessons[id]?.completedAt);
  const recent = [
    ...p.codingLog.map((x) => ({ at: x.at, label: CODING_TASKS.find((t) => t.id === x.taskId)?.title ?? x.taskId, value: `${x.passed}/${x.total} tests`, ok: x.passed === x.total, href: `/learn/${CODING_TASKS.find((t) => t.id === x.taskId)?.lessonId ?? ""}#challenge` })),
    ...p.exams.map((e) => ({ at: e.at, label: e.mode === "simulator" ? "Exam simulator" : "Exam lab run", value: `${e.total}/100`, ok: e.total >= 70, href: e.mode === "simulator" ? "/exam/simulator" : "/exam" })),
  ].sort((a, b) => b.at - a.at).slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="relative overflow-hidden p-5">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent">5COSC019W · Lab-Based Practical</p>
          <h1 className="mt-1 text-xl font-semibold text-ink">{formatColombo(EXAM_START, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, {formatColombo(EXAM_START, { hour: "2-digit", minute: "2-digit", hour12: false })} <span className="text-sm font-normal text-ink-3">Asia/Colombo</span></h1>
          <div className="mt-4 flex gap-3" aria-label="Countdown to the exam">
            {(c ? [["days", c.days], ["hours", c.hours], ["min", c.minutes], ["sec", c.seconds]] : [["days", "–"], ["hours", "–"], ["min", "–"], ["sec", "–"]]).map(([label, v]) => (
              <div key={label as string} className="min-w-16 rounded-lg border border-line bg-surface-2 px-3 py-2 text-center">
                <p className="font-mono text-2xl tabular-nums text-ink">{typeof v === "number" ? String(v).padStart(2, "0") : v}</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-3">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-3">
            100 min (90 solve + 10 upload) · OOP 40 · Spring Boot 40 · Functional validation 20 · viva.{" "}
            {beforePrep && <>Serious prep starts {formatColombo(PREP_START, { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })} — today, keep it light.</>}
          </p>
        </Card>

        <Card className="flex flex-col p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink"><Compass size={16} className="text-accent" /> Next recommended activity</p>
          {rec ? (
            <>
              <p className="mt-3 text-lg font-medium text-ink">{rec.title}</p>
              <p className="mt-1 text-sm text-ink-2">{rec.reason}</p>
              <Link href={rec.href} className="mt-auto pt-4"><Button variant="primary">{rec.cta} <ArrowRight size={14} /></Button></Link>
            </>
          ) : <p className="mt-3 text-sm text-ink-3">Loading your progress…</p>}
        </Card>
      </div>

      <HowItWorks compact />
      <Journey />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={todays.length && now && colomboDateKey(new Date(todays[0].start)) === todayKey ? "Today's study sessions" : `Next study day — ${todays[0] ? formatColombo(new Date(todays[0].start), { weekday: "long", day: "numeric", month: "short" }) : ""}`} icon={<CalendarClock size={15} />} action={<Link href="/roadmap" className="text-xs text-accent hover:underline">Full roadmap →</Link>} />
          <ul className="divide-y divide-line">
            {todays.map((b) => {
              const st = now ? blockState(b, now, p.schedule[b.id]) : "upcoming";
              return (
                <li key={b.id} className={cn("flex items-center gap-3 px-4 py-2", st === "current" && "bg-accent-soft/30")}>
                  <span className="w-24 shrink-0 font-mono text-xs text-ink-3">{formatColombo(new Date(b.start), { hour: "2-digit", minute: "2-digit", hour12: false })}–{formatColombo(new Date(b.end), { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                  <Link href={b.lessonIds[0] ? `/learn/${b.lessonIds[0]}` : (b.href ?? "/roadmap")} className={cn("flex-1 text-sm hover:underline", b.kind === "break" || b.kind === "logistics" ? "text-ink-3" : "text-ink")}>{b.title}</Link>
                  {ready && <Badge tone={st === "done" ? "ok" : st === "current" ? "accent" : st === "missed" ? "bad" : "neutral"}>{st}</Badge>}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Progress overview" icon={<Target size={15} />} action={<Link href="/progress" className="text-xs text-accent hover:underline">Details →</Link>} />
          <dl className="grid grid-cols-2 gap-px bg-line">
            {[
              ["Lessons complete", ready ? `${completedCount}/${LESSONS.length}` : "–"],
              ["Questions (latest right)", ready ? `${latestRight}/${answered}` : "–"],
              ["Coding tasks solved", ready ? `${solved}/${CODING_TASKS.length}` : "–"],
              ["Best mock score", ready ? (best === null ? "—" : `${best}/100`) : "–"],
            ].map(([k, v]) => (
              <div key={k} className="bg-surface p-3">
                <dt className="text-[11px] text-ink-3">{k}</dt>
                <dd className="font-mono text-lg text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="px-4 py-2 text-[11px] text-ink-3">Raw counts only — no invented mastery percentages.</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Continue learning" icon={<PlayCircle size={15} />} />
          <div className="p-4">
            {continueId ? (
              <>
                <p className="font-mono text-[11px] text-ink-3">Module {moduleOf(continueId)?.code}</p>
                <p className="text-sm font-medium text-ink">{LESSON_MAP[continueId].title}</p>
                <Link href={`/learn/${continueId}`}><Button className="mt-3" size="sm">Open lesson <ArrowRight size={13} /></Button></Link>
              </>
            ) : <p className="text-sm text-ok">All lessons complete.</p>}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
              <Link href="/playground"><Button size="sm" variant="ghost"><Code2 size={13} /> Playground</Button></Link>
              <Link href="/exam"><Button size="sm" variant="ghost"><FileCheck2 size={13} /> Exam Lab</Button></Link>
              <Link href="/quizzes"><Button size="sm" variant="ghost"><BrainCircuit size={13} /> Quiz</Button></Link>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Weak concepts" icon={<TriangleAlert size={15} />} sub="Latest answer wrong, or < 60% over 2+ attempts" />
          <ul className="space-y-1 p-3">
            {!ready ? null : weak.length === 0 ? <li className="px-1 text-sm text-ink-3">{answered ? "None right now." : "Answer some quiz questions to see this."}</li> : weak.map((w) => (
              <li key={w.concept}><Link href={`/learn/${w.lessonId}#quiz`} className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-surface-3"><span className="text-ink">{w.concept}</span><span className="font-mono text-xs text-warn">{w.correct}/{w.attempts}</span></Link></li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Recent coding attempts" icon={<History size={15} />} />
          <ul className="space-y-1 p-3">
            {!ready ? null : recent.length === 0 ? <li className="px-1 text-sm text-ink-3">No attempts yet.</li> : recent.map((r, i) => (
              <li key={i}><Link href={r.href} className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-surface-3"><span className="truncate text-ink-2">{r.label}</span><span className={cn("shrink-0 font-mono text-xs", r.ok ? "text-ok" : "text-warn")}>{r.value}</span></Link></li>
            ))}
          </ul>
          {ready && p.predictions.total > 0 && <p className="flex items-center gap-1.5 px-4 pb-3 text-[11px] text-ink-3"><Flame size={11} /> Greedy predictions: {p.predictions.correct}/{p.predictions.total} correct</p>}
        </Card>
      </div>
    </div>
  );
}
