import Redis from "ioredis";

let redisClient = null;
let isConnected = false;

const isRedisEnabled = process.env.REDIS_ENABLED !== "false" && process.env.REDIS_ENABLED !== "0";

/**
 * Initializes and returns a singleton Redis client instance.
 * Gracefully handles offline scenarios and reconnection.
 */
export function initRedis() {
  if (!isRedisEnabled) {
    console.log("[Redis] Redis caching is explicitly disabled via REDIS_ENABLED=false.");
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = Number(process.env.REDIS_PORT) || 6379;
  const password = process.env.REDIS_PASSWORD || undefined;
  const redisUrl = process.env.REDIS_URL;

  const options = {
    retryStrategy(times) {
      if (times > 10) {
        console.warn("[Redis] Failed to connect after 10 attempts. Switching to DB-only fallback mode.");
        return null; // Stop automatic infinite retry spam
      }
      const delay = Math.min(times * 150, 3000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    enableReadyCheck: true,
    lazyConnect: true,
  };

  if (password) {
    options.password = password;
  }

  try {
    if (redisUrl) {
      redisClient = new Redis(redisUrl, options);
    } else {
      redisClient = new Redis({
        host,
        port,
        ...options,
      });
    }

    redisClient.on("connect", () => {
      console.log(`[Redis] Connecting to Redis server at ${host}:${port}...`);
    });

    redisClient.on("ready", () => {
      isConnected = true;
      console.log(`[Redis] Connected and ready to serve cache at ${host}:${port}!`);
    });

    redisClient.on("error", (err) => {
      isConnected = false;
      console.warn(`[Redis] Connection warning: ${err.message}. Serving requests directly from DB.`);
    });

    redisClient.on("reconnecting", (time) => {
      isConnected = false;
      console.log(`[Redis] Reconnecting in ${time}ms...`);
    });

    redisClient.on("end", () => {
      isConnected = false;
      console.log("[Redis] Connection closed.");
    });

    // Initiate connection asynchronously
    redisClient.connect().catch((err) => {
      isConnected = false;
      console.warn(`[Redis] Initial connection could not be established: ${err.message}. Application running with direct database access.`);
    });

    return redisClient;
  } catch (error) {
    console.error("[Redis] Initialization failed:", error.message);
    redisClient = null;
    isConnected = false;
    return null;
  }
}

/**
 * Returns active Redis client if available.
 */
export function getRedisClient() {
  if (!redisClient && isRedisEnabled) {
    return initRedis();
  }
  return redisClient;
}

/**
 * Check if Redis is actively connected and ready to accept commands.
 */
export function isRedisReady() {
  return isConnected && redisClient && redisClient.status === "ready";
}

/**
 * Gracefully terminates the Redis connection on server shutdown.
 */
export async function closeRedisConnection() {
  if (redisClient) {
    try {
      console.log("[Redis] Closing connection gracefully...");
      await redisClient.quit();
      console.log("[Redis] Connection closed cleanly.");
    } catch (err) {
      console.error("[Redis] Error during shutdown:", err.message);
      redisClient.disconnect();
    } finally {
      redisClient = null;
      isConnected = false;
    }
  }
}

export default {
  initRedis,
  getRedisClient,
  isRedisReady,
  closeRedisConnection,
};
