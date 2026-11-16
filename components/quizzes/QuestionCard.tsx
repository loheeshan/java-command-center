"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Lightbulb, Loader2, Play, XCircle } from "lucide-react";
import type { Answer, Question } from "@/lib/quiz/types";
import { grade, normaliseOutput, seededShuffle } from "@/lib/quiz/engine";
import { progress } from "@/lib/progress/store";
import { runJava, RunnerError } from "@/lib/execution/client";
import { Badge, Button, cn } from "@/components/ui/primitives";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Markdown } from "@/components/content/Markdown";

const TYPE_LABEL: Record<Question["type"], string> = {
  mcq: "Multiple choice",
  concept: "Identify the concept",
  multi: "Select all that apply",
  predict: "Predict the output",
  "find-error": "Find the error",
  completion: "Complete the code",
  order: "Order the steps",
};

export function QuestionCard({ q, onAnswered, index }: { q: Question; onAnswered?: (correct: boolean) => void; index?: number }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [choices, setChoices] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [line, setLine] = useState<number | null>(null);
  const initialOrder = useMemo(() => (q.type === "order" ? seededShuffle(q.items, q.id) : []), [q]);
  const [order, setOrder] = useState<string[]>(initialOrder);
  const [result, setResult] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [verify, setVerify] = useState<{ busy: boolean; out?: string; err?: string }>({ busy: false });

  const answer: Answer | null = (() => {
    switch (q.type) {
      case "mcq":
      case "concept":
        return choice === null ? null : { type: "mcq", choice };
      case "multi":
        return choices.length ? { type: "multi", choices } : null;
      case "predict":
        return text.trim() ? { type: "predict", text } : null;
      case "find-error":
        return line === null ? null : { type: "find-error", line };
      case "completion":
        return text.trim() ? { type: "completion", text } : null;
      case "order":
        return { type: "order", items: order };
    }
  })();

  const submit = () => {
    if (!answer || result !== null) return;
    const ok = grade(q, answer);
    setResult(ok);
    progress.recordAnswer(q.id, ok);
    onAnswered?.(ok);
  };

  const reset = () => {
    setResult(null);
    setChoice(null);
    setChoices([]);
    setText("");
    setLine(null);
    setOrder(initialOrder);
    setVerify({ busy: false });
  };

  async function runForReal() {
    if (q.type !== "predict") return;
    setVerify({ busy: true });
    try {
      const r = await runJava({ files: [{ name: "Main.java", content: q.code }] });
      setVerify({ busy: false, out: r.compile.ok ? (r.run?.stdout ?? "") + (r.run?.stderr ?? "") : r.compile.raw });
    } catch (e) {
      setVerify({ busy: false, err: e instanceof RunnerError && e.offline ? "Runner offline — start it with npm run runner." : String(e) });
    }
  }

  const locked = result !== null;
  const optionClass = (i: number, selected: boolean, correct: boolean) =>
    cn(
      "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
      !locked && (selected ? "border-accent bg-accent-soft/60 text-ink" : "border-line hover:border-line-strong hover:bg-surface-2 text-ink-2"),
      locked && correct && "border-ok/50 bg-ok-soft/60 text-ink",
      locked && selected && !correct && "border-bad/50 bg-bad-soft/60 text-ink",
      locked && !selected && !correct && "border-line text-ink-3",
    );

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {index !== undefined && <span className="font-mono text-xs text-ink-3">Q{index + 1}</span>}
        <Badge tone="accent">{TYPE_LABEL[q.type]}</Badge>
        <Badge tone="neutral">{q.difficulty}</Badge>
        <Badge tone="violet">{q.concept}</Badge>
      </div>
      <Markdown text={q.prompt} className="!text-ink [&_p]:my-1" />

      {q.code && q.type !== "find-error" && <CodeBlock code={q.code} className="my-2" lineNumbers={q.type === "completion"} />}

      <div className="mt-3 space-y-2">
        {(q.type === "mcq" || q.type === "concept") &&
          q.options.map((o, i) => (
            <button key={i} disabled={locked} onClick={() => setChoice(i)} className={optionClass(i, choice === i, i === q.answer)}>
              <span className="mt-px font-mono text-xs text-ink-3">{String.fromCharCode(65 + i)}</span>
              <Markdown text={o} inline className="" />
            </button>
          ))}

        {q.type === "multi" &&
          q.options.map((o, i) => {
            const sel = choices.includes(i);
            return (
              <button key={i} disabled={locked} onClick={() => setChoices((c) => (sel ? c.filter((x) => x !== i) : [...c, i]))} className={optionClass(i, sel, q.answers.includes(i))}>
                <span className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm border", sel ? "border-accent bg-accent" : "border-line-strong")} />
                <Markdown text={o} inline className="" />
              </button>
            );
          })}

        {q.type === "find-error" && (
          <>
            <CodeBlock code={q.code} onLineClick={locked ? undefined : setLine} selectedLine={line ?? undefined} highlightLine={locked ? q.line : undefined} />
            <p className="text-xs text-ink-3">{line ? `You selected line ${line}.` : "Click the line that contains the error."}</p>
          </>
        )}

        {(q.type === "predict" || q.type === "completion") && (
          <textarea
            aria-label={q.type === "predict" ? "Your predicted output" : "Code for the blank"}
            disabled={locked}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={q.type === "predict" ? Math.min(6, Math.max(2, q.output.split("\n").length + 1)) : 1}
            placeholder={q.type === "predict" ? "Type the exact console output…" : "Fill in the ____"}
            className="w-full rounded-lg border border-line bg-[#0a0e15] p-2.5 font-mono text-sm text-ink outline-none focus:border-accent/60 disabled:opacity-70"
          />
        )}

        {q.type === "order" && (
          <ol className="space-y-1.5">
            {order.map((item, i) => {
              const correctPos = locked && q.items[i] === item;
              return (
                <li key={item} className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm", locked ? (correctPos ? "border-ok/50 bg-ok-soft/50" : "border-bad/50 bg-bad-soft/50") : "border-line bg-surface-2")}>
                  <span className="w-4 font-mono text-xs text-ink-3">{i + 1}</span>
                  <span className="flex-1 text-ink-2">{item}</span>
                  {!locked && (
                    <span className="flex gap-0.5">
                      <button aria-label="Move up" disabled={i === 0} onClick={() => setOrder((o) => { const n = [...o]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })} className="rounded p-1 text-ink-3 hover:bg-surface-3 hover:text-ink disabled:opacity-30"><ArrowUp size={13} /></button>
                      <button aria-label="Move down" disabled={i === order.length - 1} onClick={() => setOrder((o) => { const n = [...o]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; })} className="rounded p-1 text-ink-3 hover:bg-surface-3 hover:text-ink disabled:opacity-30"><ArrowDown size={13} /></button>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!locked ? (
          <Button variant="primary" onClick={submit} disabled={!answer}>Check answer</Button>
        ) : (
          <Button variant="ghost" onClick={reset}>Try again</Button>
        )}
        {q.hint && !locked && (
          <Button variant="ghost" onClick={() => setShowHint(true)}><Lightbulb size={14} /> Hint</Button>
        )}
        {result === true && <span className="flex items-center gap-1 text-sm font-medium text-ok"><CheckCircle2 size={16} /> Correct</span>}
        {result === false && <span className="flex items-center gap-1 text-sm font-medium text-bad"><XCircle size={16} /> Not quite</span>}
      </div>
      {showHint && q.hint && !locked && <p className="mt-2 text-sm text-warn">💡 {q.hint}</p>}

      {locked && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          {q.type === "predict" && <div><p className="mb-1 text-xs text-ink-3">Expected output</p><pre className="rounded-md bg-[#0a0e15] p-2 font-mono text-xs text-ok">{q.output}</pre></div>}
          {q.type === "completion" && <p className="text-sm text-ink-2">Accepted: <code className="font-mono text-ok">{q.accept[0]}</code></p>}
          {q.type === "find-error" && <p className="text-sm text-ink-2">The error is on line <span className="font-mono text-ok">{q.line}</span>.</p>}
          {q.type === "order" && <p className="text-sm text-ink-2">Correct order: {q.items.map((s, i) => `${i + 1}. ${s}`).join("  ")}</p>}
          <Markdown text={q.explanation} />
          {result === false && q.misconception && (
            <div className="rounded-lg border border-warn/30 bg-warn-soft/50 p-2.5 text-sm">
              <span className="font-medium text-warn">Common misconception: </span>
              <span className="text-ink-2">{q.misconception}</span>
            </div>
          )}
          {q.type === "predict" && q.runnable && (
            <div>
              <Button size="sm" onClick={runForReal} disabled={verify.busy}>
                {verify.busy ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Verify on the real JDK
              </Button>
              {verify.out !== undefined && (
                <pre className="mt-2 rounded-md border border-line bg-[#06090f] p-2 font-mono text-xs text-ink">
                  {verify.out}
                  {"\n"}
                  <span className={normaliseOutput(verify.out) === normaliseOutput(q.output) ? "text-ok" : "text-warn"}>
                    {normaliseOutput(verify.out) === normaliseOutput(q.output) ? "✓ JDK output matches the answer" : "JDK output differs"}
                  </span>
                </pre>
              )}
              {verify.err && <p className="mt-1 text-xs text-warn">{verify.err}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
