import Redis from "ioredis";

import { logger } from "@/lib/logger";

let redisClient: Redis | null | undefined;

/**
 * Returns a shared Redis client when REDIS_URL is configured.
 * Falls back to null when Redis is not available.
 */
export function getRedisClient(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) {
    redisClient = null;
    return redisClient;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    client.on("error", (error: unknown) => {
      logger.error({ err: error }, "redis client error");
    });

    client.on("end", () => {
      logger.warn("redis connection ended");
    });

    redisClient = client;
    return redisClient;
  } catch (error: unknown) {
    logger.error({ err: error }, "redis init failed");
    redisClient = null;
    return redisClient;
  }
}

/**
 * Gracefully closes Redis connection for shutdown hooks/tests.
 */
export async function closeRedisClient(): Promise<void> {
  if (!redisClient) return;
  try {
    await redisClient.quit();
  } catch (error: unknown) {
    logger.error({ err: error }, "redis quit failed");
  } finally {
    redisClient = null;
  }
}
