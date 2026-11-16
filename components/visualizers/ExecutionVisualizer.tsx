"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Play } from "lucide-react";
import type { RunResponse } from "@/runner/protocol";
import { runJava, RunnerError } from "@/lib/execution/client";
import { Badge, Button, cn } from "@/components/ui/primitives";
import { CodeBlock } from "@/components/content/CodeBlock";
import { ExecutionBadge } from "@/components/playground/RunOutput";

const SOURCE = `public class Main {
    public static void main(String[] args) {
        int distanceKm = 12;
        int loadKg = 3;
        int energy = 2 * distanceKm + 5 * loadKg;
        System.out.println(energy);
    }
}`;

const BROKEN = SOURCE.replace("int loadKg = 3;", "int loadKg = 3");

/** Captured with JDK 25.0.5: `javac Main.java && javap -c Main.class` (main method only). */
const BYTECODE = `public static void main(java.lang.String[]);
  Code:
     0: bipush        12      // push 12
     2: istore_1              // distanceKm = 12
     3: iconst_3
     4: istore_2              // loadKg = 3
     5: iconst_2
     6: iload_1
     7: imul                  // 2 * distanceKm
     8: iconst_5
     9: iload_2
    10: imul                  // 5 * loadKg
    11: iadd
    12: istore_3              // energy = 39
    13: getstatic     #7      // System.out
    16: iload_3
    17: invokevirtual #13     // PrintStream.println(int)
    20: return`;

const STAGES = [
  { id: "src", title: "Main.java", sub: "source code", body: "You write human-readable Java. The file name must match the public class name." },
  { id: "javac", title: "javac", sub: "compiler", body: "The compiler checks syntax and types. Any error here stops everything: no .class file, nothing runs. This is where `';' expected` and `cannot find symbol` come from." },
  { id: "class", title: "Main.class", sub: "bytecode", body: "Platform-independent instructions for a stack machine. The file starts with the bytes CA FE BA BE; the next bytes record the class-file version (69 = Java 25). Below is the real `javap -c` output for this program." },
  { id: "jvm", title: "JVM", sub: "loads · verifies · executes", body: "The JVM loads the class, verifies the bytecode is safe, then interprets it — and compiles hot code to native machine code (JIT) while it runs." },
  { id: "out", title: "Output", sub: "System.out", body: "`println` writes 39 and a newline to standard output. Exceptions thrown at runtime would appear on standard error instead." },
];

export function ExecutionVisualizer() {
  const [step, setStep] = useState(0);
  const [broken, setBroken] = useState(false);
  const [real, setReal] = useState<RunResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const stopAt = broken ? 1 : STAGES.length - 1;
  const st = STAGES[Math.min(step, stopAt)];

  async function runForReal() {
    setBusy(true);
    setErr(null);
    try {
      setReal(await runJava({ files: [{ name: "Main.java", content: broken ? BROKEN : SOURCE }] }));
    } catch (e) {
      setErr(e instanceof RunnerError && e.offline ? "Runner offline — the pipeline above is an explanation only. Start the runner to see real timings." : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" checked={broken} onChange={(e) => { setBroken(e.target.checked); setStep(0); setReal(null); }} className="accent-sky-400" />
          Introduce a syntax error (remove a semicolon)
        </label>
      </div>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Execution pipeline">
        {STAGES.map((s, i) => {
          const reached = i <= step && i <= stopAt;
          const blocked = broken && i > 1;
          const failedHere = broken && i === 1 && step >= 1;
          return (
            <li key={s.id}>
              <button
                onClick={() => setStep(Math.min(i, stopAt))}
                className={cn(
                  "w-full rounded-lg border p-2.5 text-left transition-all",
                  failedHere ? "border-bad/60 bg-bad-soft" : reached ? "border-accent/60 bg-accent-soft/60" : "border-line bg-surface-2",
                  blocked && "opacity-35",
                  i === step && "ring-1 ring-accent/50",
                )}
              >
                <span className="block font-mono text-[10px] text-ink-3">{i + 1}</span>
                <span className="block font-mono text-sm text-ink">{s.title}</span>
                <span className="block text-[11px] text-ink-3">{failedHere ? "compile error — stops here" : s.sub}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft size={14} /> Back</Button>
        <Button size="sm" onClick={() => setStep((s) => Math.min(stopAt, s + 1))} disabled={step >= stopAt}>Next <ChevronRight size={14} /></Button>
        <span className="text-xs text-ink-3">Stage {Math.min(step, stopAt) + 1} of {stopAt + 1}</span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface-2 p-3 text-sm text-ink-2">
          <p className="mb-1 font-medium text-ink">{st.title} — {st.sub}</p>
          <p>{broken && step >= 1 ? "javac finds a missing semicolon on line 4 and refuses to produce Main.class. Nothing reaches the JVM." : st.body}</p>
        </div>
        {step <= 1 || broken ? (
          <CodeBlock code={broken ? BROKEN : SOURCE} lineNumbers highlightLine={broken && step >= 1 ? 4 : undefined} title="Main.java" />
        ) : step === 2 ? (
          <CodeBlock code={BYTECODE} title="javap -c Main.class (real output, JDK 25)" />
        ) : step === 3 ? (
          <pre className="rounded-lg border border-line bg-[#0a0e15] p-3 font-mono text-xs text-ink-2">{`ClassLoader  → reads Main.class
Verifier     → checks the bytecode is type-safe
Interpreter  → runs instructions 0..20
JIT compiler → turns hot methods into native code
Stack frame for main: args, distanceKm=12, loadKg=3, energy=39`}</pre>
        ) : (
          <pre className="rounded-lg border border-line bg-[#06090f] p-3 font-mono text-sm text-ink">39</pre>
        )}
      </div>

      <div className="rounded-lg border border-line p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="primary" onClick={runForReal} disabled={busy}>{busy ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Run this pipeline for real</Button>
          <span className="text-xs text-ink-3">Diagram above = explanation. This button = actual javac + JVM.</span>
        </div>
        {err && <p className="text-xs text-warn">{err}</p>}
        {real && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <ExecutionBadge mode={real.mode} />
            <Badge tone={real.compile.ok ? "ok" : "bad"}>javac {real.compile.ok ? "succeeded" : "failed"} in {real.compile.durationMs} ms</Badge>
            {real.run && <Badge tone="neutral">JVM ran in {real.run.durationMs} ms</Badge>}
            <code className="font-mono text-ink">{real.compile.ok ? `stdout: ${real.run?.stdout.trim()}` : real.compile.diagnostics[0]?.message}</code>
          </div>
        )}
      </div>
    </div>
  );
}
