import type { LectureGuide } from "./types";
import { week1, lecture2 } from "./week1-2";
import { lecture3, lecture4 } from "./lecture3-4";
import { lecture5 } from "./lecture5";
import { lecture6, lecture7 } from "./lecture6-7";
import { sd2L1, sd2L2, sd2L3, sd2L4 } from "./sd2-basics";
import { sd2L5, sd2L8, sd2Files, sd2L10 } from "./sd2-more";

export type { LectureGuide, GuideStep } from "./types";

/** Part 1: SD2 (4COSC010C) Java basics, then Part 2: 5COSC019W OOP lectures — each in lecture order. */
export const SD2_GUIDES: LectureGuide[] = [sd2L1, sd2L2, sd2L3, sd2L4, sd2L5, sd2L8, sd2Files, sd2L10];
export const OOP_GUIDES: LectureGuide[] = [week1, lecture2, lecture3, lecture4, lecture5, lecture6, lecture7];
export const GUIDES: LectureGuide[] = [...SD2_GUIDES, ...OOP_GUIDES];
export const GUIDE_MAP: Record<string, LectureGuide> = Object.fromEntries(GUIDES.map((g) => [g.id, g]));

/** Progress key stored in progress.code when a guide is marked done. */
export const guideDoneKey = (id: string) => `guide:done:${id}`;

/** The lecture guide that explains a lesson's topic from zero. */
export const LESSON_GUIDE: Record<string, string> = {
  "java-quickstart": "sd2-1",
  "java-syntax-bridge": "sd2-2",
  "methods-arrays-lists": "sd2-5",
  "classes-objects": "week-1",
  "constructors-encapsulation": "lecture-2",
  "uml-class-diagrams": "lecture-2",
  "collections-generics": "lecture-3",
  "inheritance-super": "lecture-4",
  "abstract-overriding": "lecture-5",
  "polymorphism": "lecture-5",
  "interfaces-enums": "lecture-5",
  "exceptions-validation": "lecture-6",
  "spring-exception-handling": "lecture-6",
  "spring-layers-di": "lecture-7",
  "spring-boot-basics": "lecture-3",
  "rest-crud-extras": "lecture-3",
};
