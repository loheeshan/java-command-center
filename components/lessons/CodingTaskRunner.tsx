"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, FlaskConical, Lightbulb, Loader2, Lock, RotateCcw, XCircle } from "lucide-react";
import type { CodingTask } from "@/lib/curriculum/types";
import type { RunResponse, SourceFile } from "@/runner/protocol";
import { buildHarness, parseHarnessOutput, testCount, type HarnessResult } from "@/content/coding-tasks";
import { runJava, RunnerError } from "@/lib/execution/client";
import { progress, useProgress } from "@/lib/progress/store";
import { Badge, Button, cn } from "@/components/ui/primitives";
import { Markdown } from "@/components/content/Markdown";
import { CodeBlock } from "@/components/content/CodeBlock";
import { JavaEditor } from "@/components/playground/JavaEditor";
import { ExecutionBadge, OfflineNotice } from "@/components/playground/RunOutput";

export function CodingTaskRunner({ task, height = 380 }: { task: CodingTask; height?: number }) {
  const p = useProgress();
  const key = `task:${task.id}`;
  const initial = useMemo<SourceFile[]>(() => task.files.map(({ name, content }) => ({ name, content })), [task]);
  const [files, setFiles] = useState<SourceFile[]>(initial);
  const [restored, setRestored] = useState(false);
  const editableIdx = task.files.findIndex((f) => !f.readOnly);
  const [active, setActive] = useState(Math.max(0, editableIdx));
  const [results, setResults] = useState<HarnessResult[] | null>(null);
  const [run, setRun] = useState<RunResponse | null>(null);
  const [error, setError] = useState<{ message: string; offline: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const stats = p.coding[task.id];
  const total = testCount(task);

  if (!restored && p.code[key]) {
    try {
      const parsed = JSON.parse(p.code[key]) as SourceFile[];
      if (parsed.length === initial.length) setFiles(parsed.map((f, i) => (task.files[i].readOnly ? initial[i] : f)));
    } catch {
      /* ignore */
    }
    setRestored(true);
  }

  async function runTests() {
    setBusy(true);
    setError(null);
    try {
      const res = await runJava({ files: [...files, { name: "JccTests.java", content: buildHarness(task) }], mainClass: "JccTests" });
      setRun(res);
      const parsed = res.compile.ok ? parseHarnessOutput(res.run?.stdout ?? "") : [];
      setResults(parsed);
      progress.recordCoding(task.id, parsed.filter((r) => r.passed).length, total);
      progress.saveCode(key, JSON.stringify(files));
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : String(e), offline: e instanceof RunnerError && e.offline });
    } finally {
      setBusy(false);
    }
  }

  const passed = results?.filter((r) => r.passed).length ?? 0;
  const file = files[active];
  const isReadOnly = task.files[active]?.readOnly;
  const attempted = (stats?.attempts ?? 0) > 0;
  // Diagnostics mention JccTests.java when the learner's class is missing members the tests use
  const diags = run?.compile.diagnostics.filter((d) => d.file === file.name);
  const harnessErrors = run && !run.compile.ok ? run.compile.diagnostics.filter((d) => d.file === "JccTests.java") : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="violet">{task.difficulty}</Badge>
        <Badge tone="neutral">{total} hidden tests</Badge>
        {stats?.passedAt ? <Badge tone="ok"><CheckCircle2 size={11} /> solved</Badge> : stats ? <Badge tone="warn">best {stats.bestPassed}/{stats.total}</Badge> : null}
      </div>
      <Markdown text={task.prompt} />

      <div className="flex flex-wrap gap-1">
        {files.map((f, i) => (
          <button key={f.name} onClick={() => setActive(i)} className={cn("flex items-center gap-1 rounded px-2 py-1 font-mono text-xs", i === active ? "bg-accent-soft text-accent" : "text-ink-3 hover:bg-surface-3")}>
            {task.files[i].readOnly && <Lock size={10} />} {f.name}
          </button>
        ))}
      </div>
      <JavaEditor
        value={file.content}
        readOnly={isReadOnly}
        onChange={(v) => setFiles((fs) => fs.map((f, i) => (i === active ? { ...f, content: v } : f)))}
        height={height}
        diagnostics={diags}
        path={`${key}/${file.name}`}
        onRun={runTests}
      />
      {isReadOnly && <p className="text-xs text-ink-3">Supplied file (read-only) — like the parent class in the exam starter.</p>}

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={runTests} disabled={busy}>
          {busy ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />} Run tests on JDK
        </Button>
        <Button variant="ghost" onClick={() => setHints((h) => Math.min(h + 1, task.hints.length))} disabled={hints >= task.hints.length}>
          <Lightbulb size={14} /> Hint {hints}/{task.hints.length}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setFiles(initial);
            setResults(null);
            setRun(null);
            progress.saveCode(key, JSON.stringify(initial));
          }}
        >
          <RotateCcw size={14} /> Reset
        </Button>
        <Button variant="ghost" disabled={!attempted} onClick={() => setShowSolution((s) => !s)} title={attempted ? "" : "Run the tests at least once first"}>
          {attempted ? null : <Lock size={12} />} {showSolution ? "Hide" : "Compare with"} reference solution
        </Button>
      </div>

      {hints > 0 && (
        <ol className="space-y-1 rounded-lg border border-warn/30 bg-warn-soft/50 p-3 text-sm">
          {task.hints.slice(0, hints).map((h, i) => (
            <li key={i} className="flex gap-2"><Lightbulb size={14} className="mt-0.5 shrink-0 text-warn" /><Markdown text={h} /></li>
          ))}
        </ol>
      )}

      {error && (error.offline ? <OfflineNotice message={error.message} /> : <p className="text-sm text-bad">{error.message}</p>)}

      {run && (
        <div className="rounded-lg border border-line bg-surface-2 p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <ExecutionBadge mode={run.mode} />
            {run.compile.ok ? (
              <Badge tone={passed === total ? "ok" : "warn"}>{passed}/{total} tests passed</Badge>
            ) : (
              <Badge tone="bad">compile error — 0 tests ran</Badge>
            )}
            {run.run?.timedOut && <Badge tone="bad">time limit hit</Badge>}
          </div>
          {!run.compile.ok && (
            <div className="space-y-1 text-sm">
              {run.compile.diagnostics.filter((d) => d.file !== "JccTests.java").map((d, i) => (
                <p key={i} className="font-mono text-xs"><span className="text-ink-3">{d.file}:{d.line}</span> <span className="text-bad">{d.message}</span></p>
              ))}
              {harnessErrors.length > 0 && (
                <p className="text-xs text-ink-2">
                  The tests could not compile against your code — usually a missing class, constructor or method, or a different signature. First test error: <span className="font-mono text-bad">{harnessErrors[0].message}</span>
                </p>
              )}
            </div>
          )}
          {results && results.length > 0 && (
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.name} className="flex items-start gap-2 text-sm">
                  {r.passed ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-ok" /> : <XCircle size={15} className="mt-0.5 shrink-0 text-bad" />}
                  <span>
                    <span className={r.passed ? "text-ink-2" : "text-ink"}>{r.name}</span>
                    {r.message && <span className="block font-mono text-xs text-bad">{r.message}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {run.compile.ok && results && results.length < total && (
            <p className="mt-2 text-xs text-warn">Only {results.length} of {total} tests reported — the program may have crashed or timed out. stderr: {run.run?.stderr.slice(0, 300)}</p>
          )}
        </div>
      )}

      {showSolution && (
        <div className="space-y-2">
          <p className="text-xs text-ink-3">Reference solution — compare your approach, then close it and rewrite from memory.</p>
          {task.solution.map((f) => (
            <CodeBlock key={f.name} code={f.content} title={f.name} />
          ))}
        </div>
      )}
    </div>
  );
}
