import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createAdminSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});



export const updateUserRoleSchema = z.object({
  role: z.enum(['student', 'alumni', 'admin']),
});

export const userIdParamSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export const roleParamSchema = z.object({
  role: z.enum(['student', 'alumni', 'admin']),
});
