import { GIFTS } from "./gifts";
import { getRedis, isRedisConfigured } from "./redis";

const REMAINING_KEY = "gifts:remaining";
const INITIALIZED_KEY = "gifts:initialized";

export class StoreError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_CONFIGURED" | "UNKNOWN",
  ) {
    super(message);
    this.name = "StoreError";
  }
}

type MemoryStore = {
  initialized: boolean;
  remaining: Set<string>;
};

const memory: MemoryStore = {
  initialized: false,
  remaining: new Set(),
};

export function isPreview() {
  return process.env.NODE_ENV === "development";
}

function useMemoryFallback() {
  return isPreview() && !isRedisConfigured();
}

async function ensureSeededRedis() {
  const redis = getRedis();
  const initialized = await redis.get<string>(INITIALIZED_KEY);

  if (initialized) {
    return;
  }

  await redis.sadd(REMAINING_KEY, ...GIFTS);
  await redis.set(INITIALIZED_KEY, "1");
}

function ensureSeededMemory() {
  memory.remaining = new Set(GIFTS);
  memory.initialized = true;
}

export async function listRemaining() {
  if (useMemoryFallback()) {
    ensureSeededMemory();
    return [...memory.remaining];
  }

  if (!isRedisConfigured()) {
    throw new StoreError("REDIS_NOT_CONFIGURED", "NOT_CONFIGURED");
  }

  try {
    await ensureSeededRedis();
    const remaining = await getRedis().smembers<string[]>(REMAINING_KEY);
    return remaining ?? [];
  } catch (error) {
    if (error instanceof StoreError) {
      throw error;
    }

    throw new StoreError("UNKNOWN", "UNKNOWN");
  }
}

function pickRandom(pool: string[]) {
  if (pool.length === 0) {
    return { gift: null, remaining: [] as string[] };
  }

  return {
    gift: pool[Math.floor(Math.random() * pool.length)],
    remaining: pool,
  };
}

export async function claimGift() {
  if (isPreview()) {
    const remaining = await listRemaining();
    return pickRandom(remaining.length > 0 ? remaining : [...GIFTS]);
  }

  if (useMemoryFallback()) {
    ensureSeededMemory();
    return pickRandom([...memory.remaining]);
  }

  if (!isRedisConfigured()) {
    throw new StoreError("REDIS_NOT_CONFIGURED", "NOT_CONFIGURED");
  }

  try {
    await ensureSeededRedis();
    const redis = getRedis();
    const gift = await redis.spop<string>(REMAINING_KEY);
    const remaining = (await redis.smembers<string[]>(REMAINING_KEY)) ?? [];
    return { gift: gift ?? null, remaining };
  } catch (error) {
    if (error instanceof StoreError) {
      throw error;
    }

    throw new StoreError("UNKNOWN", "UNKNOWN");
  }
}

export async function resetGifts() {
  if (useMemoryFallback()) {
    memory.remaining = new Set(GIFTS);
    memory.initialized = true;
    return [...memory.remaining];
  }

  if (!isRedisConfigured()) {
    throw new StoreError("REDIS_NOT_CONFIGURED", "NOT_CONFIGURED");
  }

  try {
    const redis = getRedis();
    await redis.del(REMAINING_KEY, INITIALIZED_KEY);
    await ensureSeededRedis();
    return (await redis.smembers<string[]>(REMAINING_KEY)) ?? [];
  } catch (error) {
    if (error instanceof StoreError) {
      throw error;
    }

    throw new StoreError("UNKNOWN", "UNKNOWN");
  }
}

export function storeMode() {
  if (isRedisConfigured()) {
    return "redis" as const;
  }

  if (useMemoryFallback()) {
    return "local" as const;
  }

  return "missing" as const;
}
