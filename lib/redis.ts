import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function isRedisConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function getRedis() {
  if (!isRedisConfigured()) {
    throw new Error("REDIS_NOT_CONFIGURED");
  }

  if (!redis) {
    redis = Redis.fromEnv();
  }

  return redis;
}
