import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { settingsService } from './settings.service';

export class SettingsController {
  getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const settings = await settingsService.getSettings(userId);

    res.status(200).json({
      status: 'success',
      data: settings,
    });
  });

  updateSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const settings = await settingsService.updateSettings(userId, req.body);

    res.status(200).json({
      status: 'success',
      data: settings,
    });
  });
}

export const settingsController = new SettingsController();
