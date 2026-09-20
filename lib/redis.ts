import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function redisUrl() {
  return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
}

function redisToken() {
  return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
}

export function isRedisConfigured() {
  return Boolean(redisUrl() && redisToken());
}

export function getRedis() {
  if (!isRedisConfigured()) {
    throw new Error("REDIS_NOT_CONFIGURED");
  }

  if (!redis) {
    redis = new Redis({ url: redisUrl() as string, token: redisToken() as string });
  }

  return redis;
}
