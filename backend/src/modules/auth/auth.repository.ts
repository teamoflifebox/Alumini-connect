import pool from '../../config/database';
import { AuthProvider, UserRecord, UserRole } from './auth.types';

const splitName = (name: string) => {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName, fullName: trimmed };
};

export class AuthRepository {
  async findUserByEmail(email: string): Promise<UserRecord | undefined> {
    const result = await pool.query<UserRecord>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0];
  }

  async findUserById(id: string): Promise<UserRecord | undefined> {
    const result = await pool.query<UserRecord>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async findUserByProvider(
    provider: AuthProvider,
    providerId: string
  ): Promise<UserRecord | undefined> {
    const result = await pool.query<UserRecord>(
      'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
      [provider, providerId]
    );
    return result.rows[0];
  }

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isVerified?: boolean;
    provider?: AuthProvider;
    providerId?: string;
    avatarUrl?: string;
  }): Promise<UserRecord> {
    const { firstName, lastName, fullName } = splitName(data.name);
    const result = await pool.query<UserRecord>(
      `INSERT INTO users (
         first_name, last_name, name, email, password_hash, role,
         is_verified, provider, provider_id, avatar_url
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        firstName,
        lastName,
        fullName,
        data.email,
        data.passwordHash,
        data.role,
        data.isVerified ?? false,
        data.provider ?? 'local',
        data.providerId ?? null,
        data.avatarUrl ?? null,
      ]
    );
    return result.rows[0];
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    await pool.query(
      `UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2`,
      [refreshTokenHash, userId]
    );
  }

  async setPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    await pool.query(
      `UPDATE users
       SET reset_password_token = $1, reset_password_expires = $2, updated_at = NOW()
       WHERE id = $3`,
      [tokenHash, expiresAt, userId]
    );
  }

  async clearPasswordResetToken(userId: string) {
    await pool.query(
      `UPDATE users
       SET reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  }

  async updatePassword(userId: string, passwordHash: string) {
    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [passwordHash, userId]
    );
  }

  async setEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date) {
    await pool.query(
      `UPDATE users
       SET email_verification_token = $1, email_verification_expires = $2, updated_at = NOW()
       WHERE id = $3`,
      [tokenHash, expiresAt, userId]
    );
  }

  async markEmailVerified(userId: string) {
    await pool.query(
      `UPDATE users
       SET is_verified = true,
           email_verification_token = NULL,
           email_verification_expires = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  }

  async linkOAuthProvider(
    userId: string,
    data: {
      provider: AuthProvider;
      providerId: string;
      avatarUrl?: string;
      isVerified?: boolean;
    }
  ) {
    await pool.query(
      `UPDATE users
       SET provider = $1, provider_id = $2, avatar_url = COALESCE($3, avatar_url),
           is_verified = COALESCE($4, is_verified), updated_at = NOW()
       WHERE id = $5`,
      [data.provider, data.providerId, data.avatarUrl ?? null, data.isVerified ?? true, userId]
    );
  }
}

export const authRepository = new AuthRepository();
