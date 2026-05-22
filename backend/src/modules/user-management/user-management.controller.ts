import { Request, Response, NextFunction } from 'express';
import { userManagementService } from './user-management.service';

export class UserManagementController {
  /**
   * Admin creates a student account
   */
  async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const student = await userManagementService.createStudent(name, email, password);
      res.status(201).json({ 
        status: 'success', 
        data: { student },
        message: 'Student account created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Super admin creates another admin account
   */
  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const admin = await userManagementService.createAdmin(name, email, password);
      res.status(201).json({ 
        status: 'success', 
        data: { admin },
        message: 'Admin account created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userManagementService.getAllUsers();
      res.status(200).json({ 
        status: 'success', 
        data: { users, count: users.length } 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users by role (admin only)
   */
  async getUsersByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.params;
      const users = await userManagementService.getUsersByRole(role as any);
      res.status(200).json({ 
        status: 'success', 
        data: { users, count: users.length, role } 
      });
    } catch (error) {
      next(error);
    }
  }



  /**
   * Delete a user (admin only)
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const result = await userManagementService.deleteUser(userId);
      res.status(200).json({ 
        status: 'success', 
        message: result.message 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const { role } = req.body;
      const user = await userManagementService.updateUserRole(userId, role);
      res.status(200).json({ 
        status: 'success', 
        data: { user },
        message: 'User role updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userManagementController = new UserManagementController();
