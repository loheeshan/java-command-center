# Exam Requirements

## 1. The real Lab-Based Practical (from university guidance)

| Fact | Source |
|---|---|
| 100 min: 90 solve + 10 finalise/upload | LBP guidance (Week 05), Lecture 6 |
| OOP 40 / Spring Boot 40 / Function validation 20 | LBP guidance §3 |
| Code and questions given on the day | LBP guidance §5 |
| Open book (slides, Blackboard, Java/Spring docs); no AI; no Git | Lecture 6 slide 37 |
| One ZIP of the whole Maven project; Section B runs it | Lecture 6 slides 40–41 |
| Viva verifies understanding | LBP guidance §8, Week 01 notices |
| Same *shape* as the mock: subclass + `super(...)`, new subclass, 404 handler, GET/POST 201 | Lecture 6 slide 39 |

These are university statements. Nothing in this app predicts the exact Friday paper.

## 2. Practice paper: Emergency Dispatch Energy Planner API

**Practice simulation — not a prediction of the actual examination.**

Environment: Java 25, Maven 3.9+, Spring Boot 4.1.1, springdoc 3.2.0. Packages: `controller`, `exception`,
`model`, `repository`, `service`. Ordinary classes, no records, no `dto` package.

### Seed data
| Mission | Values | Status |
|---|---|---|
| GroundMission 101 | (101, 12, 3, true) | supplied |
| GroundMission 102 | (102, 4, 2, false) | supplied |
| AirMission 103 | (103, 8, 1, 3, true) | student adds after creating `AirMission` |

### Section A — 80 marks
| Task | Requirement | Marks |
|---|---|---|
| 1.1 | `GroundMission.energyUnits()` = 2·distance + 5·load, `long` arithmetic, safe `int` conversion | 12 |
| 1.2 | `GroundMission.priority()`: medical 3, else 1; correct override | 6 |
| 2.1 | Create `AirMission extends DispatchMission`, fields `windPenalty`, `critical`, `super(...)`, getters | 7 |
| 2.2 | Air energy = 3·distance + 8·load + 2·wind (long → int safely); priority critical 5 else 2 | 7 |
| 2.3 | `plan(capacity, urgentOnly)`: filter (priority ≥ 3 when urgent), sort priority DESC / energy ASC / id ASC, traverse all, select if fits else skip and continue; no subclass type checks | 8 |
| 3.1 | `energy(id)`; unknown → `MissionNotFoundException` | 6 |
| 3.2 | `addAir`: id 1–10000, distance 1–10000, load 0–10000, wind 0–10000, reject duplicates, calculate before save, `IllegalArgumentException` | 7 |
| 3.3 | capacity ≤ 0 → IAE; handler: IAE → 400 `BAD_REQUEST`, not found → 404 `NOT_FOUND`, descriptive message | 7 |
| 4.1 | `GET /missions/{id}/energy` → `{"energyUnits":39}` | 5 |
| 4.2 | `POST /missions/air` → 201 + created AirMission | 5 |
| 4.3 | `GET /missions/plan?capacity=60&urgentOnly=false`, default `urgentOnly=false` | 10 |

### Section B — 20 marks (running application)
| Ref | Check | Marks |
|---|---|---|
| B1 | GroundMission 101: energy 39, priority 3 | 3 |
| B2 | AirMission 103: energy 38, priority 5 | 3 |
| B3 | capacity 60 → selected [103,102], skipped [101] (used 56, remaining 4) | 3 |
| B4 | capacity 60 urgentOnly → selected [103], skipped [101], 102 in neither | 3 |
| B5 | capacity ≤ 0 / invalid POST → 400 `BAD_REQUEST`; unknown id → 404 `NOT_FOUND` | 4 |
| B6 | POST 104 → 201; GET /missions includes 104; capacity 125 → [103,101,104,102], used 125, remaining 0 | 4 |

## 3. How the app grades this paper

Grader suite: `java-grader/dispatch/tests/` (33 JUnit 5 tests, real Spring Boot server on a random port).

- Verified: reference solution passes 33/33; untouched starter fails 33/33; a "stop at first skip" bug fails exactly the 3 planner tests.
- The planner is checked on 60 seeded random scenarios against an independent reference implementation,
  using a **third mission type the student never sees** (catches `instanceof` shortcuts and hardcoded answers).
- `AirMission` is reached by reflection, so a missing class fails only the tests that need it.

Marks are mapped from tests in `lib/assessment/dispatch-rubric.ts`. Section A in the real exam is marked
by humans reading code with partial credit; the app's Section A score is an **automated behavioural proxy**
and is labelled that way. Code-review flags (e.g. `instanceof` in the service, missing `@Override`,
try/catch in the controller) are shown as advisory, not scored.
