import { Router } from 'express';
import { jobsController } from './jobs.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// Public route: anyone can view jobs
router.get('/', jobsController.getAllJobs);

// Protected route: you must be logged in to post a job
router.post('/', requireAuth, jobsController.createJob);

export default router;
