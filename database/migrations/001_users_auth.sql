-- Extends the existing users table for JWT refresh-token auth

ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
