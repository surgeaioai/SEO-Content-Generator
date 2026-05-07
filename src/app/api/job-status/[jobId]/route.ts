import { NextResponse, type NextRequest } from "next/server";

import { cacheGetJson, jobStatusCacheKey } from "@/lib/cache";
import type { JobStatus } from "@/lib/workers/aiWorker";
import type { SeoJobStatus } from "@/lib/workers/seoWorker";

type SupportedJobStatus = JobStatus | SeoJobStatus;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> },
) {
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
    console.error("job-status error", error);
    return NextResponse.json({ error: "Could not load job status" }, { status: 500 });
  }
}
