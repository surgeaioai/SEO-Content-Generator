import { NextResponse, type NextRequest } from "next/server";

import { requireUserId } from "@/lib/auth-session";
import { classifyPages } from "@/lib/classifier";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/request-ip";
import { limitGeneralApi } from "@/lib/rate-limiter";
import { loadProject, saveProject } from "@/lib/project-store";
import { projectIdBodySchema } from "@/lib/schemas";
import type { SerpResult } from "@/types";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authRes = await requireUserId();
  if (authRes instanceof NextResponse) return authRes;
  const { userId } = authRes;

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
    const json: unknown = await request.json();
    const parsed = projectIdBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const project = await loadProject(userId, parsed.data.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const serpResults: SerpResult[] = project.serpResults;
    const classifications = await classifyPages(serpResults, 5);

    const classificationObj: Record<string, string> = {};
    classifications.forEach((pageType, url) => {
      classificationObj[url] = pageType;
    });

    const updatedResults = serpResults.map((row) => ({
      ...row,
      pageType: classificationObj[row.url] ?? "Unknown",
    }));

    const now = new Date().toISOString();
    await saveProject(userId, {
      ...project,
      serpResults: updatedResults,
      updatedAt: now,
      status: "analyzing",
    });

    return NextResponse.json({ classifications: classificationObj });
  } catch (error: unknown) {
    logger.error({ err: error }, "classify-pages error");
    return NextResponse.json(
      { error: "Classification failed. Please try again." },
      { status: 500 },
    );
  }
}
