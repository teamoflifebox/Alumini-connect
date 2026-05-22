import { z } from 'zod';

export const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zip: z.string().optional()
  }).optional(),
  
  emergency_contacts: z.array(z.object({
    name: z.string(),
    relation: z.string(),
    phone: z.string()
  })).optional(),

  target_roles: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  
  work_experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    start_date: z.string(),
    end_date: z.string().optional(),
    current: z.boolean().optional(),
    description: z.string().optional()
  })).optional(),
  
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string(),
    major: z.string(),
    year: z.number(),
    cgpa: z.string().optional()
  })).optional(),
  
  social_links: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolio: z.string().optional()
  }).optional(),
  
  is_open_to_work: z.boolean().optional(),
  is_mentor_available: z.boolean().optional(),
  preferences: z.record(z.string(), z.any()).optional()
});
