import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        res.status(409).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  }
}

export const authController = new AuthController();
