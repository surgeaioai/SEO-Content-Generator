import { notFound } from "next/navigation";

import { ResultClient } from "./result-client";

type ResultPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { projectId } = await params;

  if (!projectId) {
    notFound();
  }

  return <ResultClient />;
}
