import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { JOB_STATUS_TTL_SEC, cacheSetJson, jobStatusCacheKey } from "@/lib/cache";
import { KAFKA_TOPICS, type AiContentJobMessage, publishKafkaMessage } from "@/lib/kafka";
import { loadProject } from "@/lib/project-store";
import { generateBlogBodySchema } from "@/lib/schemas";
import { processAiJob, type JobStatus } from "@/lib/workers/aiWorker";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = generateBlogBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const project = await loadProject(parsed.data.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!project.selectedAngle) {
      return NextResponse.json({ error: "No angle selected" }, { status: 400 });
    }
    if (!project.intentAnalysis) {
      return NextResponse.json({ error: "Intent analysis missing" }, { status: 400 });
    }

    const jobId = uuidv4();
    const now = new Date().toISOString();
    const queued: JobStatus = {
      jobId,
      type: "ai-content",
      state: "queued",
      createdAt: now,
      updatedAt: now,
      projectId: parsed.data.projectId,
    };
    await cacheSetJson(jobStatusCacheKey(jobId), queued, JOB_STATUS_TTL_SEC);

    const message: AiContentJobMessage = {
      jobId,
      projectId: parsed.data.projectId,
      wordCount: parsed.data.wordCount,
      brandGuidelines: parsed.data.brandGuidelines,
      brandVoice: parsed.data.brandVoice,
      contentType: parsed.data.contentType,
      internalLinks: parsed.data.internalLinks,
      targetKeywords: parsed.data.targetKeywords,
      customKeywords: parsed.data.customKeywords,
      quickMode: parsed.data.quickMode,
      ctas: parsed.data.ctas,
    };

    const published = await publishKafkaMessage(KAFKA_TOPICS.aiContentJobs, message);
    if (published) {
      return NextResponse.json(
        {
          success: true,
          mode: "async",
          kafka: "queued",
          jobId,
          statusUrl: `/api/job-status/${jobId}`,
        },
        { status: 202 },
      );
    }

    // Graceful degradation path: if Kafka is unavailable, process synchronously.
    await processAiJob(message);
    return NextResponse.json({
      success: true,
      mode: "sync-fallback",
      kafka: "unavailable",
      jobId,
      statusUrl: `/api/job-status/${jobId}`,
    });
  } catch (error: unknown) {
    console.error("generate async route error", error);
    return NextResponse.json(
      {
        error: "Could not queue generation job",
      },
      { status: 500 },
    );
  }
}
