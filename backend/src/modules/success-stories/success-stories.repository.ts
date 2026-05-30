import pool from '../../core/config/db';

export class SuccessStoriesRepository {
  async getAllStories() {
    const query = `
      SELECT s.*, u.name as admin_name 
      FROM success_stories s
      LEFT JOIN users u ON s.created_by = u.id
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async createStory(title: string, content: string, alumniName: string, alumniDesignation: string, imageUrl: string, createdBy: string, category: string = 'story') {
    const query = `
      INSERT INTO success_stories (title, content, alumni_name, alumni_designation, image_url, created_by, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const result = await pool.query(query, [title, content, alumniName, alumniDesignation, imageUrl, createdBy, category]);
    return result.rows[0];
  }

  async deleteStory(id: string) {
    const query = `
      DELETE FROM success_stories WHERE id = $1 RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export const successStoriesRepository = new SuccessStoriesRepository();
