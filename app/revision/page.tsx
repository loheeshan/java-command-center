import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/primitives";
import { RevisionCenter } from "@/components/revision/RevisionCenter";

export const metadata: Metadata = { title: "Revision Center" };

export default function RevisionPage() {
  return (
    <>
      <PageHeader eyebrow="Module 10" title="Final revision">
        Templates match the style of the university&apos;s worked solution. Read, then close the page and write each template from memory in the playground.
      </PageHeader>
      <RevisionCenter />
    </>
  );
}
