"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { evaluate, type MissionInput } from "@/lib/algorithms/dispatch";
import { Badge, Button, cn } from "@/components/ui/primitives";
import { CodeBlock } from "@/components/content/CodeBlock";

type Call = "energyUnits" | "priority" | "isCritical";

const GROUND_SRC = `@Override
public int energyUnits() {
    long e = 2L * getDistanceKm() + 5L * getLoadKg();
    return Math.toIntExact(e);
}
@Override
public int priority() { return medical ? 3 : 1; }`;

const AIR_SRC = `@Override
public int energyUnits() {
    long e = 3L * getDistanceKm() + 8L * getLoadKg() + 2L * windPenalty;
    return Math.toIntExact(e);
}
@Override
public int priority() { return critical ? 5 : 2; }`;

export function PolymorphismVisualizer() {
  const [kind, setKind] = useState<"ground" | "air">("air");
  const [flag, setFlag] = useState(true);
  const [dist, setDist] = useState(8);
  const [load, setLoad] = useState(1);
  const [wind, setWind] = useState(3);
  const [call, setCall] = useState<Call>("energyUnits");
  const [step, setStep] = useState(0);

  const m: MissionInput = kind === "ground" ? { id: 101, kind, distanceKm: dist, loadKg: load, medical: flag } : { id: 103, kind, distanceKm: dist, loadKg: load, windPenalty: wind, critical: flag };
  let ev: ReturnType<typeof evaluate> | null = null;
  let overflow = false;
  try {
    ev = evaluate(m);
  } catch {
    overflow = true;
  }
  const cls = kind === "ground" ? "GroundMission" : "AirMission";
  const ctor = kind === "ground" ? `new GroundMission(101, ${dist}, ${load}, ${flag})` : `new AirMission(103, ${dist}, ${load}, ${wind}, ${flag})`;
  const compileError = call === "isCritical";

  const steps = compileError
    ? [
        { title: "Compile time: check the reference type", ok: false, text: "The variable is declared as DispatchMission. DispatchMission has no isCritical() method, so javac reports `cannot find symbol` — even if the object really is an AirMission. The program never runs." },
      ]
    : [
        { title: "Compile time: check the reference type", ok: true, text: `DispatchMission declares ${call}(), so the call compiles. The compiler does not know or care which subclass object m will point to.` },
        { title: "Runtime: look at the actual object", ok: true, text: `m points to a ${cls} object on the heap. The JVM looks up ${call}() starting from ${cls} (dynamic dispatch).` },
        { title: `Runtime: run ${cls}.${call}()`, ok: !overflow || call === "priority", text: call === "energyUnits" ? (overflow ? "The long result does not fit in an int → Math.toIntExact throws ArithmeticException." : `${ev!.energyWorking}`) : ev ? `${ev.priorityWorking}` : (kind === "ground" ? (flag ? "medical → 3" : "not medical → 1") : flag ? "critical → 5" : "not critical → 2") },
      ];

  const reset = () => setStep(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 text-sm">
        <div>
          <p className="mb-1 text-xs text-ink-3">Object type (decided at runtime)</p>
          <div className="flex rounded-md border border-line p-0.5">
            {(["ground", "air"] as const).map((k) => (
              <button key={k} onClick={() => { setKind(k); reset(); }} className={cn("rounded px-3 py-1 text-sm", kind === k ? "bg-accent-soft text-accent" : "text-ink-3")}>{k === "ground" ? "GroundMission" : "AirMission"}</button>
            ))}
          </div>
        </div>
        <label className="text-xs text-ink-3">distanceKm<input type="number" value={dist} onChange={(e) => { setDist(Number(e.target.value) || 0); reset(); }} className="mt-1 block w-28 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-ink" /></label>
        <label className="text-xs text-ink-3">loadKg<input type="number" value={load} onChange={(e) => { setLoad(Number(e.target.value) || 0); reset(); }} className="mt-1 block w-20 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-ink" /></label>
        {kind === "air" && <label className="text-xs text-ink-3">windPenalty<input type="number" value={wind} onChange={(e) => { setWind(Number(e.target.value) || 0); reset(); }} className="mt-1 block w-20 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-ink" /></label>}
        <label className="flex items-center gap-1.5 pb-1.5 text-xs text-ink-2"><input type="checkbox" checked={flag} onChange={(e) => { setFlag(e.target.checked); reset(); }} className="accent-sky-400" />{kind === "ground" ? "medical" : "critical"}</label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-3">Call:</span>
        {(["energyUnits", "priority", "isCritical"] as const).map((c) => (
          <button key={c} onClick={() => { setCall(c); reset(); }} className={cn("rounded-md border px-2.5 py-1 font-mono text-xs", call === c ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-2 hover:border-line-strong")}>m.{c}()</button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <CodeBlock code={`DispatchMission m = ${ctor};\nint result = m.${call}();`} title="Caller (e.g. the planner)" />
          <div className="grid grid-cols-2 gap-2">
            {(["GroundMission", "AirMission"] as const).map((c) => {
              const active = !compileError && step >= 2 && c === cls;
              return (
                <div key={c} className={cn("rounded-lg border transition-all", active ? "border-ok ring-1 ring-ok/40" : c === cls && step >= 1 && !compileError ? "border-accent/60" : "border-line opacity-60")}>
                  <p className="border-b border-line px-2 py-1 font-mono text-xs text-ink">{c}</p>
                  <pre className="overflow-x-auto p-2 font-mono text-[10.5px] leading-snug text-ink-2">{c === "GroundMission" ? GROUND_SRC : AIR_SRC}</pre>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className={cn("rounded-lg border p-3 transition-all", i <= step ? (s.ok ? "border-accent/50 bg-accent-soft/40" : "border-bad/50 bg-bad-soft/50") : "border-line opacity-40")}>
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                {i <= step && (s.ok ? <CheckCircle2 size={14} className="text-ok" /> : <XCircle size={14} className="text-bad" />)} {i + 1}. {s.title}
              </p>
              {i <= step && <p className="mt-1 font-mono text-xs text-ink-2">{s.text}</p>}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" onClick={() => setStep((x) => Math.min(steps.length - 1, x + 1))} disabled={step >= steps.length - 1}>Next step <ChevronRight size={14} /></Button>
            <Button size="sm" variant="ghost" onClick={reset}><RotateCcw size={13} /> Restart</Button>
          </div>
          {!compileError && step === steps.length - 1 && (
            <p className="text-sm">
              Result: {call === "energyUnits" ? (overflow ? <Badge tone="bad">ArithmeticException</Badge> : <Badge tone="ok">{ev!.energy}</Badge>) : <Badge tone="ok">{ev?.priority ?? (kind === "ground" ? (flag ? 3 : 1) : flag ? 5 : 2)}</Badge>}
              <span className="ml-2 text-xs text-ink-3">Same line of caller code, different behaviour per object type.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
