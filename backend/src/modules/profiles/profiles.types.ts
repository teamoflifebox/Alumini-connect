export interface UserProfile {
  id: string;
  user_id: string; // References the core User Account
  first_name: string;
  last_name: string;
  batch_year: number;
  department: string;
  
  // Professional details
  current_company?: string;
  designation?: string;
  experience_years?: number;
  
  // Matching & Search
  skills: string[];
  domains: string[];
  
  // Preferences
  is_mentor_available: boolean;
  preferences: Record<string, any>;
  
  created_at: Date;
  updated_at: Date;
}

export interface UpdateProfileDTO {
  first_name?: string;
  last_name?: string;
  current_company?: string;
  designation?: string;
  skills?: string[];
  domains?: string[];
  is_mentor_available?: boolean;
}
