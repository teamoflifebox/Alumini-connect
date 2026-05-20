import { Request, Response, NextFunction } from 'express';
import { jobsService } from './jobs.service';
import { createJobSchema } from './jobs.schema';
import { AuthRequest } from '../auth/auth.middleware'; // To get the user ID

export class JobsController {
  async createJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // 1. Validate the basic schema
      const validation = createJobSchema(req.body);
      if (!validation.isValid) {
         res.status(400).json({ status: 'error', errors: validation.errors });
         return;
      }

      // 2. Call the service
      // Note: req.user.id will be available because of the requireAuth middleware
      const userId = req.user.id; 
      const job = await jobsService.createJob(userId, req.body);
      
      res.status(201).json({ status: 'success', data: job });
    } catch (error) {
      next(error);
    }
  }

  async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const jobs = await jobsService.getAllJobs();
      res.status(200).json({ status: 'success', data: jobs });
    } catch (error) {
      next(error);
    }
  }
}

export const jobsController = new JobsController();
