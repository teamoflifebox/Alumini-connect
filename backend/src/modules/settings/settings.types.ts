export interface UserSettings {
  user_id: number;
  email_notifications: boolean;
  referral_notifications: boolean;
  application_status_updates: boolean;
  new_user_notifications: boolean;
  mentorship_notifications: boolean;
  public_profile: boolean;
  show_email: boolean;
  created_at?: Date;
  updated_at?: Date;
}
