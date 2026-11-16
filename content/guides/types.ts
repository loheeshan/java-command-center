import type { SourceFile } from "@/runner/protocol";

/**
 * A Lecture Guide follows ONE university lecture in its own order, with the
 * lecturer's own example classes, explained for someone starting from zero.
 * Every runnable step is executed on the real JDK by `npm run test:content`.
 */
export interface GuideStep {
  title: string;
  /** Plain-language paragraphs (markdown-lite: **bold**, `code`, "- " lists). */
  explain: string[];
  /** Code to read (not run) — e.g. Spring code that needs the full project. */
  code?: string;
  codeTitle?: string;
  /** Code you can run on the JDK. Single Main.java unless stated. */
  run?: { files: SourceFile[]; expectedOutput: string; /** keyboard input fed to Scanner */ stdin?: string };
  /** Line-by-line reading of the code above. */
  lines?: { code: string; meaning: string }[];
  table?: { head: string[]; rows: string[][] };
  /** A small thing to change and re-run. */
  tryIt?: string;
  /** Self-check question with the answer hidden until clicked. */
  check?: { q: string; a: string };
  /** How this shows up in the Lab-Based Practical or the viva. */
  exam?: string;
}

export interface LectureGuide {
  id: string;
  /** Which university module the lecture belongs to. */
  track: "sd2" | "oop";
  /** e.g. "Week 1" */
  week: string;
  lecture: string;
  title: string;
  /** University files this guide follows. */
  sources: string[];
  /** One-sentence goal in plain words. */
  goal: string;
  minutes: number;
  /** What you will be able to do after this guide. */
  outcomes: string[];
  steps: GuideStep[];
  /** Questions an examiner may ask in the viva, with model answers. */
  viva: { q: string; a: string }[];
  /** Where to practise next inside the Command Center. */
  next: { href: string; label: string }[];
  /** Honest notes where the slides and real Java behaviour disagree. */
  notes?: string[];
}

export const main = (content: string): SourceFile[] => [{ name: "Main.java", content }];
