"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { evaluate, MISSION_104, PAPER_SEED, sortWithTrace, type EvaluatedMission, type MissionInput } from "@/lib/algorithms/dispatch";
import { Badge, Button, cn, Notice } from "@/components/ui/primitives";
import { MissionEditor } from "./MissionEditor";

const PRESET: MissionInput[] = [
  { id: 102, kind: "ground", distanceKm: 4, loadKg: 2, medical: false },
  { id: 104, kind: "air", distanceKm: 6, loadKg: 1, windPenalty: 2, critical: false },
  { id: 101, kind: "ground", distanceKm: 12, loadKg: 3, medical: true },
  { id: 99, kind: "ground", distanceKm: 5, loadKg: 4, medical: false },
  { id: 103, kind: "air", distanceKm: 8, loadKg: 1, windPenalty: 3, critical: true },
];

const KEY_TEXT = { priority: "priority (higher first)", energy: "energy (lower first)", id: "id (lower first)" };

export function SortingVisualizer() {
  const [missions, setMissions] = useState<MissionInput[]>(PRESET);
  const [step, setStep] = useState(0);

  const computed = useMemo(() => {
    try {
      const ev = missions.map(evaluate);
      return { ev, ...sortWithTrace(ev) };
    } catch {
      return null;
    }
  }, [missions]);

  if (!computed) {
    return (
      <div className="space-y-3">
        <MissionEditor missions={missions} onChange={(m) => { setMissions(m); setStep(0); }} />
        <Notice tone="bad">A mission's energy overflows int — Math.toIntExact would throw, so it cannot be sorted. Reduce the values.</Notice>
      </div>
    );
  }

  const { ev, comparisons, sorted } = computed;
  const byId = new Map<number, EvaluatedMission>(ev.map((m) => [m.id, m]));
  const cmp = step > 0 ? comparisons[step - 1] : null;
  const order = cmp ? cmp.orderAfter : ev.map((m) => m.id);
  const maxE = Math.max(1, ...ev.map((m) => m.energy));
  const done = step === comparisons.length;

  return (
    <div className="space-y-4">
      <MissionEditor missions={missions} onChange={(m) => { setMissions(m); setStep(0); }} />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => { setMissions(PRESET); setStep(0); }}>Preset with ties</Button>
        <Button size="sm" variant="ghost" onClick={() => { setMissions([...PAPER_SEED, MISSION_104]); setStep(0); }}>Paper seed + 104</Button>
      </div>

      <div className="rounded-lg border border-line bg-surface-2 p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft size={14} /></Button>
          <Button size="sm" variant="primary" onClick={() => setStep((s) => Math.min(comparisons.length, s + 1))} disabled={done}>Compare <ChevronRight size={14} /></Button>
          <Button size="sm" variant="ghost" onClick={() => setStep(comparisons.length)}>Jump to end</Button>
          <Button size="sm" variant="ghost" onClick={() => setStep(0)}><RotateCcw size={13} /></Button>
          <span className="font-mono text-xs text-ink-3">comparison {step}/{comparisons.length}</span>
        </div>

        <ol className="space-y-1.5" aria-label="Current order">
          {order.map((id, idx) => {
            const m = byId.get(id)!;
            const inCmp = cmp && (id === cmp.a || id === cmp.b);
            return (
              <li key={id} className={cn("flex items-center gap-2 rounded-md border px-2 py-1.5 transition-all", inCmp ? "border-accent bg-accent-soft/50" : done ? "border-ok/40" : "border-line")}>
                <span className="w-4 font-mono text-[11px] text-ink-3">{idx}</span>
                <span className="w-12 font-mono text-sm text-ink">{id}</span>
                <Badge tone={m.priority >= 3 ? "warn" : "neutral"}>p{m.priority}</Badge>
                <div className="h-2 flex-1 overflow-hidden rounded bg-surface-3"><div className="h-full rounded bg-accent/70" style={{ width: `${(m.energy / maxE) * 100}%` }} /></div>
                <span className="w-10 text-right font-mono text-xs text-ink-2">{m.energy}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-3 min-h-12 text-sm text-ink-2">
          {cmp ? (
            <p>
              compare(<span className="font-mono text-ink">{cmp.a}</span>, <span className="font-mono text-ink">{cmp.b}</span>) decided by <Badge tone="accent">{KEY_TEXT[cmp.decidedBy]}</Badge>{" "}
              {cmp.swapped ? <>→ positive → <span className="text-warn">swap</span>: {cmp.b} must come before {cmp.a}.</> : <>→ not positive → already in order, stop shifting.</>}
              {cmp.decidedBy !== "priority" && <span className="text-ink-3"> (earlier keys were equal)</span>}
            </p>
          ) : (
            <p className="text-ink-3">Unsorted input. Each step is one call to the comparator.</p>
          )}
          {done && <p className="mt-1 text-ok">Sorted: [{sorted.map((m) => m.id).join(", ")}]</p>}
        </div>
      </div>
      <p className="text-xs text-ink-3">
        Simulation. Comparisons are shown with insertion sort because each step is easy to follow. Java&apos;s <code className="font-mono">List.sort</code> uses TimSort (which uses insertion sort on small runs), so the comparisons may differ — but the final order is identical because the comparator defines a total order.
      </p>
    </div>
  );
}
