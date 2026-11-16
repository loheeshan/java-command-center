# Implementation Plan & Status

| Phase | Scope | Status |
|---|---|---|
| 1 Source analysis | inventory, exam requirements, curriculum map | ✅ done (`docs/`) |
| 2 Architecture | runner design, storage, data model | ✅ done |
| 3 Foundation | design system, navigation, dashboard, roadmap, storage | ✅ done |
| 4 Critical curriculum | 19 lessons (Java basics → Spring exception handling) | ✅ done, content machine-verified |
| 5 Interactive practice | playground, 11 coding tasks, 96 questions / 7 types, trace exercises, 7 visualizers | ✅ done |
| 6 Algorithms | sorting + greedy visualizers with prediction mode, validation, overflow | ✅ done |
| 7 Spring Boot | 4 lessons, request-flow visualizer, starter explorer | ✅ done |
| 8 Mock exam | Exam Lab IDE on the real starter, 33-test grader, rubric, flags, reference compare | ✅ done |
| 8b Simulator | persistent 100-min timer, submission window, auto-submit, report + review plan | ✅ done |
| 9 Refinement | types, build, unit/runner/grader/content tests, HTTP e2e | ✅ done · ⚠️ visual browser/a11y/mobile pass not done |

## Recommended next steps (in priority order)
1. Manual browser pass of the 20 acceptance tests (especially phone width and the simulator flow).
2. A second original practice project in the Lecture 6 "real paper shape" (abstract parent + `getSummary()`, 404/400, GET-by-id/POST 201) with its own grader.
3. Docker mode verification; network-isolated Maven runs for hosted use.
4. Swagger/OpenAPI walkthrough lesson.
