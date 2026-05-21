import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/** bcrypt cost for stored reset-token hashes (must match verify) */
export const TOKEN_BCRYPT_ROUNDS = 12;

/** bcrypt cost for new passwords set via reset-password */
export const PASSWORD_BCRYPT_ROUNDS = 12;

/**
 * Generate a cryptographically secure random token (hex).
 * Used for password reset secrets and similar opaque values.
 */
export const generateSecureToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/** Hash a raw token before persisting (never store plaintext reset secrets). */
export const hashToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, TOKEN_BCRYPT_ROUNDS);
};

/** Compare a raw token with its stored bcrypt hash. */
export const verifyTokenHash = async (token: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(token, hash);
};

/**
 * Opaque transport token: `userId.secretHex`
 * DB stores only bcrypt(secret); userId allows lookup without scanning all users.
 */
export const buildCompositeToken = (userId: string | number, secret: string): string => {
  return `${userId}.${secret}`;
};

export const parseCompositeToken = (composite: string): { userId: string; secret: string } | null => {
  const dotIndex = composite.indexOf('.');
  if (dotIndex <= 0) return null;

  const userId = composite.slice(0, dotIndex);
  const secret = composite.slice(dotIndex + 1);

  if (!userId || !secret) return null;
  return { userId, secret };
};
