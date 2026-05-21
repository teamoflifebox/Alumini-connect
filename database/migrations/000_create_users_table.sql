-- Create users table for standalone PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    provider VARCHAR(50) DEFAULT 'local',
    provider_id VARCHAR(255),
    refresh_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMPTZ,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users (provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_reset_expires ON users (reset_password_expires)
  WHERE reset_password_token IS NOT NULL;

-- Insert default admin user
-- Email: admin@alumni.com
-- Password: admin123
INSERT INTO users (name, email, password_hash, role, is_verified, created_at, updated_at)
VALUES (
  'System Admin',
  'admin@alumni.com',
  '$2a$10$yasCo5T1XQdliQ.P5HM4nu7nyVS78.6OzaS.bs1vPFTjDDvizoq.G',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
