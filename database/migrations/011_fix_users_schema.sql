-- Migration 011: Fix users table to match application code expectations
-- 
-- PROBLEM: Database has 'role' column but code expects 'primary_role'
-- Also missing: is_approved, approval_status, approved_by, approved_at,
--               rejection_reason, company, graduation_year
--
-- This migration brings the users table in sync with the codebase.

-- ============================================
-- STEP 1: Rename 'role' → 'primary_role'
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'primary_role'
  ) THEN
    ALTER TABLE users RENAME COLUMN role TO primary_role;
    RAISE NOTICE '✓ Renamed role → primary_role';
  ELSE
    RAISE NOTICE '⚠ Skipped rename: role column not found or primary_role already exists';
  END IF;
END $$;

-- ============================================
-- STEP 2: Add missing approval columns
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved       BOOLEAN      DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status   VARCHAR(50)  DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by       INTEGER      REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at       TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason  TEXT;

-- ============================================
-- STEP 3: Add extra profile columns
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS company          VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year  INTEGER;

-- ============================================
-- STEP 4: Approve existing admin & student rows
-- ============================================
UPDATE users
SET is_approved     = TRUE,
    approval_status = 'approved',
    updated_at      = NOW()
WHERE primary_role IN ('admin', 'student')
  AND (is_approved IS NULL OR is_approved = FALSE);

-- Set pending for everyone else
UPDATE users
SET approval_status = COALESCE(approval_status, 'pending'),
    is_approved     = COALESCE(is_approved, FALSE),
    updated_at      = NOW()
WHERE primary_role NOT IN ('admin', 'student');

-- ============================================
-- STEP 5: Rebuild indexes on new column name
-- ============================================
DROP INDEX IF EXISTS idx_users_role;
CREATE INDEX IF NOT EXISTS idx_users_primary_role ON users(primary_role);
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_is_approved    ON users(is_approved);

-- ============================================
-- STEP 6: Verify
-- ============================================
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'primary_role'
  ) INTO col_exists;

  IF NOT col_exists THEN
    RAISE EXCEPTION '✗ primary_role column still missing after migration!';
  END IF;

  RAISE NOTICE '✓ Migration 011 complete — users table is now in sync with application code';
END $$;
