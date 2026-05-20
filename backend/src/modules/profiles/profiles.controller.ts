import { Request, Response, NextFunction } from 'express';
import { profilesService } from './profiles.service';
import { updateProfileSchema } from './profiles.schema';
import { AuthRequest } from '../auth/auth.middleware';

export class ProfilesController {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profilesService.getProfile(req.user.id);
      res.status(200).json({ status: 'success', data: profile });
    } catch (error: any) {
      if (error.message === 'Profile not found') {
        res.status(404).json({ status: 'error', message: error.message });
        return;
      }
      next(error);
    }
  }

  async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validation = updateProfileSchema(req.body);
      if (!validation.isValid) {
         res.status(400).json({ status: 'error', errors: validation.errors });
         return;
      }

      const profile = await profilesService.updateProfile(req.user.id, req.body);
      res.status(200).json({ status: 'success', data: profile });
    } catch (error) {
      next(error);
    }
  }
}

export const profilesController = new ProfilesController();
