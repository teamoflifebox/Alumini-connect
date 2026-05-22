import { Request, Response, NextFunction } from 'express';
import { JwtPayload, PrimaryRole } from '../auth/auth.types';

// Extend Express Request to include user from JWT (use `any` to avoid conflicts with other libs)
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to ensure user can only access their own profile
 * Admins can access any profile
 */
export const canAccessProfile = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.params.userId as string;
  const currentUser = req.user;

  if (!currentUser) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Allow if user is accessing their own profile or is an admin
  if (currentUser.id === userId || currentUser.primary_role === 'admin') {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'You do not have permission to access this profile',
  });
};

/**
 * Middleware to ensure user can only modify their own profile
 * Admins can modify any profile
 */
export const canModifyProfile = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.params.userId as string;
  const currentUser = req.user;

  if (!currentUser) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Allow if user is modifying their own profile or is an admin
  if (currentUser.id === userId || currentUser.primary_role === 'admin') {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: 'You do not have permission to modify this profile',
  });
};

/**
 * Middleware to ensure only admins can access this route
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  const currentUser = req.user;

  if (!currentUser) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (currentUser.primary_role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * Middleware to ensure user has one of the allowed roles
 */
export const hasRole = (...allowedRoles: PrimaryRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(currentUser.primary_role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to validate role parameter in URL
 */
export const validateRoleParam = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.params.role as string;
  const validRoles: PrimaryRole[] = ['admin', 'student', 'alumni', 'recruiter', 'donor'];

  if (!validRoles.includes(role as PrimaryRole)) {
    res.status(400).json({
      success: false,
      message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
    });
    return;
  }

  next();
};

/**
 * Middleware to validate UUID format
 */
export const validateUUID = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName] as string;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(value)) {
      res.status(400).json({
        success: false,
        message: `Invalid ${paramName}. Must be a valid UUID`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to prevent role changes in profile updates
 */
export const preventRoleChange = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body.role) {
    res.status(400).json({
      success: false,
      message: 'Role cannot be changed after profile creation',
    });
    return;
  }

  next();
};

/**
 * Middleware to log profile operations (for audit trail)
 */
export const logProfileOperation = (operation: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentUser = req.user;
    const userId = req.params.userId as string;
    const profileId = req.params.profileId as string;

    console.log(`[Profile Audit] ${operation}`, {
      timestamp: new Date().toISOString(),
      performedBy: currentUser?.id,
      performerRole: currentUser?.primary_role,
      targetUserId: userId,
      targetProfileId: profileId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    next();
  };
};

/**
 * Middleware to validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const { page, limit } = req.query;

  if (page) {
    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
      return;
    }
  }

  if (limit) {
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
      });
      return;
    }
  }

  next();
};

/**
 * Middleware to ensure profile exists before operations
 */
export const ensureProfileExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleProfilesService } = await import('./role-profiles.service');
    const userId = req.params.userId as string;

    const exists = await roleProfilesService.profileExists(userId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to prevent duplicate profile creation
 */
export const preventDuplicateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleProfilesService } = await import('./role-profiles.service');
    const userId = req.body.userId as string;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'userId is required',
      });
      return;
    }

    const exists = await roleProfilesService.profileExists(userId);

    if (exists) {
      res.status(409).json({
        success: false,
        message: 'Profile already exists for this user',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
