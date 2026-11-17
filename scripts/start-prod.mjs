// Production entry (Docker): starts the Java runner, waits until it answers, then starts `next start`.
// A fresh random token is shared with both through the environment; the runner stays on 127.0.0.1.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";

const env = { ...process.env, RUNNER_TOKEN: process.env.RUNNER_TOKEN || randomBytes(24).toString("hex") };
const port = process.env.PORT ?? "3000";
const runnerUrl = `http://127.0.0.1:${process.env.RUNNER_PORT ?? 4100}/health`;
const procs = [];

const stop = (code = 0) => { for (const p of procs) p.kill("SIGTERM"); process.exit(code); };
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
const start = (args) => {
  const p = spawn("npx", args, { stdio: "inherit", env });
  p.on("exit", (code) => stop(code ?? 1));
  procs.push(p);
};

start(["tsx", "runner/server.ts"]);

// Wait up to 60 s for the runner so the website never reports "JDK offline" during startup.
for (let i = 0; i < 120; i++) {
  try {
    const res = await fetch(runnerUrl, { headers: { "X-Runner-Token": env.RUNNER_TOKEN } });
    if (res.ok) break;
  } catch { /* not listening yet */ }
  await new Promise((r) => setTimeout(r, 500));
}

start(["next", "start", "-H", "0.0.0.0", "-p", port]);
