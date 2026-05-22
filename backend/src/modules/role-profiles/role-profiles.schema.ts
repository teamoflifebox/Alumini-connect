import { z } from 'zod';
import { PrimaryRole } from '../auth/auth.types';

// ============================================
// COMMON FIELDS SCHEMA
// ============================================
export const commonFieldsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  profilePhoto: z.string().url('Invalid URL').optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  location: z.string().max(100, 'Location must not exceed 100 characters').optional(),
});

// ============================================
// ACTIVITY LOG SCHEMA
// ============================================
export const activityLogSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// ============================================
// STUDENT ROLE SCHEMA
// ============================================
const internshipExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  duration: z.string().min(1, 'Duration is required'),
  description: z.string().optional(),
});

const studentProjectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  technologies: z.array(z.string()).optional(),
  link: z.string().url('Invalid URL').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const educationDetailSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  startYear: z.number().int().min(1950).max(new Date().getFullYear() + 10),
  endYear: z.number().int().min(1950).max(new Date().getFullYear() + 10).optional(),
  grade: z.string().optional(),
});

export const studentRoleDataSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  education: z.array(educationDetailSchema).min(1, 'At least one education entry is required'),
  projects: z.array(studentProjectSchema),
  interests: z.array(z.string()),
  internshipAvailable: z.boolean(),
  internshipExperience: z.array(internshipExperienceSchema),
}).refine(
  (data) => {
    // If internshipAvailable is false, internshipExperience must be empty
    if (!data.internshipAvailable && data.internshipExperience.length > 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Internship experience must be empty when internshipAvailable is false',
    path: ['internshipExperience'],
  }
);

// ============================================
// ALUMNI ROLE SCHEMA
// ============================================
const workExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  designation: z.string().min(1, 'Designation is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
});

const achievementSchema = z.object({
  title: z.string().min(1, 'Achievement title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().optional(),
});

export const alumniRoleDataSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  workExperience: z.array(workExperienceSchema).min(1, 'At least one work experience is required'),
  education: z.array(educationDetailSchema).min(1, 'At least one education entry is required'),
  achievements: z.array(achievementSchema),
  interests: z.array(z.string()),
  graduationYear: z.number().int().min(1950).max(new Date().getFullYear()).optional(),
  currentCompany: z.string().optional(),
  currentDesignation: z.string().optional(),
});

// ============================================
// RECRUITER ROLE SCHEMA
// ============================================
const companyDetailsSchema = z.object({
  website: z.string().url('Invalid URL').optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  headquarters: z.string().optional(),
});

export const recruiterRoleDataSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  designation: z.string().min(1, 'Designation is required'),
  hiringRoles: z.array(z.string()).min(1, 'At least one hiring role is required'),
  industry: z.string().min(1, 'Industry is required'),
  companyDetails: companyDetailsSchema.optional(),
  postedJobs: z.array(z.string()).optional(),
  yearsInRecruitment: z.number().int().min(0).optional(),
});

// ============================================
// ADMIN ROLE SCHEMA
// ============================================
export const adminRoleDataSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  systemAccessLevel: z.enum(['full', 'limited', 'read-only']),
  managedModules: z.array(z.string()).optional(),
  adminNotes: z.string().optional(),
});

// ============================================
// DONOR ROLE SCHEMA
// ============================================
const contributionHistorySchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  campaign: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  transactionId: z.string().optional(),
});

export const donorRoleDataSchema = z.object({
  organizationName: z.string().optional(),
  contributionHistory: z.array(contributionHistorySchema),
  interests: z.array(z.string()),
  donationType: z.enum(['individual', 'corporate', 'foundation']),
  engagementActivity: z.array(z.string()),
  totalContributed: z.number().min(0).optional(),
  preferredCauses: z.array(z.string()).optional(),
});

// ============================================
// ROLE-BASED VALIDATION FUNCTION
// ============================================
export function getRoleSpecificSchema(role: PrimaryRole) {
  switch (role) {
    case 'student':
      return studentRoleDataSchema;
    case 'alumni':
      return alumniRoleDataSchema;
    case 'recruiter':
      return recruiterRoleDataSchema;
    case 'admin':
      return adminRoleDataSchema;
    case 'donor':
      return donorRoleDataSchema;
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}

// ============================================
// CREATE PROFILE SCHEMA
// ============================================
export const createProfileSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'student', 'alumni', 'recruiter', 'donor']),
  commonFields: commonFieldsSchema,
  roleSpecificData: z.any(), // Will be validated dynamically based on role
});

// ============================================
// UPDATE PROFILE SCHEMA
// ============================================
export const updateProfileSchema = z.object({
  commonFields: commonFieldsSchema.partial().optional(),
  roleSpecificData: z.any().optional(), // Will be validated dynamically based on role
});

// ============================================
// ADD ACTIVITY SCHEMA
// ============================================
export const addActivitySchema = z.object({
  action: z.string().min(1, 'Action is required'),
  metadata: z.record(z.string(), z.any()).optional(),
});

// ============================================
// VALIDATION HELPER FUNCTIONS
// ============================================
export function validateCreateProfile(data: any) {
  try {
    // First validate the base structure
    const baseValidation = createProfileSchema.parse(data);
    
    // Then validate role-specific data
    const roleSchema = getRoleSpecificSchema(baseValidation.role);
    const roleValidation = roleSchema.parse(baseValidation.roleSpecificData);
    
    return {
      success: true,
      data: {
        ...baseValidation,
        roleSpecificData: roleValidation,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ path: 'unknown', message: 'Validation failed' }],
    };
  }
}

export function validateUpdateProfile(role: PrimaryRole, data: any) {
  try {
    // Validate base structure
    const baseValidation = updateProfileSchema.parse(data);
    
    // If roleSpecificData is provided, validate it
    if (baseValidation.roleSpecificData) {
      const roleSchema = getRoleSpecificSchema(role);
      const roleValidation = roleSchema.partial().parse(baseValidation.roleSpecificData);
      
      return {
        success: true,
        data: {
          ...baseValidation,
          roleSpecificData: roleValidation,
        },
      };
    }
    
    return {
      success: true,
      data: baseValidation,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ path: 'unknown', message: 'Validation failed' }],
    };
  }
}

export function validateAddActivity(data: any) {
  try {
    const validation = addActivitySchema.parse(data);
    return {
      success: true,
      data: validation,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ path: 'unknown', message: 'Validation failed' }],
    };
  }
}
