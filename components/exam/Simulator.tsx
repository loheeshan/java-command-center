"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlarmClock, BookOpen, Loader2, PlayCircle, Send, ShieldAlert } from "lucide-react";
import type { ProjectTestResponse, TestCaseResult } from "@/runner/protocol";
import { EXAM_DURATION_MIN, EXAM_SUBMIT_WINDOW_MIN, formatClock } from "@/lib/exam";
import { scoreProject } from "@/lib/assessment/dispatch-rubric";
import { PROJECTS, PROJECT_LIST, isProjectId, type ProjectId } from "@/lib/projects/registry";
import { LESSON_MAP } from "@/content/modules";
import { testProject, RunnerError } from "@/lib/execution/client";
import { progress, useHydrated, useProgress } from "@/lib/progress/store";
import { Badge, Button, Card, cn, Notice, PageHeader } from "@/components/ui/primitives";
import { ExamIDE, ResultsPanel } from "./ExamIDE";

const DURATION_MS = EXAM_DURATION_MIN * 60_000;

export function Simulator({ starters, initialProject }: { starters: Record<ProjectId, Record<string, string>>; initialProject?: string }) {
  const p = useProgress();
  const hydrated = useHydrated();
  const session = p.simulator;
  const [choice, setChoice] = useState<ProjectId>(isProjectId(initialProject) ? initialProject : "tickets");
  const project = PROJECTS[session && isProjectId(session.projectId) ? session.projectId : session ? "dispatch" : choice];
  const starter = starters[project.id];
  const wsKey = project.id === "dispatch" ? "sim" : `sim-${project.id}`;
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [final, setFinal] = useState<ProjectTestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = session ? DURATION_MS - (now - session.startedAt) : DURATION_MS;
  const running = Boolean(session && !session.submittedAt);

  async function submit() {
    if (!session || submitting) return;
    setSubmitting(true);
    setError(null);
    // let the editor's 600 ms autosave flush, then read the live workspace
    await new Promise((r) => setTimeout(r, 800));
    const files = progress.getWorkspace(wsKey) ?? starter;
    try {
      const r = await testProject(project.id, files);
      const s = scoreProject(project.rubric, r.tests);
      setFinal(r);
      progress.recordExam({
        id: crypto.randomUUID(), mode: "simulator", projectId: project.id, at: Date.now(), sectionA: s.sectionA, sectionB: s.sectionB, total: s.total,
        results: Object.fromEntries(r.tests.map((t) => [t.name, t.status])), durationMs: Date.now() - session.startedAt, compileOk: r.compile.ok,
      });
      progress.submitSimulator();
    } catch (e) {
      setError(e instanceof RunnerError && e.offline ? "The Java runner is offline, so your submission could not be marked. Start it (npm run runner) and press Submit again — your timer and code are saved." : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  // auto-submit when time runs out
  useEffect(() => {
    if (running && remaining <= 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      void submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remaining]);

  if (!hydrated) return <p className="text-sm text-ink-3">Loading…</p>;

  if (!session) {
    const sims = p.exams.filter((e) => e.mode === "simulator");
    return (
      <>
        <PageHeader eyebrow="Module 09 · Full exam simulator" title="100-minute timed practice" />
        <Notice tone="warn" className="mb-4" title="Practice simulation — not a prediction of the actual examination.">Choose a paper below. The Ticketing paper follows the shape Lecture 6 describes for the real exam; Dispatch is the university&apos;s own mock.</Notice>
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          {PROJECT_LIST.map((pr) => (
            <button key={pr.id} onClick={() => setChoice(pr.id)} className={cn("rounded-xl border p-4 text-left", choice === pr.id ? "border-accent bg-accent-soft/40" : "border-line bg-surface hover:border-line-strong")}>
              <p className="font-medium text-ink">{pr.title} <Badge tone={pr.origin === "university" ? "accent" : "violet"}>{pr.origin === "university" ? "university mock" : "real-paper shape"}</Badge></p>
              <p className="mt-1 text-xs text-ink-2">{pr.description}</p>
              <p className="mt-1 font-mono text-[11px] text-ink-3">{pr.tasks.filter((t) => t.id !== "sectionB").map((t) => t.marks).join(" + ")} + 20 (Section B) · {pr.testCount} tests</p>
            </button>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-2 font-semibold text-ink">Conditions (mirroring Lecture 6&apos;s briefing)</h2>
            <ul className="space-y-1.5 text-sm text-ink-2">
              <li>• {EXAM_DURATION_MIN} minutes. The last {EXAM_SUBMIT_WINDOW_MIN} are the submission window — stop coding at 1:30.</li>
              <li>• You start from the untouched starter project. Tasks 1–4 + Section B.</li>
              <li>• No hints and no reference solution. Lessons and docs are allowed (open book) — but no AI.</li>
              <li>• &quot;Compile &amp; run tests&quot; shows the build and Section B behaviour (what Swagger would show you). Section A marks appear after you submit.</li>
              <li>• The timer keeps running if you refresh or close the tab; your code is saved.</li>
              <li>• When time runs out your work is submitted automatically.</li>
            </ul>
            <Button variant="primary" className="mt-4" onClick={() => { progress.saveWorkspace(wsKey, { ...starter }); progress.startSimulator(project.id); }}>
              <PlayCircle size={15} /> Start the 100-minute timer — {project.short}
            </Button>
          </Card>
          <Card className="p-5">
            <h2 className="mb-2 font-semibold text-ink">Previous attempts</h2>
            {sims.length === 0 ? <p className="text-sm text-ink-3">None yet. The study plan schedules this for Thursday 15:00–16:40.</p> : (
              <table className="w-full text-sm">
                <thead className="text-xs text-ink-3"><tr><th className="text-left font-medium">When</th><th className="text-left font-medium">Paper</th><th className="text-right font-medium">A /80</th><th className="text-right font-medium">B /20</th><th className="text-right font-medium">Total</th><th className="text-right font-medium">Time</th></tr></thead>
                <tbody>
                  {sims.slice().reverse().map((e) => (
                    <tr key={e.id} className="border-t border-line">
                      <td className="py-1 text-ink-2">{new Date(e.at).toLocaleString("en-GB", { timeZone: "Asia/Colombo", dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="text-ink-3">{PROJECTS[isProjectId(e.projectId) ? e.projectId : "dispatch"].short.split(" ")[0]}</td>
                      <td className="text-right font-mono">{e.sectionA}</td><td className="text-right font-mono">{e.sectionB}</td>
                      <td className="text-right font-mono text-ink">{e.total}</td><td className="text-right font-mono text-ink-3">{e.durationMs ? formatClock(e.durationMs) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </>
    );
  }

  if (session.submittedAt) {
    const last = p.exams.filter((e) => e.mode === "simulator" && (e.projectId ?? "dispatch") === project.id).at(-1);
    const tests: TestCaseResult[] = final?.tests ?? Object.entries(last?.results ?? {}).map(([name, status]) => ({ name, className: "", status: status as TestCaseResult["status"], durationMs: 0 }));
    const score = scoreProject(project.rubric, tests);
    const failedTasks = score.tasks.filter((t) => t.earned < t.marks);
    return (
      <>
        <PageHeader eyebrow="Simulation report" title={`Score: ${score.total}/100`} actions={<Button variant="primary" onClick={() => { progress.clearSimulator(); setFinal(null); autoSubmitted.current = false; }}><PlayCircle size={14} /> New attempt</Button>}>
          Time used: <span className="font-mono text-ink">{formatClock(session.submittedAt - session.startedAt)}</span> of {EXAM_DURATION_MIN}:00 · Section A (automated proxy) <span className="font-mono text-ink">{score.sectionA}/80</span> · Section B <span className="font-mono text-ink">{score.sectionB}/20</span>
          {last && !last.compileOk && <span className="text-bad"> · the project did not compile</span>}
        </PageHeader>
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          {final ? <ResultsPanel project={project} result={final} score={score} showScores /> : (
            <Card className="p-4 text-sm text-ink-2">
              {score.tasks.map((t) => <p key={t.id} className="flex justify-between border-b border-line py-1"><span>{t.title}</span><span className="font-mono">{t.earned}/{t.marks}</span></p>)}
              <p className="mt-2 text-xs text-ink-3">Detailed failure messages are shown right after submitting. Your saved code is still in the &quot;sim&quot; workspace until you start a new attempt.</p>
            </Card>
          )}
          <Card className="h-fit p-4">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><BookOpen size={15} className="text-accent" /> Review plan</h2>
            {failedTasks.length === 0 ? <p className="text-sm text-ok">Every test passed. Now practise explaining each method aloud for the viva.</p> : (
              <ul className="space-y-3 text-sm">
                {failedTasks.map((t) => {
                  const pt = project.tasks.find((x) => x.id === t.id)!;
                  return (
                    <li key={t.id}>
                      <p className="text-ink">{t.title} <span className="font-mono text-xs text-warn">−{t.marks - t.earned}</span></p>
                      <p className="text-xs text-ink-3">Missed: {t.items.filter((i) => i.earned === 0).map((i) => i.label.split(" ")[0]).join(", ")}</p>
                      <div className="mt-1 flex flex-wrap gap-1">{pt.lessons.map((l) => <Link key={l} href={`/learn/${l}`} className="rounded border border-line px-1.5 py-0.5 text-xs text-accent hover:border-accent/50">{LESSON_MAP[l]?.title.slice(0, 32)}</Link>)}</div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link href={project.href} className="mt-3 block text-xs text-accent hover:underline">Repair it in the guided Exam Lab (hints + reference) →</Link>
          </Card>
        </div>
      </>
    );
  }

  const inWindow = remaining <= EXAM_SUBMIT_WINDOW_MIN * 60_000;
  const elapsedPct = Math.min(1, (DURATION_MS - remaining) / DURATION_MS);

  return (
    <>
      <div className={cn("sticky top-12 z-10 -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6", inWindow ? "border-warn/40 bg-warn-soft/80" : "border-line bg-bg/90")}>
        <div className="flex items-center gap-3">
          <AlarmClock size={18} className={inWindow ? "text-warn" : "text-accent"} />
          <span className={cn("font-mono text-2xl tabular-nums", remaining < 5 * 60_000 ? "text-bad" : inWindow ? "text-warn" : "text-ink")} role="timer" aria-live="off">{formatClock(Math.max(0, remaining))}</span>
          <div className="hidden h-1.5 w-40 overflow-hidden rounded-full bg-surface-3 sm:block"><div className="h-full bg-accent" style={{ width: `${elapsedPct * 100}%` }} /></div>
          {inWindow && <Badge tone="warn"><ShieldAlert size={11} /> submission window — stop coding, check, submit</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">hints off · reference locked</Badge>
          <Button variant="primary" onClick={() => { if (confirm("Submit now? Your project will be built and marked.")) void submit(); }} disabled={submitting}>
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {submitting ? "Marking…" : "Submit"}
          </Button>
        </div>
      </div>
      {error && <Notice tone="bad" className="mb-3">{error}</Notice>}
      {remaining <= 0 && submitting && <Notice tone="warn" className="mb-3">Time is up — submitting automatically…</Notice>}
      <p className="mb-3 text-xs text-ink-3">Practice simulation — not a prediction of the actual examination. {project.title}. Marking: {project.rubric.length - 1} Section A tasks + Section B, from {project.testCount} grader tests.</p>
      <ExamIDE projectId={project.id} mode="simulator" starter={starter} workspaceKey={wsKey} locked={remaining <= 0 || submitting} />
    </>
  );
}
