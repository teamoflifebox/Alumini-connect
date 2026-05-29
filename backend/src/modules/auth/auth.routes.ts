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
  registerSchema,
  changePasswordSchema,
} from './auth.schema';

const router = Router();

// Universal login endpoint (auto-detects role)
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.login.bind(authController))
);

// Role-specific login endpoints (for explicit role selection)
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
  '/alumni/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.alumniLogin.bind(authController))
);

// Alumni self-registration
router.post(
  '/alumni/register',
  registerLimiter,
  validate(alumniRegisterSchema),
  asyncHandler(authController.alumniRegister.bind(authController))
);

// Universal registration endpoint
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  asyncHandler(authController.register.bind(authController))
);

// Password management
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

router.put(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword.bind(authController))
);

// Email verification
router.post(
  '/send-verification',
  authenticate,
  asyncHandler(authController.sendVerification.bind(authController))
);

router.get('/verify-email', asyncHandler(authController.verifyEmail.bind(authController)));

// OAuth
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

// Token management
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));

router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

router.delete('/me', authenticate, asyncHandler(authController.deleteAccount.bind(authController)));

export default router;
