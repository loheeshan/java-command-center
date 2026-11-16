import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/primitives";
import { Resources } from "@/components/resources/Resources";

export const metadata: Metadata = { title: "Resources" };

export default function ResourcesPage() {
  return (
    <>
      <PageHeader eyebrow="Videos & references" title="Resources" />
      <Suspense fallback={<p className="text-sm text-ink-3">Loading…</p>}>
        <Resources />
      </Suspense>
    </>
  );
}
