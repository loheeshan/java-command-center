import "server-only";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const RUNNER_URL = process.env.RUNNER_URL ?? "http://127.0.0.1:4100";

function token(): string | null {
  if (process.env.RUNNER_TOKEN) return process.env.RUNNER_TOKEN;
  const file = path.join(process.cwd(), ".runner-token");
  return existsSync(file) ? readFileSync(file, "utf8").trim() : null;
}

/**
 * Forwards a request to the separate Java runner process. This server never executes Java.
 * Returns a 503 with a clear message when the runner is not running.
 */
export async function forward(pathname: string, init: { method: "GET" | "POST"; body?: string }, timeoutMs: number): Promise<Response> {
  const t = token();
  if (!t) return Response.json({ error: "Runner token not found. Start the runner with `npm run runner` (it creates .runner-token).", offline: true }, { status: 503 });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(RUNNER_URL + pathname, {
      method: init.method,
      body: init.body,
      headers: { "Content-Type": "application/json", "X-Runner-Token": t },
      signal: ctrl.signal,
      cache: "no-store",
    });
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return Response.json(
      { error: aborted ? "The Java runner did not answer in time." : "Java runner is offline. Start it with `npm run runner` (or `npm run dev` to start everything).", offline: !aborted },
      { status: 503 },
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Basic request hygiene before forwarding untrusted input. */
export async function readJson(req: Request, maxBytes: number): Promise<{ ok: true; body: string } | { ok: false; res: Response }> {
  const text = await req.text();
  if (text.length > maxBytes) return { ok: false, res: Response.json({ error: "Request too large." }, { status: 413 }) };
  try {
    JSON.parse(text);
  } catch {
    return { ok: false, res: Response.json({ error: "Body must be JSON." }, { status: 400 }) };
  }
  return { ok: true, body: text };
}
