import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';

export class UsersController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getUserById(req.params.id as string);
      res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      if (error.message === 'User not found') {
        res.status(404).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.getAllUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
