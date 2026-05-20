import { Request, Response } from 'express';
import { errorResponse } from '../utils/apiResponse';

/** 404 handler for undefined routes */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(errorResponse(`Route ${req.method} ${req.originalUrl} not found`));
};
