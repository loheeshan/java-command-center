import type { Metadata } from "next";
import { Suspense } from "react";
import { starterFiles } from "@/lib/projects/dispatch";
import { Simulator } from "@/components/exam/Simulator";

export const metadata: Metadata = { title: "Exam Simulator" };

export default async function SimulatorPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project } = await searchParams;
  return (
    <Suspense>
      <Simulator starters={{ dispatch: starterFiles("dispatch"), tickets: starterFiles("tickets") }} initialProject={project} />
    </Suspense>
  );
}
