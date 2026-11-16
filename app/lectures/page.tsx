import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/primitives";
import { GuideIndex } from "@/components/guides/GuideIndex";

export const metadata: Metadata = { title: "Lecture Guides" };

export default function LecturesPage() {
  return (
    <>
      <PageHeader eyebrow="Start here if you are new to Java" title="Lecture Guides — learn from zero">
        Part 1 follows your SD2 Java-basics lectures; Part 2 follows your 5COSC019W OOP lectures, in the same order and with the same examples as your slides. Every line is explained in plain words, every example runs on the real JDK, and each guide ends with viva practice. You do not need the videos.
      </PageHeader>
      <GuideIndex />
    </>
  );
}
