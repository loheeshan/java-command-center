import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/primitives";
import { Playground } from "@/components/playground/Playground";

export const metadata: Metadata = { title: "Code Playground" };

export default function PlaygroundPage() {
  return (
    <>
      <PageHeader eyebrow="Live Java" title="Code Playground">
        Real compilation with <span className="font-mono">javac</span> and execution on JDK 25 through the separate runner process. If the runner is offline, nothing is pretended — you will see that the code was not run.
      </PageHeader>
      <Playground />
    </>
  );
}
