# Java Command Center — From Zero to Exam Ready

An interactive Java, OOP & Spring Boot preparation app for **5COSC019W** (Lab-Based Practical, Fri 20 Nov 2026, 13:30 Asia/Colombo). Real Java runs on JDK 25 through a separate local runner; the mock exam is graded by real JUnit tests against your Spring Boot project.

## Run it

Requirements: Node 22+, Maven 3.9+ (on PATH or `MAVEN_HOME`). A portable JDK 25 lives in `.tools/` (or set `JCC_JAVA_HOME`).

```bash
npm install
npm run test:grader -- --online   # first time only: caches Spring Boot 4.1.1 deps, self-checks the grader
npm run dev                       # runner (127.0.0.1:4100) + web (http://localhost:3000)
```

Production: `npm run build`, then `npm run runner` and `npm start` in two terminals.

## Checks
```bash
npm test                          # unit tests (vitest)
npm run typecheck
npm run test:runner               # real JDK behaviour, limits, rejection of bad input
npm run test:grader               # both projects: starter 0 passing, reference all passing, bug detection
npm run test:content              # runs every example/trace/predict answer/coding solution on the JDK
npm run test:pages                # every page in real Chrome, desktop + phone (needs npm run dev)
npm run test:ui                   # end-to-end learner flow in real Chrome (needs npm run dev)
```

## Security — read this
The runner's default **local mode is not a sandbox**: code runs as a normal JDK process on your computer, like IntelliJ's Run button, with time/memory/output limits. It listens on loopback only, requires a token, and refuses direct browser requests. Run only your own code and never expose port 4100. `RUNNER_MODE=docker` runs single-file code in an isolated container (implemented, not yet tested here).

## Where things are
- `docs/` — source inventory, exam requirements, curriculum map, architecture, testing strategy, plan.
- `materials/OOP-26/` — your original materials extracted unchanged from `OOP-26.rar`.
- `java-grader/dispatch/` — university starter (pristine), worked solution, 33 grader tests.
- `java-grader/tickets/` — original real-paper-shape practice project, reference, 24 grader tests.
- Start at the dashboard: the **start → finish path** tells you what to do next; `/coverage` shows what the exam needs and what is covered.

**Practice simulation — not a prediction of the actual examination.**
