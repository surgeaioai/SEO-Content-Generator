import { NextResponse, type NextRequest } from "next/server";

import { generateBlogFast, generateFullBlog } from "@/lib/blog-generation";
import { loadProject, saveProject } from "@/lib/project-store";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateBlogBodySchema } from "@/lib/schemas";

export const maxDuration = 300;

function clientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  let recoveryProjectId: string | null = null;

  try {
    const ip = clientIp(request);
    const limited = checkRateLimit(`generate-blog:${ip}`);
    if (!limited.ok) {
      return NextResponse.json(
        {
          error: "Rate limit reached. Try again later.",
          retryAfterSec: limited.retryAfterSec,
        },
        { status: 429 },
      );
    }

    const json: unknown = await request.json();
    const parsed = generateBlogBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    recoveryProjectId = parsed.data.projectId;

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

    const now = new Date().toISOString();
    await saveProject({
      ...project,
      status: "generating",
      updatedAt: now,
    });

    const useQuickMode = parsed.data.quickMode ?? true;
    console.log(
      `[${parsed.data.projectId}] Starting ${useQuickMode ? "quick" : "detailed"} generation for ${parsed.data.wordCount} words`,
    );

    const blog = useQuickMode
      ? await generateBlogFast({
          projectId: parsed.data.projectId,
          keyword: project.keyword,
          selectedAngle: project.selectedAngle,
          wordCount: parsed.data.wordCount,
          brandGuidelines: parsed.data.brandGuidelines,
          brandVoice: parsed.data.brandVoice,
          contentType: parsed.data.contentType ?? project.contentType ?? "blog",
          customKeywords: parsed.data.customKeywords,
          intentAnalysis: project.intentAnalysis,
        })
      : await generateFullBlog({
          project,
          angle: project.selectedAngle,
          wordCount: parsed.data.wordCount,
          brandGuidelines: parsed.data.brandGuidelines,
          brandVoice: parsed.data.brandVoice,
          contentType: parsed.data.contentType ?? project.contentType ?? "blog",
          internalLinks: parsed.data.internalLinks,
          targetKeywords: [
            ...(parsed.data.targetKeywords ?? []),
            ...(parsed.data.customKeywords ?? []),
          ],
          ctas: parsed.data.ctas,
        });

    const updated = await loadProject(parsed.data.projectId);
    if (!updated) {
      throw new Error("Project disappeared during generation");
    }

    const finalProject = {
      ...updated,
      generatedBlog: blog,
      lastBlogConfig: {
        wordCount: parsed.data.wordCount,
        brandGuidelines: parsed.data.brandGuidelines,
        brandVoice: parsed.data.brandVoice,
        contentType: parsed.data.contentType ?? project.contentType ?? "blog",
        internalLinks: parsed.data.internalLinks,
        targetKeywords: parsed.data.targetKeywords,
        customKeywords: parsed.data.customKeywords,
        quickMode: useQuickMode,
        ctas: parsed.data.ctas,
      },
      status: "complete" as const,
      updatedAt: new Date().toISOString(),
    };

    await saveProject(finalProject);

    return NextResponse.json({ success: true, blog, project: finalProject });
  } catch (error: unknown) {
    console.error("generate-blog error", error);

    if (recoveryProjectId) {
      const existing = await loadProject(recoveryProjectId);
      if (existing) {
        await saveProject({
          ...existing,
          status: "ready",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json(
      { error: "Blog generation failed. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const project = await loadProject(projectId);
    if (!project?.generatedBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog: project.generatedBlog, project });
  } catch (error: unknown) {
    console.error("generate-blog GET error", error);
    return NextResponse.json({ error: "Could not load blog" }, { status: 500 });
  }
}
