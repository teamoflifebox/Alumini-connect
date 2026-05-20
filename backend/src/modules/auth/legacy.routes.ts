import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../core/middlewares/validate';
import { authLimiter, registerLimiter } from '../../middleware/rateLimit.middleware';
import { alumniRegisterSchema, loginSchema } from './auth.schema';

/** Backward-compatible /api/v1/auth routes */
const router = Router();

router.post(
  '/register',
  registerLimiter,
  validate(alumniRegisterSchema),
  asyncHandler(authController.register.bind(authController))
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.login.bind(authController))
);

export default router;
