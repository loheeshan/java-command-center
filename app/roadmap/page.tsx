import type { Metadata } from "next";
import { Roadmap } from "@/components/dashboard/Roadmap";
import { Journey } from "@/components/dashboard/Journey";
import { PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Study Roadmap" };

export default function RoadmapPage() {
  return (
    <>
      <PageHeader eyebrow="Tue 17 → Fri 20 November · Asia/Colombo" title="Study Roadmap">
        Your initial plan from Tuesday 19:00 to the practical on Friday 13:30. It is a starting point, not an obligation — track what you actually completed and the app adjusts.
      </PageHeader>
      <div className="mb-6"><Journey /></div>
      <h2 className="mb-3 text-lg font-semibold text-ink">Day-by-day schedule</h2>
      <Roadmap />
    </>
  );
}
