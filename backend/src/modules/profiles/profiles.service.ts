import { profilesRepository } from './profiles.repository';
import { UpdateProfileDTO } from './profiles.types';

export class ProfilesService {
  async getProfile(userId: string) {
    const profile = await profilesRepository.getProfileByUserId(userId);
    return profile || null;
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    return await profilesRepository.updateProfile(userId, data);
  }

  async searchProfiles(filters: any, limit: number, offset: number, currentUserId?: string) {
    return await profilesRepository.searchProfiles(filters, limit, offset, currentUserId);
  }
}

export const profilesService = new ProfilesService();
