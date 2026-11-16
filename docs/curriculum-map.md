# Curriculum Map

Source key: **U** university material · **M** mock paper · **S** supplemental. Every lesson has all 14 elements (what/why/when/analogy, comparison, syntax, runnable example, trace, challenge, mistakes, quiz, exam question, summary); visuals where listed.

| Module | Lesson | Sources | Visual | Challenge (real tests) | Videos |
|---|---|---|---|---|---|
| 00 Quick Start | java-quickstart | U L1, Tut W01 · S | execution | ct-energy-basics | Java #1 |
| 01 Fundamentals | java-syntax-bridge | U Tut W01 · S | — | ct-priority-switch | Java #2, #7, #23 |
| | methods-arrays-lists | U Tut W01, L3 | — | ct-energy-basics | Java #26, #31, #56 |
| 02 OOP (P0) | classes-objects | U W01 Circle, L1 | object-memory | ct-circle | Java #39, #42 |
| | constructors-encapsulation | U L2, W01 · M | — | ct-product | Java #40, #41, #52 |
| | inheritance-super | U L4, Tut 4, Week05 · M 2.1 | inheritance | ct-digital-product | Java #44, #45 |
| | abstract-overriding | U L5, Tut 5 · M Task 1 | — | ct-ground-mission | Java #46, #48, #27 |
| | polymorphism | U L5, Week05, Tut 5 · M 2.3 | polymorphism | ct-air-mission | Java #50, #51, #49, #43 |
| | interfaces-enums *(new)* | U L5, Tut 5, Week05 | — | ct-discountable | Java #49, #68 |
| | uml-class-diagrams *(new, P1)* | U L2, L4, W01 | inheritance | ct-uml-to-code | — |
| 03 Collections | collections-generics | U L3 · M repository | — | ct-repository-lookup | Java #56, #67, #66 |
| | comparator-sorting | M 2.3 · U solution · S | sorting | ct-sort-missions | Java #63 |
| 04 Exceptions | exceptions-validation | U L6 · M Task 3 | — | ct-validation | Java #57 |
| | overflow-long | M 1.1/2.2/3.2 · S | — | ct-safe-energy | — |
| 05 Algorithms | greedy-dispatch | M 2.3, §5 · U solution · S | greedy | ct-greedy-plan | — |
| 06 Spring Boot | spring-boot-basics | U L1, L7 · M starter | request-flow | Exam Lab Task 4 | Spring #1, #4, #7, #8 |
| | spring-rest-params | U Tut 3, L6 · M Task 4 | — | Exam Lab Task 4 | Spring #6, #10, #11 |
| | spring-layers-di | U L3, L7 | — | Exam Lab Task 3 | Spring #13 |
| | spring-exception-handling | U L6 · M 3.3 | request-flow | Exam Lab Task 3 | — |
| | rest-crud-extras *(new)* | U Tut 3, L6 | — | Ticketing lab | Spring #12 |
| 07 Starter Explorer | starter-project-tour | U LBP §5, L6 · M | request-flow | Exam Lab Task 1 | — |
| 08 Mock Exam Lab | exam-strategy | U LBP, L6 briefing | — | Simulator | — |
| 09 Simulator | `/exam/simulator` | M | | 33 grader tests | |
| 10 Revision | `/revision` | U + M + S | | | |

Question bank: 108 questions across mcq, concept, multi-select, predict-output, find-the-error, code-completion and order-the-steps (practical problems are the 11 coding tasks + Exam Lab).

## Lecture Guides (learn from zero) — `/lectures`
**Part 1 — Java basics (SD2, 4COSC010C)**, from `SD2 Lec notes.zip` (extracted unchanged to `materials/SD2/`, not committed):

| Guide | Follows | Runnable steps |
|---|---|---|
| sd2-1 How Java runs, output, Scanner input | SD2 Lecture 1 | 2 |
| sd2-2 Types, casting, operators, constants, if/switch | SD2 Lecture 2 | 5 |
| sd2-3 Loops, break/continue, validation, debugging | SD2 Lecture 3 | 5 |
| sd2-4 Arrays, 2D arrays, search, sort | SD2 Lecture 4 | 6 |
| sd2-5 Methods, scope, overloading, recursion | SD2 Lecture 5 | 5 |
| sd2-8 Classes & objects, Week 09 activity | SD2 Lecture 8 + Week 09 | 4 |
| sd2-files File handling | SD2 file-handling tutorial | 1 |
| sd2-10 Queues, stacks, Collections Framework | SD2 Lecture 10 | 4 |

SD2 slide errors found while writing them (shown on the guide pages): `char` range given as 0–255 (it is 0–65,535); "switch only on byte/short/int/char" contradicted by the String switch example (allowed since Java 7); `students_ID[3]` on a 3-element array (throws); `for (int element : students_ID)` over a String array (does not compile); `new Student()` with only a one-argument constructor (does not compile).

**Part 2 — OOP & Spring (5COSC019W)**:
`content/guides/` — one guide per university lecture, in lecture order, using the lecturer's own example classes (EquipmentItem, Product, DigitalProduct, PhysicalProduct, ShoppingCart, Discountable). Each guide: plain-language steps, line-by-line meanings, runnable examples (all executed by `test:content`), "Try this", "In the exam", self-checks, viva practice with model answers, and links to the matching lessons/labs. Lessons link back to their guide ("New to this topic?").

| Guide | Follows | Runnable steps | Viva Qs |
|---|---|---|---|
| Week 1 — Java from zero, then your first class | Lecture 1, Week 1 notes, Java Refresher | 5 | 5 |
| Lecture 2 — Encapsulation, constructors, static, UML | Lecture 2, Tutorial 2 | 3 | 5 |
| Lecture 3 — Lists, maps, generics, service layer | Lecture 3, Tutorial 3 | 4 | 5 |
| Lecture 4 — Inheritance, super(...), IS-A vs HAS-A | Lecture 4, Tutorial 4 | 4 | 5 |
| Lecture 5 — Polymorphism, abstract, interfaces, binding | Lecture 5, Tutorial 5, Week05 | 6 | 6 |
| Lecture 6 — Exceptions, 404/400 handlers, mock briefing | Lecture 6, mock paper | 2 | 5 |
| Lecture 7 — IoC, constructor injection, repository interface | Lecture 7 | 3 | 4 |

Discrepancies found while writing them (shown on the guide pages): Lecture 1 slide 12 expects `199.9` but the JDK prints `199.89999999999998`; Lecture 2 slide 21 combines `final` fields with an empty constructor, which does not compile.

## Practice projects
| Project | Origin | Shape | Tests |
|---|---|---|---|
| Event Ticketing API (`/exam/tickets`) | original, written for this app | Lecture 6 briefing's real-paper shape: complete subclass (18) · create subclass (22) · 404 (16) · GET by id + POST 201 (14) · 400 (10) · Section B (20) | 24 |
| Emergency Dispatch Energy Planner (`/exam`) | university starter + paper | MODERATE mock paper | 33 |

## Start → finish path
`content/journey.ts` defines 13 ordered stages (shown on the dashboard and roadmap), each with a checkable "done when" rule. Stages list their lecture guide first, so **Start here** opens the Week 1 guide.

## Coverage
`content/coverage.ts` / `/coverage` lists every assessable topic from the materials with status covered / partial / not covered / out of scope. Remaining gaps: `toString/equals/hashCode`, `@PutMapping`, and the two other sample assessments the LBP guidance mentions (not in the archive).
