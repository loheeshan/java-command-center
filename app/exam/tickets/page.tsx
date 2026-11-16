import type { Metadata } from "next";
import { ExamLabPage } from "@/components/exam/ExamLabPage";

export const metadata: Metadata = { title: "Mock Exam Lab — Ticketing" };

export default async function ExamTicketsPage({ searchParams }: { searchParams: Promise<{ task?: string }> }) {
  const { task } = await searchParams;
  return <ExamLabPage projectId="tickets" task={task} />;
}
