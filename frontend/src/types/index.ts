export type UserRole = 'admin' | 'student' | 'alumni';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_verified?: boolean;
  is_approved?: boolean;
  avatar_url?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
