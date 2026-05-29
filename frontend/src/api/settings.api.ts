import { api } from './client';

export interface UserSettings {
  email_notifications: boolean;
  referral_notifications: boolean;
  application_status_updates: boolean;
  new_user_notifications: boolean;
  mentorship_notifications: boolean;
  public_profile: boolean;
  show_email: boolean;
}

export const settingsApi = {
  getSettings: () => api.get<{ data: UserSettings }>('/settings'),
  updateSettings: (data: Partial<UserSettings>) => api.put<{ data: UserSettings }>('/settings', data),
  deleteAccount: () => api.delete<{ status: string; message: string }>('/auth/me'),
};
