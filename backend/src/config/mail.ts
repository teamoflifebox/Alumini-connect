import nodemailer from 'nodemailer';
import { env } from './env';

export const isMailConfigured = () =>
  Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

export const mailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});
