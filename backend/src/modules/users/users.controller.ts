import { Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { AuthRequest } from '../auth/auth.middleware';

export class UsersController {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getUserById(req.user!.id);
      res.status(200).json({ status: 'success', data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getUserById(req.params.id as string);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await usersService.getAllUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
