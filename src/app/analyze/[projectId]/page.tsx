import { notFound } from "next/navigation";

import { AnalyzeClient } from "./analyze-client";

type AnalyzePageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function AnalyzePage({ params }: AnalyzePageProps) {
  const { projectId } = await params;

  if (!projectId) {
    notFound();
  }

  return <AnalyzeClient projectId={projectId} />;
}
