import { notFound } from "next/navigation";

import { ConfigureClient } from "./configure-client";

type ConfigurePageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ConfigurePage({ params }: ConfigurePageProps) {
  const { projectId } = await params;

  if (!projectId) {
    notFound();
  }

  return <ConfigureClient projectId={projectId} />;
}
