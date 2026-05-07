import { createHash } from "node:crypto";

import { getRedisClient } from "@/lib/redis";

type MemoryValue = {
  value: string;
  expiresAt: number;
};

type RateMemoryValue = {
  count: number;
  expiresAt: number;
};

const memoryCache = new Map<string, MemoryValue>();
const memoryRate = new Map<string, RateMemoryValue>();

export const AI_CACHE_TTL_SEC = 60 * 60;
export const SEO_CACHE_TTL_SEC = 30 * 60;
export const SESSION_TTL_SEC = 24 * 60 * 60;
export const JOB_STATUS_TTL_SEC = 60 * 60;

/**
 * Generates a stable SHA-256 hash for cache key construction.
 */
export function hashCacheKey(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function cleanupMemoryCache(now: number) {
  for (const [key, record] of memoryCache.entries()) {
    if (record.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Reads a string value from cache by key.
 */
export async function cacheGet(key: string): Promise<string | null> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const value = await redis.get(key);
      return value ?? null;
    } catch (error: unknown) {
      console.error("cacheGet redis fallback", error);
    }
  }

  const now = Date.now();
  const fromMemory = memoryCache.get(key);
  if (!fromMemory || fromMemory.expiresAt <= now) {
    memoryCache.delete(key);
    return null;
  }
  return fromMemory.value;
}

/**
 * Stores a string value in cache for a TTL window.
 */
export async function cacheSet(
  key: string,
  value: string,
  ttlSec: number,
): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(key, value, "EX", ttlSec);
      return;
    } catch (error: unknown) {
      console.error("cacheSet redis fallback", error);
    }
  }

  cleanupMemoryCache(Date.now());
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSec * 1000,
  });
}

/**
 * Deletes a cache key when present.
 */
export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.del(key);
    } catch (error: unknown) {
      console.error("cacheDelete redis fallback", error);
    }
  }
  memoryCache.delete(key);
}

/**
 * Invalidates all entries matching a known prefix.
 */
export async function invalidateByPrefix(prefix: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          "MATCH",
          `${prefix}*`,
          "COUNT",
          "200",
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== "0");
    } catch (error: unknown) {
      console.error("invalidateByPrefix redis fallback", error);
    }
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Reads and parses cached JSON payload.
 */
export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const raw = await cacheGet(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    await cacheDelete(key);
    return null;
  }
}

/**
 * Stores JSON payload in cache with a TTL.
 */
export async function cacheSetJson<T>(
  key: string,
  value: T,
  ttlSec: number,
): Promise<void> {
  await cacheSet(key, JSON.stringify(value), ttlSec);
}

/**
 * Shared rate limiter with Redis-first and in-memory fallback.
 */
export async function checkRateLimitWithRedis(params: {
  key: string;
  limit: number;
  windowSec: number;
}): Promise<{ ok: true; remaining: number; resetSec: number } | { ok: false; retryAfterSec: number }> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const count = await redis.incr(params.key);
      if (count === 1) {
        await redis.expire(params.key, params.windowSec);
      }
      const ttl = await redis.ttl(params.key);
      const remaining = Math.max(0, params.limit - count);
      const resetSec = ttl > 0 ? ttl : params.windowSec;
      if (count > params.limit) {
        return { ok: false, retryAfterSec: resetSec };
      }
      return { ok: true, remaining, resetSec };
    } catch (error: unknown) {
      console.error("checkRateLimitWithRedis fallback", error);
    }
  }

  const now = Date.now();
  const existing = memoryRate.get(params.key);
  if (!existing || existing.expiresAt <= now) {
    memoryRate.set(params.key, {
      count: 1,
      expiresAt: now + params.windowSec * 1000,
    });
    return { ok: true, remaining: params.limit - 1, resetSec: params.windowSec };
  }

  existing.count += 1;
  const retryAfterSec = Math.max(1, Math.ceil((existing.expiresAt - now) / 1000));
  if (existing.count > params.limit) {
    return { ok: false, retryAfterSec };
  }

  return {
    ok: true,
    remaining: Math.max(0, params.limit - existing.count),
    resetSec: retryAfterSec,
  };
}

export function aiPromptCacheKey(payload: {
  provider: "anthropic" | "openai";
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  jsonMode: boolean;
}): string {
  const fingerprint = hashCacheKey(JSON.stringify(payload));
  return `ai:prompt:${fingerprint}`;
}

export function seoUrlCacheKey(url: string): string {
  return `seo:url:${hashCacheKey(url.trim().toLowerCase())}`;
}

export function sessionCacheKey(sessionId: string): string {
  return `session:${sessionId}`;
}

export function jobStatusCacheKey(jobId: string): string {
  return `job:status:${jobId}`;
}

export function projectBlogCacheKey(projectId: string): string {
  return `project:${projectId}:generated-blog`;
}

/**
 * Cache invalidation strategy for content regeneration events.
 */
export async function invalidateProjectContentCache(projectId: string): Promise<void> {
  await invalidateByPrefix(`project:${projectId}:`);
}
