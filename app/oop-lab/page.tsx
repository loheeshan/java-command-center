import type { Metadata } from "next";
import Link from "next/link";
import { Notice, PageHeader } from "@/components/ui/primitives";
import { LabSection } from "@/components/ui/LabSection";
import { InheritanceVisualizer } from "@/components/visualizers/InheritanceVisualizer";
import { PolymorphismVisualizer } from "@/components/visualizers/PolymorphismVisualizer";
import { ObjectMemoryVisualizer } from "@/components/visualizers/ObjectMemoryVisualizer";
import { ExecutionVisualizer } from "@/components/visualizers/ExecutionVisualizer";

export const metadata: Metadata = { title: "OOP Lab" };

export default function OopLabPage() {
  return (
    <>
      <PageHeader eyebrow="Module 02 · OOP Lab" title="See objects, inheritance and polymorphism">
        Four interactive models of what Java does behind your code, built on the practice paper&apos;s <span className="font-mono">DispatchMission → GroundMission / AirMission</span> hierarchy. The lab is for <em>seeing</em>; the explanations, exercises and tests are in the lessons.
      </PageHeader>
      <Notice className="mb-5" title="How to use this lab">
        Work top to bottom. Read each step&apos;s lesson first, then do the &quot;Try this&quot; list — and say out loud what you expect <em>before</em> you click. Being able to explain these four pictures covers most OOP viva questions.
      </Notice>
      <div className="space-y-5">
        <LabSection id="execution" step={1} title="From source code to output"
          teaches="What javac and the JVM do, with real bytecode from JDK 25 — and why a compile error means nothing runs."
          tryThis={["Step through all five stages.", "Tick “introduce a syntax error” and notice the pipeline stops at javac.", "Press “Run this pipeline for real” and compare the real compile and run times."]}
          exam="Reading compiler errors fast. Section B scores 0 if the project does not compile."
          lesson={{ href: "/learn/java-quickstart", label: "Java Quick Start" }}>
          <ExecutionVisualizer />
        </LabSection>
        <LabSection id="memory" step={2} title="Objects and references: stack vs heap"
          teaches="What `new` creates, what a variable actually holds (an address), and why `c = a` does not copy the object."
          tryThis={["Step through all six lines and predict each change first.", "Change distanceKm and watch the object and the energy result update.", "Press “Try an overflow” — see why Math.toIntExact matters."]}
          exam="Viva: “Is circle1 a class, an object or a reference?” Task 3: lookups returning null."
          lesson={{ href: "/learn/classes-objects", label: "Classes & objects" }}>
          <ObjectMemoryVisualizer />
        </LabSection>
        <LabSection id="inheritance" step={3} title="Inheritance: what each object contains"
          teaches="Inherited vs own fields and methods, which members are overridden, why constructors chain with super(...)."
          tryThis={["Click AirMission: which fields come from the parent? Why can it not touch them directly?", "Click DispatchMission: why are energyUnits() and priority() struck through?", "Read the “through a DispatchMission reference” box — which calls need a cast?"]}
          exam="Task 1–2 in every paper: complete a subclass and create a new one with super(...)."
          lesson={{ href: "/learn/inheritance-super", label: "extends & super(...)" }}>
          <InheritanceVisualizer />
        </LabSection>
        <LabSection id="polymorphism" step={4} title="Polymorphism: which override runs?"
          teaches="The compiler checks the reference type; the JVM runs the object type's override."
          tryThis={["Call m.energyUnits() on an AirMission, then switch to GroundMission — same line, different method.", "Call m.isCritical() and read why it does not compile.", "Toggle critical/medical and predict the priority before stepping."]}
          exam="Task 2.3: the planner must use polymorphic calls, never instanceof."
          lesson={{ href: "/learn/polymorphism", label: "Polymorphism" }}>
          <PolymorphismVisualizer />
        </LabSection>
      </div>
      <p className="mt-5 text-sm text-ink-2">Next: <Link href="/learn/interfaces-enums" className="text-accent hover:underline">Interfaces &amp; enums</Link> · then the <Link href="/exam/tickets" className="text-accent hover:underline">Ticketing practice project</Link>, Tasks 1–2.</p>
    </>
  );
}
