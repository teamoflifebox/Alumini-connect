import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import {
  corsMiddleware,
  requestLogger,
  securityMiddleware,
  globalErrorHandler,
  notFoundHandler,
} from './middleware';
import { globalApiLimiter, initRateLimiters } from './middleware/rateLimit.middleware';
import apiRoutes from './routes';

export const createApp = (): Express => {
  initRateLimiters();

  const app = express();

  app.disable('x-powered-by');
  app.use(corsMiddleware);
  app.use(securityMiddleware);
  app.use(requestLogger);
  app.use(express.json());
  app.use(cookieParser());
  app.use(globalApiLimiter);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'success', message: 'Server is healthy' });
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
  });

  app.use('/api', apiRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
