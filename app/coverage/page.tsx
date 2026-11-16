import type { Metadata } from "next";
import Link from "next/link";
import { COVERAGE, type CoverageStatus } from "@/content/coverage";
import { Badge, Card, CardHeader, Notice, PageHeader } from "@/components/ui/primitives";
import { Markdown } from "@/components/content/Markdown";

export const metadata: Metadata = { title: "Exam Coverage" };

const STATUS: Record<CoverageStatus, { tone: "ok" | "warn" | "bad" | "neutral"; label: string }> = {
  covered: { tone: "ok", label: "covered" },
  partial: { tone: "warn", label: "partial" },
  gap: { tone: "bad", label: "not covered" },
  "out-of-scope": { tone: "neutral", label: "out of scope" },
};

export default function CoveragePage() {
  const all = COVERAGE.flatMap((g) => g.rows);
  const count = (s: CoverageStatus) => all.filter((r) => r.status === s).length;
  return (
    <>
      <PageHeader eyebrow="Is this enough for the exam?" title="Exam Coverage">
        Every topic your university materials say can be assessed (LBP guidance, Lectures 1–7, Tutorials 1–5, the Week 05 code, the mock paper and the Lecture 6 briefing), where it is taught here, and an honest status.
      </PageHeader>
      <div className="mb-5 flex flex-wrap gap-2">
        <Badge tone="ok">{count("covered")} covered</Badge>
        <Badge tone="warn">{count("partial")} partial</Badge>
        <Badge tone="bad">{count("gap")} not covered</Badge>
        <Badge tone="neutral">{count("out-of-scope")} out of scope</Badge>
      </div>
      <Notice tone="warn" className="mb-5" title="What nobody can promise">
        The real paper is given on the day and is not in your materials. Lecture 6 says it has the same <em>shape</em> as the mock (complete a subclass, create a subclass, 404, GET/POST 201, 400). Coverage here means &quot;taught and practised&quot;, not &quot;guaranteed on the paper&quot;.
      </Notice>
      <div className="space-y-5">
        {COVERAGE.map((g) => (
          <Card key={g.title}>
            <CardHeader title={g.title} sub={g.marks} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-ink-3">
                  <tr className="border-b border-line"><th className="p-3 text-left font-medium">Topic</th><th className="p-3 text-left font-medium">Source</th><th className="p-3 text-left font-medium">Status</th><th className="p-3 text-left font-medium">Where to learn / practise</th></tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.topic} className="border-b border-line/60 align-top last:border-0">
                      <td className="min-w-56 p-3 text-ink"><Markdown text={r.topic} inline />{r.note && <span className="mt-1 block text-xs text-ink-3"><Markdown text={r.note} inline /></span>}</td>
                      <td className="min-w-36 p-3 text-xs text-ink-3">{r.source}</td>
                      <td className="p-3"><Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge></td>
                      <td className="min-w-40 p-3">
                        <div className="flex flex-wrap gap-1">
                          {r.where.length === 0 ? <span className="text-xs text-ink-3">—</span> : r.where.map((w) => <Link key={w.href + w.label} href={w.href} className="rounded border border-line px-1.5 py-0.5 text-xs text-accent hover:border-accent/50">{w.label}</Link>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
