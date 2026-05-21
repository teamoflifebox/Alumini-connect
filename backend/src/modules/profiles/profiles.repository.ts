import pool from '../../core/config/db';
import { UpdateProfileDTO } from './profiles.types';

export class ProfilesRepository {
  async getProfileByUserId(userId: string) {
    const query = 'SELECT * FROM profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    // Basic implementation for skeleton
    const query = `
      UPDATE profiles 
      SET first_name = $1, last_name = $2, current_company = $3, updated_at = NOW() 
      WHERE user_id = $4 
      RETURNING *;
    `;
    const result = await pool.query(query, [data.first_name, data.last_name, data.current_company, userId]);
    return result.rows[0];
  }
}

export const profilesRepository = new ProfilesRepository();
