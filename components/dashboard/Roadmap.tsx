"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ban, Check, CheckCircle2, Circle, SkipForward, Undo2 } from "lucide-react";
import { STUDY_PLAN, blockState, catchUpLessons, type StudyBlock } from "@/lib/scheduling/plan";
import { formatColombo } from "@/lib/exam";
import { LESSON_MAP } from "@/content/modules";
import { progress, useHydrated, useProgress } from "@/lib/progress/store";
import { Badge, Button, Card, cn, Notice } from "@/components/ui/primitives";

const DAYS: { key: StudyBlock["day"]; label: string }[] = [
  { key: "Tue", label: "Tuesday 17 November" },
  { key: "Wed", label: "Wednesday 18 November" },
  { key: "Thu", label: "Thursday 19 November" },
  { key: "Fri", label: "Friday 20 November — exam day" },
];

const TONE = { upcoming: "neutral", current: "accent", done: "ok", missed: "bad", skipped: "warn", unavailable: "neutral" } as const;
const hm = (iso: string) => formatColombo(new Date(iso), { hour: "2-digit", minute: "2-digit", hour12: false });

export function Roadmap() {
  const p = useProgress();
  const hydrated = useHydrated();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const ready = hydrated && now !== null;
  const completed = new Set(Object.keys(p.lessons).filter((id) => p.lessons[id].completedAt));
  const catchUp = ready ? catchUpLessons(now!, p.schedule, completed) : [];

  return (
    <div className="space-y-5">
      <Notice tone="accent" title="How this plan adapts">
        Times are Asia/Colombo. Mark each block <strong>done</strong> when you finish it — attendance is never assumed. Blocks that pass without being done, or that you mark as skipped/unavailable, push their unfinished lessons into the <strong>catch-up queue</strong>, which the dashboard recommends before anything else. Breaks are part of the plan.
      </Notice>

      {ready && catchUp.length > 0 && (
        <Card className="border-warn/40 p-4">
          <p className="mb-2 text-sm font-semibold text-warn">Catch-up queue ({catchUp.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {catchUp.map((id) => <Link key={id} href={`/learn/${id}`} className="rounded-md border border-warn/40 px-2 py-1 text-xs text-ink hover:bg-warn-soft">{LESSON_MAP[id].title}</Link>)}
          </div>
          <p className="mt-2 text-xs text-ink-3">Fit these into Thursday&apos;s “Analyse mistakes” and “Targeted repeat practice” blocks if you run short of time.</p>
        </Card>
      )}

      {DAYS.map((d) => (
        <section key={d.key}>
          <h2 className="mb-2 text-sm font-semibold text-ink">{d.label}</h2>
          <Card className="divide-y divide-line">
            {STUDY_PLAN.filter((b) => b.day === d.key).map((b) => {
              const st = ready ? blockState(b, now!, p.schedule[b.id]) : "upcoming";
              const passive = b.kind === "break" || b.kind === "logistics";
              return (
                <div key={b.id} className={cn("flex flex-wrap items-start gap-3 px-4 py-3", st === "current" && "bg-accent-soft/30")}>
                  <span className="w-28 shrink-0 pt-0.5 font-mono text-xs text-ink-3">{hm(b.start)}–{hm(b.end)}</span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm", passive ? "text-ink-3" : "text-ink")}>{b.title}</p>
                    {b.lessonIds.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {b.lessonIds.map((id) => (
                          <Link key={id} href={`/learn/${id}`} className="flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-2 hover:border-accent/50">
                            {completed.has(id) ? <CheckCircle2 size={11} className="text-ok" /> : <Circle size={11} className="text-ink-3" />}{LESSON_MAP[id].title.slice(0, 40)}
                          </Link>
                        ))}
                      </div>
                    )}
                    {b.href && <Link href={b.href} className="mt-1 inline-block text-xs text-accent hover:underline">Open activity →</Link>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {ready && <Badge tone={TONE[st]}>{st}</Badge>}
                    {!passive && ready && (
                      p.schedule[b.id] ? (
                        <Button size="sm" variant="ghost" onClick={() => progress.setBlock(b.id, null)} title="Clear status"><Undo2 size={12} /></Button>
                      ) : (
                        <>
                          <Button size="sm" variant="ok" onClick={() => progress.setBlock(b.id, "done")} title="Mark done"><Check size={12} /> Done</Button>
                          <Button size="sm" variant="ghost" onClick={() => progress.setBlock(b.id, "skipped")} title="I skipped this"><SkipForward size={12} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => progress.setBlock(b.id, "unavailable")} title="I'm not available at this time"><Ban size={12} /></Button>
                        </>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </section>
      ))}
    </div>
  );
}
