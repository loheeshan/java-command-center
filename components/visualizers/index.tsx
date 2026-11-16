"use client";

import type { VisualizerId } from "@/lib/curriculum/types";
import { ExecutionVisualizer } from "./ExecutionVisualizer";
import { ObjectMemoryVisualizer } from "./ObjectMemoryVisualizer";
import { InheritanceVisualizer } from "./InheritanceVisualizer";
import { PolymorphismVisualizer } from "./PolymorphismVisualizer";
import { SortingVisualizer } from "./SortingVisualizer";
import { GreedyVisualizer } from "./GreedyVisualizer";
import { RequestFlowVisualizer } from "./RequestFlowVisualizer";

export function Visualizer({ id }: { id: VisualizerId }) {
  switch (id) {
    case "execution":
      return <ExecutionVisualizer />;
    case "object-memory":
      return <ObjectMemoryVisualizer />;
    case "inheritance":
      return <InheritanceVisualizer />;
    case "polymorphism":
      return <PolymorphismVisualizer />;
    case "sorting":
      return <SortingVisualizer />;
    case "greedy":
      return <GreedyVisualizer />;
    case "request-flow":
      return <RequestFlowVisualizer />;
  }
}
