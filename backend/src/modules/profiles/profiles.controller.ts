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

  async searchProfiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role, name, skills, company, page = 1, limit = 10 } = req.query;
      const filters = { role, name, skills, company };
      const offset = (Number(page) - 1) * Number(limit);
      const data = await profilesService.searchProfiles(filters, Number(limit), offset, req.user.id);
      res.status(200).json({ status: 'success', data: data.profiles, total: data.total, page: Number(page) });
    } catch (error: any) {
      next(error);
    }
  }

  async getProfileById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await profilesService.getProfile(req.params.id as string);
      if (!profile) {
        res.status(404).json({ status: 'error', message: 'Profile not found' });
        return;
      }
      res.status(200).json({ status: 'success', data: profile });
    } catch (error: any) {
      next(error);
    }
  }
}

export const profilesController = new ProfilesController();
