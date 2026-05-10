import { NextResponse, type NextRequest } from "next/server";

import { requireUserId } from "@/lib/auth-session";
import {
  cacheGetJson,
  cacheSetJson,
  invalidateProjectContentCache,
  projectBlogCacheKey,
} from "@/lib/cache";
import { generateBlogFast, generateFullBlog } from "@/lib/blog-generation";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/request-ip";
import { limitGenerateBlog, limitGeneralApi } from "@/lib/rate-limiter";
import { loadProject, saveProject } from "@/lib/project-store";
import { generateBlogBodySchema } from "@/lib/schemas";
import { checkAndIncrementUsage } from "@/lib/usage-guard";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  let recoveryProjectId: string | null = null;

  const authRes = await requireUserId({
    unauthorizedMessage: "Login karo pehle — blog generate karne ke liye",
  });
  if (authRes instanceof NextResponse) return authRes;
  const { userId } = authRes;

  const ip = getClientIp(request);
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

    recoveryProjectId = parsed.data.projectId;

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

    const now = new Date().toISOString();
    await saveProject(userId, {
      ...project,
      status: "generating",
      updatedAt: now,
    });
    await invalidateProjectContentCache(parsed.data.projectId);

    const useQuickMode = parsed.data.quickMode ?? true;
    logger.info(
      {
        projectId: parsed.data.projectId,
        mode: useQuickMode ? "quick" : "detailed",
        words: parsed.data.wordCount,
      },
      "blog generation started",
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

    const updated = await loadProject(userId, parsed.data.projectId);
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

    await saveProject(userId, finalProject);
    await cacheSetJson(projectBlogCacheKey(parsed.data.projectId), blog, 60 * 60);

    return NextResponse.json({ success: true, blog, project: finalProject });
  } catch (error: unknown) {
    logger.error({ err: error }, "generate-blog error");

    if (recoveryProjectId) {
      const existing = await loadProject(userId, recoveryProjectId);
      if (existing) {
        await saveProject(userId, {
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
  const authRes = await requireUserId({
    unauthorizedMessage: "Login karo pehle — blog generate karne ke liye",
  });
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
    const projectId = request.nextUrl.searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const cachedBlog = await cacheGetJson<unknown>(projectBlogCacheKey(projectId));
    const project = await loadProject(userId, projectId);
    const blog = cachedBlog ?? project?.generatedBlog;
    if (!project || !blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog, project });
  } catch (error: unknown) {
    logger.error({ err: error }, "generate-blog GET error");
    return NextResponse.json({ error: "Could not load blog" }, { status: 500 });
  }
}
