import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root (works with nodemon, ts-node, and compiled dist)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const trim = (value: string | undefined) => value?.trim() || '';

const parseOrigins = (...values: (string | undefined)[]): string[] => {
  const origins = new Set<string>();

  values.forEach((value) => {
    if (!value) return;
    value.split(',').forEach((origin) => {
      const trimmed = origin.trim();
      if (trimmed) origins.add(trimmed);
    });
  });

  return Array.from(origins);
};

const bool = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5001,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  ALLOWED_ORIGINS: parseOrigins(
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    process.env.ALLOWED_ORIGINS,
    'http://localhost:3000',
    'http://localhost:5173'
  ),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '5432',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'alumni_connect',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || process.env.SECRET_KEY || '',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || process.env.SECRET_KEY || '',
  /** Full Redis URL (optional): redis://[:password@]host:port[/db] or rediss:// for TLS */
  get REDIS_URL() {
    const url = trim(process.env.REDIS_URL);
    return url || undefined;
  },
  REDIS_HOST: process.env.REDIS_HOST?.trim() || '127.0.0.1',
  REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
  /** Omit AUTH when unset or empty */
  get REDIS_PASSWORD() {
    const p = trim(process.env.REDIS_PASSWORD);
    return p || undefined;
  },
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@alumniconnect.com',
  get GOOGLE_CLIENT_ID() {
    return trim(process.env.GOOGLE_CLIENT_ID);
  },
  get LINKEDIN_CLIENT_ID() {
    return trim(process.env.LINKEDIN_CLIENT_ID);
  },
  get LINKEDIN_CLIENT_SECRET() {
    return trim(process.env.LINKEDIN_CLIENT_SECRET);
  },
  REQUIRE_ALUMNI_EMAIL_VERIFICATION: bool(process.env.REQUIRE_ALUMNI_EMAIL_VERIFICATION, true),
  REQUIRE_STUDENT_EMAIL_VERIFICATION: bool(process.env.REQUIRE_STUDENT_EMAIL_VERIFICATION, false),
  REQUIRE_ADMIN_EMAIL_VERIFICATION: bool(process.env.REQUIRE_ADMIN_EMAIL_VERIFICATION, false),
};
