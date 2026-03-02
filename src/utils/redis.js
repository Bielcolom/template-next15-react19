import "server-only";
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "";

let redisClientPromise = null;
let redisUnavailable = false;
let hasLoggedRedisError = false;

const logRedisErrorOnce = (error) => {
  if (hasLoggedRedisError) {
    return;
  }

  hasLoggedRedisError = true;
  console.error("Redis unavailable:", error?.message || error);
};

const createRedisConnection = async () => {
  if (!REDIS_URL || redisUnavailable) {
    return null;
  }

  const client = createClient({
    url: REDIS_URL,
  });

  client.on("error", (error) => {
    logRedisErrorOnce(error);
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    redisUnavailable = true;
    logRedisErrorOnce(error);
    try {
      client.destroy();
    } catch {
      // No-op: client cleanup failure should not break auth fallback.
    }
    return null;
  }
};

export async function getRedisClient() {
  if (!REDIS_URL || redisUnavailable) {
    return null;
  }

  if (!redisClientPromise) {
    redisClientPromise = createRedisConnection();
  }

  return redisClientPromise;
}

export async function getRedisJson(key) {
  const client = await getRedisClient();
  if (!client) {
    return null;
  }

  let rawValue;
  try {
    rawValue = await client.get(key);
  } catch (error) {
    logRedisErrorOnce(error);
    return null;
  }

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    logRedisErrorOnce(error);
    return null;
  }
}

export async function setRedisJson(key, value, ttlSeconds) {
  const client = await getRedisClient();
  if (!client) {
    return false;
  }

  const serializedValue = JSON.stringify(value);

  try {
    if (ttlSeconds > 0) {
      await client.set(key, serializedValue, { EX: ttlSeconds });
      return true;
    }

    await client.set(key, serializedValue);
    return true;
  } catch (error) {
    logRedisErrorOnce(error);
    return false;
  }
}

export async function deleteRedisKey(key) {
  const client = await getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.del(key);
    return true;
  } catch (error) {
    logRedisErrorOnce(error);
    return false;
  }
}

export function isRedisConfigured() {
  return Boolean(REDIS_URL);
}
