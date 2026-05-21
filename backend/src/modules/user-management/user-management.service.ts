import bcrypt from 'bcryptjs';
import { userManagementRepository } from './user-management.repository';
import { AppError } from '../../utils/AppError';
import { UserRole } from '../auth/auth.types';

export class UserManagementService {
  /**
   * Admin creates a student account
   * Students can only be created by admins, not through public registration
   */
  async createStudent(name: string, email: string, password: string) {
    const existingUser = await userManagementRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userManagementRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'student',
      isVerified: true, // Students created by admin are auto-verified
      provider: 'local',
    });

    return {
      id: String(user.id),
      name: user.name || '',
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.created_at,
    };
  }

  /**
   * Super admin creates another admin account
   */
  async createAdmin(name: string, email: string, password: string) {
    const existingUser = await userManagementRepository.findUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userManagementRepository.createUser({
      name,
      email,
      passwordHash,
      role: 'admin',
      isVerified: true,
      provider: 'local',
    });

    return {
      id: String(user.id),
      name: user.name || '',
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      created_at: user.created_at,
    };
  }

  /**
   * Admin verifies an alumni account
   */
  async verifyAlumni(userId: string, isVerified: boolean) {
    const user = await userManagementRepository.verifyAlumni(userId, isVerified);
    if (!user) throw new AppError('User not found', 404);
    return {
      id: String(user.id),
      name: user.name || '',
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      updated_at: user.updated_at,
    };
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers() {
    const users = await userManagementRepository.getAllUsers();
    return users.map(user => ({
      id: String(user.id),
      name: user.name || '',
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      provider: user.provider || 'local',
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }

  /**
   * Get users by role (admin only)
   */
  async getUsersByRole(role: UserRole) {
    const users = await userManagementRepository.getUsersByRole(role);
    return users.map(user => ({
      id: String(user.id),
      name: user.name || '',
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
      provider: user.provider || 'local',
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }

  /**
   * Delete a user (admin only)
   */
  async deleteUser(userId: string) {
    const user = await userManagementRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      throw new AppError('Cannot delete admin accounts', 403);
    }

    await userManagementRepository.deleteUser(userId);
    return { message: 'User deleted successfully' };
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole) {
    const user = await userManagementRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent changing admin role
    if (user.role === 'admin' || newRole === 'admin') {
      throw new AppError('Cannot modify admin role', 403);
    }

    const updatedUser = await userManagementRepository.updateUserRole(userId, newRole);
    return {
      id: String(updatedUser.id),
      name: updatedUser.name || '',
      email: updatedUser.email,
      role: updatedUser.role,
      is_verified: updatedUser.is_verified,
      updated_at: updatedUser.updated_at,
    };
  }
}

export const userManagementService = new UserManagementService();
