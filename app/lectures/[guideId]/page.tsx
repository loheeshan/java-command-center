import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GUIDES, GUIDE_MAP } from "@/content/guides";
import { GuideView } from "@/components/guides/GuideView";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ guideId: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ guideId: string }> }): Promise<Metadata> {
  const { guideId } = await params;
  const g = GUIDE_MAP[guideId];
  return { title: g ? `${g.week}: ${g.title}` : "Lecture guide" };
}

export default async function GuidePage({ params }: { params: Promise<{ guideId: string }> }) {
  const { guideId } = await params;
  if (!GUIDE_MAP[guideId]) notFound();
  return <GuideView id={guideId} />;
}
