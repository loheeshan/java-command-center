"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { MISSION_104, PAPER_SEED, plan, type MissionInput, type PlanStep } from "@/lib/algorithms/dispatch";
import { progress } from "@/lib/progress/store";
import { Badge, Button, cn, Notice } from "@/components/ui/primitives";
import { MissionEditor } from "./MissionEditor";

export function GreedyVisualizer() {
  const [missions, setMissions] = useState<MissionInput[]>(PAPER_SEED);
  const [capacity, setCapacity] = useState(60);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [step, setStep] = useState(0);
  const [predict, setPredict] = useState(true);
  const [guess, setGuess] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState({ right: 0, total: 0 });

  const resetRun = () => { setStep(0); setGuess({}); setScore({ right: 0, total: 0 }); };

  const result = useMemo(() => {
    try {
      return { ok: true as const, r: plan(missions, capacity, urgentOnly) };
    } catch (e) {
      return { ok: false as const, msg: e instanceof Error ? e.message : String(e) };
    }
  }, [missions, capacity, urgentOnly]);

  const controls = (
    <div className="flex flex-wrap items-end gap-3">
      <label className="text-xs text-ink-3">capacity
        <input type="number" value={capacity} onChange={(e) => { setCapacity(Number(e.target.value)); resetRun(); }} className="mt-1 block w-24 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-sm text-ink" />
      </label>
      <label className="flex items-center gap-1.5 pb-1.5 text-sm text-ink-2"><input type="checkbox" checked={urgentOnly} onChange={(e) => { setUrgentOnly(e.target.checked); resetRun(); }} className="accent-sky-400" /> urgentOnly</label>
      <label className="flex items-center gap-1.5 pb-1.5 text-sm text-ink-2"><input type="checkbox" checked={predict} onChange={(e) => setPredict(e.target.checked)} className="accent-sky-400" /> predict each decision</label>
      <div className="flex flex-wrap gap-1.5 pb-0.5">
        <Button size="sm" variant="ghost" onClick={() => { setMissions(PAPER_SEED); setCapacity(60); setUrgentOnly(false); resetRun(); }}>B3</Button>
        <Button size="sm" variant="ghost" onClick={() => { setMissions(PAPER_SEED); setCapacity(60); setUrgentOnly(true); resetRun(); }}>B4</Button>
        <Button size="sm" variant="ghost" onClick={() => { setMissions([...PAPER_SEED, MISSION_104]); setCapacity(125); setUrgentOnly(false); resetRun(); }}>B6</Button>
      </div>
    </div>
  );

  if (!result.ok) {
    return (
      <div className="space-y-3">
        <MissionEditor missions={missions} onChange={(m) => { setMissions(m); resetRun(); }} />
        {controls}
        <Notice tone="bad" title="IllegalArgumentException (HTTP 400 in the API)">{result.msg.includes("overflow") ? "A mission's energy overflows int — Math.toIntExact throws." : result.msg}</Notice>
      </div>
    );
  }

  const r = result.r;
  const byId = new Map(r.selected.map((m) => [m.id, m]));
  const steps = r.steps;
  const shown = steps.slice(0, step);
  const current: PlanStep | undefined = steps[step];
  const awaitingGuess = predict && current?.kind === "consider" && guess[step] === undefined;
  const used = [...shown].reverse().find((s) => s.kind === "consider") as Extract<PlanStep, { kind: "consider" }> | undefined;
  const remaining = used ? used.remainingAfter : capacity;
  const done = step >= steps.length;

  const choose = (fits: boolean) => {
    if (current?.kind !== "consider") return;
    const right = fits === current.fits;
    setGuess((g) => ({ ...g, [step]: fits }));
    setScore((s) => ({ right: s.right + (right ? 1 : 0), total: s.total + 1 }));
    progress.recordPrediction(right);
    setStep((s) => s + 1);
  };

  const evalMap = new Map(missions.map((m) => [m.id, m]));
  const energyOf = (id: number) => {
    for (const s of steps) if (s.kind === "consider" && s.id === id) return s.energy;
    return null;
  };

  return (
    <div className="space-y-4">
      <MissionEditor missions={missions} onChange={(m) => { setMissions(m); resetRun(); }} />
      {controls}

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-2 rounded-lg border border-line bg-surface-2 p-3">
          <div className="flex items-center justify-between text-xs text-ink-3">
            <span>Remaining capacity</span>
            <span className="font-mono text-sm text-ink">{remaining} / {capacity}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-500" style={{ width: `${(remaining / capacity) * 100}%` }} />
          </div>

          <ol className="mt-3 space-y-1.5">
            {shown.map((s, i) => (
              <li key={i} className="rounded-md border border-line bg-surface p-2 text-sm">
                {s.kind === "filter" && (
                  <p><Badge tone="accent">1 · filter</Badge> <span className="text-ink-2">{urgentOnly ? `urgentOnly: keep priority ≥ 3 → [${s.kept.join(", ")}]` : `urgentOnly=false: keep all → [${s.kept.join(", ")}]`}</span>{s.removed.length > 0 && <span className="text-ink-3"> · filtered out (in neither list): [{s.removed.join(", ")}]</span>}</p>
                )}
                {s.kind === "sort" && <p><Badge tone="accent">2 · sort</Badge> <span className="text-ink-2">priority DESC, energy ASC, id ASC → </span><span className="font-mono text-ink">[{s.order.join(", ")}]</span></p>}
                {s.kind === "consider" && (
                  <p className="flex flex-wrap items-center gap-1.5">
                    {s.fits ? <CheckCircle2 size={14} className="text-ok" /> : <XCircle size={14} className="text-bad" />}
                    <span className="font-mono text-ink">{s.id}</span>
                    <span className="text-ink-2">needs {s.energy}, remaining {s.remainingBefore} →</span>
                    {s.fits ? <Badge tone="ok">select (remaining {s.remainingAfter})</Badge> : <Badge tone="bad">skip, continue</Badge>}
                    {guess[i] !== undefined && (guess[i] === s.fits ? <Badge tone="ok">you predicted right</Badge> : <Badge tone="warn">you predicted {guess[i] ? "select" : "skip"}</Badge>)}
                  </p>
                )}
              </li>
            ))}
          </ol>

          {awaitingGuess && current?.kind === "consider" && (
            <div className="rounded-md border border-accent/50 bg-accent-soft/40 p-3">
              <p className="text-sm text-ink">Next: mission <span className="font-mono">{current.id}</span> needs <span className="font-mono">{current.energy}</span>; remaining is <span className="font-mono">{current.remainingBefore}</span>. Select or skip?</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="ok" onClick={() => choose(true)}>Select</Button>
                <Button size="sm" variant="danger" onClick={() => choose(false)}>Skip</Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft size={14} /></Button>
            <Button size="sm" variant="primary" onClick={() => setStep((s) => s + 1)} disabled={done || awaitingGuess}>Step <ChevronRight size={14} /></Button>
            <Button size="sm" variant="ghost" onClick={() => setStep(steps.length)} disabled={done}>Run to end</Button>
            <Button size="sm" variant="ghost" onClick={resetRun}><RotateCcw size={13} /> Restart</Button>
            {score.total > 0 && <span className="text-xs text-ink-3">predictions: {score.right}/{score.total}</span>}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-ink-3">DispatchPlan {done ? "" : "(revealed when finished)"}</p>
          <pre className={cn("overflow-x-auto rounded-lg border border-line bg-[#06090f] p-3 font-mono text-xs text-ink transition-opacity", !done && "opacity-30 blur-[2px]")} aria-hidden={!done}>
            {JSON.stringify(
              {
                capacity: r.capacity,
                energyUsed: r.energyUsed,
                energyRemaining: r.energyRemaining,
                selected: r.selected.map((m) => ({ id: m.id, type: m.kind === "ground" ? "GroundMission" : "AirMission", priority: m.priority, energyUnits: m.energy })),
                skipped: r.skipped,
              },
              null,
              2,
            )}
          </pre>
          {done && (
            <div className="text-xs text-ink-2">
              <p>selected [{r.selected.map((m) => m.id).join(", ")}] · skipped [{r.skipped.join(", ")}]{r.filteredOut.length > 0 && ` · filtered [${r.filteredOut.join(", ")}]`}</p>
              <p className="mt-1 text-ink-3">Check: energyUsed {r.energyUsed} = {r.selected.map((m) => energyOf(m.id) ?? byId.get(m.id)?.energy).join(" + ") || "0"}.</p>
            </div>
          )}
          <p className="text-[11px] text-ink-3">Simulation of the paper&apos;s rules in TypeScript ({evalMap.size} missions). Your Java is graded by real tests in the Exam Lab.</p>
        </div>
      </div>
    </div>
  );
}
