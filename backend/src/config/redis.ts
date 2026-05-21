import Redis from 'ioredis';
import { env } from './env';

/**
 * Redis client for rate-limit persistence (rate-limit-redis).
 * Prefer REDIS_URL for hosted Redis (Redis Cloud, Railway, Upstash-style URLs).
 */
function createRedisClient(): Redis {
  if (env.REDIS_URL) {
    return new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
    });
  }

  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: true,
    retryStrategy(times: number) {
      const delay = Math.min(times * 200, 2000);
      return delay;
    },
  });
}

export const redis = createRedisClient();
redis.on('error', (err) => {
  // Avoid noisy unhandled ioredis events while keeping a concise signal in logs.
  if (redisReady) {
    console.warn(`Redis connection error: ${err.message}`);
  }
});

let redisReady = false;

export const isRedisReady = () => redisReady;

export const connectRedis = async (): Promise<boolean> => {
  try {
    if (redis.status === 'ready') {
      redisReady = true;
      console.log('Redis connected successfully.');
      return true;
    }

    await redis.connect();
    const pong = await redis.ping();
    if (pong !== 'PONG') {
      throw new Error(`Unexpected PING reply: ${pong}`);
    }

    redisReady = true;
    const endpoint = env.REDIS_URL ? '(REDIS_URL)' : `${env.REDIS_HOST}:${env.REDIS_PORT}`;
    console.log(`Redis connected successfully (${endpoint}).`);
    return true;
  } catch (error) {
    redisReady = false;
    if (redis.status !== 'end') {
      await redis.disconnect();
    }
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Redis unavailable (${message}). Rate limiting falls back to in-memory.`);
    console.warn(
      'Start Redis locally: docker run -d --name redis -p 6379:6379 redis:alpine'
    );
    return false;
  }
};
