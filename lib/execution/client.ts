"use client";

import { useEffect, useState } from "react";
import type { HealthResponse, ProjectTestResponse, RunRequest, RunResponse } from "@/runner/protocol";

export class RunnerError extends Error {
  constructor(message: string, readonly offline: boolean) {
    super(message);
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new RunnerError("Could not reach the app server.", true);
  }
  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  if (!res.ok) throw new RunnerError(data.error ?? `HTTP ${res.status}`, Boolean(data.offline));
  return data as T;
}

export const runJava = (req: RunRequest) => post<RunResponse>("/api/run", req);
export const testProject = (projectId: string, files: Record<string, string>) => post<ProjectTestResponse>("/api/project-test", { projectId, files });

export type RunnerStatus = { state: "checking" } | { state: "online"; health: HealthResponse } | { state: "offline"; message: string };

let cached: { at: number; status: RunnerStatus } | null = null;

export async function checkRunner(force = false): Promise<RunnerStatus> {
  if (!force && cached && Date.now() - cached.at < 15_000) return cached.status;
  let status: RunnerStatus;
  try {
    const res = await fetch("/api/runner-health", { cache: "no-store" });
    const data = await res.json();
    status = res.ok ? { state: "online", health: data as HealthResponse } : { state: "offline", message: data.error ?? "Runner offline" };
  } catch {
    status = { state: "offline", message: "Could not reach the app server." };
  }
  cached = { at: Date.now(), status };
  return status;
}

export function useRunnerStatus(): [RunnerStatus, () => void] {
  const [status, setStatus] = useState<RunnerStatus>({ state: "checking" });
  const refresh = () => {
    setStatus({ state: "checking" });
    checkRunner(true).then(setStatus);
  };
  useEffect(() => {
    let alive = true;
    checkRunner().then((s) => alive && setStatus(s));
    return () => {
      alive = false;
    };
  }, []);
  return [status, refresh];
}
