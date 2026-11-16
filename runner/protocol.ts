/**
 * Wire protocol shared by the runner service and the web app.
 * The web app imports these types only (no runtime code), so it never executes Java itself.
 */

export interface SourceFile {
  /** Simple file name, e.g. "Main.java". */
  name: string;
  content: string;
}

export interface Diagnostic {
  file: string;
  line: number;
  column?: number;
  message: string;
  severity: "error" | "warning";
}

export interface RunRequest {
  files: SourceFile[];
  /** Fully qualified main class; detected automatically when omitted. */
  mainClass?: string;
  stdin?: string;
}

export interface ProcessOutcome {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  truncated: boolean;
  durationMs: number;
}

export interface RunResponse {
  /** "local" = JDK process on this machine; "docker" = isolated container. */
  mode: ExecutionMode;
  compile: { ok: boolean; diagnostics: Diagnostic[]; raw: string; durationMs: number };
  run?: ProcessOutcome;
  mainClass?: string;
}

export interface ProjectTestRequest {
  projectId: string;
  /** Map of project-relative path (e.g. "src/main/java/.../GroundMission.java") to content. */
  files: Record<string, string>;
}

export type TestStatus = "passed" | "failed" | "error" | "skipped";

export interface TestCaseResult {
  className: string;
  name: string;
  status: TestStatus;
  message?: string;
  durationMs: number;
}

export interface ProjectTestResponse {
  mode: ExecutionMode;
  compile: { ok: boolean; diagnostics: Diagnostic[] };
  /** Spring context failed to start (Section B could not run). */
  contextFailed: boolean;
  tests: TestCaseResult[];
  durationMs: number;
  logTail: string;
}

export type ExecutionMode = "local" | "docker";

export interface HealthResponse {
  ok: boolean;
  mode: ExecutionMode;
  javaVersion: string | null;
  mavenAvailable: boolean;
  projects: string[];
  limits: RunnerLimits;
  isolationNote: string;
}

export interface RunnerLimits {
  compileTimeoutMs: number;
  runTimeoutMs: number;
  projectTimeoutMs: number;
  maxOutputBytes: number;
  maxSourceBytes: number;
  maxHeapMb: number;
}

export interface RunnerError {
  error: string;
}
