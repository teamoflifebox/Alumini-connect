// Primary Role represents user identity (5 roles)
// - admin: Platform administrators
// - student: Current students (created by admin)
// - alumni: Graduated students
// - recruiter: Company HR professionals
// - donor: Philanthropists/sponsors
export type PrimaryRole = 'admin' | 'student' | 'alumni' | 'recruiter' | 'donor';

// Capability Groups represent optional features (5 groups, available to ALL roles)
// - mentor: Offer mentorship to students
// - recruiter: Post jobs and manage recruitment
// - donor: Make donations and support fundraising
// - community_moderator: Moderate community forums
// - event_host: Organize and manage events
// NOTE: These are called "modules" in the database but conceptually they are capability groups
export type CapabilityGroup = 'mentor' | 'recruiter' | 'donor' | 'community_moderator' | 'event_host';

// Alias for backward compatibility (modules are now called capability groups)
export type ModuleName = CapabilityGroup;

export type AuthProvider = 'local' | 'google' | 'linkedin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// For backward compatibility during migration
export type UserRole = PrimaryRole;

export interface UserRecord {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  password_hash: string;
  primary_role: PrimaryRole;
  role?: PrimaryRole; // Alias for backward compatibility
  refresh_token: string | null;
  is_verified?: boolean;
  is_approved?: boolean;
  approval_status?: ApprovalStatus;
  approved_by?: number | null;
  approved_at?: Date | null;
  rejection_reason?: string | null;
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
  primary_role: PrimaryRole;
  capability_groups?: CapabilityGroup[]; // Renamed from modules for clarity
  is_verified?: boolean;
  is_approved?: boolean;
  approval_status?: ApprovalStatus;
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
  primary_role: PrimaryRole;
  capability_groups?: CapabilityGroup[]; // Renamed from modules for clarity
}
