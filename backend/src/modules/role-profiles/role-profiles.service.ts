import { roleProfilesRepository } from './role-profiles.repository';
import {
  RoleBasedProfile,
  CreateProfileDTO,
  UpdateProfileDTO,
  AddActivityDTO,
  ProfileQueryOptions,
} from './role-profiles.types';
import { PrimaryRole } from '../auth/auth.types';
import {
  validateCreateProfile,
  validateUpdateProfile,
  validateAddActivity,
} from './role-profiles.schema';

export class RoleProfilesService {
  /**
   * Create a new role-based profile
   */
  async createProfile(data: CreateProfileDTO): Promise<RoleBasedProfile> {
    // Validate input
    const validation = validateCreateProfile(data);
    if (!validation.success) {
      throw new Error(
        `Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`
      );
    }

    // Check if profile already exists
    const existingProfile = await roleProfilesRepository.profileExists(data.userId);
    if (existingProfile) {
      throw new Error('Profile already exists for this user');
    }

    // Create profile
    return await roleProfilesRepository.createProfile(validation.data);
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<RoleBasedProfile> {
    const profile = await roleProfilesRepository.getProfileByUserId(userId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }

  /**
   * Get profile by profile ID
   */
  async getProfileById(profileId: string): Promise<RoleBasedProfile> {
    const profile = await roleProfilesRepository.getProfileById(profileId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }

  /**
   * Update profile with role-based validation
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileDTO
  ): Promise<RoleBasedProfile> {
    // Get current profile to determine role
    const currentProfile = await this.getProfileByUserId(userId);

    // Validate update data based on role
    const validation = validateUpdateProfile(currentProfile.role, data);
    if (!validation.success) {
      throw new Error(
        `Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`
      );
    }

    // Perform update
    return await roleProfilesRepository.updateProfile(userId, validation.data);
  }

  /**
   * Add activity log to profile
   */
  async addActivity(userId: string, data: AddActivityDTO): Promise<RoleBasedProfile> {
    // Validate activity data
    const validation = validateAddActivity(data);
    if (!validation.success) {
      throw new Error(
        `Validation failed: ${validation.errors?.map((e) => e.message).join(', ')}`
      );
    }

    return await roleProfilesRepository.addActivity(
      userId,
      validation.data.action,
      validation.data.metadata
    );
  }

  /**
   * Delete profile
   */
  async deleteProfile(userId: string): Promise<boolean> {
    const exists = await roleProfilesRepository.profileExists(userId);
    if (!exists) {
      throw new Error('Profile not found');
    }

    return await roleProfilesRepository.deleteProfile(userId);
  }

  /**
   * Get profiles by role with pagination
   */
  async getProfilesByRole(
    role: PrimaryRole,
    options: ProfileQueryOptions = {}
  ): Promise<{ profiles: RoleBasedProfile[]; total: number }> {
    return await roleProfilesRepository.getProfilesByRole(role, options);
  }

  /**
   * Search profiles
   */
  async searchProfiles(
    searchTerm: string,
    options: ProfileQueryOptions = {}
  ): Promise<{ profiles: RoleBasedProfile[]; total: number }> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }

    return await roleProfilesRepository.searchProfiles(searchTerm, options);
  }

  /**
   * Get all profiles with pagination
   */
  async getAllProfiles(
    options: ProfileQueryOptions = {}
  ): Promise<{ profiles: RoleBasedProfile[]; total: number }> {
    return await roleProfilesRepository.getAllProfiles(options);
  }

  /**
   * Check if profile exists
   */
  async profileExists(userId: string): Promise<boolean> {
    return await roleProfilesRepository.profileExists(userId);
  }

  /**
   * Get profile statistics by role
   */
  async getProfileStats(): Promise<Record<PrimaryRole, number>> {
    const roles: PrimaryRole[] = ['admin', 'student', 'alumni', 'recruiter', 'donor'];
    const stats: Record<string, number> = {};

    for (const role of roles) {
      const { total } = await this.getProfilesByRole(role, { limit: 1 });
      stats[role] = total;
    }

    return stats as Record<PrimaryRole, number>;
  }

  /**
   * Validate role-specific business rules
   */
  private validateRoleSpecificRules(role: PrimaryRole, data: any): void {
    switch (role) {
      case 'student':
        // Student-specific validation
        if (data.roleSpecificData) {
          const { internshipAvailable, internshipExperience } = data.roleSpecificData;
          
          if (internshipAvailable === false && internshipExperience?.length > 0) {
            throw new Error(
              'Cannot add internship experience when internshipAvailable is false'
            );
          }
        }
        break;

      case 'alumni':
        // Alumni-specific validation
        if (data.roleSpecificData?.workExperience) {
          if (data.roleSpecificData.workExperience.length === 0) {
            throw new Error('Alumni must have at least one work experience');
          }
        }
        break;

      case 'recruiter':
        // Recruiter-specific validation
        if (data.roleSpecificData?.hiringRoles) {
          if (data.roleSpecificData.hiringRoles.length === 0) {
            throw new Error('Recruiter must specify at least one hiring role');
          }
        }
        break;

      case 'admin':
        // Admin-specific validation
        if (data.roleSpecificData?.permissions) {
          if (data.roleSpecificData.permissions.length === 0) {
            throw new Error('Admin must have at least one permission');
          }
        }
        break;

      case 'donor':
        // Donor-specific validation
        // No additional rules for now
        break;

      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }
}

export const roleProfilesService = new RoleProfilesService();
