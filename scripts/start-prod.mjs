// Production entry (Docker): starts the Java runner and `next start` together.
// A fresh random token is shared with both through the environment; the runner stays on 127.0.0.1.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";

const env = { ...process.env, RUNNER_TOKEN: process.env.RUNNER_TOKEN ?? randomBytes(24).toString("hex") };
const port = process.env.PORT ?? "3000";
const procs = [
  spawn("npx", ["tsx", "runner/server.ts"], { stdio: "inherit", env }),
  spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", port], { stdio: "inherit", env }),
];
const stop = (code = 0) => { for (const p of procs) p.kill("SIGTERM"); process.exit(code); };
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
for (const p of procs) p.on("exit", (code) => stop(code ?? 1));
