import type { Metadata } from "next";
import Link from "next/link";
import { Notice, PageHeader } from "@/components/ui/primitives";
import { LabSection } from "@/components/ui/LabSection";
import { RequestFlowVisualizer } from "@/components/visualizers/RequestFlowVisualizer";
import { StarterExplorer } from "@/components/exam/StarterExplorer";
import { dispatchReadmeAndPom, dispatchStarterFiles } from "@/lib/projects/dispatch";
import { MODULES, LESSON_MAP } from "@/content/modules";

export const metadata: Metadata = { title: "Spring Boot Lab" };

export default function SpringBootPage() {
  const { readme, pom } = dispatchReadmeAndPom();
  const lessons = MODULES.find((m) => m.id === "m06")!.lessons;
  return (
    <>
      <PageHeader eyebrow="Modules 06 & 07" title="Spring Boot Lab">
        Spring Boot is 40 marks plus the 20-mark functional checks. This lab shows how a request travels through the layers and walks you through a real starter project.
      </PageHeader>
      <Notice className="mb-5" title="How to use this lab">
        Lessons first: {lessons.map((l, i) => <span key={l}>{i > 0 && " · "}<Link className="text-accent hover:underline" href={`/learn/${l}`}>{LESSON_MAP[l].title.split(":")[0]}</Link></span>)}. Then step 1 here, then step 2 the morning you practise the mock exams.
      </Notice>
      <div className="space-y-5">
        <LabSection id="flow" step={1} title="Request lifecycle"
          teaches="HTTP → Controller → Service → Repository → Model → JSON, and the error path through the global exception handler."
          tryThis={["Run “Energy of 101”, then “Unknown mission” — where does the path change?", "Run “POST mission 104” and then “Plan capacity 125” — the repository remembers 104.", "Run “POST duplicate 101”: which layer rejects it, and which turns it into 400?"]}
          exam="Tasks 3–4 of both practice papers; viva questions about layers and dependency injection."
          lesson={{ href: "/learn/spring-exception-handling", label: "Global exception handling" }}>
          <RequestFlowVisualizer />
        </LabSection>
        <LabSection id="explorer" step={2} title="Starter project explorer"
          teaches="The university's real Dispatch starter files in the order to read them, with what each file does and where every TODO is."
          tryThis={["Read files 1–8 in order and say what each layer is for.", "Find every TODO (hammer icon) and name its task.", "Open pom.xml and README.md — spot the port mismatch."]}
          exam="The first 10 minutes of the practical: understand the code before writing any."
          lesson={{ href: "/learn/starter-project-tour", label: "Reading a starter project" }}>
          <StarterExplorer files={dispatchStarterFiles()} readme={readme} pom={pom} />
        </LabSection>
      </div>
    </>
  );
}
