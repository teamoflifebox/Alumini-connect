import { Request, Response, NextFunction } from 'express';
import { userManagementService } from './user-management.service';
import { verifyAlumniSchema } from './user-management.schema';

export class UserManagementController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userManagementService.getAllUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  }

  async verifyAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = verifyAlumniSchema(req.body);
      if (!validation.isValid) {
         res.status(400).json({ status: 'error', errors: validation.errors });
         return;
      }

      const user = await userManagementService.verifyAlumni(req.body.user_id, req.body.is_verified);
      res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  }
}

export const userManagementController = new UserManagementController();
