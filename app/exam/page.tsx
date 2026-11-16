import type { Metadata } from "next";
import { ExamLabPage } from "@/components/exam/ExamLabPage";

export const metadata: Metadata = { title: "Mock Exam Lab — Dispatch" };

export default async function ExamDispatchPage({ searchParams }: { searchParams: Promise<{ task?: string }> }) {
  const { task } = await searchParams;
  return <ExamLabPage projectId="dispatch" task={task} />;
}
