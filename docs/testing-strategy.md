# Testing Strategy

All results below were produced by actually running the commands (last run 17 Nov 2026).

| Layer | Command | What it proves | Last result |
|---|---|---|---|
| Unit (TS) | `npm test` | dispatch model (B3/B4/B6, overflow), quiz grading for every type, spaced review, Colombo countdown, rubric totals, storage migration, schedule, readiness, runner parsers | 28/28 |
| Runner | `npm run test:runner` | real javac/java: output, compile-error lines, infinite-loop kill, output cap, stdin, exceptions, multi-file polymorphism, path traversal rejected | 8/8 |
| Graders | `npm run test:grader` | for **both** projects: untouched starter compiles and passes 0 tests; reference passes all; an injected typical bug fails only the right tests; a syntax error is located | Dispatch 4/4 (0/33 → 33/33) · Ticketing 4/4 (0/24 → 24/24) |
| Content | `npm run test:content` | every lesson example + trace output, every runnable lecture-guide step (27) and guide link, every runnable predict question, every coding-task solution (all pass) and starter (not all pass), integrity of ids/links/video chapters | 474/474 |
| Pages in Chrome | `npm run test:pages` | every page (29, incl. 8 lecture-guide pages) at 1440 px and 390 px: no console/page errors (incl. hydration), no horizontal overflow | 0 problems |
| Learner flow in Chrome | `npm run test:ui` | dashboard path + Start here → Week 1 lecture guide (JDK run, mark finished) → lesson → real JDK run → quiz → mark complete → refresh persists → Ticketing lab Maven run → simulator → coverage → OOP lab guide | 10/10 |
| Types / build | `npm run typecheck`, `npm run build` | whole app incl. runner; 40 routes | clean / success |

`test:pages` and `test:ui` need the app and runner running (`npm run dev`) and drive the installed Chrome through `playwright-core` (no browser download).

## Bugs these checks caught (and were fixed)
- Hydration error on lesson pages: block Markdown nested inside `<p>` → added an inline Markdown mode.
- Horizontal overflow at phone width on 5 pages → grid items `min-width: 0`, wrapping for long code/paths, scrollable tables.
- Exam pages crashed after the multi-project refactor (a config with functions passed to a client component) → pass the project id only.
- A wrong expected output in one lesson and a wrong answer in one quiz question (found by `test:content`).

## Not verified
- Docker execution mode (Docker daemon not running on this machine).
- Monaco's offline fallback path.
- Screen-reader pass (keyboard focus styles and ARIA roles exist but were not audited with assistive tech).
