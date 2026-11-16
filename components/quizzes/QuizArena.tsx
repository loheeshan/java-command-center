"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, Shuffle } from "lucide-react";
import { QUESTIONS } from "@/content/questions";
import { LESSON_MAP, MODULES } from "@/content/modules";
import { seededShuffle } from "@/lib/quiz/engine";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { Badge, Button, cn, Tabs } from "@/components/ui/primitives";
import { QuestionCard } from "./QuestionCard";

type Mode = "module" | "review" | "mixed" | "wrong";

export function QuizArena() {
  const params = useSearchParams();
  const p = useProgress();
  const hydrated = useHydrated();
  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) ?? "module");
  const [moduleId, setModuleId] = useState("m02");
  const [seed, setSeed] = useState("start");
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), [mode]);

  const due = Object.values(p.review).filter((r) => r.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
  const upcoming = Object.values(p.review).filter((r) => r.dueAt > now).sort((a, b) => a.dueAt - b.dueAt);

  const list = useMemo(() => {
    if (mode === "module") {
      const lessons = MODULES.find((m) => m.id === moduleId)?.lessons ?? [];
      return QUESTIONS.filter((q) => lessons.includes(q.lessonId));
    }
    if (mode === "review") return due.map((r) => QUESTIONS.find((q) => q.id === r.questionId)!).filter(Boolean);
    if (mode === "wrong") return QUESTIONS.filter((q) => p.questions[q.id] && !p.questions[q.id].lastCorrect);
    return seededShuffle(QUESTIONS.filter((q) => LESSON_MAP[q.lessonId]?.priority === "P0"), seed).slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, moduleId, seed, hydrated, now]);

  const counts = Object.fromEntries(MODULES.map((m) => [m.id, QUESTIONS.filter((q) => m.lessons.includes(q.lessonId)).length]));

  return (
    <div className="space-y-4">
      <Tabs<Mode>
        value={mode}
        onChange={setMode}
        tabs={[
          { id: "module", label: "By module" },
          { id: "review", label: <span className="flex items-center gap-1.5">Due for review {hydrated && due.length > 0 && <Badge tone="warn">{due.length}</Badge>}</span> },
          { id: "wrong", label: "Previously wrong" },
          { id: "mixed", label: "Mixed P0 set" },
        ]}
      />

      {mode === "module" && (
        <div className="flex flex-wrap gap-1.5">
          {MODULES.filter((m) => counts[m.id] > 0).map((m) => (
            <button key={m.id} onClick={() => setModuleId(m.id)} className={cn("rounded-md border px-2.5 py-1 text-xs", moduleId === m.id ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-2 hover:border-line-strong")}>
              {m.code} {m.title} <span className="text-ink-3">({counts[m.id]})</span>
            </button>
          ))}
        </div>
      )}
      {mode === "mixed" && <Button size="sm" variant="ghost" onClick={() => setSeed(String(Date.now()))}><Shuffle size={13} /> New random set</Button>}
      {mode === "review" && (
        <p className="text-sm text-ink-2">
          Spaced review tuned to your 3-day window: a wrong answer comes back after 10 min, then 1 h, 4 h, 12 h, 24 h as you get it right.
          {hydrated && upcoming.length > 0 && <span className="ml-1 text-ink-3"><Clock size={12} className="inline" /> {upcoming.length} more scheduled; next in {Math.max(1, Math.round((upcoming[0].dueAt - now) / 60000))} min.</span>}
        </p>
      )}

      {hydrated && list.length === 0 && (
        <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-3">
          {mode === "review" ? "Nothing due right now. Wrong answers will appear here automatically." : mode === "wrong" ? "No wrong answers on record." : "No questions."}
        </p>
      )}
      <div className="space-y-3">
        {list.map((q, i) => <QuestionCard key={`${mode}-${seed}-${q.id}`} q={q} index={i} />)}
      </div>
    </div>
  );
}
