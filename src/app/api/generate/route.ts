import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { requireUserId } from "@/lib/auth-session";
import { JOB_STATUS_TTL_SEC, cacheSetJson, jobStatusCacheKey } from "@/lib/cache";
import { KAFKA_TOPICS, type AiContentJobMessage, publishKafkaMessage } from "@/lib/kafka";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/request-ip";
import { limitGeneralApi, limitGenerateBlog } from "@/lib/rate-limiter";
import { loadProject } from "@/lib/project-store";
import { generateBlogBodySchema } from "@/lib/schemas";
import { checkAndIncrementUsage } from "@/lib/usage-guard";
import { processAiJob, type JobStatus } from "@/lib/workers/aiWorker";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authRes = await requireUserId({
    unauthorizedMessage: "Login karo pehle — blog generate karne ke liye",
  });
  if (authRes instanceof NextResponse) return authRes;
  const { userId } = authRes;

  const ip = getClientIp(request);
  const apiRl = await limitGeneralApi(ip);
  if (!apiRl.ok) {
    return NextResponse.json(
      {
        error: "Too many requests. Please retry shortly.",
        retryAfterSec: apiRl.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(apiRl.retryAfterSec) },
      },
    );
  }

  const genRl = await limitGenerateBlog(ip);
  if (!genRl.ok) {
    return NextResponse.json(
      {
        error: "Rate limit reached. Try again later.",
        retryAfterSec: genRl.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(genRl.retryAfterSec) },
      },
    );
  }

  try {
    const json: unknown = await request.json();
    const parsed = generateBlogBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const project = await loadProject(userId, parsed.data.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!project.selectedAngle) {
      return NextResponse.json({ error: "No angle selected" }, { status: 400 });
    }
    if (!project.intentAnalysis) {
      return NextResponse.json({ error: "Intent analysis missing" }, { status: 400 });
    }

    const usage = await checkAndIncrementUsage(userId);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: "Monthly generation limit reached for your plan.",
          remaining: usage.remaining,
          limit: usage.limit,
        },
        { status: 403 },
      );
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
      userId,
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

    const useKafka = Boolean(process.env.KAFKA_BROKERS?.trim());
    if (useKafka) {
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
    }

    await processAiJob(message);
    return NextResponse.json({
      success: true,
      mode: "sync-fallback",
      kafka: useKafka ? "unavailable" : "disabled",
      jobId,
      statusUrl: `/api/job-status/${jobId}`,
    });
  } catch (error: unknown) {
    logger.error({ err: error }, "generate async route error");
    return NextResponse.json(
      {
        error: "Could not queue generation job",
      },
      { status: 500 },
    );
  }
}
