"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, GraduationCap, HelpCircle, Lightbulb, MessageSquareQuote, Wrench } from "lucide-react";
import { GUIDES, GUIDE_MAP, guideDoneKey, type GuideStep } from "@/content/guides";
import { progress, useHydrated, useProgress } from "@/lib/progress/store";
import { Badge, Button, Card, Notice, cn } from "@/components/ui/primitives";
import { Markdown } from "@/components/content/Markdown";
import { CodeBlock } from "@/components/content/CodeBlock";
import { CodeRunner } from "@/components/playground/CodeRunner";

function Reveal({ q, a, label = "Show answer" }: { q: string; a: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="text-sm font-medium text-ink"><Markdown text={q} inline /></p>
      {open ? (
        <div className="mt-2 rounded-md bg-ok-soft p-2.5 text-sm text-ink"><Markdown text={a} inline /></div>
      ) : (
        <Button size="sm" className="mt-2" onClick={() => setOpen(true)}>{label}</Button>
      )}
    </div>
  );
}

function Step({ guideId, step, index }: { guideId: string; step: GuideStep; index: number }) {
  return (
    <section id={`step-${index + 1}`} className="scroll-mt-20 space-y-3">
      <h2 className="text-lg font-semibold text-ink"><Markdown text={step.title} inline className="text-ink" /></h2>
      <div className="space-y-2">
        {step.explain.map((t, i) => <Markdown key={i} text={t} />)}
      </div>

      {step.table && (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-3 text-xs uppercase tracking-wide text-ink-3">
              <tr>{step.table.head.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody>
              {step.table.rows.map((r, i) => (
                <tr key={i} className="border-t border-line align-top">
                  {r.map((c, j) => <td key={j} className="px-3 py-2 text-ink-2 [&_code]:break-all"><Markdown text={c} inline /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {step.run && (
        <div>
          <p className="mb-1.5 text-xs text-ink-3">
            Read it, predict the output, then press <strong>Run on JDK</strong>. You can edit the code and run again; <em>Reset</em> restores it.
            {step.run.stdin !== undefined && <> The <strong>Input</strong> box is what the user &quot;types&quot; — one value per line. Change it and run again.</>}
          </p>
          <CodeRunner files={step.run.files} expectedOutput={step.run.expectedOutput} stdin={step.run.stdin} showStdin={step.run.stdin !== undefined} storageKey={`guide:${guideId}:${index}`} layout="split" />
        </div>
      )}

      {step.code && (
        <div>
          {step.run && <p className="mb-1.5 mt-3 text-xs text-ink-3">For reading:</p>}
          <CodeBlock code={step.code} title={step.codeTitle} />
        </div>
      )}

      {step.lines && (
        <dl className="grid gap-2 sm:grid-cols-2">
          {step.lines.map((l) => (
            <div key={l.code} className="min-w-0 rounded-lg border border-line bg-surface p-2.5">
              <dt className="break-all font-mono text-xs text-accent">{l.code}</dt>
              <dd className="mt-0.5 text-sm text-ink-2"><Markdown text={l.meaning} inline /></dd>
            </div>
          ))}
        </dl>
      )}

      {step.tryIt && (
        <div className="flex gap-2 rounded-lg border border-line bg-surface p-3 text-sm text-ink-2">
          <Wrench size={16} className="mt-0.5 shrink-0 text-accent" />
          <div><strong className="text-ink">Try this: </strong><Markdown text={step.tryIt} inline /></div>
        </div>
      )}

      {step.exam && (
        <div className="flex gap-2 rounded-lg border border-warn/40 bg-warn-soft p-3 text-sm text-ink">
          <GraduationCap size={16} className="mt-0.5 shrink-0 text-warn" />
          <div><strong>In the exam: </strong><Markdown text={step.exam} inline /></div>
        </div>
      )}

      {step.check && <Reveal q={`Check yourself: ${step.check.q}`} a={step.check.a} />}
    </section>
  );
}

export function GuideView({ id }: { id: string }) {
  const guide = GUIDE_MAP[id];
  const p = useProgress();
  const hydrated = useHydrated();
  const done = hydrated && p.code[guideDoneKey(id)] === "1";
  const i = GUIDES.findIndex((g) => g.id === id);
  const prev = GUIDES[i - 1];
  const next = GUIDES[i + 1];

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_210px]">
      <article className="min-w-0 space-y-8">
        <header>
          <Link href="/lectures" className="mb-3 inline-flex items-center gap-1 text-xs text-ink-3 hover:text-ink"><ArrowLeft size={12} /> All lecture guides</Link>
          <p className="text-xs font-medium uppercase tracking-wide text-accent">{guide.track === "sd2" ? "Part 1 · Java basics (SD2, 4COSC010C)" : "Part 2 · OOP & Spring (5COSC019W)"} · {guide.lecture}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{guide.title}</h1>
          <p className="mt-2 text-sm text-ink-2"><Markdown text={guide.goal} inline /></p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="neutral">~{guide.minutes} min</Badge>
            <Badge tone="neutral">{guide.steps.length} steps</Badge>
            {guide.sources.map((s) => <Badge key={s} tone="accent" title={s}>Source: {s.length > 52 ? s.slice(0, 50) + "…" : s}</Badge>)}
          </div>
        </header>

        <Card className="p-4">
          <p className="mb-2 text-sm font-semibold text-ink">After this guide you can:</p>
          <ul className="space-y-1 text-sm text-ink-2">
            {guide.outcomes.map((o) => <li key={o} className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok" /><Markdown text={o} inline /></li>)}
          </ul>
          <p className="mt-3 text-xs text-ink-3">No video needed: everything is explained here, in the same order and with the same examples as your lecture slides. Every runnable example was checked on the real JDK.</p>
        </Card>

        {guide.notes && guide.notes.length > 0 && (
          <Notice tone="warn" title="Where the slides and real Java differ">
            <ul className="list-disc space-y-1 pl-4">{guide.notes.map((n) => <li key={n}><Markdown text={n} inline /></li>)}</ul>
          </Notice>
        )}

        {guide.steps.map((s, k) => <Step key={s.title} guideId={guide.id} step={s} index={k} />)}

        <section id="viva" className="scroll-mt-20 space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><MessageSquareQuote size={18} /> Viva practice: answer out loud first</h2>
          <p className="text-sm text-ink-2">The viva checks that you understand the code you submit. Say your answer out loud, then reveal the model answer.</p>
          <div className="grid gap-2 md:grid-cols-2">
            {guide.viva.map((v) => <Reveal key={v.q} q={v.q} a={v.a} label="Show model answer" />)}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><Lightbulb size={18} /> Practise it next</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {guide.next.map((n) => (
              <Link key={n.href + n.label} href={n.href} className="flex items-center justify-between rounded-lg border border-line bg-surface p-3 text-sm text-ink hover:border-accent">
                {n.label} <ArrowRight size={14} className="shrink-0 text-ink-3" />
              </Link>
            ))}
          </div>
        </section>

        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Button variant={done ? "secondary" : "primary"} onClick={() => progress.saveCode(guideDoneKey(id), done ? "" : "1")}>
            {done ? <><CheckCircle2 size={15} /> Guide finished — undo</> : <><Circle size={15} /> Mark this guide finished</>}
          </Button>
          <div className="flex gap-2">
            {prev && <Link href={`/lectures/${prev.id}`}><Button size="sm"><ArrowLeft size={14} /> {prev.week}</Button></Link>}
            {next && <Link href={`/lectures/${next.id}`}><Button size="sm" variant="primary">Next: {next.week} <ArrowRight size={14} /></Button></Link>}
          </div>
        </Card>
      </article>

      <aside className="hidden xl:block">
        <nav aria-label="Steps" className="sticky top-20 space-y-1 text-xs">
          <p className="mb-2 font-medium uppercase tracking-wide text-ink-3">Steps</p>
          {guide.steps.map((s, k) => (
            <a key={s.title} href={`#step-${k + 1}`} className={cn("block rounded px-2 py-1 text-ink-2 hover:bg-surface-3 hover:text-ink")}>{s.title.replace(/`/g, "")}</a>
          ))}
          <a href="#viva" className="block rounded px-2 py-1 text-ink-2 hover:bg-surface-3 hover:text-ink"><HelpCircle size={11} className="mr-1 inline" />Viva practice</a>
        </nav>
      </aside>
    </div>
  );
}
