import type { Lesson, Module } from "@/lib/curriculum/types";
import { foundationLessons } from "./lessons/foundations";
import { oopLessons } from "./lessons/oop";
import { coreLessons } from "./lessons/core";
import { springLessons } from "./lessons/spring";
import { examLessons } from "./lessons/exam";
import { extraLessons } from "./lessons/extra";

export const LESSONS: Lesson[] = [...foundationLessons, ...oopLessons, ...coreLessons, ...springLessons, ...examLessons, ...extraLessons];
export const LESSON_MAP: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

export const MODULES: Module[] = [
  { id: "m00", code: "00", title: "Java Quick Start", goal: "Read and run Java comfortably.", priority: "P0", lessons: ["java-quickstart"], labs: [{ href: "/playground", label: "Hello World playground" }] },
  { id: "m01", code: "01", title: "Java Fundamentals", goal: "Bridge JS/TS syntax into Java types, control flow, methods and lists.", priority: "P0", lessons: ["java-syntax-bridge", "methods-arrays-lists"] },
  { id: "m02", code: "02", title: "Object-Oriented Programming", goal: "Classes, constructors, encapsulation, inheritance, abstraction, polymorphism.", priority: "P0", lessons: ["classes-objects", "constructors-encapsulation", "inheritance-super", "abstract-overriding", "polymorphism", "interfaces-enums", "uml-class-diagrams"], labs: [{ href: "/oop-lab", label: "OOP visual lab" }] },
  { id: "m03", code: "03", title: "Collections & Lambdas", goal: "Lists, maps, generics and multi-key sorting.", priority: "P0", lessons: ["collections-generics", "comparator-sorting"], labs: [{ href: "/algorithms#sorting", label: "Sorting visualizer" }] },
  { id: "m04", code: "04", title: "Exceptions & Validation", goal: "Throw, catch, validate boundaries, prevent overflow.", priority: "P0", lessons: ["exceptions-validation", "overflow-long"] },
  { id: "m05", code: "05", title: "Algorithms & Problem Solving", goal: "Turn a specification into filter → sort → greedy.", priority: "P0", lessons: ["greedy-dispatch"], labs: [{ href: "/algorithms", label: "Greedy planner visualizer" }] },
  { id: "m06", code: "06", title: "Spring Boot Foundation", goal: "Controllers, services, repositories, REST, error handling.", priority: "P0", lessons: ["spring-boot-basics", "spring-rest-params", "spring-layers-di", "spring-exception-handling", "rest-crud-extras"], labs: [{ href: "/spring-boot", label: "Request flow visualizer" }] },
  { id: "m07", code: "07", title: "Starter Project Explorer", goal: "Read an unfamiliar Spring project in ten minutes.", priority: "P0", lessons: ["starter-project-tour"], labs: [{ href: "/spring-boot#explorer", label: "Starter project explorer" }] },
  { id: "m08", code: "08", title: "Mock Exam Lab", goal: "Guided practice on the real starter project with real tests.", priority: "P0", lessons: ["exam-strategy"], labs: [{ href: "/exam", label: "Open the Exam Lab" }] },
  { id: "m09", code: "09", title: "Full Exam Simulator", goal: "100 minutes, timed, transparent marking.", priority: "P1", lessons: [], labs: [{ href: "/exam/simulator", label: "Start the simulator" }] },
  { id: "m10", code: "10", title: "Final Revision", goal: "Cheat sheets, templates and last-minute cards.", priority: "P1", lessons: [], labs: [{ href: "/revision", label: "Revision Center" }] },
];

export function moduleOf(lessonId: string): Module | undefined {
  return MODULES.find((m) => m.lessons.includes(lessonId));
}

/** Lessons in curriculum order. */
export const LESSON_ORDER: string[] = MODULES.flatMap((m) => m.lessons);

export function nextLesson(id: string): Lesson | undefined {
  const i = LESSON_ORDER.indexOf(id);
  return i >= 0 && i < LESSON_ORDER.length - 1 ? LESSON_MAP[LESSON_ORDER[i + 1]] : undefined;
}

export function prevLesson(id: string): Lesson | undefined {
  const i = LESSON_ORDER.indexOf(id);
  return i > 0 ? LESSON_MAP[LESSON_ORDER[i - 1]] : undefined;
}
