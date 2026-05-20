import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/apiResponse';

/** Enterprise global error handler — standardizes all API error responses */
export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Custom application errors
  if (err instanceof AppError) {
    res.status(err.status).json(errorResponse(err.message, err.errors));
    return;
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    res.status(401).json(errorResponse('Token expired'));
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json(errorResponse('Invalid token'));
    return;
  }

  // Zod / validation errors
  if (err && typeof err === 'object' && 'issues' in err) {
    const zodErr = err as { issues: { message: string }[] };
    res.status(400).json(
      errorResponse(
        'Validation failed',
        zodErr.issues.map((issue) => issue.message)
      )
    );
    return;
  }

  // PostgreSQL errors
  if (err && typeof err === 'object' && 'code' in err) {
    const pgErr = err as { code: string; detail?: string };

    if (pgErr.code === '23505') {
      res.status(409).json(errorResponse('Resource already exists'));
      return;
    }

    if (pgErr.code === '23503') {
      res.status(400).json(errorResponse('Invalid reference to related resource'));
      return;
    }
  }

  // CORS rejection
  if (err instanceof Error && err.message.includes('CORS')) {
    res.status(403).json(errorResponse('Origin not allowed by CORS policy'));
    return;
  }

  // Rate limit (fallback if handler not used)
  if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 429) {
    res.status(429).json(errorResponse('Too many requests, please try again later'));
    return;
  }

  console.error(err);

  const status = (err as { status?: number })?.status || 500;
  const message =
    err instanceof Error && status < 500 ? err.message : 'Internal Server Error';

  res.status(status).json(errorResponse(message));
};
