"use client";

import Link from "next/link";
import { useRef } from "react";
import { Download, Info, RotateCcw, Upload } from "lucide-react";
import { SKILL_LABELS, type SkillGroup } from "@/lib/curriculum/types";
import { examReadiness, skillReport, weakConcepts, type Indicator } from "@/lib/progress/readiness";
import { LESSONS } from "@/content/modules";
import { QUESTIONS } from "@/content/questions";
import { progress, useHydrated, useProgress } from "@/lib/progress/store";
import { Badge, Button, Card, CardHeader, Meter, Notice } from "@/components/ui/primitives";

const SKILLS: SkillGroup[] = ["fundamentals", "oop", "collections", "exceptions", "algorithms", "spring", "rest", "exam"];

function Row({ label, ind, tone }: { label: string; ind: Indicator; tone: "accent" | "ok" | "warn" }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs"><span className="text-ink-2">{label}</span><span className="font-mono text-ink-3">{ind.denominator ? `${ind.numerator}/${ind.denominator}` : "no data"}</span></div>
      <Meter value={ind.value} tone={tone} label={label} />
      <p className="mt-0.5 text-[10.5px] text-ink-3">{ind.basis}</p>
    </div>
  );
}

const fmtMin = (ms: number) => `${Math.round(ms / 60000)} min`;

export function ProgressView() {
  const p = useProgress();
  const hydrated = useHydrated();
  const fileRef = useRef<HTMLInputElement>(null);
  if (!hydrated) return <p className="text-sm text-ink-3">Loading…</p>;

  const exam = examReadiness(p);
  const weak = weakConcepts(p, 10);
  const totalTime = Object.values(p.lessons).reduce((s, l) => s + l.timeMs, 0);
  const attempts = p.quizLog.length;
  const correct = p.quizLog.filter((x) => x.correct).length;

  const exportFile = () => {
    const blob = new Blob([progress.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `java-command-center-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-5">
      <Notice tone="accent" title="How these numbers are computed">
        There is no blended &quot;mastery %&quot;. Each skill shows four separate, auditable indicators: <strong>completion</strong> (lessons you marked complete), <strong>quiz accuracy</strong> (latest answer per attempted question), <strong>coding</strong> (challenges with every hidden test passing on the JDK) and <strong>exam-lab tests</strong> (related grader marks you have passed at least once). Empty means no evidence yet — not zero ability.
      </Notice>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SKILLS.map((s) => {
          const r = skillReport(p, s);
          return (
            <Card key={s} className="space-y-3 p-4">
              <p className="text-sm font-semibold text-ink">{SKILL_LABELS[s]}</p>
              <Row label="Completion" ind={r.completion} tone="accent" />
              <Row label="Quiz accuracy" ind={r.quizAccuracy} tone="ok" />
              <Row label="Coding challenges" ind={r.coding} tone="warn" />
              {r.examTests.denominator > 0 && <Row label="Exam-lab tests" ind={r.examTests} tone="warn" />}
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Exam readiness evidence" icon={<Info size={14} />} />
          <dl className="space-y-2 p-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-2">Exam-lab / simulator runs</dt><dd className="font-mono">{exam.attempts}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Best score (any run)</dt><dd className="font-mono">{exam.bestTotal ?? "—"}/100</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Best timed simulation</dt><dd className="font-mono">{exam.bestSimulator ?? "—"}/100</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Latest Section B</dt><dd className="font-mono">{exam.latestSectionB ?? "—"}/20</dd></div>
            <p className="pt-1 text-[11px] text-ink-3">{exam.basis}</p>
          </dl>
        </Card>
        <Card>
          <CardHeader title="Activity" />
          <dl className="space-y-2 p-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-2">Lessons completed</dt><dd className="font-mono">{LESSONS.filter((l) => p.lessons[l.id]?.completedAt).length}/{LESSONS.length}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Quiz attempts (all)</dt><dd className="font-mono">{correct}/{attempts} correct</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Distinct questions tried</dt><dd className="font-mono">{Object.keys(p.questions).length}/{QUESTIONS.length}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Coding test runs</dt><dd className="font-mono">{p.codingLog.length}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Time on lesson pages</dt><dd className="font-mono">{fmtMin(totalTime)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Greedy predictions</dt><dd className="font-mono">{p.predictions.correct}/{p.predictions.total}</dd></div>
            <p className="pt-1 text-[11px] text-ink-3">Time counts only while a lesson tab is visible, in 30-second ticks.</p>
          </dl>
        </Card>
        <Card>
          <CardHeader title="Weak concepts → revise" />
          <ul className="space-y-1 p-3">
            {weak.length === 0 ? <li className="px-1 text-sm text-ink-3">No weak concepts on record.</li> : weak.map((w) => (
              <li key={w.concept}><Link href={`/learn/${w.lessonId}#quiz`} className="flex justify-between rounded px-2 py-1 text-sm hover:bg-surface-3"><span>{w.concept}</span><Badge tone="warn">{w.correct}/{w.attempts}</Badge></Link></li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Lesson time and status" />
        <div className="overflow-x-auto p-2">
          <table className="w-full text-sm">
            <thead className="text-xs text-ink-3"><tr><th className="p-2 text-left font-medium">Lesson</th><th className="p-2 text-left font-medium">Status</th><th className="p-2 text-right font-medium">Time</th><th className="p-2 text-right font-medium">Quiz (latest right)</th></tr></thead>
            <tbody>
              {LESSONS.map((l) => {
                const lp = p.lessons[l.id];
                const right = l.quiz.filter((q) => p.questions[q]?.lastCorrect).length;
                return (
                  <tr key={l.id} className="border-t border-line">
                    <td className="p-2"><Link href={`/learn/${l.id}`} className="text-ink-2 hover:text-ink">{l.title}</Link></td>
                    <td className="p-2">{lp?.completedAt ? <Badge tone="ok">complete</Badge> : lp ? <Badge tone="accent">opened</Badge> : <Badge tone="neutral">not started</Badge>}</td>
                    <td className="p-2 text-right font-mono text-xs">{lp ? fmtMin(lp.timeMs) : "—"}</td>
                    <td className="p-2 text-right font-mono text-xs">{right}/{l.quiz.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center gap-2 p-4">
        <p className="mr-auto text-sm text-ink-2">Progress is stored locally in this browser (versioned). Export a backup before switching browsers.</p>
        <Button size="sm" onClick={exportFile}><Download size={13} /> Export</Button>
        <Button size="sm" onClick={() => fileRef.current?.click()}><Upload size={13} /> Import</Button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { progress.importJson(await f.text()); } catch { alert("That file is not a valid progress export."); } }} />
        <Button size="sm" variant="danger" onClick={() => { if (confirm("Erase ALL progress, saved code and exam attempts?")) progress.reset(); }}><RotateCcw size={13} /> Reset</Button>
      </Card>
    </div>
  );
}
