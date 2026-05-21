import { authRepository } from './auth.repository';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import {
  buildCompositeToken,
  generateSecureToken,
  hashToken,
  parseCompositeToken,
  verifyTokenHash,
} from '../../utils/token';
import {
  emailVerificationTemplate,
  sendEmail,
} from '../../utils/email';
import { UserRecord, UserRole } from './auth.types';

const VERIFY_EXPIRY_HOURS = 24;

export class AuthVerificationService {
  shouldEnforceVerification(role: UserRole): boolean {
    if (role === 'alumni') return env.REQUIRE_ALUMNI_EMAIL_VERIFICATION;
    if (role === 'student') return env.REQUIRE_STUDENT_EMAIL_VERIFICATION;
    if (role === 'admin') return env.REQUIRE_ADMIN_EMAIL_VERIFICATION;
    return false;
  }

  assertEmailVerified(user: UserRecord): void {
    if (this.shouldEnforceVerification(user.role) && !user.is_verified) {
      throw new AppError('Please verify your email', 403);
    }
  }

  async sendVerificationEmail(userId: string): Promise<void> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.is_verified) {
      throw new AppError('Email is already verified', 400);
    }

    const secret = generateSecureToken();
    const composite = buildCompositeToken(user.id, secret);
    const tokenHash = await hashToken(secret);
    const expiresAt = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000);

    await authRepository.setEmailVerificationToken(String(user.id), tokenHash, expiresAt);

    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(composite)}`;
    const template = emailVerificationTemplate(verifyUrl, user.name || user.first_name);

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async verifyEmail(compositeToken: string): Promise<void> {
    const parsed = parseCompositeToken(compositeToken);
    if (!parsed) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    const user = await authRepository.findUserById(parsed.userId);
    if (!user || !user.email_verification_token || !user.email_verification_expires) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    if (new Date() > new Date(user.email_verification_expires)) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    const isValid = await verifyTokenHash(parsed.secret, user.email_verification_token);
    if (!isValid) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await authRepository.markEmailVerified(String(user.id));
  }
}

export const authVerificationService = new AuthVerificationService();
