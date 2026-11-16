/**
 * Verifies every grader end-to-end through runProjectTests():
 *  - the untouched starter compiles and passes NO test
 *  - the reference solution passes EVERY test
 *  - a typical bug fails only the tests it should
 *  - a syntax error is reported with file + line
 * Also warms the Maven cache. Pass --online the first time on a new machine.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { config } from "./config";
import { runProjectTests } from "./maven";

function collect(dir: string, base = dir, out: Record<string, string> = {}) {
  for (const f of readdirSync(dir)) {
    const full = path.join(dir, f);
    if (statSync(full).isDirectory()) collect(full, base, out);
    else if (f.endsWith(".java")) out[path.relative(base, full).split(path.sep).join("/")] = readFileSync(full, "utf8");
  }
  return out;
}

interface Case {
  projectId: string;
  expectedTests: number;
  bug: { file: string; from: string; to: string; mayFail: RegExp };
  syntax: { file: string; from: string; to: string };
}

const CASES: Case[] = [
  {
    projectId: "dispatch",
    expectedTests: 33,
    bug: { file: "src/main/java/edu/practice/dispatch/service/DispatchService.java", from: "skipped.add(mission.getId());", to: "skipped.add(mission.getId()); break;", mayFail: /t2_3|b3|b4|b6/ },
    syntax: { file: "src/main/java/edu/practice/dispatch/service/DispatchService.java", from: "return repo.all();", to: "return repo.all()" },
  },
  {
    projectId: "tickets",
    expectedTests: 24,
    // classic mistake: forgetting @ResponseStatus(CREATED) → POST returns 200
    bug: { file: "src/main/java/edu/practice/tickets/controller/TicketController.java", from: "@ResponseStatus(HttpStatus.CREATED)", to: "", mayFail: /t4_post|b5/ },
    syntax: { file: "src/main/java/edu/practice/tickets/service/TicketService.java", from: "return repository.findAll();", to: "return repository.findAll()" },
  },
];

async function main() {
  const offline = !process.argv.includes("--online");
  const only = process.argv.find((a) => a.startsWith("--project="))?.split("=")[1];
  const ok: string[] = [];
  const bad: string[] = [];

  for (const c of CASES.filter((x) => !only || x.projectId === only)) {
    const root = config.projects[c.projectId];
    const reference = collect(path.join(root, "reference"), path.join(root, "reference"));
    const tag = `[${c.projectId}]`;

    const starter = await runProjectTests({ projectId: c.projectId, files: {} }, { offline });
    const sp = starter.tests.filter((t) => t.status === "passed");
    (starter.compile.ok && starter.tests.length === c.expectedTests && sp.length === 0 ? ok : bad).push(
      `${tag} starter: compiles=${starter.compile.ok}, ${sp.length}/${starter.tests.length} passed (expected 0/${c.expectedTests})${sp.length ? " — passing: " + sp.map((t) => t.name).join(", ") : ""}`,
    );

    const ref = await runProjectTests({ projectId: c.projectId, files: reference }, { offline });
    const rp = ref.tests.filter((t) => t.status === "passed").length;
    (rp === c.expectedTests && ref.tests.length === c.expectedTests ? ok : bad).push(
      `${tag} reference: ${rp}/${ref.tests.length} passed (expected ${c.expectedTests}/${c.expectedTests}) in ${ref.durationMs} ms` +
        (rp < ref.tests.length ? " — failing: " + ref.tests.filter((t) => t.status !== "passed").map((t) => `${t.name}: ${t.message}`).join(" | ") : "") +
        (ref.compile.ok ? "" : " — compile: " + JSON.stringify(ref.compile.diagnostics.slice(0, 3))),
    );

    const buggy = { ...reference, [c.bug.file]: reference[c.bug.file].replace(c.bug.from, c.bug.to) };
    const bug = await runProjectTests({ projectId: c.projectId, files: buggy }, { offline });
    const failed = bug.tests.filter((t) => t.status !== "passed").map((t) => t.name);
    (failed.length > 0 && failed.every((n) => c.bug.mayFail.test(n)) ? ok : bad).push(`${tag} injected bug fails: ${failed.join(", ") || "(nothing!)"}`);

    const syntaxFiles = { ...reference, [c.syntax.file]: reference[c.syntax.file].replace(c.syntax.from, c.syntax.to) };
    const syn = await runProjectTests({ projectId: c.projectId, files: syntaxFiles }, { offline });
    (!syn.compile.ok && syn.compile.diagnostics.some((d) => d.file === c.syntax.file) ? ok : bad).push(`${tag} syntax error reported: ${JSON.stringify(syn.compile.diagnostics.slice(0, 1))}`);
  }

  for (const l of ok) console.log("PASS  " + l);
  for (const l of bad) console.log("FAIL  " + l);
  process.exit(bad.length ? 1 : 0);
}

main();
