"use client";

import { useState } from "react";
import { Eye, Loader2, Play, RotateCcw, Save } from "lucide-react";
import type { RunResponse, SourceFile } from "@/runner/protocol";
import { runJava, RunnerError } from "@/lib/execution/client";
import { progress, useProgress } from "@/lib/progress/store";
import { Button, cn } from "@/components/ui/primitives";
import { JavaEditor } from "./JavaEditor";
import { RunOutput } from "./RunOutput";

/**
 * Editable multi-file Java snippet that really compiles and runs through the runner.
 * `storageKey` persists edits; Reset restores the original.
 */
export function CodeRunner({
  files: initialFiles,
  expectedOutput,
  stdin: initialStdin,
  storageKey,
  height = 340,
  showStdin,
  layout = "stacked",
}: {
  files: SourceFile[];
  expectedOutput?: string;
  stdin?: string;
  storageKey?: string;
  height?: number;
  showStdin?: boolean;
  layout?: "stacked" | "split";
}) {
  const p = useProgress();
  const saved = storageKey ? p.code[storageKey] : undefined;
  const [files, setFiles] = useState<SourceFile[]>(() => initialFiles);
  const [restored, setRestored] = useState(false);
  const [active, setActive] = useState(0);
  const [stdin, setStdin] = useState(initialStdin ?? "");
  const [result, setResult] = useState<RunResponse | null>(null);
  const [error, setError] = useState<{ message: string; offline: boolean } | null>(null);
  const [running, setRunning] = useState(false);
  const [showExpected, setShowExpected] = useState(false);

  // Restore saved edits once storage has loaded on the client
  if (!restored && saved) {
    try {
      const parsed = JSON.parse(saved) as SourceFile[];
      if (Array.isArray(parsed) && parsed.length === initialFiles.length) setFiles(parsed);
    } catch {
      /* ignore corrupt saves */
    }
    setRestored(true);
  }

  const update = (content: string) => setFiles((fs) => fs.map((f, i) => (i === active ? { ...f, content } : f)));

  async function run() {
    setRunning(true);
    setError(null);
    try {
      setResult(await runJava({ files, stdin: stdin || undefined }));
      if (storageKey) progress.saveCode(storageKey, JSON.stringify(files));
    } catch (e) {
      setResult(null);
      setError({ message: e instanceof Error ? e.message : String(e), offline: e instanceof RunnerError && e.offline });
    } finally {
      setRunning(false);
    }
  }

  const diagnostics = result?.compile.diagnostics.filter((d) => d.file === files[active].name);
  const edited = files.some((f, i) => f.content !== initialFiles[i]?.content);

  const editor = (
    <div className="min-w-0">
      {files.length > 1 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {files.map((f, i) => (
            <button key={f.name} onClick={() => setActive(i)} className={cn("rounded px-2 py-1 font-mono text-xs", i === active ? "bg-accent-soft text-accent" : "text-ink-3 hover:bg-surface-3")}>
              {f.name}
            </button>
          ))}
        </div>
      )}
      <JavaEditor value={files[active].content} onChange={update} height={height} diagnostics={diagnostics} path={`${storageKey ?? "snippet"}/${files[active].name}`} onRun={run} />
      {showStdin && (
        <label className="mt-2 block text-xs text-ink-3">
          Program input (stdin)
          <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-line bg-[#0a0e15] p-2 font-mono text-xs text-ink" />
        </label>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={run} disabled={running}>
          {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Run on JDK
        </Button>
        <Button
          variant="ghost"
          disabled={!edited}
          onClick={() => {
            setFiles(initialFiles);
            setResult(null);
            if (storageKey) progress.saveCode(storageKey, JSON.stringify(initialFiles));
          }}
        >
          <RotateCcw size={14} /> Reset
        </Button>
        {storageKey && (
          <Button variant="ghost" onClick={() => progress.saveCode(storageKey, JSON.stringify(files))} title="Edits are also saved automatically on every run">
            <Save size={14} /> Save
          </Button>
        )}
        {expectedOutput !== undefined && (
          <Button variant="ghost" onClick={() => setShowExpected((v) => !v)}>
            <Eye size={14} /> {showExpected ? "Hide" : "Show"} expected output
          </Button>
        )}
      </div>
      {showExpected && expectedOutput !== undefined && <pre className="mt-2 rounded-lg border border-line bg-surface-2 p-2.5 font-mono text-xs text-ink-2">{expectedOutput}</pre>}
    </div>
  );

  const output = (
    <div className="min-w-0">
      <RunOutput result={result} expected={expectedOutput} error={error} />
    </div>
  );

  return layout === "split" ? (
    <div className="grid gap-4 lg:grid-cols-2">
      {editor}
      {output}
    </div>
  ) : (
    <div className="space-y-3">
      {editor}
      {output}
    </div>
  );
}
