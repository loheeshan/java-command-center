import type { Metadata } from "next";
import Link from "next/link";
import { Notice, PageHeader } from "@/components/ui/primitives";
import { LabSection } from "@/components/ui/LabSection";
import { GreedyVisualizer } from "@/components/visualizers/GreedyVisualizer";
import { SortingVisualizer } from "@/components/visualizers/SortingVisualizer";

export const metadata: Metadata = { title: "Collections & Algorithms" };

export default function AlgorithmsPage() {
  return (
    <>
      <PageHeader eyebrow="Modules 03 & 05" title="Sorting & greedy dispatch lab">
        The &quot;higher difficulty&quot; marks in the practical come from turning a written rule into an algorithm. Here you can change the inputs and watch every decision.
      </PageHeader>
      <Notice className="mb-5" title="How to use this lab">
        First sort by hand on paper, then check with step 1. In step 2 keep “predict each decision” ticked — your score is saved to your progress. Then implement it for real in the <Link className="text-accent hover:underline" href="/exam?task=task2">Dispatch lab, Task 2.3</Link>.
      </Notice>
      <div className="space-y-5">
        <LabSection id="sorting" step={1} title="Three-key comparator sort"
          teaches="How a Comparator decides order: priority descending, then energy ascending, then id ascending — and which key decided each comparison."
          tryThis={["Use “Preset with ties”: which pair is decided by id?", "Edit two missions to have the same priority and energy, and predict their order.", "Load “Paper seed + 104” and check the order is [103, 101, 104, 102]."]}
          exam="Dispatch Task 2.3 sort; any task saying “sort by X then Y”."
          lesson={{ href: "/learn/comparator-sorting", label: "Comparator sorting" }}>
          <SortingVisualizer />
        </LabSection>
        <LabSection id="greedy" step={2} title="Greedy dispatch planner"
          teaches="Filter → sort → select-or-skip, one decision at a time, with remaining capacity shrinking."
          tryThis={["Press B3, B4 and B6 to replay the paper's three functional checks.", "Set capacity 0 — what does the API return? (400)", "Add a small mission and find a capacity where a later mission fits after a skip."]}
          exam="Section B checks B3, B4, B6 and Task 2.3 (8 marks)."
          lesson={{ href: "/learn/greedy-dispatch", label: "Greedy dispatch" }}>
          <GreedyVisualizer />
        </LabSection>
      </div>
    </>
  );
}
