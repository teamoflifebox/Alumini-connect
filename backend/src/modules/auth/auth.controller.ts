import { Request, Response, NextFunction } from 'express';
import { authService, AppError } from './auth.service';
import { authPasswordService } from './auth.password.service';
import { authVerificationService } from './auth.verification.service';
import { authOAuthService } from './auth.oauth.service';
import { AuthRequest } from './auth.middleware';

const REFRESH_COOKIE = 'refreshToken';

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE);
};

const sendAuthResponse = (
  res: Response,
  result: { accessToken: string; refreshToken: string; user: unknown },
  status = 200
) => {
  setRefreshCookie(res, result.refreshToken);
  res.status(status).json({
    status: 'success',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
};

export class AuthController {
  async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.adminLogin(req.body.email, req.body.password);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async studentLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.studentLogin(req.body.email, req.body.password);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async alumniLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.alumniLogin(req.body.email, req.body.password);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async alumniRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.alumniRegister(name, email, password);
      sendAuthResponse(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authPasswordService.forgotPassword(req.body.email);
      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authPasswordService.resetPassword(req.body.token, req.body.password);
      res.status(200).json({
        status: 'success',
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async sendVerification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authVerificationService.sendVerificationEmail(req.user!.id);
      res.status(200).json({
        status: 'success',
        message: 'Verification email sent',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      if (!token) {
        throw new AppError('Verification token is required', 400);
      }
      await authVerificationService.verifyEmail(token);
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authOAuthService.googleLogin(req.body.idToken);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async linkedinLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authOAuthService.linkedinLogin(req.body.accessToken);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        req.body.refreshToken || (req as Request & { cookies?: Record<string, string> }).cookies?.[REFRESH_COOKIE];

      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      const result = await authService.refreshSession(refreshToken);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.id) {
        await authService.logout(req.user.id);
      }
      clearRefreshCookie(res);
      res.status(200).json({ status: 'success', message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, company, graduation_year } = req.body;
      const result = await authService.register({
        name,
        email,
        password,
        role,
        company,
        graduation_year,
      });
      sendAuthResponse(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      sendAuthResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
