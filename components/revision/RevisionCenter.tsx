"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { FLASHCARDS, REVISION } from "@/content/revision";
import { Card, CardHeader, cn } from "@/components/ui/primitives";
import { Markdown } from "@/components/content/Markdown";
import { CodeBlock } from "@/components/content/CodeBlock";

function Flashcard({ q, a }: { q: string; a: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped((f) => !f)} className={cn("flex min-h-28 flex-col justify-between rounded-lg border p-3 text-left transition-colors", flipped ? "border-ok/40 bg-ok-soft/40" : "border-line bg-surface hover:border-accent/50")} aria-pressed={flipped}>
      <Markdown text={flipped ? a : q} inline className={cn(!flipped && "!text-ink")} />
      <span className="mt-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-3"><RotateCw size={10} /> {flipped ? "answer" : "tap to reveal"}</span>
    </button>
  );
}

export function RevisionCenter() {
  return (
    <div className="grid gap-6 xl:grid-cols-[180px_1fr]">
      <nav className="hidden xl:block" aria-label="Revision sections">
        <div className="sticky top-16 space-y-0.5 text-xs">
          {REVISION.map((s) => <a key={s.id} href={`#${s.id}`} className="block rounded px-2 py-1 text-ink-3 hover:bg-surface-3 hover:text-ink">{s.title}</a>)}
          <a href="#cards" className="block rounded px-2 py-1 text-ink-3 hover:bg-surface-3 hover:text-ink">Last-minute cards</a>
        </div>
      </nav>
      <div className="min-w-0 space-y-5">
        {REVISION.map((s) => (
          <Card key={s.id} id={s.id} className="scroll-mt-16">
            <CardHeader title={s.title} />
            <div className="space-y-3 p-4">
              {s.rows && (
                <div className="overflow-x-auto"><table className="w-full text-sm [&_code]:break-all">
                  <tbody>
                    {s.rows.map(([k, v]) => (
                      <tr key={k} className="border-b border-line/60 align-top last:border-0">
                        <td className="w-2/5 py-1.5 pr-3"><Markdown text={k} inline className="!text-ink " /></td>
                        <td className="py-1.5"><Markdown text={v} inline className="" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              )}
              {s.code?.map((c) => <CodeBlock key={c.title} code={c.code} title={c.title} />)}
              {s.bullets && <ul className="space-y-1">{s.bullets.map((b) => <li key={b} className="text-sm">• <Markdown text={b} inline /></li>)}</ul>}
            </div>
          </Card>
        ))}
        <section id="cards" className="scroll-mt-16">
          <h2 className="mb-2 text-base font-semibold text-ink">Last-minute revision cards</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {FLASHCARDS.map(([q, a]) => <Flashcard key={q} q={q} a={a} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
