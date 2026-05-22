export interface UserProfile {
  id: number;
  user_id: number; // References users(id)
  first_name: string;
  last_name: string;
  headline?: string;
  bio?: string;
  
  // Contact & Personal Info
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  emergency_contacts?: Array<{
    name: string;
    relation: string;
    phone: string;
  }>;
  
  // Professional Info
  target_roles?: string[];
  skills?: string[];
  work_experience?: Array<{
    company: string;
    role: string;
    start_date: string;
    end_date?: string;
    current?: boolean;
    description?: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    major: string;
    year: number;
    cgpa?: string;
  }>;
  
  // Social Links
  social_links?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  
  // Match/Search preferences
  is_open_to_work: boolean;
  is_mentor_available: boolean;
  preferences?: Record<string, any>;
  
  created_at: Date;
  updated_at: Date;
}

export type UpdateProfileDTO = Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
