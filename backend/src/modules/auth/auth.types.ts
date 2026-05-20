export type UserRole = 'admin' | 'student' | 'alumni';
export type AuthProvider = 'local' | 'google' | 'linkedin';

export interface UserRecord {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  refresh_token: string | null;
  is_verified?: boolean;
  provider?: AuthProvider | string;
  provider_id?: string | null;
  avatar_url?: string | null;
  reset_password_token?: string | null;
  reset_password_expires?: Date | null;
  email_verification_token?: string | null;
  email_verification_expires?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_verified?: boolean;
  provider?: string;
  avatar_url?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
