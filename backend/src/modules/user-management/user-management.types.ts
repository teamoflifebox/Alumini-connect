export interface UserAccount {
  id: string; // The central user_id
  email: string;
  role: 'Student' | 'Alumni' | 'Recruiter' | 'Donor' | 'Admin';
  is_verified_alumni: boolean;
  is_suspended: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface VerifyAlumniDTO {
  user_id: string;
  is_verified: boolean;
}
