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
      'SELECT *, primary_role as role FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0];
  }

  async findUserById(id: string): Promise<UserRecord | undefined> {
    const result = await pool.query<UserRecord>(
      'SELECT *, primary_role as role FROM users WHERE id = $1',
      [id]
    );
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
    company?: string; // For recruiters
    graduation_year?: number; // For alumni
  }): Promise<UserRecord> {
    const { firstName, lastName, fullName } = splitName(data.name);
    
    // Determine approval status based on role
    // In the new system, everyone is automatically approved. Admin verification is removed.
    const isApproved = true;
    const approvalStatus = 'approved';
    
    const result = await pool.query<UserRecord>(
      `INSERT INTO users (
         first_name, last_name, name, email, password_hash, primary_role,
         is_verified, is_approved, approval_status, provider, provider_id, avatar_url,
         company, graduation_year
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *, primary_role as role`,
      [
        firstName,
        lastName,
        fullName,
        data.email,
        data.passwordHash,
        data.role,
        data.isVerified ?? false,
        isApproved,
        approvalStatus,
        data.provider ?? 'local',
        data.providerId ?? null,
        data.avatarUrl ?? null,
        data.company ?? null,
        data.graduation_year ?? null,
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

  async updateApprovalStatus(
    userId: string,
    status: 'approved' | 'rejected',
    adminId: string,
    reason?: string
  ): Promise<void> {
    const isApproved = status === 'approved';
    await pool.query(
      `UPDATE users 
       SET is_approved = $1, approval_status = $2, approved_by = $3, 
           approved_at = NOW(), rejection_reason = $4, updated_at = NOW()
       WHERE id = $5`,
      [isApproved, status, adminId, reason || null, userId]
    );
  }

  async deleteUser(userId: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }
}

export const authRepository = new AuthRepository();
