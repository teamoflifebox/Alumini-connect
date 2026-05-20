import { Router } from 'express';
import { authenticate, authorizeRoles } from './auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const studentRouter = Router();
const alumniRouter = Router();

studentRouter.get(
  '/dashboard',
  authenticate,
  authorizeRoles('student'),
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Welcome to the student dashboard',
    });
  })
);

alumniRouter.get(
  '/dashboard',
  authenticate,
  authorizeRoles('alumni'),
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Welcome to the alumni dashboard',
    });
  })
);

export { studentRouter, alumniRouter };
