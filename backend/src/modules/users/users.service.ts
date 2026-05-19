import { usersRepository } from './users.repository';

export class UsersService {
  async getUserById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getAllUsers() {
    return await usersRepository.findAll();
  }
}

export const usersService = new UsersService();
