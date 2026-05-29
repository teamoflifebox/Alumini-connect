import pool from '../../core/config/db';
import { UpdateProfileDTO, UserProfile } from './profiles.types';

export class ProfilesRepository {
  async getProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    const query = `
      SELECT p.*, u.name, u.email, u.primary_role as role, u.avatar_url 
      FROM user_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  async searchProfiles(filters: any, limit: number, offset: number, currentUserId?: string): Promise<{ profiles: UserProfile[], total: number }> {
    let query = `
      SELECT p.*, u.id as user_id, u.name, u.email, u.primary_role as role, u.avatar_url 
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramIndex = 1;

    // Exclude admins from the directory
    query += ` AND u.primary_role != 'admin'`;

    if (currentUserId) {
      query += ` AND u.id != $${paramIndex++}`;
      values.push(currentUserId);
    }

    if (filters.role) {
      query += ` AND u.primary_role = $${paramIndex++}`;
      values.push(filters.role);
    }
    
    if (filters.name) {
      query += ` AND u.name ILIKE $${paramIndex++}`;
      values.push(`%${filters.name}%`);
    }

    if (filters.skills) {
      query += ` AND p.skills::jsonb ?| array[$${paramIndex++}::text]`;
      values.push(filters.skills);
    }

    if (filters.company) {
      query += ` AND EXISTS (SELECT 1 FROM jsonb_array_elements(p.work_experience) AS exp WHERE exp->>'company' ILIKE $${paramIndex++})`;
      values.push(`%${filters.company}%`);
    }

    // Count total before pagination
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS sub`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    let orderBy = `ORDER BY p.created_at DESC`;
    
    // Prioritize by matching skills if provided in the search
    if (filters.skills) {
      orderBy = `ORDER BY (
        SELECT COUNT(*)
        FROM jsonb_array_elements_text(COALESCE(p.skills, '[]'::jsonb)) AS s
        WHERE s = ANY($${paramIndex}::text[])
      ) DESC, u.created_at DESC`;
      values.push(filters.skills);
      paramIndex++;
    } else if (currentUserId) {
      // Prioritize by matching skills with the current user
      orderBy = `ORDER BY (
        SELECT COUNT(*)
        FROM jsonb_array_elements_text(COALESCE(p.skills, '[]'::jsonb)) AS target_skill
        JOIN jsonb_array_elements_text(COALESCE((SELECT skills FROM user_profiles WHERE user_id = $${paramIndex}), '[]'::jsonb)) AS current_skill
        ON target_skill = current_skill
      ) DESC, u.created_at DESC`;
      values.push(currentUserId);
      paramIndex++;
    }

    query += ` ${orderBy} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return { profiles: result.rows, total };
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
      UPDATE user_profiles 
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
        INSERT INTO user_profiles (${insertColumns.join(', ')})
        VALUES (${insertPlaceholders.join(', ')})
        RETURNING *;
      `;
      result = await pool.query(insertQuery, values);
    }
    
    return result.rows[0];
  }
}

export const profilesRepository = new ProfilesRepository();
