import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, PrimaryRole } from './auth.types';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || process.env.SECRET_KEY || '';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getAccessSecret()) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid or expired token' });
  }
};

export const authorizeRoles =
  (...roles: PrimaryRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.primary_role)) {
      res.status(403).json({ status: 'error', message: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };

/** @deprecated Use `authenticate` instead */
export const requireAuth = authenticate;
