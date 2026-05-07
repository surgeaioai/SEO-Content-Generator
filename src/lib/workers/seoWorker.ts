import { classifyPages } from "@/lib/classifier";
import { JOB_STATUS_TTL_SEC, cacheSetJson, jobStatusCacheKey } from "@/lib/cache";
import type { SeoAnalysisJobMessage } from "@/lib/kafka";
import { loadProject, saveProject } from "@/lib/project-store";

export interface SeoJobStatus {
  jobId: string;
  type: "seo-analysis";
  state: "queued" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  projectId: string;
  error?: string;
}

/**
 * Executes a lightweight SEO classification worker step.
 */
export async function processSeoJob(message: SeoAnalysisJobMessage): Promise<void> {
  const createdAt = new Date().toISOString();
  await cacheSetJson<SeoJobStatus>(
    jobStatusCacheKey(message.jobId),
    {
      jobId: message.jobId,
      type: "seo-analysis",
      state: "processing",
      createdAt,
      updatedAt: createdAt,
      projectId: message.projectId,
    },
    JOB_STATUS_TTL_SEC,
  );

  try {
    const project = await loadProject(message.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const classifications = await classifyPages(project.serpResults, 5);
    const classificationObj: Record<string, string> = {};
    classifications.forEach((pageType, url) => {
      classificationObj[url] = pageType;
    });

    const updatedResults = project.serpResults.map((row) => ({
      ...row,
      pageType: classificationObj[row.url] ?? "Unknown",
    }));

    await saveProject({
      ...project,
      serpResults: updatedResults,
      updatedAt: new Date().toISOString(),
      status: "analyzing",
    });

    await cacheSetJson<SeoJobStatus>(
      jobStatusCacheKey(message.jobId),
      {
        jobId: message.jobId,
        type: "seo-analysis",
        state: "completed",
        createdAt,
        updatedAt: new Date().toISOString(),
        projectId: message.projectId,
      },
      JOB_STATUS_TTL_SEC,
    );
  } catch (error: unknown) {
    await cacheSetJson<SeoJobStatus>(
      jobStatusCacheKey(message.jobId),
      {
        jobId: message.jobId,
        type: "seo-analysis",
        state: "failed",
        createdAt,
        updatedAt: new Date().toISOString(),
        projectId: message.projectId,
        error: error instanceof Error ? error.message : "Unknown SEO worker error",
      },
      JOB_STATUS_TTL_SEC,
    );
  }
}
