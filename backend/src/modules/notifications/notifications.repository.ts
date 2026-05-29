import pool from '../../core/config/db';

export class NotificationsRepository {
  /**
   * Create a single notification
   */
  async createNotification(userId: number, title: string, message: string, type: string, targetId?: string) {
    const query = `
      INSERT INTO notifications (user_id, title, message, type, target_id)
      SELECT $1, $2, $3, $4::varchar, $5
      WHERE NOT EXISTS (
        SELECT 1 FROM user_settings 
        WHERE user_id = $1 AND (
          ($4::varchar = 'referral_application' AND referral_notifications = false) OR
          ($4::varchar = 'referral_status_update' AND application_status_updates = false) OR
          ($4::varchar = 'new_referral' AND referral_notifications = false) OR
          ($4::varchar = 'new_user' AND new_user_notifications = false) OR
          ($4::varchar IN ('session_created', 'session_updated', 'session_invite', 'session_deleted', 'new_session') AND mentorship_notifications = false)
        )
      )
      RETURNING *;
    `;
    const result = await pool.query(query, [userId, title, message, type, targetId || null]);
    return result.rows[0];
  }

  /**
   * Bulk create notifications for multiple users efficiently
   */
  async createBulkNotifications(userIds: number[], title: string, message: string, type: string, targetId?: string) {
    if (!userIds || userIds.length === 0) return [];

    // Use UNNEST to bulk insert, but check user_settings for opt-outs
    const query = `
      INSERT INTO notifications (user_id, title, message, type, target_id)
      SELECT u.id, $2, $3, $4::varchar, $5
      FROM unnest($1::int[]) AS u(id)
      WHERE NOT EXISTS (
        SELECT 1 FROM user_settings 
        WHERE user_id = u.id AND (
          ($4::varchar = 'referral_application' AND referral_notifications = false) OR
          ($4::varchar = 'referral_status_update' AND application_status_updates = false) OR
          ($4::varchar = 'new_referral' AND referral_notifications = false) OR
          ($4::varchar = 'new_user' AND new_user_notifications = false) OR
          ($4::varchar IN ('session_created', 'session_updated', 'session_invite', 'session_deleted', 'new_session') AND mentorship_notifications = false)
        )
      )
      RETURNING user_id;
    `;
    
    const result = await pool.query(query, [userIds, title, message, type, targetId || null]);
    return result.rows.map(r => r.user_id);
  }
}

export const notificationsRepository = new NotificationsRepository();
