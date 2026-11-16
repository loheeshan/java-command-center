import type { Answer, Question } from "./types";

export function normaliseOutput(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "")
    .replace(/^\n+/, "");
}

/** Collapses whitespace around punctuation so `super( id,x )` equals `super(id, x)`. */
export function normaliseCode(s: string): string {
  return s
    .trim()
    .replace(/;+\s*$/, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([(){}\[\],.;<>=+\-*/!&|?:])\s*/g, "$1");
}

export function grade(q: Question, a: Answer): boolean {
  switch (q.type) {
    case "mcq":
    case "concept":
      return a.type === "mcq" && a.choice === q.answer;
    case "multi": {
      if (a.type !== "multi") return false;
      const want = [...q.answers].sort();
      const got = [...new Set(a.choices)].sort();
      return want.length === got.length && want.every((v, i) => v === got[i]);
    }
    case "predict":
      return a.type === "predict" && normaliseOutput(a.text) === normaliseOutput(q.output);
    case "find-error":
      return a.type === "find-error" && a.line === q.line;
    case "completion":
      return a.type === "completion" && q.accept.some((acc) => normaliseCode(acc) === normaliseCode(a.text));
    case "order":
      return a.type === "order" && a.items.length === q.items.length && a.items.every((v, i) => v === q.items[i]);
  }
}

/** Deterministic shuffle so server and client render the same order (no hydration mismatch). */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const j = ((h ^= h >>> 16) >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  // never present an order question already solved
  if (out.length > 1 && out.every((v, i) => v === items[i])) [out[0], out[1]] = [out[1], out[0]];
  return out;
}

/**
 * Spaced review tuned to a 3-day window. Box n → wait INTERVALS[n] before the question is due again.
 * Wrong answer → box 0 (due in 10 minutes). Right answer → move up one box.
 */
export const REVIEW_INTERVALS_MIN = [10, 60, 240, 720, 1440];

export interface ReviewItem {
  questionId: string;
  box: number;
  dueAt: number;
}

export function scheduleReview(prev: ReviewItem | undefined, questionId: string, correct: boolean, now: number): ReviewItem | null {
  if (!prev && correct) return null; // first-try correct: no review needed
  const box = correct ? Math.min((prev?.box ?? 0) + 1, REVIEW_INTERVALS_MIN.length) : 0;
  if (box >= REVIEW_INTERVALS_MIN.length) return null; // graduated
  return { questionId, box, dueAt: now + REVIEW_INTERVALS_MIN[box] * 60_000 };
}
