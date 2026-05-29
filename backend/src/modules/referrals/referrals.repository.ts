import pool from '../../core/config/db';

export interface CreateReferralDTO {
  userId: number;
  companyName: string;
  rolePosition: string;
  referralLink: string;
  jobDescription: string;
  skillsRequired: string[];
  deadline: string | null;
  location: string | null;
  workType: string | null;
  salary: string | null;
  experienceRequired: string | null;
  openings: number | null;
}

export interface ApplyReferralDTO {
  referralId: number;
  applicantId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  resumeUrl: string;
  skills: string[];
  course: string | null;
  year: string | null;
  cgpa: string | null;
  portfolioLinks: any; // JSON object
}

export class ReferralsRepository {
  async createReferral(data: CreateReferralDTO) {
    const query = `
      INSERT INTO referrals (
        user_id, company_name, role_position, referral_link, 
        job_description, skills_required, deadline, location, 
        work_type, salary, experience_required, openings
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      data.userId, data.companyName, data.rolePosition, data.referralLink,
      data.jobDescription, data.skillsRequired, data.deadline, data.location,
      data.workType, data.salary, data.experienceRequired, data.openings
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getAllReferrals(userId: number, search?: string, company?: string, role?: string, location?: string) {
    let query = `
      SELECT r.*, u.name as posted_by_name, u.email as posted_by_email,
             a.id as user_application_id, a.current_status as user_application_status
      FROM referrals r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN referral_applications a ON a.referral_id = r.id AND a.applicant_id = $1
      WHERE 1=1
    `;
    
    const values: any[] = [userId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (r.company_name ILIKE $${paramIndex} OR r.role_position ILIKE $${paramIndex} OR r.job_description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }
    
    if (company) {
      query += ` AND r.company_name ILIKE $${paramIndex}`;
      values.push(`%${company}%`);
      paramIndex++;
    }
    
    if (role) {
      query += ` AND r.role_position ILIKE $${paramIndex}`;
      values.push(`%${role}%`);
      paramIndex++;
    }
    
    if (location) {
      query += ` AND r.location ILIKE $${paramIndex}`;
      values.push(`%${location}%`);
      paramIndex++;
    }

    query += ' ORDER BY r.created_at DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  async getReferralById(id: number) {
    const query = `
      SELECT r.*, u.name as posted_by_name, u.email as posted_by_email 
      FROM referrals r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  async getReferralsByUser(userId: number) {
    const query = `
      SELECT r.*, 
             (SELECT COUNT(*) FROM referral_applications WHERE referral_id = r.id) as application_count
      FROM referrals r
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async updateReferralStatus(id: number, status: string, userId: number) {
    const query = `
      UPDATE referrals 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [status, id, userId]);
    return result.rows[0];
  }

  async applyToReferral(data: ApplyReferralDTO) {
    const query = `
      INSERT INTO referral_applications (
        referral_id, applicant_id, full_name, email, phone_number,
        resume_url, skills, course, year, cgpa, portfolio_links
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      data.referralId, data.applicantId, data.fullName, data.email, data.phoneNumber,
      data.resumeUrl, data.skills, data.course, data.year, data.cgpa, data.portfolioLinks
    ];
    
    const result = await pool.query(query, values);
    
    // Create initial history entry
    await this.addApplicationHistory(result.rows[0].id, 'Applied', data.applicantId);
    
    return result.rows[0];
  }

  async getApplicationsForReferral(referralId: number, ownerId: number) {
    // Ensure the user asking is the owner of the referral
    const authCheck = await pool.query('SELECT user_id FROM referrals WHERE id = $1', [referralId]);
    if (authCheck.rows.length === 0 || authCheck.rows[0].user_id !== ownerId) {
      throw new Error('Unauthorized or referral not found');
    }

    const query = `
      SELECT a.*, u.name as applicant_name, u.avatar_url 
      FROM referral_applications a
      JOIN users u ON a.applicant_id = u.id
      WHERE a.referral_id = $1
      ORDER BY a.created_at DESC
    `;
    const result = await pool.query(query, [referralId]);
    return result.rows;
  }

  async getApplication(applicationId: number) {
    const query = `
      SELECT a.*, r.user_id as referral_owner_id, r.company_name, r.role_position
      FROM referral_applications a
      JOIN referrals r ON a.referral_id = r.id
      WHERE a.id = $1
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows[0];
  }

  async updateApplicationStatus(applicationId: number, status: string, changedBy: number) {
    const query = `
      UPDATE referral_applications 
      SET current_status = $1, updated_at = NOW() 
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, applicationId]);
    
    if (result.rows.length > 0) {
      await this.addApplicationHistory(applicationId, status, changedBy);
    }
    
    return result.rows[0];
  }

  async addApplicationHistory(applicationId: number, status: string, changedBy: number) {
    const query = `
      INSERT INTO referral_application_history (application_id, status, changed_by)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [applicationId, status, changedBy]);
  }

  async getApplicationHistory(applicationId: number) {
    const query = `
      SELECT h.*, u.name as changed_by_name 
      FROM referral_application_history h
      JOIN users u ON h.changed_by = u.id
      WHERE h.application_id = $1
      ORDER BY h.created_at DESC
    `;
    const result = await pool.query(query, [applicationId]);
    return result.rows;
  }

  async addLeaderboardScore(userId: number, points: number) {
    const query = `
      INSERT INTO leaderboard_scores (user_id, total_score)
      VALUES ($1, $2)
      ON CONFLICT (user_id) 
      DO UPDATE SET total_score = leaderboard_scores.total_score + $2
      RETURNING *
    `;
    const result = await pool.query(query, [userId, points]);
    return result.rows[0];
  }

  async getLeaderboard() {
    const query = `
      SELECT l.total_score, u.id, u.name, u.avatar_url, u.primary_role
      FROM leaderboard_scores l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.total_score DESC
      LIMIT 20
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

export const referralsRepository = new ReferralsRepository();
