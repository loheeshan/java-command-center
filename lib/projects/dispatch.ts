import "server-only";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import type { ProjectId } from "./registry";

const root = (id: ProjectId) => path.join(process.cwd(), "java-grader", id);

function collect(dir: string, base: string, out: Record<string, string>) {
  for (const f of readdirSync(dir)) {
    const full = path.join(dir, f);
    if (statSync(full).isDirectory()) collect(full, base, out);
    else if (f.endsWith(".java") || f === "application.properties") out[path.relative(base, full).split(path.sep).join("/")] = readFileSync(full, "utf8");
  }
  return out;
}

/** Editable starter sources (src/main/**) exactly as supplied. */
export function starterFiles(id: ProjectId): Record<string, string> {
  return collect(path.join(root(id), "starter", "src", "main"), path.join(root(id), "starter"), {});
}

/** Worked solution — only revealed in the guided lab after an attempt. */
export function referenceFiles(id: ProjectId): Record<string, string> {
  return collect(path.join(root(id), "reference", "src", "main"), path.join(root(id), "reference"), {});
}

export function readmeAndPom(id: ProjectId): { readme: string; pom: string } {
  const s = path.join(root(id), "starter");
  return {
    readme: existsSync(path.join(s, "README.md")) ? readFileSync(path.join(s, "README.md"), "utf8") : "",
    pom: readFileSync(path.join(s, "pom.xml"), "utf8"),
  };
}

// Backwards-compatible names used by the Spring Boot Lab page
export const dispatchStarterFiles = () => starterFiles("dispatch");
export const dispatchReferenceFiles = () => referenceFiles("dispatch");
export const dispatchReadmeAndPom = () => readmeAndPom("dispatch");
