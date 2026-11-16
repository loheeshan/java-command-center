import type { SourceFile } from "@/runner/protocol";

export type SkillGroup = "fundamentals" | "oop" | "collections" | "exceptions" | "algorithms" | "spring" | "rest" | "exam";

export const SKILL_LABELS: Record<SkillGroup, string> = {
  fundamentals: "Java Fundamentals",
  oop: "OOP",
  collections: "Collections",
  exceptions: "Exceptions",
  algorithms: "Algorithms",
  spring: "Spring Boot",
  rest: "REST APIs",
  exam: "Exam Readiness",
};

/** Where a piece of content comes from — always shown to the learner. */
export type SourceKind = "university" | "mock-paper" | "supplemental" | "advanced";

export interface SourceRef {
  kind: SourceKind;
  label: string;
}

export interface VideoRef {
  video: "java" | "spring";
  /** Chapter index into content/videos.ts */
  chapter: number;
  note?: string;
}

export type VisualizerId = "execution" | "object-memory" | "inheritance" | "polymorphism" | "sorting" | "greedy" | "request-flow";

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  minutes: number;
  priority: "P0" | "P1" | "P2";
  skill: SkillGroup;
  sources: SourceRef[];
  videos?: VideoRef[];
  /** 1–4: what / why / when / analogy (markdown-lite) */
  what: string;
  why: string;
  when: string;
  analogy: string;
  /** 5: comparison with a language the learner already knows */
  compare: { lang: string; other: string; java: string; notes: string[] };
  /** 6: syntax breakdown */
  syntax: { code: string; parts: { token: string; meaning: string }[] };
  /** 7: executable example (runs on the real JDK through the runner) */
  example: { title: string; files: SourceFile[]; expectedOutput?: string; stdin?: string; explain?: string };
  /** 8: visual explanation */
  visual?: { id: VisualizerId; caption: string };
  /** Extra explanation sections (markdown-lite) */
  body?: { heading: string; text: string; code?: string }[];
  /** 9: tracing exercise — predict the output, then verify on the JDK */
  trace: { code: string; output: string; explanation: string };
  /** 10: small coding challenge (id in content/coding-tasks), or an exam-lab task */
  challenge?: { taskId: string } | { examTask: string; text: string };
  /** 11 */
  mistakes: { mistake: string; fix: string }[];
  /** 12: question ids from the bank */
  quiz: string[];
  /** 13: exam-style question (self-assessed against a model answer) */
  examQuestion: { prompt: string; modelAnswer: string };
  /** 14 */
  summary: string[];
}

export interface Module {
  id: string;
  code: string;
  title: string;
  goal: string;
  priority: "P0" | "P1" | "P2";
  lessons: string[];
  /** Extra hands-on pages that belong to the module */
  labs?: { href: string; label: string }[];
}

export interface CodingFile extends SourceFile {
  readOnly?: boolean;
}

export interface CodingTask {
  id: string;
  lessonId: string;
  title: string;
  skill: SkillGroup;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  files: CodingFile[];
  /** Body of JccTests.main(): calls test("name", () -> { ... }). Hidden from the learner. */
  tests: string;
  hints: string[];
  solution: SourceFile[];
}
