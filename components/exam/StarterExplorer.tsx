"use client";

import { useState } from "react";
import { FileCode2, Hammer } from "lucide-react";
import { STARTER_TOUR } from "@/content/starter-tour";
import { Badge, cn } from "@/components/ui/primitives";
import { CodeBlock } from "@/components/content/CodeBlock";
import { Markdown } from "@/components/content/Markdown";

const LAYER_TONE = { entry: "accent", model: "violet", repository: "ok", service: "warn", controller: "accent", exception: "bad", config: "neutral" } as const;

export function StarterExplorer({ files, readme, pom }: { files: Record<string, string>; readme: string; pom: string }) {
  const [sel, setSel] = useState(0);
  const [extra, setExtra] = useState<"readme" | "pom" | null>(null);
  const stop = STARTER_TOUR[sel];

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <ol className="space-y-0.5">
        {STARTER_TOUR.map((s, i) => (
          <li key={s.path}>
            <button onClick={() => { setSel(i); setExtra(null); }} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left", i === sel && !extra ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-surface-3")}>
              <span className="w-4 font-mono text-[10px] text-ink-3">{i + 1}</span>
              <FileCode2 size={12} className="shrink-0" />
              <span className="flex-1 truncate font-mono text-xs">{s.path.split("/").slice(-2).join("/")}</span>
              {s.todo && <Hammer size={11} className="text-warn" aria-label="contains TODO" />}
            </button>
          </li>
        ))}
        <li className="pt-2">
          <button onClick={() => setExtra("pom")} className={cn("w-full rounded-md px-2 py-1 text-left font-mono text-xs", extra === "pom" ? "bg-accent-soft text-accent" : "text-ink-3 hover:bg-surface-3")}>pom.xml</button>
          <button onClick={() => setExtra("readme")} className={cn("w-full rounded-md px-2 py-1 text-left font-mono text-xs", extra === "readme" ? "bg-accent-soft text-accent" : "text-ink-3 hover:bg-surface-3")}>README.md</button>
        </li>
      </ol>
      <div className="min-w-0 space-y-3">
        {extra ? (
          <>
            <p className="text-sm text-ink-2">{extra === "pom" ? "Spring Boot 4.1.1 parent, Java 25, spring-boot-starter-webmvc, springdoc-openapi 3.2.0 (Swagger UI). Never edit it in the exam." : "Supplied README. Note: it says port 8082 but application.properties sets 8080."}</p>
            <pre className="max-h-[520px] overflow-auto rounded-lg border border-line bg-[#0a0e15] p-3 font-mono text-xs text-ink-2">{extra === "pom" ? pom : readme}</pre>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={LAYER_TONE[stop.layer]}>{stop.layer}</Badge>
              <span className="min-w-0 break-all font-mono text-xs text-ink-3">{stop.path}</span>
            </div>
            <Markdown text={stop.role} className="!text-ink" />
            <ul className="space-y-1">{stop.points.map((pt, i) => <li key={i} className="text-sm">• <Markdown text={pt} inline /></li>)}</ul>
            {stop.todo && <p className="rounded-md border border-warn/40 bg-warn-soft/50 px-3 py-2 text-sm text-ink"><Hammer size={13} className="mr-1 inline text-warn" /> <Markdown text={stop.todo} inline /></p>}
            <CodeBlock code={files[stop.path] ?? "(file not found)"} lineNumbers title={stop.path.split("/").pop()} />
          </>
        )}
      </div>
    </div>
  );
}
