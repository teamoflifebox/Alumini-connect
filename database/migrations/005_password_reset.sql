-- Password reset columns: fixed-width token hash + expiry (idempotent upgrades)
-- reset_password_token stores bcrypt hash of the secret segment only (never raw token)

ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;

-- Upgrade from TEXT / TIMESTAMPTZ if migration 004 already ran
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'reset_password_token'
      AND udt_name = 'text'
  ) THEN
    ALTER TABLE users ALTER COLUMN reset_password_token TYPE VARCHAR(255);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'reset_password_expires'
      AND udt_name = 'timestamptz'
  ) THEN
    ALTER TABLE users
      ALTER COLUMN reset_password_expires TYPE TIMESTAMP
      USING reset_password_expires AT TIME ZONE 'UTC';
  END IF;
END $$;
