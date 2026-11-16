import type { ProgressState } from "@/lib/progress/types";

/**
 * The single start → finish path through the Command Center.
 * Each stage has an explicit, checkable "done when" rule based on recorded activity.
 */
export interface JourneyItem {
  label: string;
  href: string;
  /** lesson id, if this item is a lesson (completion = marked complete) */
  lessonId?: string;
}

export interface JourneyStage {
  id: string;
  title: string;
  why: string;
  when: string;
  minutes: number;
  items: JourneyItem[];
  doneWhen: string;
  isDone: (p: ProgressState) => boolean;
}

const lessonsDone = (p: ProgressState, ids: string[]) => ids.every((id) => Boolean(p.lessons[id]?.completedAt));
const L = (id: string, label: string): JourneyItem => ({ label, href: `/learn/${id}`, lessonId: id });
const bestLab = (p: ProgressState, project: string) =>
  Math.max(-1, ...p.exams.filter((e) => (e.projectId ?? "dispatch") === project).map((e) => e.total));

export const JOURNEY: JourneyStage[] = [
  {
    id: "start", title: "Start: how Java runs", when: "Tue 19:00", minutes: 35,
    why: "Set up the mental model: source → javac → bytecode → JVM. Run your first program here.",
    items: [L("java-quickstart", "Java Quick Start"), { label: "Execution visualizer", href: "/oop-lab#execution" }],
    doneWhen: "Java Quick Start lesson marked complete",
    isDone: (p) => lessonsDone(p, ["java-quickstart"]),
  },
  {
    id: "syntax", title: "Java syntax for a JS/TS developer", when: "Tue 19:30", minutes: 85,
    why: "Types, integer division, String equality, loops, methods, arrays and ArrayList.",
    items: [L("java-syntax-bridge", "Variables, types, control flow"), L("methods-arrays-lists", "Methods, arrays, ArrayList")],
    doneWhen: "both lessons complete",
    isDone: (p) => lessonsDone(p, ["java-syntax-bridge", "methods-arrays-lists"]),
  },
  {
    id: "classes", title: "Classes, constructors, encapsulation", when: "Tue 20:00", minutes: 80,
    why: "The basis of every model class in the practical (Week 01 Circle, Lecture 2 Product).",
    items: [L("classes-objects", "Classes & objects"), L("constructors-encapsulation", "Constructors & encapsulation"), { label: "Object memory visualizer", href: "/oop-lab#memory" }],
    doneWhen: "both lessons complete",
    isDone: (p) => lessonsDone(p, ["classes-objects", "constructors-encapsulation"]),
  },
  {
    id: "oop", title: "Inheritance, abstraction, polymorphism, interfaces", when: "Tue 21:30", minutes: 175,
    why: "Exam Tasks 1–2 in every paper: complete a subclass with super(...), create a new subclass, override abstract methods.",
    items: [
      L("inheritance-super", "extends & super(...)"), L("abstract-overriding", "Abstract & @Override"),
      L("polymorphism", "Polymorphism"), L("interfaces-enums", "Interfaces & enums"), { label: "OOP Lab (all four visualizers)", href: "/oop-lab" },
    ],
    doneWhen: "all four lessons complete",
    isDone: (p) => lessonsDone(p, ["inheritance-super", "abstract-overriding", "polymorphism", "interfaces-enums"]),
  },
  {
    id: "collections", title: "Collections & sorting", when: "Wed 09:00", minutes: 85,
    why: "Repositories hold Maps and Lists; planners sort with multi-key Comparators.",
    items: [L("collections-generics", "List, Map, generics"), L("comparator-sorting", "Comparator sorting"), { label: "Sorting visualizer", href: "/algorithms#sorting" }],
    doneWhen: "both lessons complete",
    isDone: (p) => lessonsDone(p, ["collections-generics", "comparator-sorting"]),
  },
  {
    id: "exceptions", title: "Exceptions, validation, overflow", when: "Wed 13:15", minutes: 70,
    why: "The 404 and 400 tasks start here: custom exceptions, boundary validation, long + Math.toIntExact.",
    items: [L("exceptions-validation", "Exceptions & validation"), L("overflow-long", "Overflow-safe arithmetic")],
    doneWhen: "both lessons complete",
    isDone: (p) => lessonsDone(p, ["exceptions-validation", "overflow-long"]),
  },
  {
    id: "algorithm", title: "Greedy algorithm", when: "Wed 15:00", minutes: 50,
    why: "The 'higher difficulty' marks: turning a written specification into filter → sort → select/skip.",
    items: [L("greedy-dispatch", "Greedy dispatch"), { label: "Greedy planner visualizer", href: "/algorithms" }],
    doneWhen: "lesson complete",
    isDone: (p) => lessonsDone(p, ["greedy-dispatch"]),
  },
  {
    id: "spring", title: "Spring Boot REST API", when: "Wed 18:00", minutes: 185,
    why: "40 marks are Spring Boot: controllers, services, injection, GET/POST/DELETE, 201/204/400/404 and the global handler.",
    items: [
      L("spring-boot-basics", "Spring Boot foundations"), L("spring-rest-params", "@PathVariable, @RequestBody, 201"),
      L("spring-layers-di", "Layers & injection"), L("spring-exception-handling", "Global exception handling"),
      L("rest-crud-extras", "GET by id, DELETE, Optional"), { label: "Request-flow visualizer", href: "/spring-boot" },
    ],
    doneWhen: "all five lessons complete",
    isDone: (p) => lessonsDone(p, ["spring-boot-basics", "spring-rest-params", "spring-layers-di", "spring-exception-handling", "rest-crud-extras"]),
  },
  {
    id: "reading", title: "Read an unfamiliar project", when: "Thu 09:00", minutes: 55,
    why: "On the day you get new code. Practise the 10-minute reading routine and UML.",
    items: [L("starter-project-tour", "Reading a starter project"), L("uml-class-diagrams", "UML class diagrams"), { label: "Starter project explorer", href: "/spring-boot#explorer" }],
    doneWhen: "starter-tour lesson complete",
    isDone: (p) => lessonsDone(p, ["starter-project-tour"]),
  },
  {
    id: "mock-tickets", title: "Guided mock: Ticketing (real-paper shape)", when: "Thu 10:45", minutes: 90,
    why: "Five tasks in the exact shape Lecture 6 describes for the real paper. Hints and reference allowed.",
    items: [{ label: "Open the Ticketing lab", href: "/exam/tickets" }],
    doneWhen: "a lab run scoring ≥ 80/100",
    isDone: (p) => bestLab(p, "tickets") >= 80,
  },
  {
    id: "mock-dispatch", title: "Guided mock: Dispatch (university mock)", when: "Thu 13:15", minutes: 90,
    why: "The university's own mock paper and starter project — includes the greedy planner.",
    items: [{ label: "Open the Dispatch lab", href: "/exam" }],
    doneWhen: "a lab run scoring ≥ 80/100",
    isDone: (p) => bestLab(p, "dispatch") >= 80,
  },
  {
    id: "simulate", title: "Timed 100-minute simulation", when: "Thu 15:00", minutes: 100,
    why: "Exam conditions: no hints, no reference, the timer keeps running, auto-submit.",
    items: [{ label: "Start the simulator", href: "/exam/simulator" }],
    doneWhen: "one simulation submitted",
    isDone: (p) => p.exams.some((e) => e.mode === "simulator"),
  },
  {
    id: "finish", title: "Repair, revise, viva-ready", when: "Thu 17:15 → Fri 12:00", minutes: 240,
    why: "Fix weak areas, review wrong answers, rehearse the exam-day workflow and explain your code aloud.",
    items: [L("exam-strategy", "Exam-day workflow"), { label: "Due quiz reviews", href: "/quizzes?mode=review" }, { label: "Revision Center", href: "/revision" }],
    doneWhen: "exam-strategy lesson complete and no quiz reviews overdue",
    isDone: (p) => lessonsDone(p, ["exam-strategy"]) && Object.values(p.review).every((r) => r.dueAt > Date.now()),
  },
];

export function journeyStatus(p: ProgressState) {
  const done = JOURNEY.map((s) => s.isDone(p));
  const currentIndex = done.findIndex((d) => !d);
  return { done, currentIndex, finished: currentIndex === -1, completed: done.filter(Boolean).length };
}
