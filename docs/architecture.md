# Architecture

```
Browser (Next.js UI, Monaco)            Next.js server                       Runner (separate process)
──────────────────────────────          ─────────────────────                ───────────────────────────────
lessons · quizzes · visualizers   ──►   /api/run            ── token ──►     127.0.0.1:4100  POST /run
exam IDE · progress (localStorage)      /api/project-test   (proxy only,     javac + java (JDK 25), temp dir
                                        /api/runner-health   never runs       POST /project/test
                                                             Java itself)     Maven offline + grader JUnit tests
```

## Key decisions

| Decision | Why |
|---|---|
| **Separate runner process** (`runner/`, plain Node `http`, run with `tsx`) | The brief forbids executing Java inside the Next.js server. The runner binds to loopback only, requires a shared token (`.runner-token`, auto-generated), rejects any request carrying an `Origin` header (no direct browser access), validates file names/paths, caps body size, output (64 KB), heap (256 MB), run time (8 s), compile time (20 s), project time (240 s), and concurrency (2 runs / 1 Maven job). Child processes get a minimal environment (no inherited secrets) and a fresh temp dir that is deleted afterwards. Process trees are killed on timeout (`taskkill /T` on Windows). |
| **Two execution modes** | `RUNNER_MODE=local` (default): a normal JDK process — the same trust level as pressing Run in IntelliJ; **not a sandbox**. `RUNNER_MODE=docker`: single-file runs in `eclipse-temurin:25-jdk` with `--network none --read-only --memory 384m --cpus 1 --pids-limit 128 --cap-drop ALL --user 65534`. Docker mode is implemented but was **not tested** on this machine (the Docker daemon was not running). Maven project tests always run in local mode. |
| **Portable JDK 25** in `.tools/` | The installed JDK was 23; the starter `pom.xml` requires Java 25. The runner prefers `.tools/jdk-25*`, then `JCC_JAVA_HOME`, then `JAVA_HOME`. |
| **Maven via classworlds launcher** | Runs `mvn` through `java -cp plexus-classworlds … Launcher` so no shell is ever spawned (Node cannot spawn `.cmd` files without a shell). `-o` offline: dependencies must be cached once (`npm run test:grader -- --online`). |
| **Grader = JUnit suite copied into the learner's project** | `java-grader/dispatch/tests` (33 tests). `AirMission` is reached via reflection so a missing class only fails its own tests. HTTP checks start the real app on a random port. The planner is checked against 60 random scenarios with an unseen `FixedMission` subclass. |
| **Local-first progress** | `lib/storage/store.ts` defines a `StorageAdapter` + `VersionedStore` (schema version + migrations). `lib/progress/store.ts` uses `useSyncExternalStore`. A database adapter can replace localStorage without touching lessons. |
| **Data-driven curriculum** | Lessons (`content/lessons/*`), questions, coding tasks, paper tasks, revision, videos are typed data (`lib/curriculum/types.ts`, `lib/quiz/types.ts`). Pages contain no lesson text. |
| **Visualizers driven by a TS model** | `lib/algorithms/dispatch.ts` mirrors the paper's rules (incl. `Math.toIntExact` overflow via BigInt). Visualizers are labelled as simulations; grading always runs real Java. |
| **No shadcn CLI / React Flow / Mermaid / Framer Motion** | To keep the dependency surface small and offline-friendly, UI primitives are hand-written in shadcn style (`components/ui/primitives.tsx`) and diagrams are custom SVG/HTML. CSS transitions replace Motion. |
| **Monaco from CDN** | `@monaco-editor/react` loads Monaco from jsDelivr. If that fails (offline) the editor falls back to a plain textarea after 12 s. |

## Directory map

```
app/                    routes (dashboard, roadmap, learn, oop-lab, algorithms, spring-boot,
                        playground, exam, exam/simulator, quizzes, revision, progress, resources, api/*)
components/             ui · layout · content · lessons · playground · quizzes · visualizers · exam · dashboard
content/                lessons/, questions.ts, coding-tasks.ts, exam-paper.ts, starter-tour.ts, revision.ts, videos.ts, modules.ts
lib/                    algorithms/ assessment/ curriculum/ execution/ progress/ projects/ quiz/ scheduling/ storage/ exam.ts
runner/                 server.ts, java.ts, maven.ts, process.ts, config.ts, protocol.ts, selftest.ts, grader-selftest.ts
java-grader/dispatch/   starter/ (pristine copy), reference/ (worked solution), tests/ (grader)
scripts/                dev-all.mjs, verify-content.ts
tests/                  vitest unit tests
materials/              extracted OOP-26.rar (read-only source material) + text extracts
```

## Deployment notes
Vercel can host the UI, but **cannot** run the runner (it needs a JDK, Maven, and long-lived processes). A hosted deployment would need the runner on a separate machine/container with Docker mode enabled, `RUNNER_URL` + `RUNNER_TOKEN` set on the web app, and network isolation for project tests (not implemented).
