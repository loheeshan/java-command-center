import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import type { ExecutionMode, RunnerLimits } from "./protocol";

export const ROOT = path.resolve(__dirname, "..");

function findJavaHome(): string | null {
  if (process.env.JCC_JAVA_HOME && existsSync(process.env.JCC_JAVA_HOME)) return process.env.JCC_JAVA_HOME;
  const tools = path.join(ROOT, ".tools");
  if (existsSync(tools)) {
    const jdk = readdirSync(tools).filter((d) => d.startsWith("jdk-25")).sort().pop();
    if (jdk) return path.join(tools, jdk);
  }
  if (process.env.JAVA_HOME && existsSync(process.env.JAVA_HOME)) return process.env.JAVA_HOME;
  return null;
}

function findMavenHome(): string | null {
  for (const v of [process.env.MAVEN_HOME, process.env.M2_HOME]) if (v && existsSync(v)) return v;
  const which = spawnSync(process.platform === "win32" ? "where" : "which", ["mvn"], { encoding: "utf8", windowsHide: true });
  const first = which.stdout?.split(/\r?\n/).find(Boolean);
  if (!first) return null;
  const home = path.resolve(path.dirname(first), "..");
  return existsSync(path.join(home, "boot")) ? home : null;
}

function loadToken(): string {
  if (process.env.RUNNER_TOKEN) return process.env.RUNNER_TOKEN;
  const file = path.join(ROOT, ".runner-token");
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  const token = randomBytes(24).toString("hex");
  writeFileSync(file, token, { encoding: "utf8" });
  return token;
}

const javaHome = findJavaHome();
const exe = process.platform === "win32" ? ".exe" : "";

export const config = {
  port: Number(process.env.RUNNER_PORT ?? 4100),
  /** Bound to loopback only — the runner is never reachable from the network. */
  host: "127.0.0.1",
  token: loadToken(),
  mode: (process.env.RUNNER_MODE === "docker" ? "docker" : "local") as ExecutionMode,
  dockerImage: process.env.RUNNER_DOCKER_IMAGE ?? "eclipse-temurin:25-jdk",
  javaHome,
  javac: javaHome ? path.join(javaHome, "bin", "javac" + exe) : "javac",
  java: javaHome ? path.join(javaHome, "bin", "java" + exe) : "java",
  mavenHome: findMavenHome(),
  mavenRepo: process.env.MAVEN_REPO ?? path.join(process.env.USERPROFILE ?? process.env.HOME ?? ".", ".m2", "repository"),
  projects: {
    dispatch: path.join(ROOT, "java-grader", "dispatch"),
    tickets: path.join(ROOT, "java-grader", "tickets"),
  } as Record<string, string>,
  limits: {
    compileTimeoutMs: 20_000,
    runTimeoutMs: 8_000,
    projectTimeoutMs: 240_000,
    maxOutputBytes: 64 * 1024,
    maxSourceBytes: 200 * 1024,
    maxHeapMb: 256,
  } satisfies RunnerLimits,
};

/** Minimal environment for child processes: no secrets from the parent environment leak in. */
export function childEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const keep = ["PATH", "Path", "SystemRoot", "SYSTEMROOT", "TEMP", "TMP", "WINDIR", "COMSPEC", "LANG"];
  const env: Record<string, string> = {};
  for (const k of keep) {
    const v = process.env[k];
    if (v) env[k] = v;
  }
  if (config.javaHome) env.JAVA_HOME = config.javaHome;
  return { ...env, ...extra } as NodeJS.ProcessEnv;
}
