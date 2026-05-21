import pool from '../../core/config/db';
import { UserRole } from '../auth/auth.types';

interface CreateUserParams {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  provider: string;
}

export class UserManagementRepository {
  async findUserByEmail(email: string) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async findUserById(userId: string) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  }

  async createUser(params: CreateUserParams) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, is_verified, provider, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [params.name, params.email, params.passwordHash, params.role, params.isVerified, params.provider]
    );
    return result.rows[0];
  }

  async verifyAlumni(userId: string, isVerified: boolean) {
    const result = await pool.query(
      'UPDATE users SET is_verified = $1, updated_at = NOW() WHERE id = $2 AND role = $3 RETURNING *',
      [isVerified, userId, 'alumni']
    );
    return result.rows[0];
  }

  async getAllUsers() {
    const result = await pool.query(
      'SELECT id, name, email, role, is_verified, provider, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getUsersByRole(role: UserRole) {
    const result = await pool.query(
      'SELECT id, name, email, role, is_verified, provider, created_at, updated_at FROM users WHERE role = $1 ORDER BY created_at DESC',
      [role]
    );
    return result.rows;
  }

  async deleteUser(userId: string) {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newRole, userId]
    );
    return result.rows[0];
  }
}

export const userManagementRepository = new UserManagementRepository();
