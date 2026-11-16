import type { ReviewItem } from "@/lib/quiz/engine";

export interface LessonProgress {
  firstOpenedAt: number;
  lastOpenedAt: number;
  completedAt?: number;
  timeMs: number;
}

export interface QuestionStats {
  attempts: number;
  correctAttempts: number;
  lastCorrect: boolean;
  firstCorrect: boolean;
  lastAt: number;
}

export interface CodingStats {
  attempts: number;
  bestPassed: number;
  total: number;
  passedAt?: number;
  lastAt: number;
}

export interface ExamAttempt {
  id: string;
  mode: "lab" | "simulator";
  /** Practice project; older attempts without it were "dispatch". */
  projectId?: string;
  at: number;
  sectionA: number;
  sectionB: number;
  total: number;
  /** test name -> status */
  results: Record<string, string>;
  durationMs?: number;
  compileOk: boolean;
}

export interface SimulatorSession {
  projectId?: string;
  startedAt: number;
  submittedAt?: number;
  hintsUsed: number;
}

export type BlockStatus = "done" | "skipped" | "unavailable";

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  questions: Record<string, QuestionStats>;
  quizLog: { questionId: string; correct: boolean; at: number }[];
  review: Record<string, ReviewItem>;
  coding: Record<string, CodingStats>;
  codingLog: { taskId: string; passed: number; total: number; at: number }[];
  exams: ExamAttempt[];
  simulator?: SimulatorSession;
  /** Workspace files for the exam lab / simulator, keyed by workspace then path. */
  workspaces: Record<string, Record<string, string>>;
  schedule: Record<string, BlockStatus>;
  /** Saved editor contents keyed by context (playground, task id...). */
  code: Record<string, string>;
  lastLessonId?: string;
  /** Visualizer prediction practice */
  predictions: { correct: number; total: number };
}

export const emptyProgress = (): ProgressState => ({
  lessons: {},
  questions: {},
  quizLog: [],
  review: {},
  coding: {},
  codingLog: [],
  exams: [],
  workspaces: {},
  schedule: {},
  code: {},
  predictions: { correct: 0, total: 0 },
});
