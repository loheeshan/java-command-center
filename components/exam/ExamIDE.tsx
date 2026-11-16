"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, FilePlus2, FileCode2, FlaskConical, GitCompare, Lightbulb, Loader2,
  Lock, RotateCcw, Trash2, XCircle,
} from "lucide-react";
import type { ProjectTestResponse } from "@/runner/protocol";
import { testProject, RunnerError } from "@/lib/execution/client";
import { scoreProject, type Score } from "@/lib/assessment/dispatch-rubric";
import { PROJECTS, type ProjectConfig, type ProjectId } from "@/lib/projects/registry";
import { progress, useProgress } from "@/lib/progress/store";
import { Badge, Button, cn, Notice } from "@/components/ui/primitives";
import { Markdown } from "@/components/content/Markdown";
import { CodeBlock } from "@/components/content/CodeBlock";
import { JavaEditor } from "@/components/playground/JavaEditor";
import { ExecutionBadge, OfflineNotice } from "@/components/playground/RunOutput";

export type IdeMode = "lab" | "simulator";

const shortPath = (base: string) => (p: string) => p.replace(base, "").replace("src/main/resources/", "resources/");
const PACKAGES = ["model", "service", "exception", "controller", "repository"];

export function useWorkspace(key: string, starter: Record<string, string>) {
  const p = useProgress();
  const [files, setFiles] = useState<Record<string, string>>(starter);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!loaded && p.workspaces[key]) {
    setFiles({ ...p.workspaces[key] });
    setLoaded(true);
  }

  const update = (next: Record<string, string>) => {
    setFiles(next);
    setLoaded(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => progress.saveWorkspace(key, next), 600);
  };
  return [files, update] as const;
}

export function ExamIDE({
  projectId,
  mode,
  starter,
  reference,
  workspaceKey,
  initialTask,
  locked,
  onResult,
}: {
  /** Only the id crosses the server → client boundary (the config contains functions). */
  projectId: ProjectId;
  mode: IdeMode;
  starter: Record<string, string>;
  reference?: Record<string, string>;
  workspaceKey: string;
  initialTask?: string;
  locked?: boolean;
  onResult?: (r: ProjectTestResponse, s: Score) => void;
}) {
  const p = useProgress();
  const project = PROJECTS[projectId];
  const short = shortPath(project.base);
  const [files, setFiles] = useWorkspace(workspaceKey, starter);
  const paths = useMemo(() => Object.keys(files).sort((a, b) => short(a).localeCompare(short(b))), [files]);
  const [active, setActive] = useState(() => project.tasks.find((t) => t.id === initialTask)?.files[0] ?? project.defaultFile);
  const [task, setTask] = useState<string>(project.tasks.some((t) => t.id === initialTask) ? initialTask! : "task1");
  const [result, setResult] = useState<ProjectTestResponse | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<{ message: string; offline: boolean } | null>(null);
  const [hints, setHints] = useState<Record<string, number>>({});
  const [compare, setCompare] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPkg, setNewPkg] = useState("model");

  const attempted = p.exams.some((e) => e.mode === "lab" && (e.projectId ?? "dispatch") === project.id) || result !== null;
  const activeFile = files[active] !== undefined ? active : paths[0];
  const paperTask = project.tasks.find((t) => t.id === task) ?? project.tasks[0];
  const flags = useMemo(() => project.review(files), [files, project]);

  useEffect(() => {
    if (!busy) return;
    const s = Date.now();
    const t = setInterval(() => setElapsed(Math.round((Date.now() - s) / 1000)), 500);
    return () => clearInterval(t);
  }, [busy]);

  async function run() {
    setBusy(true);
    setElapsed(0);
    setError(null);
    try {
      const r = await testProject(project.id, files);
      const s = scoreProject(project.rubric, r.tests);
      setResult(r);
      setScore(s);
      if (mode === "lab") {
        progress.recordExam({
          id: crypto.randomUUID(), mode: "lab", projectId: project.id, at: Date.now(), sectionA: s.sectionA, sectionB: s.sectionB, total: s.total,
          results: Object.fromEntries(r.tests.map((t) => [t.name, t.status])), durationMs: r.durationMs, compileOk: r.compile.ok,
        });
      }
      onResult?.(r, s);
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : String(e), offline: e instanceof RunnerError && e.offline });
    } finally {
      setBusy(false);
    }
  }

  const createFile = () => {
    const name = newName.trim().replace(/\.java$/, "");
    if (!/^[A-Z][A-Za-z0-9_]*$/.test(name)) return;
    const path = `${project.base}${newPkg}/${name}.java`;
    if (files[path] !== undefined) return setActive(path);
    setFiles({ ...files, [path]: `package ${project.packageName}.${newPkg};\n\npublic class ${name} {\n\n}\n` });
    setActive(path);
    setNewName("");
  };

  const diagnostics = result?.compile.diagnostics.filter((d) => d.file === activeFile);
  const showScores = mode === "lab";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[230px_1fr_360px]">
        {/* Explorer */}
        <div className="rounded-xl border border-line bg-surface p-2">
          <p className="px-2 pb-1 font-mono text-[11px] uppercase tracking-wider text-ink-3">{project.packageName}</p>
          <ul className="space-y-0.5">
            {paths.map((path) => {
              const isNew = starter[path] === undefined;
              const modified = !isNew && files[path] !== starter[path];
              const errs = result?.compile.diagnostics.filter((d) => d.file === path).length ?? 0;
              return (
                <li key={path} className="group flex items-center">
                  <button onClick={() => setActive(path)} className={cn("flex min-w-0 flex-1 items-center gap-1.5 rounded px-2 py-1 text-left font-mono text-xs", path === activeFile ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-surface-3")}>
                    <FileCode2 size={12} className="shrink-0" />
                    <span className="truncate">{short(path)}</span>
                    {isNew && <span className="text-ok">+</span>}
                    {modified && <span className="text-warn">●</span>}
                    {errs > 0 && <span className="text-bad">!{errs}</span>}
                  </button>
                  {isNew && !locked && (
                    <button aria-label={`Delete ${short(path)}`} onClick={() => { const n = { ...files }; delete n[path]; setFiles(n); }} className="hidden rounded p-1 text-ink-3 hover:text-bad group-hover:block"><Trash2 size={11} /></button>
                  )}
                </li>
              );
            })}
          </ul>
          {!locked && (
            <div className="mt-3 border-t border-line pt-2">
              <p className="px-1 pb-1 text-[11px] text-ink-3">New class</p>
              <div className="flex gap-1 px-1">
                <select value={newPkg} onChange={(e) => setNewPkg(e.target.value)} aria-label="Package" className="rounded border border-line bg-surface-2 px-1 text-xs text-ink">
                  {PACKAGES.map((x) => <option key={x}>{x}</option>)}
                </select>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createFile()} placeholder={project.id === "tickets" ? "VipTicket" : "AirMission"} aria-label="Class name" className="w-full min-w-0 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-ink" />
                <button aria-label="Create file" onClick={createFile} className="rounded p-1 text-accent hover:bg-surface-3"><FilePlus2 size={14} /></button>
              </div>
            </div>
          )}
          {!locked && (
            <div className="mt-3 space-y-1 border-t border-line px-1 pt-2">
              <Button size="sm" variant="ghost" className="w-full justify-start" onClick={() => { if (starter[activeFile] !== undefined) setFiles({ ...files, [activeFile]: starter[activeFile] }); }} disabled={starter[activeFile] === undefined || files[activeFile] === starter[activeFile]}>
                <RotateCcw size={12} /> Reset this file
              </Button>
              <Button size="sm" variant="ghost" className="w-full justify-start text-bad" onClick={() => { if (confirm("Reset the whole project to the untouched starter? Your edits will be lost.")) { setFiles({ ...starter }); setResult(null); setScore(null); } }}>
                <RotateCcw size={12} /> Reset entire project
              </Button>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="min-w-0 break-all font-mono text-xs text-ink-2">{activeFile}</p>
            <div className="flex items-center gap-2">
              {mode === "lab" && reference && (
                <Button size="sm" variant="ghost" disabled={!attempted} onClick={() => setCompare((c) => !c)} title={attempted ? "" : "Run the tests at least once to unlock"}>
                  {attempted ? <GitCompare size={13} /> : <Lock size={12} />} {compare ? "Hide" : "Compare with"} reference
                </Button>
              )}
              <Button variant="primary" onClick={run} disabled={busy || locked}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />} {busy ? `Building & testing… ${elapsed}s` : "Compile & run tests"}
              </Button>
            </div>
          </div>
          {compare && reference ? (
            <div className="grid gap-2 lg:grid-cols-2">
              <JavaEditor value={files[activeFile] ?? ""} onChange={(v) => setFiles({ ...files, [activeFile]: v })} readOnly={locked} height={560} diagnostics={diagnostics} path={`${workspaceKey}/${activeFile}`} />
              {reference[activeFile] ? <div className="max-h-[560px] overflow-auto"><CodeBlock code={reference[activeFile]} title={`Reference: ${short(activeFile)}`} /></div> : <p className="text-xs text-ink-3">No reference version of this file (it is unchanged in the worked solution or not part of it).</p>}
            </div>
          ) : (
            <JavaEditor value={files[activeFile] ?? ""} onChange={(v) => setFiles({ ...files, [activeFile]: v })} readOnly={locked} height={560} diagnostics={diagnostics} path={`${workspaceKey}/${activeFile}`} onRun={run} />
          )}
          {busy && <p className="text-xs text-ink-3">Maven compiles the project, starts Spring Boot on a random port and runs {project.testCount} JUnit tests over real HTTP. Usually 10–25 s.</p>}
        </div>

        {/* Task panel */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {project.tasks.map((t) => (
              <button key={t.id} onClick={() => setTask(t.id)} className={cn("rounded-md border px-2 py-1 text-xs", task === t.id ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-2")}>
                {t.id === "sectionB" ? "Sec B" : t.id.replace("task", "Task ")}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-surface p-3">
            <p className="text-sm font-semibold text-ink">{paperTask.title}</p>
            <p className="mb-2 text-xs text-ink-3">{paperTask.marks} marks</p>
            <ul className="space-y-1.5">
              {paperTask.requirements.map((r, i) => <li key={i} className="text-sm"><Markdown text={r} inline className="" /></li>)}
            </ul>
            {paperTask.files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {paperTask.files.map((f) => <button key={f} onClick={() => files[f] !== undefined && setActive(f)} className={cn("rounded border px-1.5 py-0.5 font-mono text-[11px]", files[f] !== undefined ? "border-line text-accent hover:border-accent/50" : "border-dashed border-line text-ink-3")} title={files[f] === undefined ? "Create this file" : "Open"}>{short(f)}</button>)}
              </div>
            )}
            {mode === "lab" && (
              <div className="mt-3 border-t border-line pt-2">
                <Button size="sm" variant="ghost" onClick={() => setHints((h) => ({ ...h, [task]: Math.min((h[task] ?? 0) + 1, paperTask.hints.length) }))} disabled={(hints[task] ?? 0) >= paperTask.hints.length}>
                  <Lightbulb size={13} /> Hint {hints[task] ?? 0}/{paperTask.hints.length}
                </Button>
                {(hints[task] ?? 0) > 0 && (
                  <ol className="mt-2 space-y-1">
                    {paperTask.hints.slice(0, hints[task]).map((h, i) => <li key={i} className="rounded-md bg-warn-soft/50 p-2 text-xs"><Markdown text={h} inline className="" /></li>)}
                  </ol>
                )}
              </div>
            )}
          </div>

          {flags.length > 0 && (
            <div className="rounded-xl border border-warn/30 bg-warn-soft/40 p-3">
              <p className="mb-1 text-xs font-medium text-warn">Code-review flags (advisory, not scored)</p>
              <ul className="space-y-1">
                {flags.map((f, i) => <li key={i} className="text-xs text-ink-2"><span className="font-mono text-ink-3">{short(f.file)}:</span> {f.message}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {error && (error.offline ? <OfflineNotice message={error.message} /> : <Notice tone="bad">{error.message}</Notice>)}
      {result && score && <ResultsPanel project={project} result={result} score={score} showScores={showScores} onOpen={(f) => setActive(f)} />}
    </div>
  );
}

export function ResultsPanel({ project, result, score, showScores, onOpen }: { project: ProjectConfig; result: ProjectTestResponse; score: Score; showScores: boolean; onOpen?: (file: string) => void }) {
  const short = shortPath(project.base);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const passed = result.tests.filter((t) => t.status === "passed").length;
  const visibleTasks = showScores ? score.tasks : score.tasks.filter((t) => t.section === "B");

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ExecutionBadge mode={result.mode} />
        <Badge tone={result.compile.ok ? "ok" : "bad"}>{result.compile.ok ? "BUILD SUCCESS" : "BUILD FAILED"}</Badge>
        {result.compile.ok && <Badge tone="neutral">{passed}/{result.tests.length} tests passed</Badge>}
        <Badge tone="neutral">{(result.durationMs / 1000).toFixed(1)} s</Badge>
        {showScores && result.compile.ok && (
          <>
            <Badge tone="accent">Section A (automated proxy): {score.sectionA}/80</Badge>
            <Badge tone="accent">Section B: {score.sectionB}/20</Badge>
            <Badge tone={score.total >= 70 ? "ok" : score.total >= 40 ? "warn" : "bad"}>Total {score.total}/100</Badge>
          </>
        )}
      </div>

      {!result.compile.ok && (
        <div className="mb-3 space-y-1 rounded-lg border border-bad/30 bg-bad-soft/40 p-3">
          <p className="text-sm font-medium text-ink">The project does not compile, so no tests ran — and in the real exam Section B would score 0.</p>
          {result.compile.diagnostics.map((d, i) => (
            <button key={i} onClick={() => onOpen?.(d.file)} className="block text-left font-mono text-xs hover:underline">
              <span className="text-ink-3">{short(d.file)}:{d.line}{d.column ? `:${d.column}` : ""}</span> <span className="text-bad">{d.message}</span>
            </button>
          ))}
          {result.compile.diagnostics.length === 0 && <pre className="max-h-48 overflow-auto font-mono text-[11px] text-ink-2">{result.logTail.slice(-2500)}</pre>}
        </div>
      )}
      {result.contextFailed && <Notice tone="bad" className="mb-3" title="Spring Boot failed to start">All HTTP checks errored because the application context could not load (e.g. a duplicate mapping or a bean error). Expand Section B for the message.</Notice>}
      {!showScores && result.compile.ok && <p className="mb-2 text-xs text-ink-3">During the simulation you see what you could verify yourself in Swagger (build + Section B behaviour). Section A marks are revealed when you submit.</p>}

      {result.compile.ok && (
        <div className="space-y-2">
          {visibleTasks.map((t) => {
            const isOpen = open[t.id] ?? t.earned < t.marks;
            return (
              <div key={t.id} className="rounded-lg border border-line">
                <button onClick={() => setOpen((o) => ({ ...o, [t.id]: !isOpen }))} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left">
                  <span className="flex items-center gap-1.5 text-sm text-ink">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />} {t.title}</span>
                  <span className={cn("font-mono text-sm", t.earned === t.marks ? "text-ok" : t.earned === 0 ? "text-bad" : "text-warn")}>{t.earned}/{t.marks}</span>
                </button>
                {isOpen && (
                  <ul className="space-y-1 border-t border-line px-3 py-2">
                    {t.items.map((it) => (
                      <li key={it.test} className="flex items-start gap-2 text-sm">
                        {it.result?.status === "passed" ? <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok" /> : it.result ? <XCircle size={14} className="mt-0.5 shrink-0 text-bad" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warn" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-ink-2">{it.label} <span className="font-mono text-xs text-ink-3">[{it.marks}]</span></p>
                          {it.result && it.result.status !== "passed" && it.result.message && <p className="break-words font-mono text-xs text-bad">{it.result.message.slice(0, 400)}</p>}
                          {!it.result && <p className="text-xs text-warn">test did not run</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
      {showScores && (
        <p className="mt-3 text-[11px] text-ink-3">
          Marks come only from named tests ({project.rubric.reduce((s, t) => s + t.items.length, 0)} tests, weights per the paper&apos;s task marks). Real Section A is marked by people reading your code with partial credit — this automated score is a proxy for behaviour, not a prediction of your mark.
        </p>
      )}
    </div>
  );
}
