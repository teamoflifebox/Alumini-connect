import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null, // Don't retry on connection failure
  lazyConnect: true,
  enableOfflineQueue: false, // Don't queue commands when offline
});

let redisReady = false;

// Suppress error events to prevent unhandled error warnings
redis.on('error', (err) => {
  // Silently ignore connection errors - we handle them in connectRedis
  if (!err.message.includes('ECONNREFUSED')) {
    console.warn('Redis error:', err.message);
  }
});

export const isRedisReady = () => redisReady;

export const connectRedis = async (): Promise<boolean> => {
  try {
    if (redis.status === 'ready') {
      redisReady = true;
      return true;
    }
    await redis.connect();
    await redis.ping();
    redisReady = true;
    console.log('✓ Redis connected successfully.');
    return true;
  } catch (error) {
    redisReady = false;
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠ Redis unavailable (${message}). Using in-memory rate limiting.`);
    return false;
  }
};
