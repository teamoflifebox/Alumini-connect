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
import session from 'express-session';
import passport from './config/passport';
import { env } from './config/env';
import apiRoutes from './routes';
import linkedinRoutes from './routes/linkedin.routes';

export const createApp = (): Express => {
  initRateLimiters();

  const app = express();

  app.disable('x-powered-by');
  app.use(corsMiddleware);
  app.use(securityMiddleware);
  app.use(requestLogger);
  app.use(express.json());
  app.use(cookieParser());
  
  // Required for passport-linkedin-oauth2 state parameter
  app.use(
    session({
      secret: env.JWT_ACCESS_SECRET || 'fallback-secret',
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(globalApiLimiter);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'success', message: 'Server is healthy' });
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'success', message: 'API is running' });
  });

  app.use('/api', apiRoutes);
  app.use('/api/v1/auth/linkedin', linkedinRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
