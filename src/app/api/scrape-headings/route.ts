import { NextResponse, type NextRequest } from "next/server";

import { requireUserId } from "@/lib/auth-session";
import { logger } from "@/lib/logger";
import { getClientIp } from "@/lib/request-ip";
import { limitGeneralApi } from "@/lib/rate-limiter";
import { scrapeMultipleUrls } from "@/lib/scraper";
import { scrapeHeadingsBodySchema } from "@/lib/schemas";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const authRes = await requireUserId();
  if (authRes instanceof NextResponse) return authRes;

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
    logger.error({ err: error }, "scrape-headings error");
    return NextResponse.json(
      { error: "Could not scrape headings" },
      { status: 500 },
    );
  }
}
