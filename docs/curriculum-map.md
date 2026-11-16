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

## Practice projects
| Project | Origin | Shape | Tests |
|---|---|---|---|
| Event Ticketing API (`/exam/tickets`) | original, written for this app | Lecture 6 briefing's real-paper shape: complete subclass (18) · create subclass (22) · 404 (16) · GET by id + POST 201 (14) · 400 (10) · Section B (20) | 24 |
| Emergency Dispatch Energy Planner (`/exam`) | university starter + paper | MODERATE mock paper | 33 |

## Start → finish path
`content/journey.ts` defines 13 ordered stages (shown on the dashboard and roadmap), each with a checkable "done when" rule.

## Coverage
`content/coverage.ts` / `/coverage` lists every assessable topic from the materials with status covered / partial / not covered / out of scope. Remaining gaps: `toString/equals/hashCode`, `@PutMapping`, and the two other sample assessments the LBP guidance mentions (not in the archive).
