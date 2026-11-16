"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { evaluate } from "@/lib/algorithms/dispatch";
import { Badge, Button, cn } from "@/components/ui/primitives";
import { CodeBlock } from "@/components/content/CodeBlock";

interface HeapObj {
  addr: string;
  cls: "GroundMission" | "AirMission";
  inherited: Record<string, string | number>;
  own: Record<string, string | number | boolean>;
}
interface State {
  vars: { name: string; type: string; ref: string | null; value?: number }[];
  heap: HeapObj[];
  note: string;
}

/**
 * A scripted memory model of a short program. Each step is computed from the inputs,
 * so editing the constructor arguments changes the objects and the energy result.
 */
export function ObjectMemoryVisualizer() {
  const [d, setD] = useState(12);
  const [l, setL] = useState(3);
  const [step, setStep] = useState(0);

  const code = `DispatchMission a = new GroundMission(101, ${d}, ${l}, true);
DispatchMission b = new AirMission(103, 8, 1, 3, true);
DispatchMission c = a;
int e = c.energyUnits();
a = null;
b = c;`;

  const ground: HeapObj = { addr: "@1a2f", cls: "GroundMission", inherited: { id: 101, distanceKm: d, loadKg: l }, own: { medical: true } };
  const air: HeapObj = { addr: "@3c7d", cls: "AirMission", inherited: { id: 103, distanceKm: 8, loadKg: 1 }, own: { windPenalty: 3, critical: true } };
  let energy: number | string;
  try {
    energy = evaluate({ id: 101, kind: "ground", distanceKm: d, loadKg: l, medical: true }).energy;
  } catch {
    energy = "ArithmeticException";
  }

  const states: State[] = [
    { vars: [], heap: [], note: "Before line 1: main's stack frame is empty; the heap has no missions." },
    { vars: [{ name: "a", type: "DispatchMission", ref: "@1a2f" }], heap: [ground], note: "`new` allocates a GroundMission on the heap. super(...) fills the inherited fields first, then `medical`. Variable `a` (on the stack) holds only its address." },
    { vars: [{ name: "a", type: "DispatchMission", ref: "@1a2f" }, { name: "b", type: "DispatchMission", ref: "@3c7d" }], heap: [ground, air], note: "A second, independent object. Both variables are declared as DispatchMission — the objects keep their real classes." },
    { vars: [{ name: "a", type: "DispatchMission", ref: "@1a2f" }, { name: "b", type: "DispatchMission", ref: "@3c7d" }, { name: "c", type: "DispatchMission", ref: "@1a2f" }], heap: [ground, air], note: "`c = a` copies the ADDRESS. No new object: a and c now point to the same GroundMission." },
    { vars: [{ name: "a", type: "DispatchMission", ref: "@1a2f" }, { name: "b", type: "DispatchMission", ref: "@3c7d" }, { name: "c", type: "DispatchMission", ref: "@1a2f" }, { name: "e", type: "int", ref: null, value: typeof energy === "number" ? energy : undefined }], heap: [ground, air], note: typeof energy === "number" ? `c.energyUnits() runs GroundMission's override on @1a2f: 2 × ${d} + 5 × ${l} = ${energy}. The int is stored directly in the stack slot (primitives hold values, not addresses).` : "The energy does not fit in an int, so Math.toIntExact throws ArithmeticException — e is never assigned." },
    { vars: [{ name: "a", type: "DispatchMission", ref: null }, { name: "b", type: "DispatchMission", ref: "@3c7d" }, { name: "c", type: "DispatchMission", ref: "@1a2f" }, { name: "e", type: "int", ref: null, value: typeof energy === "number" ? energy : undefined }], heap: [ground, air], note: "`a = null` only changes the variable. The object survives because `c` still references it." },
    { vars: [{ name: "a", type: "DispatchMission", ref: null }, { name: "b", type: "DispatchMission", ref: "@1a2f" }, { name: "c", type: "DispatchMission", ref: "@1a2f" }, { name: "e", type: "int", ref: null, value: typeof energy === "number" ? energy : undefined }], heap: [ground, { ...air, addr: air.addr }], note: "Now nothing references the AirMission @3c7d. It is unreachable and the garbage collector may reclaim it." },
  ];
  const s = states[step];
  const referenced = new Set(s.vars.map((v) => v.ref).filter(Boolean));
  const colorOf = (addr: string) => (addr === "@1a2f" ? "text-accent border-accent/50" : "text-violet border-violet/50");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 text-sm">
        <label className="text-xs text-ink-3">GroundMission distanceKm
          <input type="number" value={d} onChange={(e) => setD(Number(e.target.value) || 0)} className="mt-1 block w-32 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-ink" />
        </label>
        <label className="text-xs text-ink-3">loadKg
          <input type="number" value={l} onChange={(e) => setL(Number(e.target.value) || 0)} className="mt-1 block w-24 rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-ink" />
        </label>
        <Button size="sm" variant="ghost" onClick={() => { setD(1_500_000_000); setL(0); }}>Try an overflow</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-2">
          <CodeBlock code={code} lineNumbers highlightLine={step === 0 ? undefined : step} />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setStep((x) => Math.max(0, x - 1))} disabled={step === 0}><ChevronLeft size={14} /> Back</Button>
            <Button size="sm" variant="primary" onClick={() => setStep((x) => Math.min(states.length - 1, x + 1))} disabled={step === states.length - 1}>Step <ChevronRight size={14} /></Button>
            <Button size="sm" variant="ghost" onClick={() => setStep(0)}><RotateCcw size={13} /></Button>
            <span className="text-xs text-ink-3">after line {step}</span>
          </div>
          <p className="rounded-lg border border-line bg-surface-2 p-3 text-sm text-ink-2">{s.note}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-3">Stack (main)</p>
            <div className="space-y-1.5">
              {s.vars.length === 0 && <p className="text-xs text-ink-3">empty</p>}
              {s.vars.map((v) => (
                <div key={v.name} className="rounded-md border border-line bg-surface-2 px-2.5 py-1.5">
                  <p className="font-mono text-xs text-ink-3">{v.type}</p>
                  <p className="font-mono text-sm">
                    <span className="text-ink">{v.name}</span> ={" "}
                    {v.type === "int" ? <span className="text-warn">{v.value ?? "—"}</span> : v.ref ? <span className={cn("rounded border px-1", colorOf(v.ref))}>→ {v.ref}</span> : <span className="text-ink-3">null</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-3">Heap</p>
            <div className="space-y-2">
              {s.heap.length === 0 && <p className="text-xs text-ink-3">empty</p>}
              {s.heap.map((o) => {
                const live = referenced.has(o.addr);
                return (
                  <div key={o.addr} className={cn("rounded-lg border p-2.5 transition-opacity", colorOf(o.addr), !live && "opacity-40")}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-sm text-ink">{o.cls}</span>
                      <span className="font-mono text-xs">{o.addr}</span>
                    </div>
                    <p className="font-mono text-[10px] uppercase text-ink-3">from DispatchMission (private)</p>
                    {Object.entries(o.inherited).map(([k, v]) => <p key={k} className="font-mono text-xs text-ink-2">{k} = {String(v)}</p>)}
                    <p className="mt-1 font-mono text-[10px] uppercase text-ink-3">own fields</p>
                    {Object.entries(o.own).map(([k, v]) => <p key={k} className="font-mono text-xs text-ink-2">{k} = {String(v)}</p>)}
                    {!live && <Badge tone="neutral" className="mt-1.5">unreachable → eligible for GC</Badge>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
