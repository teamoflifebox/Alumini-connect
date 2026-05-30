import { api } from './client';
import type { LoginPayload, AuthResponse } from '../types';

export const authApi = {
  /** Student self-register */
  register: (payload: { name: string; email: string; password: string; role?: string }) =>
    api.post<{ data: AuthResponse }>('/auth/register', payload),

  /** Universal login for all roles */
  login: (payload: LoginPayload) =>
    api.post<{ data: AuthResponse }>('/auth/login', payload),

  /** Refresh access token using HttpOnly cookie */
  refresh: () =>
    api.post<{ data: { accessToken: string } }>('/auth/refresh'),

  /** Logout and clear the refresh token cookie server-side */
  logout: () =>
    api.post('/auth/logout'),

  /** Forgot password */
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  /** Reset password with token */
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  /** Google OAuth Login */
  googleLogin: (idToken: string) =>
    api.post<{ data: AuthResponse }>('/auth/google', { idToken }),

  /** LinkedIn OAuth Login */
  linkedinLogin: (code: string, redirectUri: string) =>
    api.post<{ data: AuthResponse }>('/auth/linkedin', { code, redirectUri }),

  /** Change Password (authenticated) */
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
};
