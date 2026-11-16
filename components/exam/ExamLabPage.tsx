import Link from "next/link";
import { Timer } from "lucide-react";
import { referenceFiles, starterFiles } from "@/lib/projects/dispatch";
import { PROJECTS, PROJECT_LIST, type ProjectId } from "@/lib/projects/registry";
import { ExamIDE } from "@/components/exam/ExamIDE";
import { Badge, Button, cn, Notice, PageHeader } from "@/components/ui/primitives";

/** Server component: loads the project's real files from java-grader/<id>. */
export function ExamLabPage({ projectId, task }: { projectId: ProjectId; task?: string }) {
  const project = PROJECTS[projectId];
  return (
    <>
      <PageHeader
        eyebrow="Module 08 · Mock Exam Lab"
        title={project.title}
        actions={<Link href={`/exam/simulator?project=${project.id}`}><Button variant="primary"><Timer size={14} /> Timed simulator</Button></Link>}
      >
        {project.description} Edit the files, then <strong className="text-ink">Compile &amp; run tests</strong>: Maven builds your project, starts the app and runs {project.testCount} grader tests against it over HTTP. Hints and the reference solution are available here — not in the simulator.
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Practice project">
        {PROJECT_LIST.map((p) => (
          <Link key={p.id} href={p.href} role="tab" aria-selected={p.id === project.id} className={cn("rounded-lg border px-3 py-2 text-sm", p.id === project.id ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-2 hover:border-line-strong")}>
            {p.short} <Badge tone={p.origin === "university" ? "accent" : "violet"} className="ml-1">{p.origin === "university" ? "university files" : "original"}</Badge>
          </Link>
        ))}
      </div>

      <Notice tone="warn" className="mb-4" title="Practice simulation — not a prediction of the actual examination.">
        {project.origin === "university" ? (
          <>Based on <span className="font-mono">MODERATE_Mock_Practice_Paper.docx</span> and its supplied starter project.</>
        ) : (
          <>Written for this app in the task <em>shape</em> Lecture 6 describes for the real paper (complete a subclass → create a subclass → 404 → GET/POST 201 → 400). The domain is deliberately different: learn the shape, not the domain.</>
        )}
      </Notice>
      <ExamIDE key={project.id} projectId={project.id} mode="lab" starter={starterFiles(project.id)} reference={referenceFiles(project.id)} workspaceKey={project.id === "dispatch" ? "lab" : `lab-${project.id}`} initialTask={task} />
    </>
  );
}
