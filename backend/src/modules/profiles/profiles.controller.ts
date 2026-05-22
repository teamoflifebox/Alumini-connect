import { Response, NextFunction } from 'express';
import { profilesService } from './profiles.service';
import { updateProfileSchema } from './profiles.schema';
import { AuthRequest } from '../auth/auth.middleware';

export class ProfilesController {
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profilesService.getProfile(req.user.id);
      // It's perfectly fine if profile is null, frontend can just show an empty form
      res.status(200).json({ status: 'success', data: profile || {} });
    } catch (error: any) {
      next(error);
    }
  }

  async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const profile = await profilesService.updateProfile(req.user.id, validatedData);
      res.status(200).json({ status: 'success', data: profile });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ status: 'error', errors: error.errors });
        return;
      }
      next(error);
    }
  }
}

export const profilesController = new ProfilesController();
