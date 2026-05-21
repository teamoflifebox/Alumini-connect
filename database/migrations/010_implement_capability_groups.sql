-- Migration 010: Implement Capability Groups Architecture
-- 
-- CHANGE: Transform modules into capability_groups with NO restrictions
-- - Add recruiter and donor as PRIMARY ROLES
-- - Rename modules → capability_groups (conceptually, keep table name for now)
-- - Remove available_to_roles restrictions (anyone can have any capability)
-- - Support multiple capability groups per user

-- ============================================
-- STEP 1: Add recruiter and donor as primary roles
-- ============================================

-- Add recruiter role
INSERT INTO roles (name, display_name, description, is_active, created_at, updated_at)
VALUES (
  'recruiter',
  'Recruiter',
  'Company HR professional recruiting students and alumni',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Add donor role
INSERT INTO roles (name, display_name, description, is_active, created_at, updated_at)
VALUES (
  'donor',
  'Donor',
  'Philanthropist or sponsor making donations',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 2: Update modules to remove restrictions
-- ============================================

-- Remove available_to_roles restrictions - ANYONE can have ANY capability
UPDATE modules
SET available_to_roles = ARRAY[]::VARCHAR[],
    description = CASE name
      WHEN 'mentor' THEN 'Offer mentorship to students (available to all roles)'
      WHEN 'recruiter' THEN 'Post jobs and manage recruitment (available to all roles)'
      WHEN 'donor' THEN 'Make donations and support fundraising (available to all roles)'
      WHEN 'community_moderator' THEN 'Moderate community forums (available to all roles)'
      WHEN 'event_host' THEN 'Organize and manage events (available to all roles)'
    END,
    updated_at = NOW();

-- ============================================
-- STEP 3: Add base capabilities for new roles
-- ============================================

-- Recruiter role base capabilities (before adding recruiter capability group)
DO $$
DECLARE
  recruiter_role_id INT;
BEGIN
  SELECT id INTO recruiter_role_id FROM roles WHERE name = 'recruiter';
  
  -- Base capabilities for recruiter role
  INSERT INTO role_capabilities (role_id, capability_id, created_at)
  SELECT 
    recruiter_role_id,
    c.id,
    NOW()
  FROM capabilities c
  WHERE c.name IN (
    'profile.read.own',
    'profile.update.own',
    'profile.read.all',
    'event.read'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- Donor role base capabilities (before adding donor capability group)
DO $$
DECLARE
  donor_role_id INT;
BEGIN
  SELECT id INTO donor_role_id FROM roles WHERE name = 'donor';
  
  -- Base capabilities for donor role
  INSERT INTO role_capabilities (role_id, capability_id, created_at)
  SELECT 
    donor_role_id,
    c.id,
    NOW()
  FROM capabilities c
  WHERE c.name IN (
    'profile.read.own',
    'profile.update.own',
    'event.read'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- STEP 4: Create capability_requests table
-- ============================================

CREATE TABLE IF NOT EXISTS capability_requests (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  reviewed_by INT REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, module_id, status)
);

CREATE INDEX IF NOT EXISTS idx_capability_requests_status ON capability_requests(status);
CREATE INDEX IF NOT EXISTS idx_capability_requests_user ON capability_requests(user_id);

-- ============================================
-- STEP 5: Add company and graduation_year to users
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS company VARCHAR(255),
ADD COLUMN IF NOT EXISTS graduation_year INT;

COMMENT ON COLUMN users.company IS 'Company name for recruiters';
COMMENT ON COLUMN users.graduation_year IS 'Graduation year for alumni';

-- ============================================
-- STEP 6: Update comments for clarity
-- ============================================

COMMENT ON TABLE roles IS '5 Primary roles: admin, student, alumni, recruiter, donor';
COMMENT ON TABLE modules IS '5 Capability groups (available to ALL roles): mentor, recruiter, donor, community_moderator, event_host';
COMMENT ON TABLE user_modules IS 'Links users to their enabled capability groups (any user can have any capability)';
COMMENT ON TABLE capability_requests IS 'Tracks user requests for capability groups';

COMMENT ON COLUMN users.primary_role IS 'User primary identity: admin, student, alumni, recruiter, or donor';
COMMENT ON COLUMN modules.available_to_roles IS 'DEPRECATED - Now empty array. All capability groups available to all roles';

-- ============================================
-- STEP 7: Verification
-- ============================================

DO $$
DECLARE
  role_count INT;
  module_count INT;
BEGIN
  -- Verify 5 roles exist
  SELECT COUNT(*) INTO role_count FROM roles WHERE name IN ('admin', 'student', 'alumni', 'recruiter', 'donor');
  IF role_count != 5 THEN
    RAISE EXCEPTION 'Expected 5 roles, found %', role_count;
  END IF;
  RAISE NOTICE '✓ All 5 primary roles exist';
  
  -- Verify 5 capability groups exist
  SELECT COUNT(*) INTO module_count FROM modules WHERE name IN ('mentor', 'recruiter', 'donor', 'community_moderator', 'event_host');
  IF module_count != 5 THEN
    RAISE EXCEPTION 'Expected 5 capability groups, found %', module_count;
  END IF;
  RAISE NOTICE '✓ All 5 capability groups exist';
  
  -- Verify no restrictions
  SELECT COUNT(*) INTO module_count FROM modules WHERE array_length(available_to_roles, 1) > 0;
  IF module_count > 0 THEN
    RAISE EXCEPTION 'Found % capability groups with restrictions. All should be unrestricted', module_count;
  END IF;
  RAISE NOTICE '✓ All capability groups are unrestricted (available to all roles)';
  
  RAISE NOTICE '✓ Migration 010 completed successfully';
  RAISE NOTICE '  - 5 Primary Roles: admin, student, alumni, recruiter, donor';
  RAISE NOTICE '  - 5 Capability Groups: mentor, recruiter, donor, community_moderator, event_host';
  RAISE NOTICE '  - NO RESTRICTIONS: Any user can have any capability group';
  RAISE NOTICE '  - Users can have MULTIPLE capability groups simultaneously';
END $$;
