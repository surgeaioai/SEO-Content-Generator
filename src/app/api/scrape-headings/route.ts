import { NextResponse } from "next/server";

import { scrapeMultipleUrls } from "@/lib/scraper";
import { scrapeHeadingsBodySchema } from "@/lib/schemas";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = scrapeHeadingsBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const urls = parsed.data.urls;
    const scraped = await scrapeMultipleUrls(urls, 1000);

    const results: Record<
      string,
      { success: boolean; headings?: unknown; error?: string }
    > = {};

    scraped.forEach((value, key) => {
      results[key] = {
        success: value.success,
        headings: value.headings,
        error: value.error,
      };
    });

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("scrape-headings error", error);
    return NextResponse.json(
      { error: "Could not scrape headings" },
      { status: 500 },
    );
  }
}
