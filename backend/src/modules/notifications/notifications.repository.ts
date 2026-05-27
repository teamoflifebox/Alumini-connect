import pool from '../../core/config/db';

export class NotificationsRepository {
  /**
   * Create a single notification
   */
  async createNotification(userId: number, title: string, message: string, type: string, targetId?: string) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, target_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, message, type, targetId || null]
    );
    return result.rows[0];
  }

  /**
   * Bulk create notifications for multiple users efficiently
   */
  async createBulkNotifications(userIds: number[], title: string, message: string, type: string, targetId?: string) {
    if (!userIds || userIds.length === 0) return [];

    // Use UNNEST to bulk insert
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, target_id)
       SELECT unnest($1::int[]), $2, $3, $4, $5
       RETURNING *`,
      [userIds, title, message, type, targetId || null]
    );
    return result.rows;
  }
}

export const notificationsRepository = new NotificationsRepository();
