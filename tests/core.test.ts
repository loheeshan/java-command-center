import { describe, expect, it } from "vitest";
import { evaluate, plan, PAPER_SEED, MISSION_104, sortWithTrace, validateNewAir, OverflowError } from "@/lib/algorithms/dispatch";
import { grade, normaliseCode, scheduleReview, seededShuffle, REVIEW_INTERVALS_MIN } from "@/lib/quiz/engine";
import { countdown, EXAM_START, colomboDateKey, formatColombo } from "@/lib/exam";
import { scoreDispatch, DISPATCH_RUBRIC, reviewDispatchCode } from "@/lib/assessment/dispatch-rubric";
import { VersionedStore, memoryAdapter } from "@/lib/storage/store";
import { blockState, catchUpLessons, STUDY_PLAN } from "@/lib/scheduling/plan";
import { skillReport, weakConcepts } from "@/lib/progress/readiness";
import { emptyProgress } from "@/lib/progress/types";
import { QUESTIONS, QUESTION_MAP } from "@/content/questions";
import { parseHarnessOutput } from "@/content/coding-tasks";
import { parseSurefireXml, parseMavenDiagnostics } from "@/runner/maven";
import { parseJavacDiagnostics, detectMainClass } from "@/runner/java";

describe("dispatch model (drives visualizers)", () => {
  it("matches the paper's illustrative calculations", () => {
    expect(evaluate(PAPER_SEED[0])).toMatchObject({ energy: 39, priority: 3 });
    expect(evaluate(PAPER_SEED[2])).toMatchObject({ energy: 38, priority: 5 });
    expect(evaluate(MISSION_104)).toMatchObject({ energy: 30, priority: 2 });
  });
  it("B3: capacity 60", () => {
    const r = plan(PAPER_SEED, 60, false);
    expect(r.selected.map((m) => m.id)).toEqual([103, 102]);
    expect(r.skipped).toEqual([101]);
    expect([r.energyUsed, r.energyRemaining]).toEqual([56, 4]);
  });
  it("B4: urgent only excludes 102 from both lists", () => {
    const r = plan(PAPER_SEED, 60, true);
    expect(r.selected.map((m) => m.id)).toEqual([103]);
    expect(r.skipped).toEqual([101]);
    expect(r.filteredOut).toEqual([102]);
  });
  it("B6: capacity 125 after adding 104", () => {
    const r = plan([...PAPER_SEED, MISSION_104], 125, false);
    expect(r.selected.map((m) => m.id)).toEqual([103, 101, 104, 102]);
    expect([r.energyUsed, r.energyRemaining]).toEqual([125, 0]);
  });
  it("rejects non-positive capacity", () => {
    expect(() => plan(PAPER_SEED, 0, false)).toThrow();
  });
  it("detects overflow like Math.toIntExact", () => {
    expect(() => evaluate({ id: 1, kind: "ground", distanceKm: 2_000_000_000, loadKg: 0 })).toThrow(OverflowError);
  });
  it("sort trace ends in the comparator order and records deciding keys", () => {
    const ms = [{ id: 7, kind: "air", distanceKm: 1, loadKg: 0, windPenalty: 0 }, { id: 3, kind: "air", distanceKm: 1, loadKg: 0, windPenalty: 0 }].map((m) => evaluate(m as never));
    const { sorted, comparisons } = sortWithTrace(ms);
    expect(sorted.map((m) => m.id)).toEqual([3, 7]);
    expect(comparisons[0].decidedBy).toBe("id");
    // a/b are always the comparator's (first, second) arguments
    expect([comparisons[0].a, comparisons[0].b, comparisons[0].swapped]).toEqual([7, 3, true]);
  });
  it("validation mirrors Task 3.2 boundaries", () => {
    expect(validateNewAir({ id: 1, distanceKm: 1, loadKg: 0, windPenalty: 0 }, [])).toBeNull();
    expect(validateNewAir({ id: 10001, distanceKm: 1, loadKg: 0, windPenalty: 0 }, [])).toMatch(/ID/);
    expect(validateNewAir({ id: 101, distanceKm: 1, loadKg: 0, windPenalty: 0 }, [101])).toMatch(/already exists/);
  });
});

describe("quiz engine", () => {
  it("grades each question type", () => {
    expect(grade(QUESTION_MAP["qs-jvm-1"], { type: "mcq", choice: 1 })).toBe(true);
    expect(grade(QUESTION_MAP["qs-jvm-1"], { type: "mcq", choice: 0 })).toBe(false);
    expect(grade(QUESTION_MAP["qs-types-1"], { type: "multi", choices: [4, 0, 2] })).toBe(true);
    expect(grade(QUESTION_MAP["qs-types-1"], { type: "multi", choices: [0, 2] })).toBe(false);
    expect(grade(QUESTION_MAP["qs-intdiv-1"], { type: "predict", text: "3\r\n1\r\n3.5\r\n" })).toBe(true);
    expect(grade(QUESTION_MAP["qs-intdiv-1"], { type: "predict", text: "3.5\n1\n3.5" })).toBe(false);
    expect(grade(QUESTION_MAP["qs-compile-1"], { type: "find-error", line: 3 })).toBe(true);
    expect(grade(QUESTION_MAP["qs-super-complete-1"], { type: "completion", text: "super( id,distanceKm , loadKg );" })).toBe(true);
    expect(grade(QUESTION_MAP["qs-super-complete-1"], { type: "completion", text: "super(id, loadKg, distanceKm)" })).toBe(false);
    const ord = QUESTION_MAP["qs-new-1"];
    if (ord.type !== "order") throw new Error();
    expect(grade(ord, { type: "order", items: [...ord.items] })).toBe(true);
    expect(grade(ord, { type: "order", items: [...ord.items].reverse() })).toBe(false);
  });
  it("normalises code tokens but keeps meaning", () => {
    expect(normaliseCode("Math.toIntExact( energy ) ;")).toBe("Math.toIntExact(energy)");
  });
  it("seeded shuffle is deterministic and never returns the solved order", () => {
    const items = ["a", "b", "c", "d"];
    expect(seededShuffle(items, "x")).toEqual(seededShuffle(items, "x"));
    expect(seededShuffle(items, "x")).not.toEqual(items);
  });
  it("spaced review: wrong → 10 min, right → next box, graduates", () => {
    const now = 1_000_000;
    const a = scheduleReview(undefined, "q", false, now)!;
    expect(a.box).toBe(0);
    expect(a.dueAt - now).toBe(REVIEW_INTERVALS_MIN[0] * 60_000);
    const b = scheduleReview(a, "q", true, now)!;
    expect(b.box).toBe(1);
    expect(scheduleReview(undefined, "q", true, now)).toBeNull();
    let item: ReturnType<typeof scheduleReview> = a;
    for (let i = 0; i < 10 && item; i++) item = scheduleReview(item, "q", true, now);
    expect(item).toBeNull();
  });
  it("every question has an explanation and a valid answer", () => {
    for (const q of QUESTIONS) {
      expect(q.explanation.length).toBeGreaterThan(10);
      if (q.type === "mcq" || q.type === "concept") expect(q.answer).toBeLessThan(q.options.length);
      if (q.type === "multi") for (const a of q.answers) expect(a).toBeLessThan(q.options.length);
    }
  });
});

describe("exam clock (Asia/Colombo)", () => {
  it("exam starts 08:00 UTC on 20 Nov 2026", () => {
    expect(EXAM_START.toISOString()).toBe("2026-11-20T08:00:00.000Z");
    expect(formatColombo(EXAM_START, { hour: "2-digit", minute: "2-digit", hour12: false })).toBe("13:30");
  });
  it("countdown from Monday 16 Nov 18:00 Colombo", () => {
    const c = countdown(EXAM_START, new Date("2026-11-16T18:00:00+05:30"));
    expect([c.days, c.hours, c.minutes, c.seconds, c.past]).toEqual([3, 19, 30, 0, false]);
  });
  it("Colombo day key differs from UTC near midnight", () => {
    expect(colomboDateKey(new Date("2026-11-17T19:00:00Z"))).toBe("2026-11-18");
  });
});

describe("rubric", () => {
  it("totals 80 + 20 and matches paper task marks", () => {
    expect(DISPATCH_RUBRIC.filter((t) => t.section === "A").reduce((s, t) => s + t.marks, 0)).toBe(80);
    expect(DISPATCH_RUBRIC.find((t) => t.section === "B")!.marks).toBe(20);
    for (const t of DISPATCH_RUBRIC) expect(t.items.reduce((s, i) => s + i.marks, 0)).toBe(t.marks);
  });
  it("scores only passed tests", () => {
    const s = scoreDispatch([
      { className: "Task1GroundMissionTest", name: "t1_1_energy_mission101_is_39", status: "passed", durationMs: 1 },
      { className: "Task1GroundMissionTest", name: "t1_2_priority_medical_is_3", status: "failed", durationMs: 1 },
      { className: "HttpBehaviourTest", name: "b3_capacity_60_selects_103_102_skips_101", status: "passed", durationMs: 1 },
    ]);
    expect([s.sectionA, s.sectionB, s.total]).toEqual([4, 3, 7]);
  });
  it("flags instanceof and try/catch", () => {
    const flags = reviewDispatchCode({
      "src/main/java/edu/practice/dispatch/service/DispatchService.java": "if (m instanceof AirMission) {}",
      "src/main/java/edu/practice/dispatch/controller/DispatchController.java": "@PostMapping x; try { } catch (Exception e) {}",
    });
    expect(flags.map((f) => f.message).join(" ")).toMatch(/instanceof/);
    expect(flags.map((f) => f.message).join(" ")).toMatch(/try\/catch/);
    expect(flags.map((f) => f.message).join(" ")).toMatch(/201/);
  });
});

describe("versioned storage", () => {
  it("round-trips, migrates and falls back on corrupt data", () => {
    const a = memoryAdapter();
    const v1 = new VersionedStore(a, "k", 1, () => ({ n: 0 }));
    v1.save({ n: 5 });
    expect(v1.load()).toEqual({ n: 5 });
    const v2 = new VersionedStore(a, "k", 2, () => ({ n: 0, m: 1 }), { 1: (d) => ({ ...(d as object), m: 9 }) });
    expect(v2.load()).toEqual({ n: 5, m: 9 });
    a.write("k", "{not json");
    expect(v2.load()).toEqual({ n: 0, m: 1 });
  });
});

describe("study plan", () => {
  it("block states and catch-up", () => {
    const first = STUDY_PLAN[0];
    const before = Date.parse(first.start) - 1000;
    const after = Date.parse(first.end) + 1000;
    expect(blockState(first, before)).toBe("upcoming");
    expect(blockState(first, after)).toBe("missed");
    expect(blockState(first, after, "done")).toBe("done");
    expect(catchUpLessons(after, {}, new Set())).toEqual(first.lessonIds);
    expect(catchUpLessons(after, {}, new Set(first.lessonIds))).toEqual([]);
  });
  it("plan blocks are ordered and do not overlap", () => {
    for (let i = 1; i < STUDY_PLAN.length; i++) expect(Date.parse(STUDY_PLAN[i].start)).toBeGreaterThanOrEqual(Date.parse(STUDY_PLAN[i - 1].end));
  });
});

describe("readiness is evidence-based", () => {
  it("empty progress → no data, not zero", () => {
    const r = skillReport(emptyProgress(), "oop");
    expect(r.quizAccuracy.value).toBeNull();
    expect(r.completion.value).toBe(0);
  });
  it("counts the latest answer per question", () => {
    const p = emptyProgress();
    p.questions["qs-poly-runtime-1"] = { attempts: 2, correctAttempts: 1, lastCorrect: true, firstCorrect: false, lastAt: 1 };
    p.questions["qs-isa-1"] = { attempts: 1, correctAttempts: 0, lastCorrect: false, firstCorrect: false, lastAt: 1 };
    const r = skillReport(p, "oop");
    expect([r.quizAccuracy.numerator, r.quizAccuracy.denominator]).toEqual([1, 2]);
    expect(weakConcepts(p).map((w) => w.concept)).toContain("IS-A vs HAS-A");
  });
});

describe("runner parsers", () => {
  it("parses javac diagnostics with column", () => {
    const d = parseJavacDiagnostics("Main.java:3: error: ';' expected\n        int marks = 100\n                       ^\n1 error");
    expect(d[0]).toMatchObject({ file: "Main.java", line: 3, column: 24, severity: "error" });
  });
  it("parses surefire XML", () => {
    const xml = `<testsuite><testcase name="b1_x()" classname="edu.practice.dispatch.grader.HttpBehaviourTest" time="0.2"/><testcase name="t1" classname="a.T" time="0.001"><failure message="expected: &lt;39&gt; but was: &lt;0&gt;" type="org.opentest4j.AssertionFailedError"/></testcase></testsuite>`;
    const r = parseSurefireXml(xml);
    expect(r[0]).toMatchObject({ name: "b1_x", status: "passed", className: "HttpBehaviourTest", durationMs: 200 });
    expect(r[1]).toMatchObject({ status: "failed", message: "expected: <39> but was: <0>" });
  });
  it("parses maven compile errors into project-relative paths", () => {
    const d = parseMavenDiagnostics("[ERROR] /C:/Temp/jcc-proj-x/project/src/main/java/a/B.java:[12,5] ';' expected", "C:\\Temp\\jcc-proj-x\\project");
    expect(d[0]).toMatchObject({ file: "src/main/java/a/B.java", line: 12, column: 5 });
  });
  it("parses harness output and detects main class", () => {
    expect(parseHarnessOutput("@@PASS a\nnoise\n@@FAIL b :: expected <1> but was <2>")).toEqual([
      { name: "a", passed: true },
      { name: "b", passed: false, message: "expected <1> but was <2>" },
    ]);
    expect(detectMainClass([{ name: "App.java", content: "package x.y;\nclass App { public static void main(String[] a){} }" }])).toBe("x.y.App");
  });
});
