import bcrypt from 'bcryptjs';
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
  passwordResetEmailTemplate,
  sendEmail,
} from '../../utils/email';

const RESET_EXPIRY_MINUTES = 15;

export class AuthPasswordService {
  /** Always returns success message to prevent email enumeration */
  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);

    if (!user) return;

    // OAuth-only accounts cannot reset password via email
    if (user.provider && user.provider !== 'local') return;

    const secret = generateSecureToken();
    const composite = buildCompositeToken(user.id, secret);
    const tokenHash = await hashToken(secret);
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000);

    await authRepository.setPasswordResetToken(String(user.id), tokenHash, expiresAt);

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(composite)}`;
    const template = passwordResetEmailTemplate(resetUrl, user.name || user.first_name);

    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  async resetPassword(compositeToken: string, newPassword: string): Promise<void> {
    const parsed = parseCompositeToken(compositeToken);
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

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(String(user.id), passwordHash);
    await authRepository.clearPasswordResetToken(String(user.id));
    await authRepository.updateRefreshToken(String(user.id), null);
  }
}

export const authPasswordService = new AuthPasswordService();
