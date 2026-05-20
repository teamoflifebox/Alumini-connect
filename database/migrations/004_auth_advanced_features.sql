-- Forgot password, email verification, OAuth fields

ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMPTZ;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ;

ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);

-- avatar_url may already exist on some databases
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_users_provider ON users (provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_reset_expires ON users (reset_password_expires)
  WHERE reset_password_token IS NOT NULL;
