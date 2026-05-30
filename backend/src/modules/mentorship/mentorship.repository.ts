import pool from '../../core/config/db';

export interface CreateSessionParams {
  mentorId: number;
  title: string;
  skills: string[];
  duration: string;
  session_type?: string;
  meeting_mode?: string;
  meeting_url?: string;
  start_time?: string;
  end_time?: string;
  max_participants?: number;
  visibility?: string;
  thumbnail_url?: string;
  target_domain?: string;
  selected_participants?: number[];
}

export class MentorshipRepository {
  async createSession(params: CreateSessionParams) {
    const query = `
      INSERT INTO mentorship_sessions (
        mentor_id, title, skills, duration, session_type, 
        meeting_mode, meeting_url, start_time, end_time, 
        max_participants, visibility, thumbnail_url, target_domain,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *;
    `;
    const result = await pool.query(query, [
      params.mentorId,
      params.title,
      JSON.stringify(params.skills),
      params.duration,
      params.session_type || 'Public',
      params.meeting_mode || 'Custom',
      params.meeting_url || null,
      params.start_time || null,
      params.end_time || null,
      params.max_participants || null,
      params.visibility || 'Public',
      params.thumbnail_url || null,
      params.target_domain || null,
    ]);
    return result.rows[0];
  }

  async getSessionById(sessionId: number) {
    const query = `
      SELECT 
        ms.*,
        u.name as mentor_name,
        up.designation as mentor_headline,
        COALESCE(
          (SELECT json_agg(user_id) FROM mentorship_session_attendees WHERE session_id = ms.id),
          '[]'::json
        ) as attendee_ids
      FROM mentorship_sessions ms
      LEFT JOIN users u ON ms.mentor_id = u.id
      LEFT JOIN profiles up ON ms.mentor_id = up.user_id
      WHERE ms.id = $1;
    `;
    const result = await pool.query(query, [sessionId]);
    return result.rows[0];
  }

  async getAllSessions() {
    const query = `
      SELECT 
        ms.*,
        u.name as mentor_name,
        up.designation as mentor_headline,
        COALESCE(
          (SELECT json_agg(user_id) FROM mentorship_session_attendees WHERE session_id = ms.id),
          '[]'::json
        ) as attendee_ids
      FROM mentorship_sessions ms
      LEFT JOIN users u ON ms.mentor_id = u.id
      LEFT JOIN profiles up ON ms.mentor_id = up.user_id
      ORDER BY ms.created_at DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async deleteSession(sessionId: number) {
    const query = 'DELETE FROM mentorship_sessions WHERE id = $1 RETURNING *;';
    const result = await pool.query(query, [sessionId]);
    return result.rows[0];
  }

  async joinSession(sessionId: number, userId: number) {
    const query = `
      INSERT INTO mentorship_session_attendees (session_id, user_id, joined_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (session_id, user_id) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [sessionId, userId]);
    return result.rows[0];
  }

  async leaveSession(sessionId: number, userId: number) {
    const query = `
      DELETE FROM mentorship_session_attendees
      WHERE session_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [sessionId, userId]);
    return result.rows[0];
  }

  /**
   * Performs database keyword search across title, mentor name, and individual skills.
   * Serves as our fully-featured PostgreSQL fallback.
   */
  async searchSessionsInPostgres(searchQuery: string) {
    const queryTerm = `%${searchQuery}%`;
    const query = `
      SELECT 
        ms.*,
        u.name as mentor_name,
        up.designation as mentor_headline,
        COALESCE(
          (SELECT json_agg(user_id) FROM mentorship_session_attendees WHERE session_id = ms.id),
          '[]'::json
        ) as attendee_ids
      FROM mentorship_sessions ms
      LEFT JOIN users u ON ms.mentor_id = u.id
      LEFT JOIN profiles up ON ms.mentor_id = up.user_id
      WHERE 
        ms.title ILIKE $1
        OR u.name ILIKE $1
        OR up.designation ILIKE $1
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(ms.skills) AS skill
          WHERE skill ILIKE $1
        )
      ORDER BY ms.created_at DESC;
    `;
    const result = await pool.query(query, [queryTerm]);
    return result.rows;
  }

  /**
   * Fetches sessions by a list of IDs.
   * Useful when combining with Typesense search results.
   */
  async getSessionsByIds(ids: number[]) {
    if (!ids || ids.length === 0) return [];
    
    const query = `
      SELECT 
        ms.*,
        u.name as mentor_name,
        up.designation as mentor_headline,
        COALESCE(
          (SELECT json_agg(user_id) FROM mentorship_session_attendees WHERE session_id = ms.id),
          '[]'::json
        ) as attendee_ids
      FROM mentorship_sessions ms
      LEFT JOIN users u ON ms.mentor_id = u.id
      LEFT JOIN profiles up ON ms.mentor_id = up.user_id
      WHERE ms.id = ANY($1::int[])
      ORDER BY ms.created_at DESC;
    `;
    const result = await pool.query(query, [ids]);
    return result.rows;
  }

  async getUsersByDomain(domain: string) {
    const query = `
      SELECT u.id, u.name, CASE WHEN us.show_email = false THEN 'Hidden' ELSE u.email END as email
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN user_settings us ON u.id = us.user_id
      WHERE (us.public_profile = true OR us.public_profile IS NULL) AND (
        EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(p.target_roles) AS role
          WHERE role ILIKE $1
        ) OR EXISTS (
          SELECT 1 FROM unnest(p.skills) AS skill
          WHERE skill ILIKE $1
        )
      )
    `;
    // We do a loose match
    const result = await pool.query(query, [`%${domain}%`]);
    return result.rows;
  }
  /**
   * Recommends sessions based on the user's skills from their profile.
   * Matches session JSONB skills with user's ARRAY skills.
   */
  async getRecommendedSessions(userId: number) {
    const query = `
      WITH user_skills AS (
        SELECT unnest(skills) as skill
        FROM profiles
        WHERE user_id = $1
      )
      SELECT
        ms.*,
        u.name as mentor_name,
        up.designation as mentor_headline,
        COALESCE(
          (SELECT json_agg(user_id) FROM mentorship_session_attendees WHERE session_id = ms.id),
          '[]'::json
        ) as attendee_ids
      FROM mentorship_sessions ms
      LEFT JOIN users u ON ms.mentor_id = u.id
      LEFT JOIN profiles up ON ms.mentor_id = up.user_id
      WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(ms.skills) AS session_skill
        JOIN user_skills us ON session_skill ILIKE '%' || us.skill || '%'
      )
      AND ms.visibility IN ('Public', 'Skill-Targeted')
      ORDER BY ms.created_at DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
  async inviteUser(sessionId: number, userId: number) {
    const query = `
      INSERT INTO session_invitations (session_id, user_id, status, created_at, updated_at)
      VALUES ($1, $2, 'pending', NOW(), NOW())
      ON CONFLICT (session_id, user_id) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [sessionId, userId]);
    return result.rows[0];
  }

  async getInvitations(userId: number) {
    const query = `
      SELECT si.*, ms.title as session_title, u.name as mentor_name 
      FROM session_invitations si
      JOIN mentorship_sessions ms ON si.session_id = ms.id
      JOIN users u ON ms.mentor_id = u.id
      WHERE si.user_id = $1 AND si.status = 'pending'
      ORDER BY si.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async respondToInvitation(invitationId: number, userId: number, status: string) {
    const query = `
      UPDATE session_invitations
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [status, invitationId, userId]);
    return result.rows[0];
  }
}

export const mentorshipRepository = new MentorshipRepository();
