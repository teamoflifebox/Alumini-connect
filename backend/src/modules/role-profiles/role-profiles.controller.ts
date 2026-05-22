import { Request, Response, NextFunction } from 'express';
import { roleProfilesService } from './role-profiles.service';
import { CreateProfileDTO, UpdateProfileDTO, AddActivityDTO } from './role-profiles.types';
import { PrimaryRole } from '../auth/auth.types';

export class RoleProfilesController {
  /**
   * Create a new profile
   * POST /api/role-profiles
   */
  async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateProfileDTO = req.body;

      const profile = await roleProfilesService.createProfile(data);

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile by user ID
   * GET /api/role-profiles/user/:userId
   */
  async getProfileByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const profile = await roleProfilesService.getProfileByUserId(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile by profile ID
   * GET /api/role-profiles/:profileId
   */
  async getProfileById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profileId = req.params.profileId as string;
      const profile = await roleProfilesService.getProfileById(profileId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update profile
   * PUT /api/role-profiles/user/:userId
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const data: UpdateProfileDTO = req.body;
      const profile = await roleProfilesService.updateProfile(userId, data);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add activity log
   * POST /api/role-profiles/user/:userId/activity
   */
  async addActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      const data: AddActivityDTO = req.body;
      const profile = await roleProfilesService.addActivity(userId, data);

      res.status(200).json({
        success: true,
        message: 'Activity logged successfully',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete profile
   * DELETE /api/role-profiles/user/:userId
   */
  async deleteProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;
      await roleProfilesService.deleteProfile(userId);

      res.status(200).json({
        success: true,
        message: 'Profile deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profiles by role
   * GET /api/role-profiles/role/:role
   */
  async getProfilesByRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.params.role as PrimaryRole;
      const { page = '1', limit = '10', sortBy, sortOrder } = req.query;

      const result = await roleProfilesService.getProfilesByRole(role as PrimaryRole, {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      res.status(200).json({
        success: true,
        data: result.profiles,
        total: result.total,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search profiles
   * GET /api/role-profiles/search
   */
  async searchProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, role, page = '1', limit = '10' } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Search query parameter "q" is required',
        });
        return;
      }

      const result = await roleProfilesService.searchProfiles(q as string, {
        role: role as PrimaryRole,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });

      res.status(200).json({
        success: true,
        data: result.profiles,
        total: result.total,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all profiles
   * GET /api/role-profiles
   */
  async getAllProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', sortBy, sortOrder } = req.query;

      const result = await roleProfilesService.getAllProfiles({
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      res.status(200).json({
        success: true,
        data: result.profiles,
        total: result.total,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile statistics
   * GET /api/role-profiles/stats
   */
  async getProfileStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await roleProfilesService.getProfileStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if profile exists
   * GET /api/role-profiles/user/:userId/exists
   */
  async checkProfileExists(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId as string;

      const exists = await roleProfilesService.profileExists(userId);

      res.status(200).json({
        success: true,
        exists,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const roleProfilesController = new RoleProfilesController();
