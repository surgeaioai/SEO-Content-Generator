import { NextResponse } from "next/server";

import { callLLMJson } from "@/lib/llm";
import { intentOutputSchema } from "@/lib/intent";
import { ANALYZE_INTENT_PROMPT } from "@/lib/prompts";
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
    await saveProject({
      ...project,
      intentAnalysis,
      updatedAt: now,
      status: "analyzing",
    });

    return NextResponse.json({ intentAnalysis });
  } catch (error: unknown) {
    console.error("analyze-intent error", error);
    return NextResponse.json(
      { error: "Intent analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
