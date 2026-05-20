import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../core/middlewares/validate';
import { authLimiter, registerLimiter } from '../../middleware/rateLimit.middleware';
import {
  alumniRegisterSchema,
  forgotPasswordSchema,
  googleAuthSchema,
  linkedinAuthSchema,
  loginSchema,
  resetPasswordSchema,
} from './auth.schema';

const router = Router();

router.post(
  '/admin/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.adminLogin.bind(authController))
);

router.post(
  '/student/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.studentLogin.bind(authController))
);

router.post(
  '/alumni/register',
  registerLimiter,
  validate(alumniRegisterSchema),
  asyncHandler(authController.alumniRegister.bind(authController))
);

router.post(
  '/alumni/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.alumniLogin.bind(authController))
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword.bind(authController))
);

router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword.bind(authController))
);

router.post(
  '/send-verification',
  authenticate,
  asyncHandler(authController.sendVerification.bind(authController))
);

router.get('/verify-email', asyncHandler(authController.verifyEmail.bind(authController)));

router.post(
  '/google',
  authLimiter,
  validate(googleAuthSchema),
  asyncHandler(authController.googleLogin.bind(authController))
);

router.post(
  '/linkedin',
  authLimiter,
  validate(linkedinAuthSchema),
  asyncHandler(authController.linkedinLogin.bind(authController))
);

router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));

router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

export default router;
