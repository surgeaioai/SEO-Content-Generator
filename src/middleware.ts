import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimitWithRedis, hashCacheKey } from "@/lib/cache";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_SEC = Number(process.env.RATE_LIMIT_WINDOW_SEC ?? "60");
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX_PER_IP ?? "100");

function readClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api") || pathname === "/api/health") {
    return NextResponse.next();
  }

  const ip = readClientIp(request);
  const bucketKey = `ratelimit:ip:${hashCacheKey(ip)}:${Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW_SEC)}`;
  const limitResult = await checkRateLimitWithRedis({
    key: bucketKey,
    limit: RATE_LIMIT_MAX,
    windowSec: RATE_LIMIT_WINDOW_SEC,
  });

  if (!limitResult.ok) {
    return NextResponse.json(
      {
        error: "Too many requests. Please retry shortly.",
        retryAfterSec: limitResult.retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limitResult.retryAfterSec),
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX));
  response.headers.set("X-RateLimit-Remaining", String(limitResult.remaining));
  response.headers.set("X-RateLimit-Reset", String(limitResult.resetSec));

  // Layer 1 cache policy:
  // - AI-generated content endpoints: 10 minutes edge cache
  // - Other API endpoints: 60 seconds edge cache
  const isAiGeneratedContentRoute =
    pathname.startsWith("/api/generate-blog") ||
    pathname.startsWith("/api/generate") ||
    pathname.startsWith("/api/job-status");

  if (isAiGeneratedContentRoute) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=1200",
    );
  } else {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120",
    );
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
