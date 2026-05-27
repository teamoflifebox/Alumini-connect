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

  async searchUsers(query: string) {
    if (!query || query.trim().length < 2) return [];
    return await profilesRepository.searchUsers(query.trim());
  }
}

export const profilesService = new ProfilesService();
