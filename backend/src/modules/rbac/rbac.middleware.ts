import { Request, Response, NextFunction } from 'express';
import { rbacService } from './rbac.service';
import { AppError } from '../../utils/AppError';
import { AuthRequest } from '../auth/auth.middleware';
import { PermissionCheckOptions } from './rbac.types';
import { PrimaryRole, ModuleName } from '../auth/auth.types';

/**
 * Middleware to check if user has required capability/capabilities
 */
export const requireCapability = (
  capabilities: string | string[],
  options: PermissionCheckOptions = { requireAll: true }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      
      if (!authReq.user || !authReq.user.id) {
        throw new AppError('Authentication required', 401);
      }

      const userId = parseInt(authReq.user.id);
      const capsArray = Array.isArray(capabilities) ? capabilities : [capabilities];

      let hasPermission: boolean;

      if (options.requireAll) {
        hasPermission = await rbacService.hasAllCapabilities(userId, capsArray);
      } else {
        hasPermission = await rbacService.hasAnyCapability(userId, capsArray);
      }

      if (!hasPermission) {
        throw new AppError(
          `Insufficient permissions. Required: ${capsArray.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has a specific primary role
 */
export const requireRole = (roles: PrimaryRole | PrimaryRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      
      if (!authReq.user || !authReq.user.primary_role) {
        throw new AppError('Authentication required', 401);
      }

      const rolesArray = Array.isArray(roles) ? roles : [roles];
      
      if (!rolesArray.includes(authReq.user.primary_role)) {
        throw new AppError(
          `Access denied. Required role: ${rolesArray.join(' or ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has a specific capability group enabled
 * Capability groups are: mentor, recruiter, donor, community_moderator, event_host
 */
export const requireCapabilityGroup = (
  capabilityGroups: string | string[],
  requireAll: boolean = true
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      
      if (!authReq.user || !authReq.user.id) {
        throw new AppError('Authentication required', 401);
      }

      const groupsArray = Array.isArray(capabilityGroups) ? capabilityGroups : [capabilityGroups];
      const userCapabilityGroups = (authReq.user.capability_groups || []) as string[];

      let hasCapabilityGroup: boolean;

      if (requireAll) {
        hasCapabilityGroup = groupsArray.every(group => userCapabilityGroups.includes(group));
      } else {
        hasCapabilityGroup = groupsArray.some(group => userCapabilityGroups.includes(group));
      }

      if (!hasCapabilityGroup) {
        throw new AppError(
          `Capability group access required: ${groupsArray.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * @deprecated Use requireCapabilityGroup instead
 * Kept for backward compatibility
 */
export const requireModule = requireCapabilityGroup;

export const requireApproval = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      
      if (!authReq.user) {
        throw new AppError('Authentication required', 401);
      }

      if (authReq.user.primary_role === 'admin' || authReq.user.primary_role === 'student') {
        return next();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
