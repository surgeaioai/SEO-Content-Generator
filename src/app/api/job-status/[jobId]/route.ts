import { NextResponse, type NextRequest } from "next/server";

import { requireUserId } from "@/lib/auth-session";
import { cacheGetJson, jobStatusCacheKey } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/request-ip";
import { limitGeneralApi } from "@/lib/rate-limiter";
import type { JobStatus } from "@/lib/workers/aiWorker";
import type { SeoJobStatus } from "@/lib/workers/seoWorker";

type SupportedJobStatus = JobStatus | SeoJobStatus;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
) {
  const authRes = await requireUserId();
  if (authRes instanceof NextResponse) return authRes;

  const ip = getClientIp(request);
  const rl = await limitGeneralApi(ip);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: "Too many requests. Please retry shortly.",
        retryAfterSec: rl.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  try {
    const { jobId } = await context.params;
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const status = await cacheGetJson<SupportedJobStatus>(jobStatusCacheKey(jobId));
    if (!status) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error: unknown) {
    logger.error({ err: error }, "job-status error");
    return NextResponse.json({ error: "Could not load job status" }, { status: 500 });
  }
}
