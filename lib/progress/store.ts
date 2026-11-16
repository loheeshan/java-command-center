"use client";

import { useSyncExternalStore } from "react";
import { localStorageAdapter, VersionedStore } from "@/lib/storage/store";
import { scheduleReview } from "@/lib/quiz/engine";
import { emptyProgress, type BlockStatus, type ExamAttempt, type ProgressState } from "./types";

const SCHEMA_VERSION = 1;
const persistent = new VersionedStore<ProgressState>(localStorageAdapter, "jcc.progress", SCHEMA_VERSION, emptyProgress);

let state: ProgressState = emptyProgress();
let loaded = false;
const listeners = new Set<() => void>();
const SERVER_SNAPSHOT = emptyProgress();

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    state = persistent.load();
    loaded = true;
    window.addEventListener("storage", (e) => {
      if (e.key === "jcc.progress") {
        state = persistent.load();
        listeners.forEach((l) => l());
      }
    });
  }
}

function update(fn: (s: ProgressState) => ProgressState) {
  ensureLoaded();
  state = fn(state);
  persistent.save(state);
  listeners.forEach((l) => l());
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(
    (cb) => {
      ensureLoaded();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      ensureLoaded();
      return state;
    },
    () => SERVER_SNAPSHOT,
  );
}

/** True after the first client render (avoids flashing "0%" before storage loads). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const progress = {
  openLesson(id: string) {
    update((s) => {
      const now = Date.now();
      const prev = s.lessons[id];
      return { ...s, lastLessonId: id, lessons: { ...s.lessons, [id]: { firstOpenedAt: prev?.firstOpenedAt ?? now, lastOpenedAt: now, completedAt: prev?.completedAt, timeMs: prev?.timeMs ?? 0 } } };
    });
  },
  addLessonTime(id: string, ms: number) {
    if (ms <= 0) return;
    update((s) => {
      const prev = s.lessons[id];
      if (!prev) return s;
      return { ...s, lessons: { ...s.lessons, [id]: { ...prev, timeMs: prev.timeMs + Math.min(ms, 30 * 60_000) } } };
    });
  },
  setLessonComplete(id: string, done: boolean) {
    update((s) => {
      const now = Date.now();
      const prev = s.lessons[id] ?? { firstOpenedAt: now, lastOpenedAt: now, timeMs: 0 };
      return { ...s, lessons: { ...s.lessons, [id]: { ...prev, completedAt: done ? now : undefined } } };
    });
  },
  recordAnswer(questionId: string, correct: boolean) {
    update((s) => {
      const now = Date.now();
      const prev = s.questions[questionId];
      const stats = {
        attempts: (prev?.attempts ?? 0) + 1,
        correctAttempts: (prev?.correctAttempts ?? 0) + (correct ? 1 : 0),
        lastCorrect: correct,
        firstCorrect: prev ? prev.firstCorrect : correct,
        lastAt: now,
      };
      const review = { ...s.review };
      const next = scheduleReview(review[questionId], questionId, correct, now);
      if (next) review[questionId] = next;
      else delete review[questionId];
      return {
        ...s,
        questions: { ...s.questions, [questionId]: stats },
        quizLog: [...s.quizLog, { questionId, correct, at: now }].slice(-1000),
        review,
      };
    });
  },
  recordCoding(taskId: string, passed: number, total: number) {
    update((s) => {
      const now = Date.now();
      const prev = s.coding[taskId];
      const all = total > 0 && passed === total;
      return {
        ...s,
        coding: {
          ...s.coding,
          [taskId]: { attempts: (prev?.attempts ?? 0) + 1, bestPassed: Math.max(prev?.bestPassed ?? 0, passed), total, passedAt: prev?.passedAt ?? (all ? now : undefined), lastAt: now },
        },
        codingLog: [...s.codingLog, { taskId, passed, total, at: now }].slice(-200),
      };
    });
  },
  recordExam(attempt: ExamAttempt) {
    update((s) => ({ ...s, exams: [...s.exams, attempt].slice(-50) }));
  },
  startSimulator(projectId = "dispatch") {
    update((s) => ({ ...s, simulator: { projectId, startedAt: Date.now(), hintsUsed: 0 } }));
  },
  submitSimulator() {
    update((s) => (s.simulator ? { ...s, simulator: { ...s.simulator, submittedAt: Date.now() } } : s));
  },
  clearSimulator() {
    update((s) => ({ ...s, simulator: undefined }));
  },
  /** Reads the live (not render-time) workspace. */
  getWorkspace(workspace: string): Record<string, string> | undefined {
    ensureLoaded();
    return state.workspaces[workspace];
  },
  saveWorkspace(workspace: string, files: Record<string, string>) {
    update((s) => ({ ...s, workspaces: { ...s.workspaces, [workspace]: files } }));
  },
  setBlock(blockId: string, status: BlockStatus | null) {
    update((s) => {
      const schedule = { ...s.schedule };
      if (status) schedule[blockId] = status;
      else delete schedule[blockId];
      return { ...s, schedule };
    });
  },
  saveCode(key: string, code: string) {
    update((s) => ({ ...s, code: { ...s.code, [key]: code } }));
  },
  recordPrediction(correct: boolean) {
    update((s) => ({ ...s, predictions: { correct: s.predictions.correct + (correct ? 1 : 0), total: s.predictions.total + 1 } }));
  },
  exportJson(): string {
    ensureLoaded();
    return JSON.stringify(state, null, 2);
  },
  importJson(json: string) {
    const parsed = JSON.parse(json) as ProgressState;
    update(() => ({ ...emptyProgress(), ...parsed }));
  },
  reset() {
    update(() => emptyProgress());
  },
};
