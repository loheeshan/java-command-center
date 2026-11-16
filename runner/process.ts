import { spawn, spawnSync } from "node:child_process";
import type { ProcessOutcome } from "./protocol";

export interface ExecOptions {
  cwd: string;
  timeoutMs: number;
  maxOutputBytes: number;
  stdin?: string;
  env: NodeJS.ProcessEnv;
}

/** Kill a process and all of its children (Maven forks test JVMs). */
function killTree(pid: number | undefined) {
  if (!pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { windowsHide: true });
  } else {
    try {
      process.kill(-pid, "SIGKILL");
    } catch {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        /* already gone */
      }
    }
  }
}

/** Runs a command with a hard timeout and capped output. Never uses a shell. */
export function exec(cmd: string, args: string[], opts: ExecOptions): Promise<ProcessOutcome> {
  return new Promise((resolve) => {
    const started = Date.now();
    let stdout = "";
    let stderr = "";
    let truncated = false;
    let timedOut = false;

    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: opts.env,
      windowsHide: true,
      detached: process.platform !== "win32",
      shell: false,
    });

    const append = (which: "out" | "err", chunk: Buffer) => {
      const current = which === "out" ? stdout : stderr;
      if (current.length >= opts.maxOutputBytes) {
        truncated = true;
        return;
      }
      let text = chunk.toString("utf8");
      if (current.length + text.length > opts.maxOutputBytes) {
        text = text.slice(0, opts.maxOutputBytes - current.length);
        truncated = true;
      }
      if (which === "out") stdout += text;
      else stderr += text;
      if (truncated && stdout.length + stderr.length >= opts.maxOutputBytes * 2) killTree(child.pid);
    };

    child.stdout.on("data", (c: Buffer) => append("out", c));
    child.stderr.on("data", (c: Buffer) => append("err", c));

    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child.pid);
    }, opts.timeoutMs);

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: stderr + String(err), exitCode: null, timedOut, truncated, durationMs: Date.now() - started });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timedOut, truncated, durationMs: Date.now() - started });
    });

    if (opts.stdin) child.stdin.write(opts.stdin);
    child.stdin.end();
  });
}

/** A tiny FIFO limiter so a burst of requests cannot start unlimited JVMs. */
export class Limiter {
  private active = 0;
  private queue: Array<() => void> = [];
  constructor(private readonly max: number, private readonly maxQueue: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.max) {
      if (this.queue.length >= this.maxQueue) throw new Error("Runner is busy — try again in a few seconds.");
      await new Promise<void>((r) => this.queue.push(r));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      this.queue.shift()?.();
    }
  }
}
