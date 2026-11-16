import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import { spawnSync } from "node:child_process";
import { config } from "./config";
import { BadRequest, compileAndRun } from "./java";
import { runProjectTests } from "./maven";
import { Limiter } from "./process";
import type { HealthResponse } from "./protocol";

const runLimiter = new Limiter(2, 6);
const projectLimiter = new Limiter(1, 2);
const MAX_BODY = 600 * 1024;

function javaVersion(): string | null {
  const r = spawnSync(config.java, ["-version"], { encoding: "utf8", windowsHide: true });
  return (r.stderr || r.stdout || "").split(/\r?\n/)[0] || null;
}

const health: HealthResponse = {
  ok: true,
  mode: config.mode,
  javaVersion: javaVersion(),
  mavenAvailable: Boolean(config.mavenHome),
  projects: Object.keys(config.projects),
  limits: config.limits,
  isolationNote:
    config.mode === "docker"
      ? "Code runs in a throwaway Docker container: no network, read-only filesystem, 384 MB memory, 1 CPU, 128 processes."
      : "Local mode: code runs as a normal JDK process on this computer (like pressing Run in IntelliJ), with time, memory and output limits. It is NOT a security sandbox — run only your own code, and never expose this runner to a network.",
};

function authorised(req: http.IncomingMessage): boolean {
  const got = Buffer.from(String(req.headers["x-runner-token"] ?? ""));
  const want = Buffer.from(config.token);
  return got.length === want.length && timingSafeEqual(got, want);
}

function send(res: http.ServerResponse, status: number, body: unknown) {
  const json = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(json);
}

function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new BadRequest("Request too large."));
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new BadRequest("Body must be JSON."));
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    // Browsers must never talk to the runner directly: reject any cross-origin request outright.
    if (req.headers.origin) return send(res, 403, { error: "Direct browser access is not allowed." });
    if (!authorised(req)) return send(res, 401, { error: "Missing or invalid runner token." });

    if (req.method === "GET" && req.url === "/health") return send(res, 200, health);

    if (req.method === "POST" && req.url === "/run") {
      const body = (await readBody(req)) as Parameters<typeof compileAndRun>[0];
      const result = await runLimiter.run(() => compileAndRun(body));
      return send(res, 200, result);
    }

    if (req.method === "POST" && req.url === "/project/test") {
      const body = (await readBody(req)) as Parameters<typeof runProjectTests>[0];
      const result = await projectLimiter.run(() => runProjectTests(body));
      return send(res, 200, result);
    }

    send(res, 404, { error: "Not found" });
  } catch (err) {
    const status = err instanceof BadRequest ? 400 : /busy/.test(String(err)) ? 429 : 500;
    send(res, status, { error: err instanceof Error ? err.message : String(err) });
  }
});

server.listen(config.port, config.host, () => {
  console.log(`[runner] listening on http://${config.host}:${config.port} (${config.mode} mode)`);
  console.log(`[runner] java: ${health.javaVersion ?? "NOT FOUND"}`);
  console.log(`[runner] maven: ${config.mavenHome ?? "NOT FOUND"}`);
  if (config.mode === "local") console.log("[runner] WARNING: local mode is not a sandbox. Loopback only; do not expose.");
});
