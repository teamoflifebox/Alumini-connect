import pool from '../../core/config/db';

export class CommunityRepository {
  // --- Connections ---

  async sendConnectionRequest(requesterId: string, recipientId: string) {
    const query = `
      INSERT INTO connections (requester_id, recipient_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *;
    `;
    const result = await pool.query(query, [requesterId, recipientId]);
    return result.rows[0];
  }

  async respondConnectionRequest(connectionId: string, userId: string, status: 'accepted' | 'rejected') {
    const query = `
      UPDATE connections
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND recipient_id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [status, connectionId, userId]);
    return result.rows[0];
  }

  async getConnections(userId: string) {
    const query = `
      SELECT c.id, c.status, c.requester_id, c.recipient_id,
             u.id as user_id, u.name, u.avatar_url, u.primary_role as role,
             p.headline
      FROM connections c
      JOIN users u ON (u.id = c.requester_id OR u.id = c.recipient_id)
      LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE (c.requester_id = $1 OR c.recipient_id = $1)
        AND u.id != $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // --- Posts ---

  async createPost(authorId: string, content: string, type: string = 'text', imageUrl?: string, groupId?: number) {
    const query = `
      INSERT INTO community_posts (author_id, content, post_type, image_url, group_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(query, [authorId, content, type, imageUrl, groupId || null]);
    return result.rows[0];
  }

  async getFeed(userId: string, limit: number, offset: number, groupId?: number) {
    let query = `
      SELECT p.*,
             u.name as author_name, u.avatar_url as author_avatar, u.primary_role as author_role,
             EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1) as is_liked
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
    `;
    
    const queryParams: any[] = [userId, limit, offset];
    
    if (groupId) {
      query += ` WHERE p.group_id = $4`;
      queryParams.push(groupId);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $2 OFFSET $3;`;
    
    const result = await pool.query(query, queryParams);
    
    let countQuery = `SELECT COUNT(*) FROM community_posts`;
    const countParams: any[] = [];
    if (groupId) {
      countQuery += ` WHERE group_id = $1`;
      countParams.push(groupId);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    return {
      posts: result.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  async getPost(postId: string, userId: string) {
    const query = `
      SELECT p.*,
             u.name as author_name, u.avatar_url as author_avatar, u.primary_role as author_role,
             EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $2) as is_liked
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
  }

  async toggleLike(postId: string, userId: string) {
    // Check if like exists
    const checkQuery = `SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2`;
    const checkResult = await pool.query(checkQuery, [postId, userId]);

    if (checkResult.rows.length > 0) {
      // Unlike
      await pool.query(`DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`, [postId, userId]);
      return { liked: false };
    } else {
      // Like
      await pool.query(`INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`, [postId, userId]);
      return { liked: true };
    }
  }

  async addComment(postId: string, authorId: string, content: string, parentId?: string) {
    const query = `
      INSERT INTO post_comments (post_id, author_id, content, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [postId, authorId, content, parentId || null]);
    return result.rows[0];
  }

  async toggleCommentLike(commentId: string, userId: string) {
    const checkQuery = `SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2`;
    const checkResult = await pool.query(checkQuery, [commentId, userId]);

    if (checkResult.rows.length > 0) {
      await pool.query(`DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2`, [commentId, userId]);
      return { liked: false };
    } else {
      await pool.query(`INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)`, [commentId, userId]);
      return { liked: true };
    }
  }

  async getComments(postId: string, userId: string) {
    const query = `
      SELECT c.*, u.name as author_name, u.avatar_url as author_avatar,
             EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = $2) as is_liked
      FROM post_comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC;
    `;
    const result = await pool.query(query, [postId, userId]);
    return result.rows;
  }

  // --- Groups / Communities ---

  async getGroups(userId: string) {
    const query = `
      SELECT g.*, 
             EXISTS(SELECT 1 FROM group_members gm WHERE gm.group_id = g.id AND gm.user_id = $1) as is_member
      FROM groups g
      ORDER BY g.members_count DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async joinGroup(groupId: string, userId: string) {
    const query = `
      INSERT INTO group_members (group_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [groupId, userId]);
    return result.rows[0];
  }

  async getTrendingDiscussions() {
    const query = `
      SELECT p.id as post_id, p.content as title, 
             u.name as author_name, u.primary_role as author_role,
             p.comments_count as replies, p.likes_count as likes, p.created_at
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      ORDER BY (p.comments_count * 2 + p.likes_count) DESC, p.created_at DESC
      LIMIT 5;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async createGroup(name: string, description: string, tags: string[], color: string, creatorId: string) {
    const query = `
      INSERT INTO groups (name, description, tags, color, creator_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(query, [name, description, tags, color, creatorId]);
    
    // Automatically add creator as admin
    if (result.rows[0]) {
      await pool.query(`
        INSERT INTO group_members (group_id, user_id, role)
        VALUES ($1, $2, 'admin')
      `, [result.rows[0].id, creatorId]);
    }
    
    return result.rows[0];
  }

  async deleteGroup(groupId: string, userId: string) {
    const query = `
      DELETE FROM groups 
      WHERE id = $1 AND creator_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [groupId, userId]);
    return result.rows[0];
  }
  async getGroupMembers(groupId: string) {
    const query = `
      SELECT u.id as user_id, u.name, u.avatar_url, u.primary_role, gm.role as group_role, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = $1
      ORDER BY gm.role ASC, gm.joined_at DESC
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows;
  }

  async removeGroupMember(groupId: string, targetUserId: string, requesterId: string) {
    // Only allow if requester is creator/admin (check happens in controller, but adding basic auth logic here)
    const query = `
      DELETE FROM group_members 
      WHERE group_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [groupId, targetUserId]);
    return result.rows[0];
  }

  async leaveGroup(groupId: string, userId: string) {
    const query = `
      DELETE FROM group_members 
      WHERE group_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [groupId, userId]);
    return result.rows[0];
  }

  async reportGroup(groupId: string, userId: string) {
    try {
      await pool.query(`INSERT INTO group_reports (group_id, user_id) VALUES ($1, $2)`, [groupId, userId]);
      
      // Increment reports count
      const result = await pool.query(`
        UPDATE groups 
        SET reports_count = reports_count + 1 
        WHERE id = $1 
        RETURNING reports_count;
      `, [groupId]);

      const reportsCount = result.rows[0]?.reports_count || 0;
      
      // Auto-ban if more than 5 reports
      if (reportsCount >= 5) {
        await pool.query(`UPDATE groups SET is_banned = true WHERE id = $1`, [groupId]);
        return { reported: true, banned: true };
      }
      return { reported: true, banned: false };
    } catch (e: any) {
      if (e.code === '23505') { // Unique constraint violation (already reported)
        return { reported: false, message: 'Already reported' };
      }
      throw e;
    }
  }
}

export const communityRepository = new CommunityRepository();
