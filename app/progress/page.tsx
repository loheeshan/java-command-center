import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/primitives";
import { ProgressView } from "@/components/dashboard/ProgressView";

export const metadata: Metadata = { title: "Progress & Analytics" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader eyebrow="Evidence, not guesses" title="Progress & Analytics" />
      <ProgressView />
    </>
  );
}
