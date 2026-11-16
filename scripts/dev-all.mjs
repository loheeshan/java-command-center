// Starts the Java runner and the Next.js dev server together. Ctrl+C stops both.
import { spawn } from "node:child_process";

const shell = process.platform === "win32";
const procs = [
  spawn("npm", ["run", "runner"], { stdio: "inherit", shell }),
  spawn("npm", ["run", "dev:web"], { stdio: "inherit", shell }),
];
const stop = () => { for (const p of procs) p.kill(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const p of procs) p.on("exit", (code) => { if (code) stop(); });
