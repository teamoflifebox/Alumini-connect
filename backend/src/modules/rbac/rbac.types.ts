export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Capability {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RoleCapability {
  id: number;
  role_id: number;
  capability_id: number;
  created_at: Date;
}

export interface UserCapability {
  id: number;
  user_id: number;
  capability_id: number;
  granted_by: number | null;
  created_at: Date;
}

export interface UserPermissions {
  userId: number;
  role: string;
  roleCapabilities: string[];
  userCapabilities: string[];
  allCapabilities: string[];
}

export interface PermissionCheckOptions {
  requireAll?: boolean; // If true, user must have ALL capabilities. If false, user needs ANY
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  userId: number;
  approvedBy: number;
  reason?: string;
}
