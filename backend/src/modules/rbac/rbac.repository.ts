import pool from '../../core/config/db';
import { Role, Capability, UserPermissions } from './rbac.types';

export class RBACRepository {
  // ==================== ROLES ====================
  
  async getAllRoles(): Promise<Role[]> {
    const result = await pool.query('SELECT * FROM roles WHERE is_active = TRUE ORDER BY name');
    return result.rows;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    const result = await pool.query('SELECT * FROM roles WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  async createRole(name: string, displayName: string, description?: string): Promise<Role> {
    const result = await pool.query(
      'INSERT INTO roles (name, display_name, description) VALUES ($1, $2, $3) RETURNING *',
      [name, displayName, description]
    );
    return result.rows[0];
  }

  // ==================== CAPABILITIES ====================
  
  async getAllCapabilities(): Promise<Capability[]> {
    const result = await pool.query(
      'SELECT * FROM capabilities WHERE is_active = TRUE ORDER BY category, name'
    );
    return result.rows;
  }

  async getCapabilityByName(name: string): Promise<Capability | null> {
    const result = await pool.query('SELECT * FROM capabilities WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  async createCapability(
    name: string,
    displayName: string,
    description?: string,
    category?: string
  ): Promise<Capability> {
    const result = await pool.query(
      'INSERT INTO capabilities (name, display_name, description, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, displayName, description, category]
    );
    return result.rows[0];
  }

  // ==================== ROLE CAPABILITIES ====================
  
  async getRoleCapabilities(roleId: number): Promise<Capability[]> {
    const result = await pool.query(
      `SELECT c.* FROM capabilities c
       INNER JOIN role_capabilities rc ON c.id = rc.capability_id
       WHERE rc.role_id = $1 AND c.is_active = TRUE`,
      [roleId]
    );
    return result.rows;
  }

  async getRoleCapabilitiesByName(roleName: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT c.name FROM capabilities c
       INNER JOIN role_capabilities rc ON c.id = rc.capability_id
       INNER JOIN roles r ON rc.role_id = r.id
       WHERE r.name = $1 AND c.is_active = TRUE`,
      [roleName]
    );
    return result.rows.map(row => row.name);
  }

  async assignCapabilityToRole(roleId: number, capabilityId: number): Promise<void> {
    await pool.query(
      'INSERT INTO role_capabilities (role_id, capability_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [roleId, capabilityId]
    );
  }

  async removeCapabilityFromRole(roleId: number, capabilityId: number): Promise<void> {
    await pool.query(
      'DELETE FROM role_capabilities WHERE role_id = $1 AND capability_id = $2',
      [roleId, capabilityId]
    );
  }

  // ==================== USER CAPABILITIES ====================
  
  async getUserCapabilities(userId: number): Promise<Capability[]> {
    const result = await pool.query(
      `SELECT c.* FROM capabilities c
       INNER JOIN user_capabilities uc ON c.id = uc.capability_id
       WHERE uc.user_id = $1 AND c.is_active = TRUE`,
      [userId]
    );
    return result.rows;
  }

  async getUserCapabilityNames(userId: number): Promise<string[]> {
    const result = await pool.query(
      `SELECT c.name FROM capabilities c
       INNER JOIN user_capabilities uc ON c.id = uc.capability_id
       WHERE uc.user_id = $1 AND c.is_active = TRUE`,
      [userId]
    );
    return result.rows.map(row => row.name);
  }

  async grantCapabilityToUser(
    userId: number,
    capabilityId: number,
    grantedBy: number
  ): Promise<void> {
    await pool.query(
      'INSERT INTO user_capabilities (user_id, capability_id, granted_by) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [userId, capabilityId, grantedBy]
    );
  }

  async revokeCapabilityFromUser(userId: number, capabilityId: number): Promise<void> {
    await pool.query(
      'DELETE FROM user_capabilities WHERE user_id = $1 AND capability_id = $2',
      [userId, capabilityId]
    );
  }

  // ==================== USER PERMISSIONS ====================
  
  async getUserPermissions(userId: number): Promise<UserPermissions | null> {
    // Get user primary_role
    const userResult = await pool.query('SELECT primary_role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return null;
    
    const primaryRole = userResult.rows[0].primary_role;

    // Get role capabilities (from primary role)
    const roleCapabilities = await this.getRoleCapabilitiesByName(primaryRole);

    // Get user-specific capabilities
    const userCapabilities = await this.getUserCapabilityNames(userId);

    // Get module capabilities
    const moduleCapabilities = await this.getUserModuleCapabilities(userId);

    // Combine all capabilities (remove duplicates)
    const allCapabilities = Array.from(new Set([
      ...roleCapabilities,
      ...userCapabilities,
      ...moduleCapabilities
    ]));

    return {
      userId,
      role: primaryRole,
      roleCapabilities,
      userCapabilities,
      allCapabilities,
    };
  }

  // ==================== MODULE MANAGEMENT ====================

  async getAllModules(): Promise<any[]> {
    const result = await pool.query(
      'SELECT * FROM modules WHERE is_active = TRUE ORDER BY name'
    );
    return result.rows;
  }

  async getModuleByName(name: string): Promise<any | null> {
    const result = await pool.query('SELECT * FROM modules WHERE name = $1', [name]);
    return result.rows[0] || null;
  }

  async getUserModules(userId: number): Promise<string[]> {
    const result = await pool.query(
      `SELECT m.name FROM modules m
       INNER JOIN user_modules um ON m.id = um.module_id
       WHERE um.user_id = $1 AND um.enabled = TRUE AND m.is_active = TRUE`,
      [userId]
    );
    return result.rows.map(row => row.name);
  }

  async getUserModuleCapabilities(userId: number): Promise<string[]> {
    const result = await pool.query(
      `SELECT DISTINCT c.name FROM capabilities c
       INNER JOIN module_capabilities mc ON c.id = mc.capability_id
       INNER JOIN user_modules um ON mc.module_id = um.module_id
       WHERE um.user_id = $1 AND um.enabled = TRUE AND c.is_active = TRUE`,
      [userId]
    );
    return result.rows.map(row => row.name);
  }

  async enableModuleForUser(userId: number, moduleName: string, activatedBy: number): Promise<void> {
    const module = await this.getModuleByName(moduleName);
    if (!module) throw new Error('Module not found');

    await pool.query(
      `INSERT INTO user_modules (user_id, module_id, enabled, activated_by, activated_at)
       VALUES ($1, $2, TRUE, $3, NOW())
       ON CONFLICT (user_id, module_id) DO UPDATE SET enabled = TRUE, activated_at = NOW()`,
      [userId, module.id, activatedBy]
    );
  }

  async disableModuleForUser(userId: number, moduleName: string): Promise<void> {
    const module = await this.getModuleByName(moduleName);
    if (!module) throw new Error('Module not found');

    await pool.query(
      'UPDATE user_modules SET enabled = FALSE WHERE user_id = $1 AND module_id = $2',
      [userId, module.id]
    );
  }

  // ==================== APPROVAL MANAGEMENT ====================
  
  async getPendingUsers(): Promise<any[]> {
    const result = await pool.query(
      `SELECT id, name, email, primary_role as role, created_at, is_verified
       FROM users
       WHERE approval_status = 'pending'
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async approveUser(userId: number, approvedBy: number): Promise<void> {
    await pool.query(
      `UPDATE users
       SET is_approved = TRUE,
           approval_status = 'approved',
           approved_by = $2,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [userId, approvedBy]
    );
  }

  async rejectUser(userId: number, approvedBy: number, reason?: string): Promise<void> {
    await pool.query(
      `UPDATE users
       SET is_approved = FALSE,
           approval_status = 'rejected',
           approved_by = $2,
           approved_at = NOW(),
           rejection_reason = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [userId, approvedBy, reason]
    );
  }

  // ==================== CAPABILITY GROUP REQUESTS ====================

  async createCapabilityRequest(
    userId: number,
    capabilityGroupName: string,
    reason?: string
  ): Promise<any> {
    const module = await this.getModuleByName(capabilityGroupName);
    if (!module) throw new Error('Capability group not found');

    const result = await pool.query(
      `INSERT INTO capability_requests (user_id, capability_group_id, reason, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [userId, module.id, reason]
    );
    return result.rows[0];
  }

  async getPendingCapabilityRequests(): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
         cr.id,
         cr.user_id,
         u.name as user_name,
         u.email as user_email,
         u.primary_role as user_role,
         m.name as capability_group_name,
         m.display_name as capability_group_display_name,
         cr.reason,
         cr.status,
         cr.created_at
       FROM capability_requests cr
       INNER JOIN users u ON cr.user_id = u.id
       INNER JOIN modules m ON cr.capability_group_id = m.id
       WHERE cr.status = 'pending'
       ORDER BY cr.created_at DESC`
    );
    return result.rows;
  }

  async approveCapabilityRequest(requestId: number, adminId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get the request details
      const requestResult = await client.query(
        'SELECT user_id, capability_group_id FROM capability_requests WHERE id = $1',
        [requestId]
      );
      
      if (requestResult.rows.length === 0) {
        throw new Error('Capability request not found');
      }

      const { user_id, capability_group_id } = requestResult.rows[0];

      // Enable the module for the user
      await client.query(
        `INSERT INTO user_modules (user_id, module_id, enabled, activated_by, activated_at)
         VALUES ($1, $2, TRUE, $3, NOW())
         ON CONFLICT (user_id, module_id) DO UPDATE SET enabled = TRUE, activated_at = NOW()`,
        [user_id, capability_group_id, adminId]
      );

      // Update the request status
      await client.query(
        `UPDATE capability_requests
         SET status = 'approved',
             reviewed_by = $2,
             reviewed_at = NOW()
         WHERE id = $1`,
        [requestId, adminId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rejectCapabilityRequest(requestId: number, adminId: number, reason?: string): Promise<void> {
    await pool.query(
      `UPDATE capability_requests
       SET status = 'rejected',
           reviewed_by = $2,
           reviewed_at = NOW(),
           rejection_reason = $3
       WHERE id = $1`,
      [requestId, adminId, reason]
    );
  }

  async getUserCapabilityRequests(userId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
         cr.id,
         m.name as capability_group_name,
         m.display_name as capability_group_display_name,
         cr.reason,
         cr.status,
         cr.rejection_reason,
         cr.created_at,
         cr.reviewed_at
       FROM capability_requests cr
       INNER JOIN modules m ON cr.capability_group_id = m.id
       WHERE cr.user_id = $1
       ORDER BY cr.created_at DESC`,
      [userId]
    );
    return result.rows;
  }
}

export const rbacRepository = new RBACRepository();
