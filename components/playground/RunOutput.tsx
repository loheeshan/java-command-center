"use client";

import { AlertTriangle, CheckCircle2, Clock, Cpu, ServerOff, XCircle } from "lucide-react";
import type { RunResponse } from "@/runner/protocol";
import { normaliseOutput } from "@/lib/quiz/engine";
import { Badge } from "@/components/ui/primitives";

export function ExecutionBadge({ mode }: { mode: "local" | "docker" }) {
  return (
    <Badge tone="ok" title={mode === "docker" ? "Compiled and run in an isolated Docker container" : "Compiled with javac and run on the JDK on this computer"}>
      <Cpu size={11} /> Real JDK · {mode === "docker" ? "sandboxed container" : "local process"}
    </Badge>
  );
}

export function OfflineNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warn/30 bg-warn-soft/60 p-3 text-sm text-ink-2">
      <ServerOff size={16} className="mt-0.5 shrink-0 text-warn" />
      <div>
        <p className="font-medium text-ink">Code was NOT run.</p>
        <p className="mt-0.5">{message}</p>
        <p className="mt-1 text-xs text-ink-3">
          Start everything with <code className="font-mono text-ink-2">npm run dev</code>, or just the runner with <code className="font-mono text-ink-2">npm run runner</code>.
        </p>
      </div>
    </div>
  );
}

export function RunOutput({ result, expected, error }: { result: RunResponse | null; expected?: string; error?: { message: string; offline: boolean } | null }) {
  if (error) return error.offline ? <OfflineNotice message={error.message} /> : <p className="rounded-lg border border-bad/30 bg-bad-soft/60 p-3 text-sm text-bad">{error.message}</p>;
  if (!result) return <p className="rounded-lg border border-dashed border-line p-4 text-center text-xs text-ink-3">Press Run (or Ctrl+Enter) to compile and execute on the JDK.</p>;

  const { compile, run } = result;
  const matches = expected !== undefined && run && run.exitCode === 0 ? normaliseOutput(run.stdout) === normaliseOutput(expected) : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <ExecutionBadge mode={result.mode} />
        {compile.ok ? <Badge tone="ok"><CheckCircle2 size={11} /> compiled · {compile.durationMs} ms</Badge> : <Badge tone="bad"><XCircle size={11} /> compile error</Badge>}
        {run && (
          <>
            <Badge tone={run.exitCode === 0 ? "neutral" : "bad"}>exit {run.exitCode ?? "killed"}</Badge>
            <Badge tone="neutral"><Clock size={11} /> {run.durationMs} ms</Badge>
            {run.timedOut && <Badge tone="bad">time limit hit — infinite loop?</Badge>}
            {run.truncated && <Badge tone="warn">output truncated</Badge>}
          </>
        )}
        {matches !== null && (matches ? <Badge tone="ok">matches expected output</Badge> : <Badge tone="warn">differs from expected output</Badge>)}
      </div>

      {!compile.ok && (
        <div className="rounded-lg border border-bad/30 bg-bad-soft/40">
          {compile.diagnostics.length > 0 && (
            <ul className="space-y-1 border-b border-bad/20 p-2.5 text-sm">
              {compile.diagnostics.map((d, i) => (
                <li key={i} className="flex gap-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-bad" />
                  <span>
                    <span className="font-mono text-xs text-ink-3">{d.file}:{d.line}{d.column ? `:${d.column}` : ""}</span> <span className="text-ink">{d.message}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <pre className="max-h-56 overflow-auto p-2.5 font-mono text-xs text-ink-2">{compile.raw.trim()}</pre>
        </div>
      )}

      {run && (
        <div>
          <pre className="max-h-72 overflow-auto rounded-lg border border-line bg-[#06090f] p-3 font-mono text-[12.5px] leading-relaxed text-ink" aria-label="Program output">
            {run.stdout || <span className="text-ink-3">(no output)</span>}
            {run.stderr && <span className="text-bad">{run.stdout ? "\n" : ""}{run.stderr}</span>}
          </pre>
        </div>
      )}

      {matches === false && expected !== undefined && (
        <details className="rounded-lg border border-line p-2 text-xs">
          <summary className="cursor-pointer text-ink-2">Show expected output</summary>
          <pre className="mt-2 font-mono text-ink-2">{expected}</pre>
        </details>
      )}
    </div>
  );
}
