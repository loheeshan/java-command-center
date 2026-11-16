import type { TestCaseResult } from "@/runner/protocol";
import type { SkillGroup } from "@/lib/curriculum/types";

/**
 * Transparent marking for the Dispatch practice paper.
 * Every mark comes from a named grader test (java-grader/dispatch/tests). Marks per task match the paper.
 * Section A in the real exam is marked by humans reading code with partial credit — this is an
 * automated behavioural proxy and is always labelled as such.
 */

export interface RubricItem {
  test: string;
  marks: number;
  label: string;
}

export interface RubricTask {
  id: string;
  section: "A" | "B";
  title: string;
  marks: number;
  items: RubricItem[];
  /** Skill groups this task gives evidence for (used by the progress page). */
  skills: SkillGroup[];
}

export const DISPATCH_RUBRIC: RubricTask[] = [
  {
    id: "task1", section: "A", title: "Task 1 — GroundMission methods", marks: 18, skills: ["oop", "exceptions"],
    items: [
      { test: "t1_1_energy_mission101_is_39", marks: 4, label: "1.1 energy of mission 101 is 39" },
      { test: "t1_1_energy_formula_other_values", marks: 4, label: "1.1 formula correct for other values (incl. large ints)" },
      { test: "t1_1_overflow_is_not_silent", marks: 4, label: "1.1 overflow throws instead of wrapping (long + Math.toIntExact)" },
      { test: "t1_2_priority_medical_is_3", marks: 3, label: "1.2 medical → 3" },
      { test: "t1_2_priority_non_medical_is_1", marks: 3, label: "1.2 non-medical → 1" },
    ],
  },
  {
    id: "task2", section: "A", title: "Task 2 — AirMission & dispatch planning", marks: 22, skills: ["oop", "algorithms", "collections"],
    items: [
      { test: "t2_1_air_mission_extends_dispatch_mission", marks: 2, label: "2.1 AirMission extends DispatchMission" },
      { test: "t2_1_constructor_chains_to_super_and_getters_work", marks: 3, label: "2.1 constructor uses super(...); getters" },
      { test: "t2_1_repository_seeds_air_mission_103", marks: 2, label: "2.1 AirMission 103 seeded once" },
      { test: "t2_2_air_energy_formula", marks: 3, label: "2.2 energy = 3d + 8l + 2w" },
      { test: "t2_2_air_overflow_is_not_silent", marks: 2, label: "2.2 safe int conversion" },
      { test: "t2_2_air_priority", marks: 2, label: "2.2 critical → 5, else 2" },
      { test: "t2_3_plan_capacity_60_matches_paper", marks: 2, label: "2.3 capacity 60 example" },
      { test: "t2_3_urgent_only_filters_before_planning", marks: 2, label: "2.3 urgentOnly filter" },
      { test: "t2_3_tie_breaking_energy_then_id", marks: 2, label: "2.3 tie-breaks: energy ASC, id ASC" },
      { test: "t2_3_polymorphic_and_matches_reference_on_random_inputs", marks: 2, label: "2.3 60 random scenarios with an unseen mission type" },
    ],
  },
  {
    id: "task3", section: "A", title: "Task 3 — Validation, lookup & errors", marks: 20, skills: ["exceptions", "spring"],
    items: [
      { test: "t3_1_energy_lookup_existing", marks: 3, label: "3.1 energy(id) for existing missions" },
      { test: "t3_1_energy_lookup_unknown_throws_not_found", marks: 3, label: "3.1 unknown id → MissionNotFoundException" },
      { test: "t3_2_add_valid_air_mission_is_saved", marks: 2, label: "3.2 valid mission saved and returned" },
      { test: "t3_2_rejects_out_of_range_values_and_saves_nothing", marks: 3, label: "3.2 range checks (inclusive bounds), nothing saved" },
      { test: "t3_2_rejects_duplicate_id_without_overwriting", marks: 2, label: "3.2 duplicate id rejected" },
      { test: "t3_3_rejects_non_positive_capacity", marks: 2, label: "3.3 capacity ≤ 0 rejected" },
      { test: "t3_3_handler_maps_illegal_argument_to_400", marks: 2, label: "3.3 IllegalArgumentException → 400 BAD_REQUEST" },
      { test: "t3_3_handler_maps_not_found_to_404", marks: 3, label: "3.3 MissionNotFoundException → 404 NOT_FOUND" },
    ],
  },
  {
    id: "task4", section: "A", title: "Task 4 — REST operations", marks: 20, skills: ["rest", "spring"],
    items: [
      { test: "t4_1_get_energy_endpoint", marks: 5, label: "4.1 GET /missions/{id}/energy → {\"energyUnits\":39}" },
      { test: "t4_2_post_air_returns_201_with_created_mission", marks: 5, label: "4.2 POST /missions/air → 201 + body" },
      { test: "t4_3_get_plan_endpoint_shape", marks: 6, label: "4.3 GET /missions/plan returns DispatchPlan" },
      { test: "t4_3_urgent_only_defaults_to_false", marks: 4, label: "4.3 urgentOnly defaults to false" },
    ],
  },
  {
    id: "sectionB", section: "B", title: "Section B — Functional checks", marks: 20, skills: ["rest", "exam"],
    items: [
      { test: "b1_ground_101_energy_39_priority_3", marks: 3, label: "B1 GroundMission 101: 39 / priority 3" },
      { test: "b2_air_103_energy_38_priority_5", marks: 3, label: "B2 AirMission 103: 38 / priority 5" },
      { test: "b3_capacity_60_selects_103_102_skips_101", marks: 3, label: "B3 capacity 60 → [103,102], skip [101]" },
      { test: "b4_urgent_only_selects_103_skips_101_excludes_102", marks: 3, label: "B4 urgentOnly → [103], skip [101]" },
      { test: "b5_invalid_input_400_and_unknown_404", marks: 4, label: "B5 400 BAD_REQUEST / 404 NOT_FOUND" },
      { test: "b6_post_104_then_plan_125", marks: 4, label: "B6 POST 104 → 201, plan 125 → [103,101,104,102]" },
    ],
  },
];

export interface ScoredItem extends RubricItem {
  result?: TestCaseResult;
  earned: number;
}

export interface ScoredTask extends Omit<RubricTask, "items"> {
  items: ScoredItem[];
  earned: number;
}

export interface Score {
  tasks: ScoredTask[];
  sectionA: number;
  sectionB: number;
  total: number;
}

export function scoreDispatch(results: TestCaseResult[]): Score {
  return scoreProject(DISPATCH_RUBRIC, results);
}

export function scoreProject(rubric: RubricTask[], results: TestCaseResult[]): Score {
  const byName = new Map(results.map((r) => [r.name, r]));
  const tasks = rubric.map((t) => {
    const items = t.items.map((it) => {
      const result = byName.get(it.test);
      return { ...it, result, earned: result?.status === "passed" ? it.marks : 0 };
    });
    return { ...t, items, earned: items.reduce((s, i) => s + i.earned, 0) };
  });
  const sectionA = tasks.filter((t) => t.section === "A").reduce((s, t) => s + t.earned, 0);
  const sectionB = tasks.filter((t) => t.section === "B").reduce((s, t) => s + t.earned, 0);
  return { tasks, sectionA, sectionB, total: sectionA + sectionB };
}

export interface CodeFlag {
  file: string;
  severity: "warn" | "info";
  message: string;
}

/** Advisory code-review flags. Shown to the learner; never added to the score. */
export function reviewDispatchCode(files: Record<string, string>): CodeFlag[] {
  const flags: CodeFlag[] = [];
  const find = (suffix: string) => Object.entries(files).find(([p]) => p.endsWith(suffix));
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

  const service = find("service/DispatchService.java");
  if (service && /\binstanceof\s+(GroundMission|AirMission)\b/.test(strip(service[1])))
    flags.push({ file: service[0], severity: "warn", message: "DispatchService uses instanceof on a concrete mission type. The paper requires polymorphic calls (energyUnits(), priority())." });

  const ctrl = find("controller/DispatchController.java");
  if (ctrl) {
    const c = strip(ctrl[1]);
    if (/\btry\s*\{/.test(c)) flags.push({ file: ctrl[0], severity: "warn", message: "try/catch in the controller: let exceptions reach GlobalExceptionHandler instead (Lecture 6: 'Where people lose time')." });
    if (/@PostMapping/.test(c) && !/CREATED|201/.test(c)) flags.push({ file: ctrl[0], severity: "warn", message: "POST handler found but no 201: add @ResponseStatus(HttpStatus.CREATED) or return ResponseEntity.status(HttpStatus.CREATED)." });
  }

  const air = find("model/AirMission.java");
  if (air) {
    const a = strip(air[1]);
    if (!/super\s*\(/.test(a)) flags.push({ file: air[0], severity: "warn", message: "AirMission constructor does not call super(...). Task 2.1 requires chaining to the parent constructor." });
    if (!/@Override/.test(a)) flags.push({ file: air[0], severity: "info", message: "No @Override annotations in AirMission. Add them so the compiler checks your overrides." });
  }

  for (const suffix of ["model/GroundMission.java", "model/AirMission.java"]) {
    const f = find(suffix);
    if (f && !/\blong\b|\d+L\b|toIntExact|multiplyExact|addExact/.test(strip(f[1])))
      flags.push({ file: f[0], severity: "warn", message: "energyUnits() does not appear to use long arithmetic or Math.toIntExact — silent overflow is possible." });
  }

  const handler = find("exception/GlobalExceptionHandler.java");
  if (handler && !/@ExceptionHandler/.test(strip(handler[1])))
    flags.push({ file: handler[0], severity: "warn", message: "GlobalExceptionHandler has no @ExceptionHandler methods yet." });

  return flags;
}
