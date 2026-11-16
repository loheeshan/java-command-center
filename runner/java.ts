import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { childEnv, config } from "./config";
import { exec } from "./process";
import type { Diagnostic, RunRequest, RunResponse, SourceFile } from "./protocol";

const FILE_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*\.java$/;

export class BadRequest extends Error {}

export function validateFiles(files: SourceFile[]) {
  if (!Array.isArray(files) || files.length === 0) throw new BadRequest("At least one .java file is required.");
  if (files.length > 25) throw new BadRequest("Too many files (max 25).");
  const seen = new Set<string>();
  let total = 0;
  for (const f of files) {
    if (typeof f?.name !== "string" || typeof f?.content !== "string") throw new BadRequest("Each file needs a name and content.");
    if (!FILE_NAME.test(f.name)) throw new BadRequest(`Invalid file name: ${f.name}`);
    if (seen.has(f.name)) throw new BadRequest(`Duplicate file: ${f.name}`);
    seen.add(f.name);
    total += Buffer.byteLength(f.content, "utf8");
  }
  if (total > config.limits.maxSourceBytes) throw new BadRequest("Source code is too large.");
}

/** Finds the class with `static void main`, including its package. */
export function detectMainClass(files: SourceFile[]): string | undefined {
  for (const f of files) {
    if (!/static\s+void\s+main\s*\(/.test(f.content)) continue;
    const pkg = /^\s*package\s+([\w.]+)\s*;/m.exec(f.content)?.[1];
    const cls = f.name.replace(/\.java$/, "");
    return pkg ? `${pkg}.${cls}` : cls;
  }
  return undefined;
}

/** Parses javac output: `Main.java:5: error: ';' expected` */
export function parseJavacDiagnostics(raw: string): Diagnostic[] {
  const out: Diagnostic[] = [];
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = /^(?:.*[\\/])?([^\\/:]+\.java):(\d+): (error|warning): (.*)$/.exec(lines[i]);
    if (!m) continue;
    let column: number | undefined;
    // javac prints the source line, then a caret line marking the column
    const caret = lines[i + 2];
    if (caret !== undefined && /^\s*\^\s*$/.test(caret)) column = caret.indexOf("^") + 1;
    out.push({ file: m[1], line: Number(m[2]), column, severity: m[3] as "error" | "warning", message: m[4] });
  }
  return out;
}

function dockerArgs(workDir: string, readOnlyWork: boolean, inner: string[]): string[] {
  return [
    "run", "--rm", "-i",
    "--network", "none",
    "--memory", "384m", "--memory-swap", "384m",
    "--cpus", "1", "--pids-limit", "128",
    "--read-only", "--tmpfs", "/tmp:rw,size=64m",
    "--security-opt", "no-new-privileges", "--cap-drop", "ALL",
    "--user", "65534:65534",
    "-v", `${workDir}:/work${readOnlyWork ? ":ro" : ""}`, "-w", "/work",
    config.dockerImage, ...inner,
  ];
}

export async function compileAndRun(req: RunRequest): Promise<RunResponse> {
  validateFiles(req.files);
  if (req.stdin && req.stdin.length > 16 * 1024) throw new BadRequest("stdin is too large.");
  const mainClass = req.mainClass ?? detectMainClass(req.files);

  const dir = mkdtempSync(path.join(os.tmpdir(), "jcc-run-"));
  try {
    const src = path.join(dir, "src");
    const out = path.join(dir, "out");
    mkdirSync(src);
    mkdirSync(out);
    for (const f of req.files) writeFileSync(path.join(src, f.name), f.content, "utf8");
    const names = req.files.map((f) => `src/${f.name}`);
    const { limits } = config;
    const common = { cwd: dir, maxOutputBytes: limits.maxOutputBytes, env: childEnv() };

    const javacArgs = ["-encoding", "UTF-8", "-Xlint:none", "-d", "out", ...names];
    const compile =
      config.mode === "docker"
        ? await exec("docker", dockerArgs(dir, false, ["javac", ...javacArgs]), { ...common, timeoutMs: limits.compileTimeoutMs + 10_000 })
        : await exec(config.javac, ["-J-Xmx256m", ...javacArgs], { ...common, timeoutMs: limits.compileTimeoutMs });

    const raw = (compile.stderr + compile.stdout).replaceAll(src + path.sep, "").replaceAll("src/", "");
    const compileOk = compile.exitCode === 0 && !compile.timedOut;
    const result: RunResponse = {
      mode: config.mode,
      compile: { ok: compileOk, diagnostics: parseJavacDiagnostics(raw), raw: compile.timedOut ? "Compilation timed out." : raw, durationMs: compile.durationMs },
      mainClass,
    };
    if (!compileOk) return result;
    if (!mainClass) {
      result.compile.raw += "\nCompiled successfully, but no class has `public static void main(String[] args)` to run.";
      return result;
    }

    const javaArgs = [`-Xmx${limits.maxHeapMb}m`, "-Xss8m", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-Dfile.encoding=UTF-8", "-Dstdout.encoding=UTF-8", "-cp", "out", mainClass];
    result.run =
      config.mode === "docker"
        ? await exec("docker", dockerArgs(dir, true, ["java", ...javaArgs]), { ...common, timeoutMs: limits.runTimeoutMs + 10_000, stdin: req.stdin })
        : await exec(config.java, javaArgs, { ...common, timeoutMs: limits.runTimeoutMs, stdin: req.stdin });
    return result;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
