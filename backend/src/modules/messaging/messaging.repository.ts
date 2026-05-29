import pool from '../../core/config/db';

export class MessagingRepository {
  async getOrCreateConversation(user1Id: string, user2Id: string) {
    // Check if conversation exists
    const checkQuery = `
      SELECT c.id FROM conversations c
      JOIN conversation_participants p1 ON c.id = p1.conversation_id AND p1.user_id = $1
      JOIN conversation_participants p2 ON c.id = p2.conversation_id AND p2.user_id = $2
      WHERE c.type = 'direct'
    `;
    const checkResult = await pool.query(checkQuery, [user1Id, user2Id]);

    if (checkResult.rows.length > 0) {
      return checkResult.rows[0];
    }

    // Create new conversation
    const createConvQuery = `INSERT INTO conversations (type) VALUES ('direct') RETURNING id`;
    const convResult = await pool.query(createConvQuery);
    const convId = convResult.rows[0].id;

    // Add participants
    const addParticipantsQuery = `
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES ($1, $2), ($1, $3)
    `;
    await pool.query(addParticipantsQuery, [convId, user1Id, user2Id]);

    return { id: convId };
  }

  async getConversations(userId: string) {
    const query = `
      SELECT c.id, c.updated_at,
             u.id as other_user_id, u.name as other_user_name, u.avatar_url as other_user_avatar,
             (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
             (SELECT is_read FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_read,
             (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.is_read = FALSE) as unread_count
      FROM conversations c
      JOIN conversation_participants p1 ON c.id = p1.conversation_id AND p1.user_id = $1
      JOIN conversation_participants p2 ON c.id = p2.conversation_id AND p2.user_id != $1
      JOIN users u ON p2.user_id = u.id
      ORDER BY c.updated_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getMessages(conversationId: string, limit: number, offset: number) {
    const query = `
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [conversationId, limit, offset]);
    return result.rows.reverse(); // Return chronological order
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    const query = `
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [conversationId, senderId, content]);
    return result.rows[0];
  }

  async markAsRead(conversationId: string, userId: string) {
    // Update participant last_read_at
    await pool.query(`UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2`, [conversationId, userId]);
    // Mark messages not from me as read
    await pool.query(`UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`, [conversationId, userId]);
  }
}

export const messagingRepository = new MessagingRepository();
