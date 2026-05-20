import pool from '../../core/config/db';

export class UserManagementRepository {
  async verifyAlumni(userId: string, isVerified: boolean) {
    const query = 'UPDATE users SET is_verified_alumni = $1 WHERE id = $2 RETURNING id, email, is_verified_alumni';
    const result = await pool.query(query, [isVerified, userId]);
    return result.rows[0];
  }

  async getAllUsers() {
    // Admin view of all users
    const query = 'SELECT id, email, role, is_verified_alumni, is_suspended FROM users';
    const result = await pool.query(query);
    return result.rows;
  }
}

export const userManagementRepository = new UserManagementRepository();
