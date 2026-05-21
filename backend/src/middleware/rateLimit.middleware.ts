import { Request, Response, RequestHandler } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis, isRedisReady } from '../config/redis';
import { errorResponse } from '../utils/apiResponse';

const rateLimitHandler = (_req: Request, res: Response) => {
  res.status(429).json(errorResponse('Too many requests, please try again later'));
};

const buildStore = (prefix: string) => {
  if (!isRedisReady()) return undefined;

  return new RedisStore({
    prefix: `rl:${prefix}:`,
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as Promise<number>,
  });
};

const createLimiter = (
  prefix: string,
  windowMs: number,
  max: number
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
    store: buildStore(prefix),
  });
};

/** Populated during server bootstrap */
export let globalApiLimiter: RequestHandler = (_req, _res, next) => next();
export let authLimiter: RequestHandler = (_req, _res, next) => next();
export let registerLimiter: RequestHandler = (_req, _res, next) => next();

export const initRateLimiters = () => {
  globalApiLimiter = createLimiter('global', 15 * 60 * 1000, 100);
  authLimiter = createLimiter('auth', 15 * 60 * 1000, 10);
  registerLimiter = createLimiter('register', 60 * 60 * 1000, 5);
};
