import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from '../modules/auth/auth.service';
import { UserRecord } from '../modules/auth/auth.types';

const router = Router();

/**
 * @route   GET /api/v1/auth/linkedin
 * @desc    Initiate LinkedIn OAuth flow
 * @access  Public
 */
router.get(
  '/',
  passport.authenticate('linkedin', {
    state: true, // Requires express-session
  } as any)
);

/**
 * @route   GET /api/v1/auth/linkedin/callback
 * @desc    LinkedIn OAuth callback
 * @access  Public
 */
router.get(
  '/callback',
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('linkedin', { failureRedirect: '/login', session: false }, async (err: any, user: UserRecord, info: any) => {
      if (err || !user) {
        console.error('LinkedIn Auth Error:', err, 'Info:', info, 'User:', user);
        return res.status(401).json({ success: false, message: 'Authentication failed', error: err?.message || 'Unknown error' });
      }

      try {
        // Generate JWT token and the final response object
        const authResponse = await authService.buildAuthResponseForUser(user);

        // The user asked to return: { success: true, token, user }
        return res.status(200).json({
          success: true,
          token: authResponse.accessToken,
          user: authResponse.user,
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }
);

export default router;
