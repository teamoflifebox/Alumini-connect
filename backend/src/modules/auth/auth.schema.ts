import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const alumniRegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

/** Strong password for reset flow only (8+, upper, lower, number, special). */
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      strongPasswordRegex,
      'Password must include uppercase, lowercase, a number, and a special character'
    ),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google idToken is required'),
});

export const linkedinAuthSchema = z.object({
  accessToken: z.string().min(1, 'LinkedIn accessToken is required'),
});

export const registerSchema = (data: { email?: string; password?: string; name?: string }) => {
  const errors: string[] = [];
  if (!data.email || !data.email.includes('@')) errors.push('Valid email is required');
  if (!data.password || data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (!data.name) errors.push('Name is required');

  return {
    isValid: errors.length === 0,
    errors,
  };
};
