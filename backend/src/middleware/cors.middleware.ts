import cors, { CorsOptions } from 'cors';
import { env } from '../config/env';

/**
 * Production-grade CORS configuration.
 * Allows configured frontend origins only; rejects others.
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (Postman, curl, mobile apps) with no Origin header
    if (!origin) {
      callback(null, true);
      return;
    }

    if (env.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  optionsSuccessStatus: 204,
} as CorsOptions);
