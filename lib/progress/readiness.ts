import { LESSONS, LESSON_MAP } from "@/content/modules";
import { QUESTIONS } from "@/content/questions";
import { CODING_TASKS } from "@/content/coding-tasks";
import { PROJECT_LIST } from "@/lib/projects/registry";
import type { SkillGroup } from "@/lib/curriculum/types";
import type { ProgressState } from "./types";

/**
 * Readiness is reported as SEPARATE observable indicators — never a blended "mastery %".
 * Each indicator states its numerator and denominator so the learner can audit it.
 */
export interface Indicator {
  value: number | null; // 0..1, null = no data yet
  numerator: number;
  denominator: number;
  basis: string;
}

export interface SkillReport {
  skill: SkillGroup;
  completion: Indicator;
  quizAccuracy: Indicator;
  coding: Indicator;
  examTests: Indicator;
}

const ind = (num: number, den: number, basis: string): Indicator => ({ value: den > 0 ? num / den : null, numerator: num, denominator: den, basis });

export function skillReport(p: ProgressState, skill: SkillGroup): SkillReport {
  const lessons = LESSONS.filter((l) => l.skill === skill);
  const done = lessons.filter((l) => p.lessons[l.id]?.completedAt).length;

  const qIds = QUESTIONS.filter((q) => LESSON_MAP[q.lessonId]?.skill === skill).map((q) => q.id);
  const attempted = qIds.filter((id) => p.questions[id]);
  const correctLatest = attempted.filter((id) => p.questions[id].lastCorrect).length;

  const tasks = CODING_TASKS.filter((t) => t.skill === skill);
  const tasksPassed = tasks.filter((t) => p.coding[t.id]?.passedAt).length;

  // Exam-lab evidence: across every practice project, marks for rubric tasks tagged with this skill
  // that you have passed at least once.
  let examEarned = 0, examMarks = 0;
  for (const proj of PROJECT_LIST) {
    const attempts = p.exams.filter((a) => (a.projectId ?? "dispatch") === proj.id);
    if (!attempts.length) continue;
    for (const task of proj.rubric.filter((t) => t.skills.includes(skill))) {
      for (const item of task.items) {
        examMarks += item.marks;
        if (attempts.some((a) => a.results[item.test] === "passed")) examEarned += item.marks;
      }
    }
  }

  return {
    skill,
    completion: ind(done, lessons.length, `${done} of ${lessons.length} lessons marked complete`),
    quizAccuracy: ind(correctLatest, attempted.length, `latest answer correct on ${correctLatest} of ${attempted.length} attempted questions (${qIds.length} in bank)`),
    coding: ind(tasksPassed, tasks.length, `${tasksPassed} of ${tasks.length} coding tasks with every hidden test passing`),
    examTests: ind(examEarned, examMarks, examMarks ? `${examEarned} of ${examMarks} related exam-lab marks passed at least once (projects you have attempted)` : "no exam-lab attempts yet for tasks that use this skill"),
  };
}

export interface ExamReadiness {
  attempts: number;
  bestTotal: number | null;
  bestSimulator: number | null;
  latestSectionB: number | null;
  basis: string;
}

export function examReadiness(p: ProgressState): ExamReadiness {
  const sims = p.exams.filter((e) => e.mode === "simulator");
  const best = p.exams.length ? Math.max(...p.exams.map((e) => e.total)) : null;
  const bestSim = sims.length ? Math.max(...sims.map((e) => e.total)) : null;
  const latest = p.exams.at(-1);
  return {
    attempts: p.exams.length,
    bestTotal: best,
    bestSimulator: bestSim,
    latestSectionB: latest ? latest.sectionB : null,
    basis: "Scores come only from the grader's 33 JUnit tests on your code (Section A automated proxy + Section B functional checks).",
  };
}

/** Concepts answered wrong most recently, or with < 60% accuracy over ≥ 2 attempts. */
export function weakConcepts(p: ProgressState, limit = 6): { concept: string; lessonId: string; correct: number; attempts: number }[] {
  const byConcept = new Map<string, { lessonId: string; correct: number; attempts: number; lastWrong: boolean }>();
  for (const q of QUESTIONS) {
    const s = p.questions[q.id];
    if (!s) continue;
    const c = byConcept.get(q.concept) ?? { lessonId: q.lessonId, correct: 0, attempts: 0, lastWrong: false };
    c.correct += s.correctAttempts;
    c.attempts += s.attempts;
    c.lastWrong ||= !s.lastCorrect;
    byConcept.set(q.concept, c);
  }
  return [...byConcept.entries()]
    .filter(([, c]) => c.lastWrong || (c.attempts >= 2 && c.correct / c.attempts < 0.6))
    .sort((a, b) => a[1].correct / a[1].attempts - b[1].correct / b[1].attempts)
    .slice(0, limit)
    .map(([concept, c]) => ({ concept, lessonId: c.lessonId, correct: c.correct, attempts: c.attempts }));
}
