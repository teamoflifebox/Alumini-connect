import { usersRepository } from './users.repository';
import { AppError } from '../../utils/AppError';

export class UsersService {
  async getUserById(id: string) {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return {
      id: String(user.id),
      name: user.name?.trim() || `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async getAllUsers() {
    return await usersRepository.findAll();
  }
}

export const usersService = new UsersService();
