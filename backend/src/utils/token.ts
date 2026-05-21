import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/** Generate a cryptographically secure random token */
export const generateSecureToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

/** Hash a token before storing in the database */
export const hashToken = async (token: string): Promise<string> => {
  return bcrypt.hash(token, 10);
};

/** Compare a raw token with its stored hash */
export const verifyTokenHash = async (token: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(token, hash);
};

/**
 * Composite token: userId.randomHex
 * Allows lookup by user id while keeping the secret part hashed in DB.
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
