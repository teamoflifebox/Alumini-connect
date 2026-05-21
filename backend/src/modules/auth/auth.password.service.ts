import bcrypt from 'bcryptjs';
import { authRepository } from './auth.repository';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import {
  PASSWORD_BCRYPT_ROUNDS,
  buildCompositeToken,
  generateSecureToken,
  hashToken,
  parseCompositeToken,
  verifyTokenHash,
} from '../../utils/token';
import { passwordResetEmailTemplate, sendEmail } from '../../utils/email';

/** Reset link validity (minutes). */
const RESET_EXPIRY_MINUTES = 15;

/**
 * Forgot / reset password domain logic.
 * - No email enumeration (forgot always succeeds from caller's perspective).
 * - Only bcrypt(secret) persisted; transport token is opaque composite `userId.secret`.
 */
export class AuthPasswordService {
  /**
   * Request password reset. If user exists and is local provider, store hashed secret + expiry and email.
   * OAuth-only accounts are ignored silently (same generic response to caller).
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);

    if (!user) return;

    if (user.provider && user.provider !== 'local') return;

    const secret = generateSecureToken(32);
    const rawTransportToken = buildCompositeToken(user.id, secret);
    const tokenHash = await hashToken(secret);
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000);

    await authRepository.setPasswordResetToken(String(user.id), tokenHash, expiresAt);

    const baseUrl = env.FRONTEND_URL.replace(/\/$/, '');
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawTransportToken)}`;
    const template = passwordResetEmailTemplate(resetUrl, user.name || user.first_name);

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      passwordReset: true,
      passwordResetUrl: resetUrl,
    });
  }

  /**
   * Complete reset: validate composite token, expiry, bcrypt match; set new password; clear reset + refresh.
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const parsed = parseCompositeToken(rawToken);
    if (!parsed) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const user = await authRepository.findUserById(parsed.userId);
    if (!user || !user.reset_password_token || !user.reset_password_expires) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    if (new Date() > new Date(user.reset_password_expires)) {
      await authRepository.clearPasswordResetToken(String(user.id));
      throw new AppError('Invalid or expired reset token', 400);
    }

    const isValid = await verifyTokenHash(parsed.secret, user.reset_password_token);
    if (!isValid) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_BCRYPT_ROUNDS);
    await authRepository.updatePassword(String(user.id), passwordHash);
    await authRepository.clearPasswordResetToken(String(user.id));
    await authRepository.updateRefreshToken(String(user.id), null);
  }
}

export const authPasswordService = new AuthPasswordService();
