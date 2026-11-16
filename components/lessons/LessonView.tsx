"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookMarked, CheckCircle2, Circle, Code2, Eye, FileCheck2, GitCompare, Lightbulb,
  ListChecks, Loader2, Play, PlayCircle, Puzzle, Route, Sparkles, Target,
} from "lucide-react";
import type { Lesson } from "@/lib/curriculum/types";
import { LESSON_MAP, moduleOf, nextLesson, prevLesson } from "@/content/modules";
import { QUESTION_MAP } from "@/content/questions";
import { CODING_TASKS } from "@/content/coding-tasks";
import { VIDEOS, chapterRange } from "@/content/videos";
import { normaliseOutput } from "@/lib/quiz/engine";
import { progress, useProgress } from "@/lib/progress/store";
import { runJava, RunnerError } from "@/lib/execution/client";
import { Badge, Button, Card, cn } from "@/components/ui/primitives";
import { Markdown } from "@/components/content/Markdown";
import { CodeBlock } from "@/components/content/CodeBlock";
import { CodeRunner } from "@/components/playground/CodeRunner";
import { CodingTaskRunner } from "./CodingTaskRunner";
import { QuestionCard } from "@/components/quizzes/QuestionCard";
import { Visualizer } from "@/components/visualizers";

const SOURCE_TONE = { university: "accent", "mock-paper": "warn", supplemental: "violet", advanced: "neutral" } as const;
const SOURCE_LABEL = { university: "University material", "mock-paper": "Mock paper", supplemental: "Supplemental", advanced: "Optional / advanced" } as const;

function Section({ id, n, title, icon, children }: { id: string; n: number; title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16">
      <h2 className="mb-2.5 flex items-center gap-2 text-base font-semibold text-ink">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-3 font-mono text-[11px] text-ink-3">{n}</span>
        <span className="text-accent">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function TraceExercise({ lesson }: { lesson: Lesson }) {
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [real, setReal] = useState<{ busy: boolean; out?: string; err?: string }>({ busy: false });
  const correct = revealed && normaliseOutput(guess) === normaliseOutput(lesson.trace.output);

  async function verify() {
    setReal({ busy: true });
    try {
      const r = await runJava({ files: [{ name: "Main.java", content: lesson.trace.code }] });
      setReal({ busy: false, out: r.compile.ok ? r.run?.stdout ?? "" : r.compile.raw });
    } catch (e) {
      setReal({ busy: false, err: e instanceof RunnerError && e.offline ? "Runner offline — start it to verify on the JDK." : String(e) });
    }
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <CodeBlock code={lesson.trace.code} lineNumbers />
      <div className="space-y-2">
        <p className="text-sm text-ink-2">Trace the code line by line on paper. What exactly does it print?</p>
        <textarea value={guess} onChange={(e) => setGuess(e.target.value)} disabled={revealed} rows={4} placeholder="Your predicted output…" aria-label="Predicted output" className="w-full rounded-lg border border-line bg-[#0a0e15] p-2.5 font-mono text-sm text-ink outline-none focus:border-accent/60" />
        <div className="flex flex-wrap gap-2">
          {!revealed ? (
            <Button variant="primary" onClick={() => setRevealed(true)} disabled={!guess.trim()}>Check my trace</Button>
          ) : (
            <Button variant="ghost" onClick={() => { setRevealed(false); setGuess(""); setReal({ busy: false }); }}>Try again</Button>
          )}
          <Button variant="ghost" onClick={verify} disabled={real.busy}>{real.busy ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run it on the JDK</Button>
        </div>
        {revealed && (
          <div className={cn("rounded-lg border p-3 text-sm", correct ? "border-ok/40 bg-ok-soft/50" : "border-warn/40 bg-warn-soft/50")}>
            <p className="mb-1 font-medium text-ink">{correct ? "Exactly right." : "Not quite — expected:"}</p>
            {!correct && <pre className="mb-2 font-mono text-xs text-ok">{lesson.trace.output}</pre>}
            <Markdown text={lesson.trace.explanation} />
          </div>
        )}
        {real.out !== undefined && <pre className="rounded-lg border border-line bg-[#06090f] p-2.5 font-mono text-xs text-ink">{real.out}<span className="block text-[10px] text-ok">↑ actual JDK output</span></pre>}
        {real.err && <p className="text-xs text-warn">{real.err}</p>}
      </div>
    </div>
  );
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const p = useProgress();
  const mod = moduleOf(lesson.id);
  const next = nextLesson(lesson.id);
  const prev = prevLesson(lesson.id);
  const done = Boolean(p.lessons[lesson.id]?.completedAt);
  const [showModel, setShowModel] = useState(false);
  const task = lesson.challenge && "taskId" in lesson.challenge ? CODING_TASKS.find((t) => t.id === (lesson.challenge as { taskId: string }).taskId) : undefined;
  const answered = lesson.quiz.filter((q) => p.questions[q]).length;

  // record open + active time (counts only while the tab is visible)
  useEffect(() => {
    progress.openLesson(lesson.id);
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      if (document.visibilityState === "visible") progress.addLessonTime(lesson.id, now - last);
      last = now;
    };
    const t = setInterval(tick, 30_000);
    return () => {
      clearInterval(t);
      tick();
    };
  }, [lesson.id]);

  const toc = [
    ["what", "What & why"], ["compare", "Compare"], ["syntax", "Syntax"], ["example", "Run it"], ["visual", "Visual"], ["trace", "Trace"],
    ["challenge", "Challenge"], ["mistakes", "Mistakes"], ["quiz", "Quiz"], ["exam", "Exam question"], ["summary", "Summary"],
  ].filter(([id]) => id !== "visual" || lesson.visual);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_200px]">
      <article className="min-w-0 space-y-9">
        <header>
          <Link href="/learn" className="mb-3 inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink"><ArrowLeft size={12} /> Module {mod?.code} · {mod?.title}</Link>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{lesson.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={lesson.priority === "P0" ? "bad" : "neutral"}>{lesson.priority}</Badge>
            <Badge tone="neutral">~{lesson.minutes} min</Badge>
            {lesson.sources.map((s) => (
              <Badge key={s.label} tone={SOURCE_TONE[s.kind]} title={s.label}>{SOURCE_LABEL[s.kind]}: {s.label.length > 48 ? s.label.slice(0, 46) + "…" : s.label}</Badge>
            ))}
          </div>
        </header>

        <Section id="what" n={1} title="What it is, why it exists, when you use it" icon={<Target size={16} />}>
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4"><p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-3">What</p><Markdown text={lesson.what} /></Card>
            <Card className="p-4"><p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-3">Why</p><Markdown text={lesson.why} /></Card>
            <Card className="p-4"><p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-3">When (in the practical)</p><Markdown text={lesson.when} /></Card>
            <Card className="border-violet/25 p-4"><p className="mb-1 text-xs font-medium uppercase tracking-wide text-violet">Analogy</p><Markdown text={lesson.analogy} /></Card>
          </div>
        </Section>

        {lesson.videos && lesson.videos.length > 0 && (
          <Card className="p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-ink"><PlayCircle size={15} className="text-accent" /> Watch one short segment, then practise</p>
            <ul className="space-y-1.5 text-sm">
              {lesson.videos.map((v) => {
                const info = VIDEOS[v.video];
                const ch = info.chapters.find((c) => c.n === v.chapter)!;
                const { start, end } = chapterRange(v.video, v.chapter);
                return (
                  <li key={`${v.video}${v.chapter}`} className="flex flex-wrap items-center gap-2">
                    <Link href={`/resources?v=${v.video}&t=${start}&end=${end}`} className="text-accent hover:underline">#{ch.n} {ch.title}</Link>
                    <span className="font-mono text-xs text-ink-3">{ch.start} · {Math.round((end - start) / 60)} min · {info.channel}{info.key === "spring" ? " (Tamil)" : ""}</span>
                    {v.note && <span className="text-xs text-ink-3">— {v.note}</span>}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11px] text-ink-3">Chapter titles and times are the creators&apos; own (verified 16 Nov 2026). Content inside chapters has not been reviewed by this app.</p>
          </Card>
        )}

        {lesson.body && (
          <div className="space-y-4">
            {lesson.body.map((b) => (
              <Card key={b.heading} className="p-4">
                <h3 className="mb-1 text-sm font-semibold text-ink">{b.heading}</h3>
                <Markdown text={b.text} />
                {b.code && <CodeBlock code={b.code} className="mt-2" />}
              </Card>
            ))}
          </div>
        )}

        <Section id="compare" n={2} title={`Compared with ${lesson.compare.lang}`} icon={<GitCompare size={16} />}>
          <div className="grid gap-3 lg:grid-cols-2">
            <CodeBlock code={lesson.compare.other} title={lesson.compare.lang} />
            <CodeBlock code={lesson.compare.java} title="Java" />
          </div>
          <ul className="mt-3 space-y-1.5">
            {lesson.compare.notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-sm"><ArrowRight size={14} className="mt-1 shrink-0 text-accent" /><Markdown text={n} inline className="" /></li>
            ))}
          </ul>
        </Section>

        <Section id="syntax" n={3} title="Syntax breakdown" icon={<Code2 size={16} />}>
          <CodeBlock code={lesson.syntax.code} />
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {lesson.syntax.parts.map((p) => (
              <div key={p.token} className="rounded-lg border border-line bg-surface p-2.5">
                <dt className="font-mono text-xs text-accent">{p.token}</dt>
                <dd className="mt-0.5"><Markdown text={p.meaning} inline className="" /></dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="example" n={4} title={`Run it: ${lesson.example.title}`} icon={<Play size={16} />}>
          {lesson.example.explain && <Markdown text={lesson.example.explain} className="mb-2" />}
          <CodeRunner files={lesson.example.files} expectedOutput={lesson.example.expectedOutput} stdin={lesson.example.stdin} storageKey={`lesson:${lesson.id}:example`} layout="split" />
        </Section>

        {lesson.visual && (
          <Section id="visual" n={5} title="Visualise" icon={<Eye size={16} />}>
            <p className="mb-3 text-sm text-ink-2">{lesson.visual.caption}</p>
            <Card className="p-4"><Visualizer id={lesson.visual.id} /></Card>
          </Section>
        )}

        <Section id="trace" n={6} title="Trace it (predict before you run)" icon={<Route size={16} />}>
          <TraceExercise lesson={lesson} />
        </Section>

        <Section id="challenge" n={7} title="Coding challenge" icon={<Puzzle size={16} />}>
          {task ? (
            <Card className="p-4"><h3 className="mb-2 font-semibold text-ink">{task.title}</h3><CodingTaskRunner task={task} /></Card>
          ) : lesson.challenge && "examTask" in lesson.challenge ? (
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-ink-2">{lesson.challenge.text}</p>
              <Link href={lesson.challenge.examTask === "simulator" ? "/exam/simulator" : lesson.challenge.examTask === "tickets" ? "/exam/tickets" : `/exam?task=${lesson.challenge.examTask}`}><Button variant="primary"><FileCheck2 size={14} /> Open {lesson.challenge.examTask === "simulator" ? "Simulator" : lesson.challenge.examTask === "tickets" ? "Ticketing lab" : "Exam Lab"}</Button></Link>
            </Card>
          ) : null}
        </Section>

        <Section id="mistakes" n={8} title="Common beginner mistakes" icon={<AlertTriangle size={16} />}>
          <div className="grid gap-2 md:grid-cols-2">
            {lesson.mistakes.map((m, i) => (
              <div key={i} className="rounded-lg border border-line bg-surface p-3 text-sm">
                <p className="flex gap-1.5 text-ink"><span className="text-bad">✗</span><Markdown text={m.mistake} inline className="!text-ink " /></p>
                <p className="mt-1 flex gap-1.5"><span className="text-ok">✓</span><Markdown text={m.fix} inline className="" /></p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="quiz" n={9} title={`Quick quiz (${answered}/${lesson.quiz.length} answered)`} icon={<ListChecks size={16} />}>
          <div className="space-y-3">
            {lesson.quiz.map((id, i) => QUESTION_MAP[id] && <QuestionCard key={id} q={QUESTION_MAP[id]} index={i} />)}
          </div>
        </Section>

        <Section id="exam" n={10} title="Exam-style question" icon={<Sparkles size={16} />}>
          <Card className="p-4">
            <Markdown text={lesson.examQuestion.prompt} className="!text-ink" />
            <p className="mt-2 text-xs text-ink-3">Answer it in your own words (or in IntelliJ) first. This one is self-assessed — compare honestly with the model answer.</p>
            <Button className="mt-2" variant="ghost" onClick={() => setShowModel((s) => !s)}><Lightbulb size={14} /> {showModel ? "Hide" : "Show"} model answer</Button>
            {showModel && <div className="mt-2 rounded-lg border border-ok/30 bg-ok-soft/40 p-3"><Markdown text={lesson.examQuestion.modelAnswer} /></div>}
          </Card>
        </Section>

        <Section id="summary" n={11} title="Revision summary" icon={<BookMarked size={16} />}>
          <ul className="space-y-1.5">
            {lesson.summary.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok" /><Markdown text={s} inline className="" /></li>
            ))}
          </ul>
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          {prev ? <Link href={`/learn/${prev.id}`}><Button variant="ghost"><ArrowLeft size={14} /> {prev.title.slice(0, 40)}</Button></Link> : <span />}
          <Button variant={done ? "ok" : "primary"} onClick={() => progress.setLessonComplete(lesson.id, !done)}>
            {done ? <><CheckCircle2 size={14} /> Completed — undo</> : <><Circle size={14} /> Mark lesson complete</>}
          </Button>
          {next ? <Link href={`/learn/${next.id}`}><Button variant="ghost">{next.title.slice(0, 40)} <ArrowRight size={14} /></Button></Link> : <Link href="/exam"><Button variant="ghost">Exam Lab <ArrowRight size={14} /></Button></Link>}
        </div>
      </article>

      <aside className="hidden xl:block">
        <nav aria-label="On this page" className="sticky top-16 space-y-0.5 text-xs">
          <p className="mb-2 font-medium text-ink-3">On this page</p>
          {toc.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded px-2 py-1 text-ink-3 hover:bg-surface-3 hover:text-ink">{label}</a>
          ))}
          <p className="mt-4 text-[11px] text-ink-3">Related lessons</p>
          {mod?.lessons.filter((l) => l !== lesson.id).map((l) => (
            <Link key={l} href={`/learn/${l}`} className="block rounded px-2 py-1 text-ink-3 hover:bg-surface-3 hover:text-ink">{LESSON_MAP[l]?.title.slice(0, 34)}</Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
