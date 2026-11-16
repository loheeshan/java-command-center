import type { BlockStatus } from "@/lib/progress/types";

export type BlockKind = "study" | "practice" | "break" | "quiz" | "exam" | "logistics";

export interface StudyBlock {
  id: string;
  day: "Tue" | "Wed" | "Thu" | "Fri";
  start: string; // ISO with +05:30
  end: string;
  title: string;
  kind: BlockKind;
  lessonIds: string[];
  href?: string;
}

const T = (date: string, hm: string) => `${date}T${hm}:00+05:30`;
const TUE = "2026-11-17", WED = "2026-11-18", THU = "2026-11-19", FRI = "2026-11-20";

export const STUDY_PLAN: StudyBlock[] = [
  { id: "tue-1", day: "Tue", start: T(TUE, "19:00"), end: T(TUE, "20:00"), title: "Java setup and syntax fundamentals", kind: "study", lessonIds: ["java-quickstart", "java-syntax-bridge"] },
  { id: "tue-2", day: "Tue", start: T(TUE, "20:00"), end: T(TUE, "21:15"), title: "Classes, objects, constructors and access modifiers", kind: "study", lessonIds: ["classes-objects", "constructors-encapsulation"] },
  { id: "tue-b", day: "Tue", start: T(TUE, "21:15"), end: T(TUE, "21:30"), title: "Break", kind: "break", lessonIds: [] },
  { id: "tue-3", day: "Tue", start: T(TUE, "21:30"), end: T(TUE, "22:45"), title: "Inheritance, super, overriding, abstraction and polymorphism", kind: "study", lessonIds: ["inheritance-super", "abstract-overriding", "polymorphism", "interfaces-enums"], href: "/oop-lab" },
  { id: "tue-4", day: "Tue", start: T(TUE, "22:45"), end: T(TUE, "23:00"), title: "Quiz and revision", kind: "quiz", lessonIds: [], href: "/quizzes" },

  { id: "wed-1", day: "Wed", start: T(WED, "09:00"), end: T(WED, "10:30"), title: "Java foundations reinforcement and collections", kind: "study", lessonIds: ["methods-arrays-lists", "collections-generics"] },
  { id: "wed-2", day: "Wed", start: T(WED, "10:45"), end: T(WED, "12:15"), title: "OOP coding exercises", kind: "practice", lessonIds: ["inheritance-super", "abstract-overriding", "polymorphism"], href: "/playground" },
  { id: "wed-3", day: "Wed", start: T(WED, "13:15"), end: T(WED, "14:45"), title: "Exceptions, validation and integer overflow", kind: "study", lessonIds: ["exceptions-validation", "overflow-long"] },
  { id: "wed-4", day: "Wed", start: T(WED, "15:00"), end: T(WED, "16:30"), title: "Sorting, comparators and greedy algorithms", kind: "study", lessonIds: ["comparator-sorting", "greedy-dispatch"], href: "/algorithms" },
  { id: "wed-5", day: "Wed", start: T(WED, "18:00"), end: T(WED, "19:30"), title: "Spring Boot architecture and annotations", kind: "study", lessonIds: ["spring-boot-basics", "spring-layers-di"], href: "/spring-boot" },
  { id: "wed-6", day: "Wed", start: T(WED, "19:45"), end: T(WED, "21:15"), title: "REST controller, service, repository and API exercises", kind: "study", lessonIds: ["spring-rest-params", "spring-exception-handling", "rest-crud-extras"] },
  { id: "wed-7", day: "Wed", start: T(WED, "21:15"), end: T(WED, "21:45"), title: "Revision and knowledge checks", kind: "quiz", lessonIds: [], href: "/quizzes" },

  { id: "thu-1", day: "Thu", start: T(THU, "09:00"), end: T(THU, "10:30"), title: "Read and understand the complete starter project", kind: "study", lessonIds: ["starter-project-tour", "uml-class-diagrams"], href: "/spring-boot#explorer" },
  { id: "thu-2", day: "Thu", start: T(THU, "10:45"), end: T(THU, "12:15"), title: "Guided mock: Ticketing project (real-paper shape)", kind: "practice", lessonIds: [], href: "/exam/tickets" },
  { id: "thu-3", day: "Thu", start: T(THU, "13:15"), end: T(THU, "14:45"), title: "Guided mock: Dispatch project (university mock)", kind: "practice", lessonIds: [], href: "/exam" },
  { id: "thu-4", day: "Thu", start: T(THU, "15:00"), end: T(THU, "16:40"), title: "Full 100-minute timed practice", kind: "exam", lessonIds: ["exam-strategy"], href: "/exam/simulator" },
  { id: "thu-5", day: "Thu", start: T(THU, "17:15"), end: T(THU, "18:30"), title: "Analyse mistakes and repair weak areas", kind: "practice", lessonIds: [], href: "/progress" },
  { id: "thu-6", day: "Thu", start: T(THU, "19:00"), end: T(THU, "20:30"), title: "Targeted repeat practice", kind: "practice", lessonIds: [], href: "/exam" },
  { id: "thu-7", day: "Thu", start: T(THU, "20:30"), end: T(THU, "21:00"), title: "Final revision", kind: "quiz", lessonIds: [], href: "/revision" },

  { id: "fri-1", day: "Fri", start: T(FRI, "08:00"), end: T(FRI, "09:00"), title: "OOP and Java coding revision", kind: "quiz", lessonIds: [], href: "/revision" },
  { id: "fri-2", day: "Fri", start: T(FRI, "09:00"), end: T(FRI, "10:00"), title: "Spring Boot API and error-handling review", kind: "quiz", lessonIds: [], href: "/revision#spring" },
  { id: "fri-3", day: "Fri", start: T(FRI, "10:15"), end: T(FRI, "11:15"), title: "Short practical challenges", kind: "practice", lessonIds: [], href: "/playground" },
  { id: "fri-4", day: "Fri", start: T(FRI, "11:15"), end: T(FRI, "12:00"), title: "Review mistakes and essential syntax", kind: "quiz", lessonIds: [], href: "/quizzes?mode=review" },
  { id: "fri-5", day: "Fri", start: T(FRI, "12:00"), end: T(FRI, "13:30"), title: "Stop heavy learning — eat, travel, logistics", kind: "logistics", lessonIds: [] },
  { id: "fri-exam", day: "Fri", start: T(FRI, "13:30"), end: T(FRI, "15:10"), title: "Lab-Based Practical", kind: "logistics", lessonIds: [] },
];

export type BlockState = "upcoming" | "current" | "done" | "missed" | "skipped" | "unavailable";

export function blockState(b: StudyBlock, now: number, status?: BlockStatus): BlockState {
  if (status === "done") return "done";
  if (status === "skipped") return "skipped";
  if (status === "unavailable") return "unavailable";
  const s = Date.parse(b.start), e = Date.parse(b.end);
  if (now < s) return "upcoming";
  if (now < e) return "current";
  return b.kind === "break" || b.kind === "logistics" ? "done" : "missed";
}

/**
 * Lessons from blocks that were missed/skipped/unavailable and are still incomplete.
 * These are pushed to the front of the recommendation queue.
 */
export function catchUpLessons(now: number, schedule: Record<string, BlockStatus>, completed: Set<string>): string[] {
  const out: string[] = [];
  for (const b of STUDY_PLAN) {
    const st = blockState(b, now, schedule[b.id]);
    if (st === "missed" || st === "skipped" || st === "unavailable") {
      for (const l of b.lessonIds) if (!completed.has(l) && !out.includes(l)) out.push(l);
    }
  }
  return out;
}
