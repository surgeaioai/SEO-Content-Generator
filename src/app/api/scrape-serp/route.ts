import { NextResponse, type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { loadProject, saveProject } from "@/lib/project-store";
import { scrapeMultipleUrls } from "@/lib/scraper";
import { scrapeSerpBodySchema } from "@/lib/schemas";
import { fetchSerpResults } from "@/lib/serp";
import { sanitizePlainText } from "@/lib/text";
import type { Project, SerpResult } from "@/types";

export const maxDuration = 300;

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "invalid";
  }
}

export async function POST(request: NextRequest) {
  try {
    const json: unknown = await request.json();
    const parsed = scrapeSerpBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const keyword = sanitizePlainText(parsed.data.keyword);
    const location = sanitizePlainText(parsed.data.location);
    const contentType = parsed.data.contentType?.trim() || "blog";
    const projectId = parsed.data.projectId ?? uuidv4();

    const now = new Date().toISOString();
    const existing = await loadProject(projectId);

    const serpApiResults = await fetchSerpResults(keyword, location, 30);

    if (serpApiResults.length === 0) {
      return NextResponse.json({ error: "No SERP results found" }, { status: 404 });
    }

    const urls = serpApiResults.map((r) => r.link).filter(Boolean);
    const scrapedData = await scrapeMultipleUrls(urls, 1000);

    const serpResults: SerpResult[] = serpApiResults.map((result) => {
      const scrapeResult = scrapedData.get(result.link);
      const domain = safeHostname(result.link);

      return {
        position: result.position,
        title: result.title,
        url: result.link,
        domain,
        snippet: result.snippet,
        headings: scrapeResult?.success ? scrapeResult.headings : undefined,
        scrapedSuccessfully: Boolean(scrapeResult?.success),
        errorMessage: scrapeResult?.success ? undefined : scrapeResult?.error,
      };
    });

    const project: Project = {
      id: projectId,
      keyword,
      location,
      contentType,
      serpResults,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      status: "analyzing",
    };

    if (existing) {
      project.intentAnalysis = undefined;
      project.recommendedAngles = undefined;
      project.selectedAngle = undefined;
      project.generatedBlog = undefined;
      project.lastBlogConfig = undefined;
    }

    await saveProject(project);

    const successfulScrapes = serpResults.filter((r) => r.scrapedSuccessfully).length;

    return NextResponse.json({
      projectId,
      keyword,
      location,
      totalResults: serpResults.length,
      successfulScrapes,
    });
  } catch (error: unknown) {
    console.error("scrape-serp error", error);
    return NextResponse.json(
      { error: "We could not complete SERP scraping. Please try again." },
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
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: unknown) {
    console.error("scrape-serp GET error", error);
    return NextResponse.json({ error: "Could not load project" }, { status: 500 });
  }
}
