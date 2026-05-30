import pool from '../../config/database';
import { UserSettings } from './settings.types';

export class SettingsRepository {
  async getSettingsByUserId(userId: string): Promise<UserSettings | null> {
    const result = await pool.query<UserSettings>(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async createDefaultSettings(userId: string): Promise<UserSettings> {
    const result = await pool.query<UserSettings>(
      `INSERT INTO user_settings (user_id) 
       VALUES ($1) 
       RETURNING *`,
      [userId]
    );
    return result.rows[0];
  }

  async updateSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    const fields: string[] = [];
    const values: any[] = [];
    let queryIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${queryIndex}`);
        values.push(value);
        queryIndex++;
      }
    });

    if (fields.length === 0) {
      const existing = await this.getSettingsByUserId(userId);
      return existing!;
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE user_settings 
      SET ${fields.join(', ')} 
      WHERE user_id = $${queryIndex} 
      RETURNING *
    `;

    const result = await pool.query<UserSettings>(query, values);
    return result.rows[0];
  }
}

export const settingsRepository = new SettingsRepository();
