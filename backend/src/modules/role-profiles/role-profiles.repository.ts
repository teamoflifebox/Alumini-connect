import pool from '../../config/database';
import {
  RoleBasedProfile,
  ProfileRecord,
  CreateProfileDTO,
  UpdateProfileDTO,
  ActivityLog,
  ProfileQueryOptions,
} from './role-profiles.types';
import { PrimaryRole } from '../auth/auth.types';

export class RoleProfilesRepository {
  /**
   * Create a new role-based profile
   */
  async createProfile(data: CreateProfileDTO): Promise<RoleBasedProfile> {
    const query = `
      INSERT INTO role_based_profiles (
        user_id,
        role,
        common_fields,
        role_specific_data,
        activity_logs
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const initialActivityLog: ActivityLog = {
      action: 'profile_created',
      timestamp: new Date(),
      metadata: { role: data.role },
    };

    const values = [
      data.userId,
      data.role,
      JSON.stringify(data.commonFields),
      JSON.stringify(data.roleSpecificData),
      JSON.stringify([initialActivityLog]),
    ];

    const result = await pool.query<ProfileRecord>(query, values);
    return this.mapRecordToProfile(result.rows[0]);
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<RoleBasedProfile | null> {
    const query = `
      SELECT * FROM role_based_profiles
      WHERE user_id = $1
    `;

    const result = await pool.query<ProfileRecord>(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRecordToProfile(result.rows[0]);
  }

  /**
   * Get profile by profile ID
   */
  async getProfileById(profileId: string): Promise<RoleBasedProfile | null> {
    const query = `
      SELECT * FROM role_based_profiles
      WHERE id = $1
    `;

    const result = await pool.query<ProfileRecord>(query, [profileId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRecordToProfile(result.rows[0]);
  }

  /**
   * Update profile
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileDTO
  ): Promise<RoleBasedProfile> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get current profile
      const currentProfile = await this.getProfileByUserId(userId);
      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      // Merge updates
      const updatedCommonFields = {
        ...currentProfile.commonFields,
        ...(data.commonFields || {}),
      };

      const updatedRoleSpecificData = {
        ...currentProfile.roleSpecificData,
        ...(data.roleSpecificData || {}),
      };

      // Add activity log
      const activityLog: ActivityLog = {
        action: 'profile_updated',
        timestamp: new Date(),
        metadata: {
          updatedFields: Object.keys(data.commonFields || {}).concat(
            Object.keys(data.roleSpecificData || {})
          ),
        },
      };

      const updatedActivityLogs = [...currentProfile.activityLogs, activityLog];

      // Update query
      const query = `
        UPDATE role_based_profiles
        SET 
          common_fields = $1,
          role_specific_data = $2,
          activity_logs = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4
        RETURNING *
      `;

      const values = [
        JSON.stringify(updatedCommonFields),
        JSON.stringify(updatedRoleSpecificData),
        JSON.stringify(updatedActivityLogs),
        userId,
      ];

      const result = await client.query<ProfileRecord>(query, values);

      await client.query('COMMIT');

      return this.mapRecordToProfile(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add activity log to profile
   */
  async addActivity(
    userId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<RoleBasedProfile> {
    const currentProfile = await this.getProfileByUserId(userId);
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    const activityLog: ActivityLog = {
      action,
      timestamp: new Date(),
      metadata,
    };

    const updatedActivityLogs = [...currentProfile.activityLogs, activityLog];

    const query = `
      UPDATE role_based_profiles
      SET 
        activity_logs = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING *
    `;

    const values = [JSON.stringify(updatedActivityLogs), userId];

    const result = await pool.query<ProfileRecord>(query, values);
    return this.mapRecordToProfile(result.rows[0]);
  }

  /**
   * Delete profile
   */
  async deleteProfile(userId: string): Promise<boolean> {
    const query = `
      DELETE FROM role_based_profiles
      WHERE user_id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get profiles by role with pagination
   */
  async getProfilesByRole(
    role: PrimaryRole,
    options: ProfileQueryOptions = {}
  ): Promise<{ profiles: RoleBasedProfile[]; total: number }> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Count query
    const countQuery = `
      SELECT COUNT(*) FROM role_based_profiles
      WHERE role = $1
    `;
    const countResult = await pool.query(countQuery, [role]);
    const total = parseInt(countResult.rows[0].count, 10);

    // Data query
    const dataQuery = `
      SELECT * FROM role_based_profiles
      WHERE role = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;

    const dataResult = await pool.query<ProfileRecord>(dataQuery, [role, limit, offset]);

    const profiles = dataResult.rows.map((record) => this.mapRecordToProfile(record));

    return { profiles, total };
  }

  /**
   * Search profiles by name or email
   */
  async searchProfiles(
    searchTerm: string,
    options: ProfileQueryOptions = {}
  ): Promise<{ profiles: RoleBasedProfile[]; total: number }> {
    const { page = 1, limit = 10, role } = options;
    const offset = (page - 1) * limit;

    const searchPattern = `%${searchTerm}%`;

    // Build WHERE clause
    let whereClause = `
      (common_fields->>'name' ILIKE $1 OR common_fields->>'email' ILIKE $1)
    `;
    const queryParams: any[] = [searchPattern];

    if (role) {
      whereClause += ` AND role = $${queryParams.length + 1}`;
      queryParams.push(role);
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*) FROM role_based_profiles
      WHERE ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count, 10);

    // Data query
    const dataQuery = `
      SELECT * FROM role_based_profiles
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    const dataResult = await pool.query<ProfileRecord>(
      dataQuery,
      [...queryParams, limit, offset]
    );

    const profiles = dataResult.rows.map((record) => this.mapRecordToProfile(record));

    return { profiles, total };
  }

  /**
   * Check if profile exists for user
   */
  async profileExists(userId: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(SELECT 1 FROM role_based_profiles WHERE user_id = $1)
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0].exists;
  }

  /**
   * Get all profiles with pagination
   */
  async getAllProfiles(
    options: ProfileQueryOptions = {}
  ): Promise<{ profiles: RoleBasedProfile[]; total: number }> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Count query
    const countQuery = `SELECT COUNT(*) FROM role_based_profiles`;
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count, 10);

    // Data query
    const dataQuery = `
      SELECT * FROM role_based_profiles
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $1 OFFSET $2
    `;

    const dataResult = await pool.query<ProfileRecord>(dataQuery, [limit, offset]);

    const profiles = dataResult.rows.map((record) => this.mapRecordToProfile(record));

    return { profiles, total };
  }

  /**
   * Map database record to profile object
   */
  private mapRecordToProfile(record: ProfileRecord): RoleBasedProfile {
    return {
      id: record.id,
      userId: record.user_id,
      role: record.role,
      commonFields: record.common_fields,
      roleSpecificData: record.role_specific_data,
      activityLogs: record.activity_logs,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const roleProfilesRepository = new RoleProfilesRepository();
