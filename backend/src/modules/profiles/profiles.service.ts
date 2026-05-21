import { profilesRepository } from './profiles.repository';
import { UpdateProfileDTO } from './profiles.types';

export class ProfilesService {
  async getProfile(userId: string) {
    const profile = await profilesRepository.getProfileByUserId(userId);
    if (!profile) throw new Error('Profile not found');
    return profile;
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    return await profilesRepository.updateProfile(userId, data);
  }
}

export const profilesService = new ProfilesService();
