import { Request, Response, NextFunction } from 'express';
import { rbacService } from './rbac.service';
import { AuthRequest } from '../auth/auth.middleware';

export class RBACController {
  // ==================== ROLES ====================

  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await rbacService.getAllRoles();
      res.status(200).json({
        status: 'success',
        data: { roles, count: roles.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, display_name, description } = req.body;
      const role = await rbacService.createRole(name, display_name, description);
      res.status(201).json({
        status: 'success',
        data: { role },
        message: 'Role created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CAPABILITIES ====================

  async getAllCapabilities(req: Request, res: Response, next: NextFunction) {
    try {
      const capabilities = await rbacService.getAllCapabilities();
      res.status(200).json({
        status: 'success',
        data: { capabilities, count: capabilities.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async createCapability(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, display_name, description, category } = req.body;
      const capability = await rbacService.createCapability(name, display_name, description, category);
      res.status(201).json({
        status: 'success',
        data: { capability },
        message: 'Capability created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== ROLE-CAPABILITY ASSIGNMENT ====================

  async getRoleCapabilities(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = parseInt(req.params.roleId as string);
      const capabilities = await rbacService.getRoleCapabilities(roleId);
      res.status(200).json({
        status: 'success',
        data: { capabilities, count: capabilities.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async assignCapabilityToRole(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = parseInt(req.params.roleId as string);
      const { capability_id } = req.body;
      await rbacService.assignCapabilityToRole(roleId, capability_id);
      res.status(200).json({
        status: 'success',
        message: 'Capability assigned to role successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeCapabilityFromRole(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = parseInt(req.params.roleId as string);
      const capabilityId = parseInt(req.params.capabilityId as string);
      await rbacService.removeCapabilityFromRole(roleId, capabilityId);
      res.status(200).json({
        status: 'success',
        message: 'Capability removed from role successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== USER-CAPABILITY ASSIGNMENT ====================

  async getUserCapabilities(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId as string);
      const capabilities = await rbacService.getUserCapabilities(userId);
      res.status(200).json({
        status: 'success',
        data: { capabilities, count: capabilities.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async grantCapabilityToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId as string);
      const { capability_id } = req.body;
      const authReq = req as AuthRequest;
      const grantedBy = parseInt(authReq.user!.id);

      await rbacService.grantCapabilityToUser(userId, capability_id, grantedBy);
      res.status(200).json({
        status: 'success',
        message: 'Capability granted to user successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeCapabilityFromUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId as string);
      const capabilityId = parseInt(req.params.capabilityId as string);
      await rbacService.revokeCapabilityFromUser(userId, capabilityId);
      res.status(200).json({
        status: 'success',
        message: 'Capability revoked from user successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== PERMISSION CHECK ====================

  async checkPermission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { capability } = req.body;
      const userId = parseInt(req.user!.id);
      
      const hasPermission = await rbacService.hasCapability(userId, capability);
      
      res.status(200).json({
        status: 'success',
        data: { hasPermission, capability },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt((req.params.userId || req.user!.id) as string);
      const permissions = await rbacService.getUserPermissions(userId);
      
      res.status(200).json({
        status: 'success',
        data: { permissions },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== USER APPROVAL ====================

  async getPendingUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await rbacService.getPendingUsers();
      res.status(200).json({
        status: 'success',
        data: { users, count: users.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async approveUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId as string);
      const authReq = req as AuthRequest;
      const approvedBy = parseInt(authReq.user!.id);

      await rbacService.approveUser(userId, approvedBy);
      res.status(200).json({
        status: 'success',
        message: 'User approved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId as string);
      const { reason } = req.body;
      const authReq = req as AuthRequest;
      const approvedBy = parseInt(authReq.user!.id);

      await rbacService.rejectUser(userId, approvedBy, reason);
      res.status(200).json({
        status: 'success',
        message: 'User rejected successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== MODULE MANAGEMENT ====================

  async getAllModules(req: Request, res: Response, next: NextFunction) {
    try {
      const modules = await rbacService.getAllModules();
      res.status(200).json({
        status: 'success',
        data: { modules, count: modules.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserModules(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId as string);
      const modules = await rbacService.getUserModules(userId);
      res.status(200).json({
        status: 'success',
        data: { modules },
      });
    } catch (error) {
      next(error);
    }
  }

  async enableModuleForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId as string);
      const { module_name } = req.body;
      const authReq = req as AuthRequest;
      const activatedBy = parseInt(authReq.user!.id);

      await rbacService.enableModuleForUser(userId, module_name, activatedBy);
      res.status(200).json({
        status: 'success',
        message: `Module ${module_name} enabled for user`,
      });
    } catch (error) {
      next(error);
    }
  }

  async disableModuleForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.userId as string);
      const moduleName = req.params.moduleName as string;

      await rbacService.disableModuleForUser(userId, moduleName);
      res.status(200).json({
        status: 'success',
        message: `Module ${moduleName} disabled for user`,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CAPABILITY GROUP REQUESTS ====================

  async requestCapability(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.user!.id);
      const { capability_group_name, reason } = req.body;

      const request = await rbacService.createCapabilityRequest(
        userId,
        capability_group_name,
        reason
      );

      res.status(201).json({
        status: 'success',
        data: { request },
        message: 'Capability group request submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getPendingCapabilityRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await rbacService.getPendingCapabilityRequests();
      res.status(200).json({
        status: 'success',
        data: { requests, count: requests.length },
      });
    } catch (error) {
      next(error);
    }
  }

  async approveCapabilityRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = parseInt(req.params.requestId as string);
      const authReq = req as AuthRequest;
      const adminId = parseInt(authReq.user!.id);

      await rbacService.approveCapabilityRequest(requestId, adminId);
      res.status(200).json({
        status: 'success',
        message: 'Capability group request approved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectCapabilityRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = parseInt(req.params.requestId as string);
      const { reason } = req.body;
      const authReq = req as AuthRequest;
      const adminId = parseInt(authReq.user!.id);

      await rbacService.rejectCapabilityRequest(requestId, adminId, reason);
      res.status(200).json({
        status: 'success',
        message: 'Capability group request rejected successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserCapabilityRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = parseInt((req.params.userId as string) || req.user!.id);
      const requests = await rbacService.getUserCapabilityRequests(userId);
      res.status(200).json({
        status: 'success',
        data: { requests, count: requests.length },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const rbacController = new RBACController();
