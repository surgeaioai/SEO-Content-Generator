import { NextResponse } from "next/server";

import { classifyPages } from "@/lib/classifier";
import { loadProject, saveProject } from "@/lib/project-store";
import { projectIdBodySchema } from "@/lib/schemas";
import type { SerpResult } from "@/types";

export const maxDuration = 300;

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
    await saveProject({
      ...project,
      serpResults: updatedResults,
      updatedAt: now,
      status: "analyzing",
    });

    return NextResponse.json({ classifications: classificationObj });
  } catch (error: unknown) {
    console.error("classify-pages error", error);
    return NextResponse.json(
      { error: "Classification failed. Please try again." },
      { status: 500 },
    );
  }
}
