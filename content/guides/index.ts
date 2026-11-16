import type { LectureGuide } from "./types";
import { week1, lecture2 } from "./week1-2";
import { lecture3, lecture4 } from "./lecture3-4";
import { lecture5 } from "./lecture5";
import { lecture6, lecture7 } from "./lecture6-7";

export type { LectureGuide, GuideStep } from "./types";

/** In the same order as the university lectures. */
export const GUIDES: LectureGuide[] = [week1, lecture2, lecture3, lecture4, lecture5, lecture6, lecture7];
export const GUIDE_MAP: Record<string, LectureGuide> = Object.fromEntries(GUIDES.map((g) => [g.id, g]));

/** Progress key stored in progress.code when a guide is marked done. */
export const guideDoneKey = (id: string) => `guide:done:${id}`;

/** The lecture guide that explains a lesson's topic from zero. */
export const LESSON_GUIDE: Record<string, string> = {
  "java-quickstart": "week-1",
  "java-syntax-bridge": "week-1",
  "methods-arrays-lists": "week-1",
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
