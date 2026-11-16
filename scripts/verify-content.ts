/**
 * Content verification on the REAL JDK (no mocks):
 *  - every lesson example compiles, runs and matches its expectedOutput
 *  - every trace exercise's stated output is what Java actually prints
 *  - every runnable predict-the-output question's answer is correct
 *  - every coding task's reference solution passes all hidden tests,
 *    and the untouched starter does NOT pass all of them
 *  - referential integrity: quiz ids, task ids, module lessons, video chapters
 * Usage: npx tsx scripts/verify-content.ts
 */
import { compileAndRun } from "../runner/java";
import { LESSONS, MODULES, LESSON_MAP } from "../content/modules";
import { QUESTIONS, QUESTION_MAP } from "../content/questions";
import { CODING_TASKS, buildHarness, parseHarnessOutput, testCount } from "../content/coding-tasks";
import { VIDEOS } from "../content/videos";
import { GUIDES } from "../content/guides";
import { normaliseOutput } from "../lib/quiz/engine";
import type { SourceFile } from "../runner/protocol";

const failures: string[] = [];
let checks = 0;
const ok = (cond: boolean, msg: string) => {
  checks++;
  if (!cond) failures.push(msg);
};

async function runOutput(files: SourceFile[], stdin?: string) {
  const r = await compileAndRun({ files, stdin });
  if (!r.compile.ok) return { error: "COMPILE: " + r.compile.raw.slice(0, 600) };
  if (!r.run) return { error: "NO RUN: " + r.compile.raw.slice(0, 300) };
  if (r.run.exitCode !== 0) return { error: `EXIT ${r.run.exitCode}: ${r.run.stderr.slice(0, 400)}` };
  return { out: r.run.stdout };
}

async function main() {
  // integrity
  for (const m of MODULES) for (const l of m.lessons) ok(Boolean(LESSON_MAP[l]), `module ${m.id} lists unknown lesson ${l}`);
  for (const l of LESSONS) {
    ok(MODULES.some((m) => m.lessons.includes(l.id)), `lesson ${l.id} is in no module`);
    for (const q of l.quiz) ok(Boolean(QUESTION_MAP[q]), `lesson ${l.id} references unknown question ${q}`);
    if (l.challenge && "taskId" in l.challenge) { const tid = l.challenge.taskId; ok(CODING_TASKS.some((t) => t.id === tid), `lesson ${l.id} references unknown task ${tid}`); }
    for (const v of l.videos ?? []) ok(VIDEOS[v.video].chapters.some((c) => c.n === v.chapter), `lesson ${l.id} references missing chapter ${v.video}#${v.chapter}`);
  }
  for (const q of QUESTIONS) {
    ok(Boolean(LESSON_MAP[q.lessonId]), `question ${q.id} has unknown lesson ${q.lessonId}`);
    if (q.type === "completion") ok((q.code.match(/____/g) ?? []).length === 1, `question ${q.id} must have exactly one blank`);
    if (q.type === "find-error") ok(q.line >= 1 && q.line <= q.code.split("\n").length, `question ${q.id} line out of range`);
  }
  const ids = QUESTIONS.map((q) => q.id);
  ok(new Set(ids).size === ids.length, "duplicate question ids");

  // lessons: examples + traces
  for (const l of LESSONS) {
    const ex = await runOutput(l.example.files, l.example.stdin);
    if ("error" in ex) ok(false, `[${l.id}] example: ${ex.error}`);
    else if (l.example.expectedOutput !== undefined)
      ok(normaliseOutput(ex.out!) === normaliseOutput(l.example.expectedOutput), `[${l.id}] example output mismatch\n  expected: ${JSON.stringify(l.example.expectedOutput)}\n  actual:   ${JSON.stringify(ex.out)}`);

    const tr = await runOutput([{ name: "Main.java", content: l.trace.code }]);
    if ("error" in tr) ok(false, `[${l.id}] trace: ${tr.error}`);
    else ok(normaliseOutput(tr.out!) === normaliseOutput(l.trace.output), `[${l.id}] trace output mismatch\n  expected: ${JSON.stringify(l.trace.output)}\n  actual:   ${JSON.stringify(tr.out)}`);
    process.stdout.write(".");
  }

  // lecture guides: every runnable step + every internal link
  const routes = new Set(["/", "/roadmap", "/learn", "/oop-lab", "/algorithms", "/spring-boot", "/playground", "/exam", "/exam/tickets", "/exam/simulator", "/coverage", "/quizzes", "/revision", "/progress", "/resources", "/lectures"]);
  for (const g of GUIDES) {
    for (const n of g.next) {
      const path = n.href.split("#")[0];
      ok(routes.has(path) || (path.startsWith("/learn/") && Boolean(LESSON_MAP[path.slice(7)])), `guide ${g.id} links to unknown page ${n.href}`);
    }
    for (const s of g.steps) {
      if (!s.run) continue;
      const r = await runOutput(s.run.files);
      if ("error" in r) ok(false, `[guide ${g.id} / ${s.title}] ${r.error}`);
      else ok(normaliseOutput(r.out!) === normaliseOutput(s.run.expectedOutput), `[guide ${g.id} / ${s.title}] output mismatch\n  expected: ${JSON.stringify(s.run.expectedOutput)}\n  actual:   ${JSON.stringify(r.out)}`);
      process.stdout.write(".");
    }
  }

  // runnable predict questions
  for (const q of QUESTIONS) {
    if (q.type !== "predict" || !q.runnable) continue;
    const r = await runOutput([{ name: "Main.java", content: q.code }]);
    if ("error" in r) ok(false, `[${q.id}] ${r.error}`);
    else ok(normaliseOutput(r.out!) === normaliseOutput(q.output), `[${q.id}] predict answer mismatch\n  expected: ${JSON.stringify(q.output)}\n  actual:   ${JSON.stringify(r.out)}`);
    process.stdout.write(".");
  }

  // coding tasks
  for (const t of CODING_TASKS) {
    const harness = { name: "JccTests.java", content: buildHarness(t) };
    const solved = t.files.map((f) => t.solution.find((s) => s.name === f.name) ?? f);
    const sr = await compileAndRun({ files: [...solved, harness], mainClass: "JccTests" });
    if (!sr.compile.ok) ok(false, `[${t.id}] solution does not compile: ${sr.compile.raw.slice(0, 800)}`);
    else {
      const res = parseHarnessOutput(sr.run?.stdout ?? "");
      const total = testCount(t);
      ok(res.length === total && res.every((x) => x.passed), `[${t.id}] solution: ${res.filter((x) => x.passed).length}/${total} passed; failures: ${res.filter((x) => !x.passed).map((x) => x.name + " - " + x.message).join("; ")} ${sr.run?.stderr.slice(0, 300) ?? ""}`);
    }
    const st = await compileAndRun({ files: [...t.files, harness], mainClass: "JccTests" });
    const stRes = st.compile.ok ? parseHarnessOutput(st.run?.stdout ?? "") : [];
    ok(!(stRes.length === testCount(t) && stRes.every((x) => x.passed)), `[${t.id}] untouched starter passes every test — tests are too weak`);
    process.stdout.write(".");
  }

  console.log(`\n\n${checks - failures.length}/${checks} content checks passed`);
  for (const f of failures) console.log("FAIL " + f);
  process.exit(failures.length ? 1 : 0);
}

main();
