import { userManagementRepository } from './user-management.repository';

export class UserManagementService {
  async verifyAlumni(userId: string, isVerified: boolean) {
    const user = await userManagementRepository.verifyAlumni(userId, isVerified);
    if (!user) throw new Error('User not found');
    return user;
  }

  async getAllUsers() {
    return await userManagementRepository.getAllUsers();
  }
}

export const userManagementService = new UserManagementService();
