import { UserRole } from '../auth/auth.types';

export interface UserManagementUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  provider: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyAlumniRequest {
  user_id: string;
  is_verified: boolean;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface DeleteUserResponse {
  message: string;
}
