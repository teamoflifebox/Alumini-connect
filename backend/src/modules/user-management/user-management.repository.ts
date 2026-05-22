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
    const result = await pool.query('SELECT *, primary_role as role FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async findUserById(userId: string) {
    const result = await pool.query('SELECT *, primary_role as role FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  }

  async createUser(params: CreateUserParams) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, primary_role, is_verified, provider, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *, primary_role as role`,
      [params.name, params.email, params.passwordHash, params.role, params.isVerified, params.provider]
    );
    return result.rows[0];
  }



  async getAllUsers() {
    const result = await pool.query(
      'SELECT id, name, email, primary_role as role, is_verified, is_approved, approval_status, provider, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getUsersByRole(role: UserRole) {
    const result = await pool.query(
      'SELECT id, name, email, primary_role as role, is_verified, provider, created_at, updated_at FROM users WHERE primary_role = $1 ORDER BY created_at DESC',
      [role]
    );
    return result.rows;
  }

  async deleteUser(userId: string) {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  }

  async updateUserRole(userId: string, newRole: UserRole) {
    const result = await pool.query(
      'UPDATE users SET primary_role = $1, updated_at = NOW() WHERE id = $2 RETURNING *, primary_role as role',
      [newRole, userId]
    );
    return result.rows[0];
  }
}

export const userManagementRepository = new UserManagementRepository();
