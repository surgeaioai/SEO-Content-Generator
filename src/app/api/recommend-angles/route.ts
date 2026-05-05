import { NextResponse } from "next/server";

import { normalizeAngles } from "@/lib/angles";
import { callLLMJson } from "@/lib/llm";
import { RECOMMEND_ANGLES_PROMPT } from "@/lib/prompts";
import { loadProject, saveProject } from "@/lib/project-store";
import { projectIdBodySchema } from "@/lib/schemas";
import type { ContentAngle } from "@/types";

export const maxDuration = 300;

function buildPageTypeBreakdown(serpResults: { pageType?: string }[]) {
  const counts: Record<string, number> = {};
  for (const row of serpResults) {
    const type = row.pageType ?? "Unknown";
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

function sampleH2Themes(serpResults: { headings?: { h2?: string[] } }[], limit = 30) {
  const bag = new Map<string, number>();
  for (const row of serpResults) {
    for (const h2 of row.headings?.h2 ?? []) {
      const key = h2.trim().toLowerCase();
      if (!key) continue;
      bag.set(key, (bag.get(key) ?? 0) + 1);
    }
  }
  return [...bag.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text]) => text);
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = projectIdBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const project = await loadProject(parsed.data.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.intentAnalysis) {
      return NextResponse.json({ error: "Intent analysis missing" }, { status: 400 });
    }

    const pageTypes = buildPageTypeBreakdown(project.serpResults);
    const h2Themes = sampleH2Themes(project.serpResults);

    const prompt = RECOMMEND_ANGLES_PROMPT.replace("{keyword}", project.keyword)
      .replace("{intent}", JSON.stringify(project.intentAnalysis))
      .replace("{pageTypes}", JSON.stringify(pageTypes))
      .replace("{gaps}", JSON.stringify(project.intentAnalysis.contentGaps))
      .replace("{mustCover}", JSON.stringify(project.intentAnalysis.mustCoverTopics))
      .replace("{h2Themes}", JSON.stringify(h2Themes));

    const raw = await callLLMJson<unknown>(
      "You are a senior SEO content strategist.",
      prompt,
      4000,
    );

    const angles: ContentAngle[] = normalizeAngles(raw);

    const now = new Date().toISOString();
    await saveProject({
      ...project,
      recommendedAngles: angles,
      updatedAt: now,
      status: "ready",
    });

    return NextResponse.json({ angles });
  } catch (error: unknown) {
    console.error("recommend-angles error", error);
    return NextResponse.json(
      { error: "Could not generate recommendations" },
      { status: 500 },
    );
  }
}
