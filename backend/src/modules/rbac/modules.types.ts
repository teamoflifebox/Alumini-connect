import { PrimaryRole, ModuleName } from '../auth/auth.types';

export interface Module {
  id: number;
  name: ModuleName;
  display_name: string;
  description: string | null;
  available_to_roles: PrimaryRole[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserModule {
  id: number;
  user_id: number;
  module_id: number;
  enabled: boolean;
  activated_at: Date;
  activated_by: number | null;
  created_at: Date;
}

export interface UserModuleInfo {
  userId: number;
  primaryRole: PrimaryRole;
  modules: ModuleName[];
}
