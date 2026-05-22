/**
 * Unit tests for RoleProfilesService
 * 
 * To run these tests, you'll need to install Jest:
 * npm install --save-dev jest @types/jest ts-jest
 * 
 * Configure Jest in package.json:
 * "jest": {
 *   "preset": "ts-jest",
 *   "testEnvironment": "node"
 * }
 */

import { roleProfilesService } from '../role-profiles.service';
import { roleProfilesRepository } from '../role-profiles.repository';
import { CreateProfileDTO, RoleBasedProfile } from '../role-profiles.types';

// Mock the repository
jest.mock('../role-profiles.repository');

describe('RoleProfilesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create a valid student profile', async () => {
      const mockProfile: RoleBasedProfile = {
        id: 'profile-uuid',
        userId: 'user-uuid',
        role: 'student',
        commonFields: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        roleSpecificData: {
          skills: ['JavaScript'],
          education: [{
            institution: 'MIT',
            degree: 'BS',
            fieldOfStudy: 'CS',
            startYear: 2020,
          }],
          projects: [],
          interests: [],
          internshipAvailable: false,
          internshipExperience: [],
        },
        activityLogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (roleProfilesRepository.profileExists as jest.Mock).mockResolvedValue(false);
      (roleProfilesRepository.createProfile as jest.Mock).mockResolvedValue(mockProfile);

      const createDTO: CreateProfileDTO = {
        userId: 'user-uuid',
        role: 'student',
        commonFields: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        roleSpecificData: {
          skills: ['JavaScript'],
          education: [{
            institution: 'MIT',
            degree: 'BS',
            fieldOfStudy: 'CS',
            startYear: 2020,
          }],
          projects: [],
          interests: [],
          internshipAvailable: false,
          internshipExperience: [],
        },
      };

      const result = await roleProfilesService.createProfile(createDTO);

      expect(result).toEqual(mockProfile);
      expect(roleProfilesRepository.profileExists).toHaveBeenCalledWith('user-uuid');
      expect(roleProfilesRepository.createProfile).toHaveBeenCalled();
    });

    it('should throw error if profile already exists', async () => {
      (roleProfilesRepository.profileExists as jest.Mock).mockResolvedValue(true);

      const createDTO: CreateProfileDTO = {
        userId: 'user-uuid',
        role: 'student',
        commonFields: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        roleSpecificData: {
          skills: ['JavaScript'],
          education: [],
          projects: [],
          interests: [],
          internshipAvailable: false,
          internshipExperience: [],
        },
      };

      await expect(roleProfilesService.createProfile(createDTO))
        .rejects
        .toThrow('Profile already exists for this user');
    });

    it('should throw validation error for invalid email', async () => {
      const createDTO: CreateProfileDTO = {
        userId: 'user-uuid',
        role: 'student',
        commonFields: {
          name: 'John Doe',
          email: 'invalid-email',
        },
        roleSpecificData: {
          skills: ['JavaScript'],
          education: [],
          projects: [],
          interests: [],
          internshipAvailable: false,
          internshipExperience: [],
        },
      };

      await expect(roleProfilesService.createProfile(createDTO))
        .rejects
        .toThrow('Validation failed');
    });

    it('should enforce internship business rule for students', async () => {
      const createDTO: CreateProfileDTO = {
        userId: 'user-uuid',
        role: 'student',
        commonFields: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        roleSpecificData: {
          skills: ['JavaScript'],
          education: [{
            institution: 'MIT',
            degree: 'BS',
            fieldOfStudy: 'CS',
            startYear: 2020,
          }],
          projects: [],
          interests: [],
          internshipAvailable: false,
          internshipExperience: [{
            company: 'TechCorp',
            role: 'Intern',
            duration: '3 months',
          }],
        },
      };

      await expect(roleProfilesService.createProfile(createDTO))
        .rejects
        .toThrow();
    });
  });

  describe('getProfileByUserId', () => {
    it('should return profile if exists', async () => {
      const mockProfile: RoleBasedProfile = {
        id: 'profile-uuid',
        userId: 'user-uuid',
        role: 'student',
        commonFields: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        roleSpecificData: {
          skills: [],
          education: [],
          projects: [],
          interests: [],
          internshipAvailable: false,
          internshipExperience: [],
        },
        activityLogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (roleProfilesRepository.getProfileByUserId as jest.Mock).mockResolvedValue(mockProfile);

      const result = await roleProfilesService.getProfileByUserId('user-uuid');

      expect(result).toEqual(mockProfile);
      expect(roleProfilesRepository.getProfileByUserId).toHaveBeenCalledWith('user-uuid');
    });

    it('should throw error if profile not found', async () => {
      (roleProfilesRepository.getProfileByUserId as jest.Mock).mockResolvedValue(null);

      await expect(roleProfilesService.getProfileByUserId('user-uuid'))
        .rejects
        .toThrow('Profile not found');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const currentProfile: RoleBasedProfile = {
        id: 'profile-uuid',
        userId: 'user-uuid',
        role: 'student',
        commonFields: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        roleSpecificData: {
          skills: ['JavaScript'],
          education: [],
          projects: [],
          interests: [],
          internshipAvailable: false,
          internshipExperience: [],
        },
        activityLogs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProfile = {
        ...currentProfile,
        roleSpecificData: {
          ...currentProfile.roleSpecificData,
          skills: ['JavaScript', 'TypeScript'],
        },
      };

      (roleProfilesRepository.getProfileByUserId as jest.Mock).mockResolvedValue(currentProfile);
      (roleProfilesRepository.updateProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const result = await roleProfilesService.updateProfile('user-uuid', {
        roleSpecificData: {
          skills: ['JavaScript', 'TypeScript'],
        },
      });

      expect(result.roleSpecificData.skills).toContain('TypeScript');
    });
  });

  describe('getProfileStats', () => {
    it('should return statistics for all roles', async () => {
      (roleProfilesRepository.getProfilesByRole as jest.Mock)
        .mockResolvedValueOnce({ profiles: [], total: 5 })   // admin
        .mockResolvedValueOnce({ profiles: [], total: 150 }) // student
        .mockResolvedValueOnce({ profiles: [], total: 300 }) // alumni
        .mockResolvedValueOnce({ profiles: [], total: 25 })  // recruiter
        .mockResolvedValueOnce({ profiles: [], total: 40 }); // donor

      const stats = await roleProfilesService.getProfileStats();

      expect(stats).toEqual({
        admin: 5,
        student: 150,
        alumni: 300,
        recruiter: 25,
        donor: 40,
      });
    });
  });
});
