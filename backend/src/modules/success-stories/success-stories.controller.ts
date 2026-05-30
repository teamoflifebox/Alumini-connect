import { Response, NextFunction } from 'express';
import { successStoriesService } from './success-stories.service';
import { AuthRequest } from '../auth/auth.middleware';

export class SuccessStoriesController {
  async getAllStories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stories = await successStoriesService.getAllStories();
      res.status(200).json({ status: 'success', data: stories });
    } catch (error: any) {
      next(error);
    }
  }

  async createStory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, content, alumniName, alumniDesignation, imageUrl, category } = req.body;
      const story = await successStoriesService.createStory(title, content, alumniName, alumniDesignation, imageUrl, req.user.id, category);
      res.status(201).json({ status: 'success', data: story });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteStory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const story = await successStoriesService.deleteStory(id as string);
      res.status(200).json({ status: 'success', data: story });
    } catch (error: any) {
      next(error);
    }
  }
}

export const successStoriesController = new SuccessStoriesController();
