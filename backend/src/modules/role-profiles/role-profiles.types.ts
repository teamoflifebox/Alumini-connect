import { PrimaryRole } from '../auth/auth.types';

// ============================================
// COMMON PROFILE FIELDS (ALL ROLES)
// ============================================
export interface CommonProfileFields {
  name: string;
  email: string;
  profilePhoto?: string;
  bio?: string;
  location?: string;
}

// ============================================
// ACTIVITY TRACKING
// ============================================
export interface ActivityLog {
  action: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// ============================================
// ROLE-SPECIFIC DATA STRUCTURES
// ============================================

// Student Profile
export interface InternshipExperience {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

export interface StudentProject {
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
  startDate?: string;
  endDate?: string;
}

export interface EducationDetail {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  grade?: string;
}

export interface StudentRoleData {
  skills: string[];
  education: EducationDetail[];
  projects: StudentProject[];
  interests: string[];
  internshipAvailable: boolean;
  internshipExperience: InternshipExperience[];
}

// Alumni Profile
export interface WorkExperience {
  company: string;
  designation: string;
  startDate: string;
  endDate?: string;
  description?: string;
  location?: string;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
  category?: string;
}

export interface AlumniRoleData {
  skills: string[];
  workExperience: WorkExperience[];
  education: EducationDetail[];
  achievements: Achievement[];
  interests: string[];
  graduationYear?: number;
  currentCompany?: string;
  currentDesignation?: string;
}

// Recruiter Profile
export interface CompanyDetails {
  website?: string;
  size?: string;
  description?: string;
  headquarters?: string;
}

export interface RecruiterRoleData {
  companyName: string;
  designation: string;
  hiringRoles: string[];
  industry: string;
  companyDetails?: CompanyDetails;
  postedJobs?: string[]; // Array of job IDs
  yearsInRecruitment?: number;
}

// Admin Profile
export interface AdminRoleData {
  department: string;
  permissions: string[];
  systemAccessLevel: 'full' | 'limited' | 'read-only';
  managedModules?: string[];
  adminNotes?: string;
}

// Donor Profile
export interface ContributionHistory {
  amount: number;
  date: string;
  campaign?: string;
  purpose: string;
  transactionId?: string;
}

export interface DonorRoleData {
  organizationName?: string;
  contributionHistory: ContributionHistory[];
  interests: string[];
  donationType: 'individual' | 'corporate' | 'foundation';
  engagementActivity: string[];
  totalContributed?: number;
  preferredCauses?: string[];
}

// ============================================
// UNION TYPE FOR ALL ROLE DATA
// ============================================
export type RoleSpecificData = 
  | StudentRoleData 
  | AlumniRoleData 
  | RecruiterRoleData 
  | AdminRoleData 
  | DonorRoleData;

// ============================================
// MAIN PROFILE INTERFACE
// ============================================
export interface RoleBasedProfile {
  id: string;
  userId: string;
  role: PrimaryRole;
  commonFields: CommonProfileFields;
  roleSpecificData: RoleSpecificData;
  activityLogs: ActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// DATABASE RECORD INTERFACE
// ============================================
export interface ProfileRecord {
  id: string;
  user_id: string;
  role: PrimaryRole;
  common_fields: CommonProfileFields;
  role_specific_data: RoleSpecificData;
  activity_logs: ActivityLog[];
  created_at: Date;
  updated_at: Date;
}

// ============================================
// DTO INTERFACES
// ============================================
export interface CreateProfileDTO {
  userId: string;
  role: PrimaryRole;
  commonFields: CommonProfileFields;
  roleSpecificData: RoleSpecificData;
}

export interface UpdateProfileDTO {
  commonFields?: Partial<CommonProfileFields>;
  roleSpecificData?: Partial<RoleSpecificData>;
}

export interface AddActivityDTO {
  action: string;
  metadata?: Record<string, any>;
}

// ============================================
// RESPONSE INTERFACES
// ============================================
export interface ProfileResponse {
  success: boolean;
  data: RoleBasedProfile;
  message?: string;
}

export interface ProfileListResponse {
  success: boolean;
  data: RoleBasedProfile[];
  total: number;
  page?: number;
  limit?: number;
}

// ============================================
// QUERY INTERFACES
// ============================================
export interface ProfileQueryOptions {
  role?: PrimaryRole;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ============================================
// TYPE GUARDS
// ============================================
export function isStudentRoleData(data: RoleSpecificData): data is StudentRoleData {
  return 'internshipAvailable' in data && 'projects' in data;
}

export function isAlumniRoleData(data: RoleSpecificData): data is AlumniRoleData {
  return 'workExperience' in data && 'achievements' in data;
}

export function isRecruiterRoleData(data: RoleSpecificData): data is RecruiterRoleData {
  return 'companyName' in data && 'hiringRoles' in data;
}

export function isAdminRoleData(data: RoleSpecificData): data is AdminRoleData {
  return 'department' in data && 'systemAccessLevel' in data;
}

export function isDonorRoleData(data: RoleSpecificData): data is DonorRoleData {
  return 'contributionHistory' in data && 'donationType' in data;
}
