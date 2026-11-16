"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ExternalLink, PlayCircle } from "lucide-react";
import { VIDEOS, chapterRange, toSeconds, type VideoInfo } from "@/content/videos";
import { LESSONS } from "@/content/modules";
import { Badge, Card, CardHeader, cn, Notice } from "@/components/ui/primitives";

function lessonsForChapter(key: "java" | "spring", n: number) {
  return LESSONS.filter((l) => l.videos?.some((v) => v.video === key && v.chapter === n));
}

export function Resources() {
  const params = useSearchParams();
  const initialKey = (params.get("v") as "java" | "spring") ?? "java";
  const initialStart = Number(params.get("t") ?? 0);
  const initialEnd = params.get("end") ? Number(params.get("end")) : undefined;
  const [key, setKey] = useState<"java" | "spring">(initialKey === "spring" ? "spring" : "java");
  const [range, setRange] = useState<{ start: number; end?: number }>({ start: initialStart, end: initialEnd });
  const [onlyMapped, setOnlyMapped] = useState(true);
  const v: VideoInfo = VIDEOS[key];
  const src = `https://www.youtube-nocookie.com/embed/${v.youtubeId}?start=${range.start}${range.end ? `&end=${range.end}` : ""}&rel=0`;
  const chapters = v.chapters.filter((c) => !onlyMapped || lessonsForChapter(key, c.n).length > 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex gap-1 border-b border-line p-2">
            {(["java", "spring"] as const).map((k) => (
              <button key={k} onClick={() => { setKey(k); setRange({ start: 0 }); }} className={cn("rounded-md px-3 py-1 text-sm", key === k ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-surface-3")}>{k === "java" ? "Java course" : "Spring Boot course"}</button>
            ))}
          </div>
          <div className="aspect-video bg-black">
            <iframe key={src} src={src} title={v.title} className="h-full w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          </div>
          <div className="space-y-1 p-4 text-sm">
            <p className="font-medium text-ink">{v.title}</p>
            <p className="text-ink-3">{v.channel} · {v.duration} · {v.language}</p>
            <p className="text-ink-2">{v.note}</p>
            <a href={`https://www.youtube.com/watch?v=${v.youtubeId}&t=${range.start}s`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">Open on YouTube <ExternalLink size={11} /></a>
          </div>
        </Card>
        <Card className="flex max-h-[640px] flex-col">
          <CardHeader title="Chapters" sub={`Creator-written chapter list, verified ${v.verifiedOn}`} action={<label className="flex items-center gap-1 text-xs text-ink-3"><input type="checkbox" checked={onlyMapped} onChange={(e) => setOnlyMapped(e.target.checked)} className="accent-sky-400" />mapped to lessons</label>} />
          <ul className="flex-1 overflow-y-auto p-2">
            {chapters.map((c) => {
              const r = chapterRange(key, c.n);
              const lessons = lessonsForChapter(key, c.n);
              const active = range.start === toSeconds(c.start);
              return (
                <li key={c.n}>
                  <button onClick={() => setRange(r)} className={cn("flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left", active ? "bg-accent-soft" : "hover:bg-surface-3")}>
                    <PlayCircle size={14} className={cn("mt-0.5 shrink-0", active ? "text-accent" : "text-ink-3")} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink">#{c.n} {c.title}</span>
                      <span className="font-mono text-[11px] text-ink-3">{c.start} · {Math.round((r.end - r.start) / 60)} min</span>
                      {lessons.length > 0 && <span className="mt-0.5 flex flex-wrap gap-1">{lessons.map((l) => <Badge key={l.id} tone="accent">{l.title.split(":")[0].slice(0, 28)}</Badge>)}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Notice tone="warn" title="Watch in short segments">Choose a chapter linked from a lesson, watch only that segment (the player stops at the chapter end), then go straight back to the lesson&apos;s run/trace/quiz. Do not binge the 12-hour course before Friday.</Notice>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Your university materials (from OOP-26.rar)" />
          <ul className="space-y-1.5 p-4 text-sm text-ink-2">
            <li>• Lectures 1–7 (PDF) — Product, encapsulation, collections & service layer, inheritance, polymorphism, exceptions, DI.</li>
            <li>• Tutorials 1–5 (lab guides) and Week 01 Java refresher.</li>
            <li>• Week05.zip — Vehicle/Car/Boat/Plane abstract hierarchy.</li>
            <li>• LBP guidance — 100 min, OOP 40 / Spring 40 / validation 20, viva.</li>
            <li>• Week 8 mock — paper, starter project and worked solution (used by the Exam Lab).</li>
            <li className="pt-1 text-xs text-ink-3">Full inventory with discrepancies: <span className="font-mono">docs/source-inventory.md</span>. Original files: <span className="font-mono">materials/OOP-26/</span>.</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Allowed reference docs (open book)" />
          <ul className="space-y-1.5 p-4 text-sm">
            {[
              ["Java SE 25 API (java.util, java.lang)", "https://docs.oracle.com/en/java/javase/25/docs/api/index.html"],
              ["Spring Boot reference", "https://docs.spring.io/spring-boot/index.html"],
              ["Spring MVC annotated controllers", "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller.html"],
              ["Spring MVC exception handling (@ControllerAdvice)", "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-advice.html"],
            ].map(([label, href]) => (
              <li key={href}><a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">{label} <ExternalLink size={11} /></a></li>
            ))}
            <li className="pt-1 text-xs text-ink-3">Starter app (when running locally): <span className="font-mono">http://localhost:8080/swagger-ui.html</span></li>
          </ul>
          <p className="px-4 pb-4 text-xs text-ink-3">Lecture 6: slides, Blackboard materials and Java/Spring docs are allowed in the practical. AI assistants are not. Practise finding things in these docs now.</p>
          <p className="px-4 pb-4 text-xs"><Link href="/revision" className="text-accent hover:underline">Revision Center →</Link></p>
        </Card>
      </div>
    </div>
  );
}
