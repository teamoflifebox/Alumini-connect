import { z } from 'zod';

export const updateSettingsSchema = z.object({
  email_notifications: z.boolean().optional(),
  referral_notifications: z.boolean().optional(),
  application_status_updates: z.boolean().optional(),
  new_user_notifications: z.boolean().optional(),
  mentorship_notifications: z.boolean().optional(),
  public_profile: z.boolean().optional(),
  show_email: z.boolean().optional(),
});
