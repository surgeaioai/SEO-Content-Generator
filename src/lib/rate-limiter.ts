import { checkRateLimitWithRedis, hashCacheKey } from "@/lib/cache";
import { logger } from "@/lib/logger";

const API_LIMIT = Number(process.env.RATE_LIMIT_MAX_PER_IP ?? "100");
const API_WINDOW_SEC = Number(process.env.RATE_LIMIT_WINDOW_SEC ?? "60");
const GENERATE_LIMIT = 5;
const GENERATE_WINDOW_SEC = 60 * 60;

type Ok = { ok: true; remaining: number; resetSec: number };
type No = { ok: false; retryAfterSec: number };
type LimitResult = Ok | No;

function bucketKey(prefix: string, ip: string, windowSec: number): string {
  const slice = Math.floor(Date.now() / 1000 / windowSec);
  return `${prefix}:${hashCacheKey(ip)}:${String(slice)}`;
}

export async function limitGeneralApi(ip: string): Promise<LimitResult> {
  try {
    return await checkRateLimitWithRedis({
      key: bucketKey("ratelimit:api", ip, API_WINDOW_SEC),
      limit: API_LIMIT,
      windowSec: API_WINDOW_SEC,
    });
  } catch (error: unknown) {
    logger.warn({ err: error }, "api rate limit check failed; failing open");
    return { ok: true, remaining: API_LIMIT, resetSec: API_WINDOW_SEC };
  }
}

export async function limitGenerateBlog(ip: string): Promise<LimitResult> {
  try {
    return await checkRateLimitWithRedis({
      key: bucketKey("ratelimit:generate", ip, GENERATE_WINDOW_SEC),
      limit: GENERATE_LIMIT,
      windowSec: GENERATE_WINDOW_SEC,
    });
  } catch (error: unknown) {
    logger.warn({ err: error }, "generate rate limit check failed; failing open");
    return { ok: true, remaining: GENERATE_LIMIT, resetSec: GENERATE_WINDOW_SEC };
  }
}
