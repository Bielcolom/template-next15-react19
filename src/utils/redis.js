import "server-only";
import { createClient } from "redis";
import { logger } from "./logger";

const isDev = process.env.NODE_ENV !== "production";
const LOCAL_REDIS_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const REDIS_URL = normalizeRedisUrl(process.env.REDIS_URL || "");
const REDIS_HOST = getRedisHost(REDIS_URL);

const normalizeRedisUrl = (value = "") => {
  if (!value) {
    return "";
  }

  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.hostname === "localhost") {
      parsedUrl.hostname = "127.0.0.1";
      return parsedUrl.toString();
    }

    return parsedUrl.toString();
  } catch {
    return value;
  }
};

const getRedisHost = (value = "") => {
  if (!value) {
    return "";
  }

  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
};


let redisClientPromise = null;
let redisUnavailable = false;
let hasLoggedRedisError = false;

const logRedisErrorOnce = (error) => {
  if (hasLoggedRedisError) {
    return;
  }

  hasLoggedRedisError = true;

  if (isDev && error?.code === "ECONNREFUSED" && LOCAL_REDIS_HOSTS.has(REDIS_HOST)) {
    logger.warn(
      "Redis unavailable in local development. Falling back to MongoDB for auth helpers. Start Redis or unset REDIS_URL to silence this warning.",
      { code: error.code, address: error.address, port: error.port }
    );
    return;
  }

  logger.error("Redis unavailable", error);
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
