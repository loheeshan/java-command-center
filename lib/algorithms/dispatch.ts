/**
 * TypeScript model of the practice paper's dispatch rules. Used ONLY to drive the
 * visualizers (clearly labelled as simulations). Real grading runs the student's Java.
 */

export type MissionKind = "ground" | "air";

export interface MissionInput {
  id: number;
  kind: MissionKind;
  distanceKm: number;
  loadKg: number;
  /** ground only */
  medical?: boolean;
  /** air only */
  windPenalty?: number;
  critical?: boolean;
}

export interface EvaluatedMission extends MissionInput {
  energy: number;
  priority: number;
  /** Human-readable formula with numbers substituted. */
  energyWorking: string;
  priorityWorking: string;
}

const INT_MAX = 2147483647;

export class OverflowError extends Error {}

/** Mirrors Math.toIntExact on a long computation. */
function toIntExact(v: bigint): number {
  if (v > BigInt(INT_MAX) || v < BigInt(-INT_MAX - 1)) throw new OverflowError(`integer overflow: ${v} does not fit in int`);
  return Number(v);
}

export function evaluate(m: MissionInput): EvaluatedMission {
  if (m.kind === "ground") {
    const energy = toIntExact(2n * BigInt(m.distanceKm) + 5n * BigInt(m.loadKg));
    return {
      ...m,
      energy,
      priority: m.medical ? 3 : 1,
      energyWorking: `2 × ${m.distanceKm} + 5 × ${m.loadKg} = ${energy}`,
      priorityWorking: m.medical ? "medical → 3" : "not medical → 1",
    };
  }
  const wind = m.windPenalty ?? 0;
  const energy = toIntExact(3n * BigInt(m.distanceKm) + 8n * BigInt(m.loadKg) + 2n * BigInt(wind));
  return {
    ...m,
    energy,
    priority: m.critical ? 5 : 2,
    energyWorking: `3 × ${m.distanceKm} + 8 × ${m.loadKg} + 2 × ${wind} = ${energy}`,
    priorityWorking: m.critical ? "critical → 5" : "not critical → 2",
  };
}

/** Comparator: priority DESC, energy ASC, id ASC. Returns the deciding key too. */
export function compareMissions(a: EvaluatedMission, b: EvaluatedMission): { result: number; decidedBy: "priority" | "energy" | "id" } {
  if (a.priority !== b.priority) return { result: b.priority - a.priority, decidedBy: "priority" };
  if (a.energy !== b.energy) return { result: a.energy - b.energy, decidedBy: "energy" };
  return { result: a.id - b.id, decidedBy: "id" };
}

export interface Comparison {
  a: number;
  b: number;
  decidedBy: "priority" | "energy" | "id";
  /** true when a must move before b (a swap/shift happens) */
  swapped: boolean;
  orderAfter: number[];
}

/** Insertion sort that records every comparison (stable, same final order as Collections.sort). */
export function sortWithTrace(list: EvaluatedMission[]): { sorted: EvaluatedMission[]; comparisons: Comparison[] } {
  const arr = [...list];
  const comparisons: Comparison[] = [];
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0) {
      const { result, decidedBy } = compareMissions(arr[j - 1], arr[j]);
      const swapped = result > 0;
      if (swapped) [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
      comparisons.push({ a: arr[swapped ? j : j - 1].id, b: arr[swapped ? j - 1 : j].id, decidedBy, swapped, orderAfter: arr.map((m) => m.id) });
      if (!swapped) break;
      j--;
    }
  }
  return { sorted: arr, comparisons };
}

export type PlanStep =
  | { kind: "filter"; kept: number[]; removed: number[] }
  | { kind: "sort"; order: number[] }
  | { kind: "consider"; id: number; energy: number; remainingBefore: number; fits: boolean; remainingAfter: number };

export interface PlanResult {
  capacity: number;
  energyUsed: number;
  energyRemaining: number;
  selected: EvaluatedMission[];
  skipped: number[];
  filteredOut: number[];
  steps: PlanStep[];
}

export function plan(missions: MissionInput[], capacity: number, urgentOnly: boolean): PlanResult {
  if (!Number.isInteger(capacity) || capacity <= 0) throw new RangeError("Capacity must be greater than zero.");
  const evaluated = missions.map(evaluate);
  const eligible = evaluated.filter((m) => !urgentOnly || m.priority >= 3);
  const filteredOut = evaluated.filter((m) => !eligible.includes(m)).map((m) => m.id);
  const steps: PlanStep[] = [{ kind: "filter", kept: eligible.map((m) => m.id), removed: filteredOut }];
  const { sorted } = sortWithTrace(eligible);
  steps.push({ kind: "sort", order: sorted.map((m) => m.id) });

  const selected: EvaluatedMission[] = [];
  const skipped: number[] = [];
  let used = 0;
  for (const m of sorted) {
    const remainingBefore = capacity - used;
    const fits = m.energy <= remainingBefore;
    if (fits) {
      selected.push(m);
      used += m.energy;
    } else skipped.push(m.id);
    steps.push({ kind: "consider", id: m.id, energy: m.energy, remainingBefore, fits, remainingAfter: capacity - used });
  }
  return { capacity, energyUsed: used, energyRemaining: capacity - used, selected, skipped, filteredOut, steps };
}

export const PAPER_SEED: MissionInput[] = [
  { id: 101, kind: "ground", distanceKm: 12, loadKg: 3, medical: true },
  { id: 102, kind: "ground", distanceKm: 4, loadKg: 2, medical: false },
  { id: 103, kind: "air", distanceKm: 8, loadKg: 1, windPenalty: 3, critical: true },
];

export const MISSION_104: MissionInput = { id: 104, kind: "air", distanceKm: 6, loadKg: 1, windPenalty: 2, critical: false };

/** Validation rules of NewAirMission, mirroring Task 3.2. Returns the first error or null. */
export function validateNewAir(m: { id: number; distanceKm: number; loadKg: number; windPenalty: number }, existingIds: number[]): string | null {
  if (m.id < 1 || m.id > 10000) return "ID must be between 1 and 10000.";
  if (m.distanceKm < 1 || m.distanceKm > 10000) return "distanceKm must be between 1 and 10000.";
  if (m.loadKg < 0 || m.loadKg > 10000) return "loadKg must be between 0 and 10000.";
  if (m.windPenalty < 0 || m.windPenalty > 10000) return "windPenalty must be between 0 and 10000.";
  if (existingIds.includes(m.id)) return `A mission with ID ${m.id} already exists.`;
  return null;
}
