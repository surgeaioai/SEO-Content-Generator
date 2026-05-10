import { NextResponse, type NextRequest } from "next/server";

import { requireUserId } from "@/lib/auth-session";
import { callLLMJson } from "@/lib/llm";
import { intentOutputSchema } from "@/lib/intent";
import { logger } from "@/lib/logger";
import { ANALYZE_INTENT_PROMPT } from "@/lib/prompts";
import { getClientIp } from "@/lib/request-ip";
import { limitGeneralApi } from "@/lib/rate-limiter";
import { loadProject, saveProject } from "@/lib/project-store";
import { projectIdBodySchema } from "@/lib/schemas";
import type { IntentAnalysis } from "@/types";

export const maxDuration = 300;

function buildPageTypeBreakdown(serpResults: { pageType?: string }[]) {
  const counts: Record<string, number> = {};
  for (const row of serpResults) {
    const type = row.pageType ?? "Unknown";
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

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

    const pageTypeBreakdown = buildPageTypeBreakdown(project.serpResults);

    const sampleH1s = project.serpResults
      .filter((r) => (r.headings?.h1?.length ?? 0) > 0)
      .slice(0, 12)
      .map((r) => r.headings?.h1?.[0])
      .filter(Boolean);

    const sampleH2s = project.serpResults
      .filter((r) => (r.headings?.h2?.length ?? 0) > 0)
      .slice(0, 12)
      .flatMap((r) => r.headings?.h2?.slice(0, 3) ?? []);

    const prompt = ANALYZE_INTENT_PROMPT.replace("{keyword}", project.keyword)
      .replace("{pageTypeStats}", JSON.stringify(pageTypeBreakdown))
      .replace("{sampleH1s}", JSON.stringify(sampleH1s))
      .replace("{sampleH2s}", JSON.stringify(sampleH2s));

    const raw = await callLLMJson<unknown>(
      "You are an experienced SEO analyst.",
      prompt,
      2500,
    );

    const parsedIntent = intentOutputSchema.parse(raw);

    const intentAnalysis: IntentAnalysis = {
      ...parsedIntent,
      pageTypeBreakdown,
    };

    const now = new Date().toISOString();
    await saveProject(userId, {
      ...project,
      intentAnalysis,
      updatedAt: now,
      status: "analyzing",
    });

    return NextResponse.json({ intentAnalysis });
  } catch (error: unknown) {
    logger.error({ err: error }, "analyze-intent error");
    return NextResponse.json(
      { error: "Intent analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
