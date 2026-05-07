import Redis from "ioredis";

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
      console.error("redis client error", error);
    });

    client.on("end", () => {
      console.warn("redis connection ended");
    });

    redisClient = client;
    return redisClient;
  } catch (error: unknown) {
    console.error("redis init failed", error);
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
    console.error("redis quit failed", error);
  } finally {
    redisClient = null;
  }
}
