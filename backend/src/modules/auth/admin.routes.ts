import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate, authorizeRoles } from './auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../core/middlewares/validate';
import { createStudentSchema } from './auth.schema';

const router = Router();

router.post(
  '/students/create',
  authenticate,
  authorizeRoles('admin'),
  validate(createStudentSchema),
  asyncHandler(authController.createStudent.bind(authController))
);

router.get(
  '/dashboard',
  authenticate,
  authorizeRoles('admin'),
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Welcome to the admin dashboard',
    });
  })
);

export default router;
