import { api } from './client';

export interface Referral {
  id: number;
  user_id: number;
  company_name: string;
  role_position: string;
  referral_link: string;
  job_description: string;
  skills_required: string[];
  deadline: string | null;
  location: string | null;
  work_type: string | null;
  salary: string | null;
  experience_required: string | null;
  openings: number | null;
  status: string;
  created_at: string;
  
  posted_by_name?: string;
  posted_by_email?: string;
  application_count?: string | number; // Returned as string from Postgres COUNT
  
  // Tracked via JOIN for current user
  user_application_id?: number;
  user_application_status?: string;
}

export interface ReferralApplication {
  id: number;
  referral_id: number;
  applicant_id: number;
  full_name: string;
  email: string;
  phone_number: string | null;
  resume_url: string;
  skills: string[];
  course: string | null;
  year: string | null;
  cgpa: string | null;
  portfolio_links: any;
  current_status: string;
  created_at: string;
  
  applicant_name?: string;
  avatar_url?: string;
}

export interface CreateReferralParams {
  companyName: string;
  rolePosition: string;
  jobDescription: string;
  referralLink?: string;
  skillsRequired?: string[];
  deadline?: string;
  location?: string;
  workType?: string;
  salary?: string;
  experienceRequired?: string;
  openings?: number;
}

export interface ApplyReferralParams {
  fullName: string;
  email: string;
  resumeUrl: string;
  phoneNumber?: string;
  skills?: string[];
  course?: string;
  year?: string;
  cgpa?: string;
  portfolioLinks?: any;
}

export const referralsApi = {
  createReferral: async (data: CreateReferralParams): Promise<Referral> => {
    const res = await api.post('/referrals', data);
    return res.data.data;
  },

  getAllReferrals: async (params?: { search?: string; company?: string; role?: string; location?: string }): Promise<Referral[]> => {
    const res = await api.get('/referrals', { params });
    return res.data.data;
  },

  getMyPostedReferrals: async (): Promise<Referral[]> => {
    const res = await api.get('/referrals/my-posted');
    return res.data.data;
  },

  getReferralById: async (id: number): Promise<Referral> => {
    const res = await api.get(`/referrals/${id}`);
    return res.data.data;
  },

  closeReferral: async (id: number): Promise<Referral> => {
    const res = await api.patch(`/referrals/${id}/close`);
    return res.data.data;
  },

  applyToReferral: async (id: number, data: ApplyReferralParams): Promise<ReferralApplication> => {
    const res = await api.post(`/referrals/${id}/apply`, data);
    return res.data.data;
  },

  getApplications: async (referralId: number): Promise<ReferralApplication[]> => {
    const res = await api.get(`/referrals/${referralId}/applications`);
    return res.data.data;
  },

  updateApplicationStatus: async (appId: number, status: string): Promise<ReferralApplication> => {
    const res = await api.patch(`/referrals/applications/${appId}/status`, { status });
    return res.data.data;
  },

  getLeaderboard: async (): Promise<any[]> => {
    const res = await api.get('/referrals/leaderboard');
    return res.data.data;
  }
};
