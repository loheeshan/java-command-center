"use client";

import { Plus, Trash2 } from "lucide-react";
import { evaluate, type MissionInput } from "@/lib/algorithms/dispatch";
import { Button } from "@/components/ui/primitives";

const num = "w-full min-w-14 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-ink";

export function MissionEditor({ missions, onChange }: { missions: MissionInput[]; onChange: (m: MissionInput[]) => void }) {
  const set = (i: number, patch: Partial<MissionInput>) => onChange(missions.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const nextId = () => Math.max(100, ...missions.map((m) => m.id)) + 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-ink-3">
          <tr className="border-b border-line">
            <th className="p-1.5 font-medium">id</th><th className="p-1.5 font-medium">type</th><th className="p-1.5 font-medium">distance</th><th className="p-1.5 font-medium">load</th>
            <th className="p-1.5 font-medium">wind</th><th className="p-1.5 font-medium">medical / critical</th><th className="p-1.5 font-medium">energy</th><th className="p-1.5 font-medium">priority</th><th />
          </tr>
        </thead>
        <tbody>
          {missions.map((m, i) => {
            let ev: ReturnType<typeof evaluate> | null = null;
            try { ev = evaluate(m); } catch { /* overflow */ }
            return (
              <tr key={i} className="border-b border-line/60">
                <td className="p-1"><input aria-label="id" type="number" className={num} value={m.id} onChange={(e) => set(i, { id: Number(e.target.value) || 0 })} /></td>
                <td className="p-1">
                  <select aria-label="type" value={m.kind} onChange={(e) => set(i, e.target.value === "air" ? { kind: "air", windPenalty: m.windPenalty ?? 0, critical: m.medical ?? false } : { kind: "ground", medical: m.critical ?? false })} className="rounded border border-line bg-surface-2 px-1 py-0.5 text-xs text-ink">
                    <option value="ground">Ground</option><option value="air">Air</option>
                  </select>
                </td>
                <td className="p-1"><input aria-label="distanceKm" type="number" className={num} value={m.distanceKm} onChange={(e) => set(i, { distanceKm: Number(e.target.value) || 0 })} /></td>
                <td className="p-1"><input aria-label="loadKg" type="number" className={num} value={m.loadKg} onChange={(e) => set(i, { loadKg: Number(e.target.value) || 0 })} /></td>
                <td className="p-1">{m.kind === "air" ? <input aria-label="windPenalty" type="number" className={num} value={m.windPenalty ?? 0} onChange={(e) => set(i, { windPenalty: Number(e.target.value) || 0 })} /> : <span className="text-ink-3">—</span>}</td>
                <td className="p-1"><input aria-label={m.kind === "air" ? "critical" : "medical"} type="checkbox" className="accent-sky-400" checked={m.kind === "air" ? !!m.critical : !!m.medical} onChange={(e) => set(i, m.kind === "air" ? { critical: e.target.checked } : { medical: e.target.checked })} /></td>
                <td className="p-1.5 font-mono text-ink" title={ev?.energyWorking}>{ev ? ev.energy : <span className="text-bad">overflow</span>}</td>
                <td className="p-1.5 font-mono text-ink">{ev ? ev.priority : "—"}</td>
                <td className="p-1"><button aria-label="Remove mission" onClick={() => onChange(missions.filter((_, j) => j !== i))} className="rounded p-1 text-ink-3 hover:bg-bad-soft hover:text-bad"><Trash2 size={13} /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Button size="sm" variant="ghost" className="mt-1" onClick={() => onChange([...missions, { id: nextId(), kind: "ground", distanceKm: 5, loadKg: 1, medical: false }])}><Plus size={13} /> Add mission</Button>
    </div>
  );
}
