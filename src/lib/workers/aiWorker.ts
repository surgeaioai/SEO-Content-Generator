import { generateBlogFast, generateFullBlog } from "@/lib/blog-generation";
import {
  JOB_STATUS_TTL_SEC,
  cacheSetJson,
  invalidateProjectContentCache,
  jobStatusCacheKey,
  projectBlogCacheKey,
} from "@/lib/cache";
import type { AiContentJobMessage } from "@/lib/kafka";
import { loadProject, saveProject } from "@/lib/project-store";

export type JobState = "queued" | "processing" | "completed" | "failed";

export interface JobStatus {
  jobId: string;
  type: "ai-content" | "seo-analysis";
  state: JobState;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  error?: string;
  result?: Record<string, unknown>;
}

/**
 * Persists job status for polling API clients.
 */
export async function saveJobStatus(status: JobStatus): Promise<void> {
  await cacheSetJson(jobStatusCacheKey(status.jobId), status, JOB_STATUS_TTL_SEC);
}

/**
 * Executes one AI content generation job.
 */
export async function processAiJob(message: AiContentJobMessage): Promise<void> {
  const startedAt = new Date().toISOString();
  await saveJobStatus({
    jobId: message.jobId,
    type: "ai-content",
    state: "processing",
    createdAt: startedAt,
    updatedAt: startedAt,
    projectId: message.projectId,
  });

  try {
    const project = await loadProject(message.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (!project.selectedAngle) {
      throw new Error("No selected angle found");
    }
    if (!project.intentAnalysis) {
      throw new Error("Intent analysis missing");
    }

    const now = new Date().toISOString();
    await saveProject({
      ...project,
      status: "generating",
      updatedAt: now,
    });
    await invalidateProjectContentCache(message.projectId);

    const useQuickMode = message.quickMode ?? true;
    const blog = useQuickMode
      ? await generateBlogFast({
          projectId: message.projectId,
          keyword: project.keyword,
          selectedAngle: project.selectedAngle,
          wordCount: message.wordCount,
          brandGuidelines: message.brandGuidelines,
          brandVoice: message.brandVoice,
          contentType: message.contentType ?? project.contentType ?? "blog",
          customKeywords: message.customKeywords,
          intentAnalysis: project.intentAnalysis,
        })
      : await generateFullBlog({
          project,
          angle: project.selectedAngle,
          wordCount: message.wordCount,
          brandGuidelines: message.brandGuidelines,
          brandVoice: message.brandVoice,
          contentType: message.contentType ?? project.contentType ?? "blog",
          internalLinks: message.internalLinks,
          targetKeywords: [
            ...(message.targetKeywords ?? []),
            ...(message.customKeywords ?? []),
          ],
          ctas: message.ctas,
        });

    const updated = await loadProject(message.projectId);
    if (!updated) {
      throw new Error("Project disappeared during generation");
    }

    const finalProject = {
      ...updated,
      generatedBlog: blog,
      lastBlogConfig: {
        wordCount: message.wordCount,
        brandGuidelines: message.brandGuidelines,
        brandVoice: message.brandVoice,
        contentType: message.contentType ?? project.contentType ?? "blog",
        internalLinks: message.internalLinks,
        targetKeywords: message.targetKeywords,
        customKeywords: message.customKeywords,
        quickMode: useQuickMode,
        ctas: message.ctas,
      },
      status: "complete" as const,
      updatedAt: new Date().toISOString(),
    };

    await saveProject(finalProject);
    await cacheSetJson(projectBlogCacheKey(message.projectId), blog, 60 * 60);
    await saveJobStatus({
      jobId: message.jobId,
      type: "ai-content",
      state: "completed",
      createdAt: startedAt,
      updatedAt: new Date().toISOString(),
      projectId: message.projectId,
      result: {
        projectId: message.projectId,
        status: "complete",
      },
    });
  } catch (error: unknown) {
    console.error("ai worker failed", error);

    const project = await loadProject(message.projectId);
    if (project) {
      await saveProject({
        ...project,
        status: "ready",
        updatedAt: new Date().toISOString(),
      });
    }

    await saveJobStatus({
      jobId: message.jobId,
      type: "ai-content",
      state: "failed",
      createdAt: startedAt,
      updatedAt: new Date().toISOString(),
      projectId: message.projectId,
      error: error instanceof Error ? error.message : "Unknown worker error",
    });
  }
}
