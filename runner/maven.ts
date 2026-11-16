import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { childEnv, config } from "./config";
import { BadRequest } from "./java";
import { exec } from "./process";
import type { Diagnostic, ProjectTestRequest, ProjectTestResponse, TestCaseResult } from "./protocol";

/** Only these project paths may be overwritten by the learner. */
const EDITABLE = /^src\/main\/(java\/[A-Za-z0-9_/]+\.java|resources\/application\.properties)$/;

function decodeXml(s: string): string {
  return s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&#10;", "\n")
    .replaceAll("&#13;", "")
    .replaceAll("&amp;", "&");
}

export function parseSurefireXml(xml: string): TestCaseResult[] {
  const results: TestCaseResult[] = [];
  const re = /<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const attrs = m[1];
    const body = m[3] ?? "";
    const attr = (k: string) => new RegExp(`\\b${k}="([^"]*)"`).exec(attrs)?.[1] ?? "";
    const name = attr("name").replace(/\(\)$/, "");
    const className = attr("classname").split(".").pop() ?? "";
    const durationMs = Math.round(Number(attr("time") || 0) * 1000);
    let status: TestCaseResult["status"] = "passed";
    let message: string | undefined;
    const fail = /<(failure|error)\b([^>]*)>/.exec(body) ?? /<(failure|error)\b([^>]*)\/>/.exec(body);
    if (fail) {
      status = fail[1] === "failure" ? "failed" : "error";
      const msg = /\bmessage="([^"]*)"/.exec(fail[2])?.[1];
      const type = /\btype="([^"]*)"/.exec(fail[2])?.[1];
      message = decodeXml(msg ?? type ?? "Test failed");
      if (type && msg && status === "error") message = `${type.split(".").pop()}: ${decodeXml(msg)}`;
      else if (type && !msg) message = type.split(".").pop();
    } else if (/<skipped\b/.test(body)) {
      status = "skipped";
    }
    results.push({ className, name, status, message, durationMs });
  }
  return results;
}

/** Maven/javac errors look like: [ERROR] /C:/tmp/x/src/main/java/a/B.java:[12,5] ';' expected */
export function parseMavenDiagnostics(log: string, projectDir: string): Diagnostic[] {
  const out: Diagnostic[] = [];
  const seen = new Set<string>();
  const norm = projectDir.replaceAll("\\", "/").replace(/^\/?([A-Za-z]):/, "$1:").toLowerCase();
  for (const line of log.split(/\r?\n/)) {
    const m = /^\[(ERROR|WARNING)\]\s+\/?(.+?\.java):\[(\d+),(\d+)\]\s+(.*)$/.exec(line);
    if (!m) continue;
    let file = m[2].replaceAll("\\", "/");
    const idx = file.toLowerCase().indexOf(norm);
    if (idx >= 0) file = file.slice(idx + norm.length).replace(/^\//, "");
    const key = `${file}:${m[3]}:${m[5]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ file, line: Number(m[3]), column: Number(m[4]), message: m[5], severity: m[1] === "ERROR" ? "error" : "warning" });
  }
  return out;
}

function mavenLauncherArgs(projectDir: string): string[] {
  const home = config.mavenHome!;
  const boot = path.join(home, "boot");
  const cw = readdirSync(boot).find((f) => f.startsWith("plexus-classworlds") && f.endsWith(".jar"));
  if (!cw) throw new Error("Maven installation is missing plexus-classworlds.");
  return [
    "-Xmx512m",
    "-classpath", path.join(boot, cw),
    `-Dclassworlds.conf=${path.join(home, "bin", "m2.conf")}`,
    `-Dmaven.home=${home}`,
    `-Dmaven.multiModuleProjectDirectory=${projectDir}`,
    "org.codehaus.plexus.classworlds.launcher.Launcher",
  ];
}

export async function runProjectTests(req: ProjectTestRequest, opts: { offline: boolean } = { offline: true }): Promise<ProjectTestResponse> {
  const projectRoot = config.projects[req.projectId];
  if (!projectRoot) throw new BadRequest(`Unknown project: ${req.projectId}`);
  if (!config.mavenHome) throw new Error("Maven was not found. Set MAVEN_HOME.");
  if (typeof req.files !== "object" || req.files === null) throw new BadRequest("files must be an object.");

  let total = 0;
  for (const [p, content] of Object.entries(req.files)) {
    if (!EDITABLE.test(p) || p.includes("..")) throw new BadRequest(`File not editable: ${p}`);
    if (typeof content !== "string") throw new BadRequest(`Invalid content for ${p}`);
    total += Buffer.byteLength(content, "utf8");
  }
  if (total > config.limits.maxSourceBytes * 2) throw new BadRequest("Project sources are too large.");

  const started = Date.now();
  const dir = mkdtempSync(path.join(os.tmpdir(), "jcc-proj-"));
  const proj = path.join(dir, "project");
  try {
    cpSync(path.join(projectRoot, "starter"), proj, { recursive: true, filter: (s) => !s.includes(`${path.sep}target`) });
    for (const [rel, content] of Object.entries(req.files)) {
      const dest = path.join(proj, ...rel.split("/"));
      mkdirSync(path.dirname(dest), { recursive: true });
      writeFileSync(dest, content, "utf8");
    }
    cpSync(path.join(projectRoot, "tests"), path.join(proj, "src", "test", "java"), { recursive: true });

    const args = [
      ...mavenLauncherArgs(proj),
      ...(opts.offline ? ["-o"] : []),
      "-B", "-q", "test",
      `-Dmaven.repo.local=${config.mavenRepo}`,
      "-Dmaven.test.failure.ignore=true",
      "-DtrimStackTrace=true",
      "-DargLine=-Xmx384m",
      "-Dspring.main.banner-mode=off",
    ];
    const res = await exec(config.java, args, {
      cwd: proj,
      timeoutMs: config.limits.projectTimeoutMs,
      maxOutputBytes: 512 * 1024,
      env: childEnv(),
    });
    const log = res.stdout + res.stderr;

    const reports = path.join(proj, "target", "surefire-reports");
    const tests: TestCaseResult[] = [];
    if (existsSync(reports)) {
      for (const f of readdirSync(reports).filter((f) => f.startsWith("TEST-") && f.endsWith(".xml")).sort()) {
        tests.push(...parseSurefireXml(readFileSync(path.join(reports, f), "utf8")));
      }
    }
    const diagnostics = parseMavenDiagnostics(log, proj).filter((d) => d.severity === "error");
    const compileOk = tests.length > 0 || (diagnostics.length === 0 && res.exitCode === 0);
    const contextFailed = tests.some(
      (t) => t.className === "HttpBehaviourTest" && t.status === "error" && /ApplicationContext|context/i.test(t.message ?? ""),
    );
    let tail = log.slice(-6000);
    if (res.timedOut) tail = `Timed out after ${config.limits.projectTimeoutMs / 1000}s (infinite loop?).\n` + tail;

    return {
      mode: "local",
      compile: { ok: compileOk && !res.timedOut, diagnostics },
      contextFailed,
      tests,
      durationMs: Date.now() - started,
      logTail: tail.replaceAll(proj, "<project>"),
    };
  } finally {
    rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  }
}
