import { env } from '../config/env';
import { isMailConfigured, mailTransporter } from '../config/mail';
import pool from '../core/config/db';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  if (!isMailConfigured()) {
    if (env.NODE_ENV === 'development') {
      console.log('--- EMAIL (dev mode, SMTP not configured) ---');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(options.text || options.html);
      console.log('-------------------------------------------');
      return;
    }
    throw new Error('Email service is not configured');
  }

  await mailTransporter.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
};

export const sendNotificationEmail = async (userId: number | string, options: SendEmailOptions): Promise<void> => {
  // Check if user has opted out of email notifications
  const result = await pool.query('SELECT email_notifications FROM user_settings WHERE user_id = $1', [userId]);
  
  // If settings exist and email_notifications is false, abort dispatch
  if (result.rows.length > 0 && result.rows[0].email_notifications === false) {
    console.log(`--- EMAIL ABORTED: User ${userId} has disabled email notifications ---`);
    return;
  }

  // Otherwise, proceed to send
  await sendEmail(options);
};

export const passwordResetEmailTemplate = (resetUrl: string, name: string) => ({
  subject: 'Reset your Alumni Connect password',
  html: `
    <p>Hi ${name},</p>
    <p>You requested a password reset. Click the link below (valid for 15 minutes):</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you did not request this, ignore this email.</p>
  `,
  text: `Reset your password: ${resetUrl} (valid for 15 minutes)`,
});

export const emailVerificationTemplate = (verifyUrl: string, name: string) => ({
  subject: 'Verify your Alumni Connect email',
  html: `
    <p>Hi ${name},</p>
    <p>Please verify your email address by clicking the link below (valid for 24 hours):</p>
    <p><a href="${verifyUrl}">Verify Email</a></p>
  `,
  text: `Verify your email: ${verifyUrl} (valid for 24 hours)`,
});
