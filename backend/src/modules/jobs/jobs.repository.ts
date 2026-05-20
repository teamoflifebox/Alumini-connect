import pool from '../../core/config/db';
import { CreateJobDTO } from './jobs.types';

export class JobsRepository {
  async createJob(userId: string, jobData: CreateJobDTO) {
    // Basic SQL query. We will add more columns to this later!
    const query = `
      INSERT INTO jobs (title, description, company, posted_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [jobData.title, jobData.description, jobData.company, userId]);
    return result.rows[0];
  }

  async getAllJobs() {
    const query = 'SELECT * FROM jobs ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }
}

export const jobsRepository = new JobsRepository();
