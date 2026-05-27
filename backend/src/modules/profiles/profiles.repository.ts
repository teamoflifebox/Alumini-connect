import pool from '../../core/config/db';
import { UpdateProfileDTO, UserProfile } from './profiles.types';

export class ProfilesRepository {
  async getProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    const query = 'SELECT * FROM profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<UserProfile> {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return (await this.getProfileByUserId(userId)) as UserProfile;
    }

    const setClauses: string[] = [];
    const values: any[] = [userId]; // $1
    let paramIndex = 2;

    for (const key of keys) {
      setClauses.push(`${key} = $${paramIndex}`);
      
      const val = data[key as keyof UpdateProfileDTO];
      // Convert arrays/objects to JSON for postgres JSONB columns if needed
      if (typeof val === 'object' && val !== null) {
        values.push(JSON.stringify(val));
      } else {
        values.push(val);
      }
      
      paramIndex++;
    }

    // Upsert logic: If the profile doesn't exist, we should probably insert it.
    // However, UPDATE ... RETURNING is easier. If it returns 0 rows, we can INSERT.
    const updateQuery = `
      UPDATE profiles 
      SET ${setClauses.join(', ')}, updated_at = NOW() 
      WHERE user_id = $1 
      RETURNING *;
    `;
    
    let result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      // Profile doesn't exist, insert it
      const insertColumns = ['user_id', ...keys];
      const insertPlaceholders = ['$1', ...keys.map((_, i) => `$${i + 2}`)];
      const insertQuery = `
        INSERT INTO profiles (${insertColumns.join(', ')})
        VALUES (${insertPlaceholders.join(', ')})
        RETURNING *;
      `;
      result = await pool.query(insertQuery, values);
    }
    
    return result.rows[0];
  }

  async searchUsers(searchQuery: string) {
    const query = `
      SELECT u.id, u.name, u.email, u.primary_role as role, p.designation as headline
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.name ILIKE $1 OR u.email ILIKE $1
      LIMIT 10;
    `;
    const result = await pool.query(query, [`%${searchQuery}%`]);
    return result.rows;
  }
}

export const profilesRepository = new ProfilesRepository();
