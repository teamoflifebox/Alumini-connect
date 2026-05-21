-- Migration 009: Correct Roles and Modules Architecture
-- 
-- CHANGE: 
-- - 5 Primary Roles: admin, student, alumni, recruiter, donor
-- - 3 Optional Modules: mentor, community_moderator, event_host
--
-- REASON:
-- - Recruiter and Donor should be PRIMARY ROLES (identities)
-- - Not all recruiters are alumni (company HR)
-- - Not all donors are alumni (philanthropists)
-- - Only alumni should have optional modules

-- ============================================
-- STEP 1: Clean up existing module data
-- ============================================

-- Remove recruiter and donor module capabilities
DELETE FROM module_capabilities 
WHERE module_id IN (
  SELECT id FROM modules WHERE name IN ('recruiter', 'donor')
);

-- Remove user assignments for recruiter and donor modules
-- (We'll need to handle these users manually)
DELETE FROM user_modules 
WHERE module_id IN (
  SELECT id FROM modules WHERE name IN ('recruiter', 'donor')
);

-- Remove recruiter and donor from modules table
DELETE FROM modules WHERE name IN ('recruiter', 'donor');

-- ============================================
-- STEP 2: Ensure roles table has all 5 roles
-- ============================================

-- Add recruiter role if not exists
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

-- Add donor role if not exists
INSERT INTO roles (name, display_name, description, is_active, created_at, updated_at)
VALUES (
  'donor',
  'Donor',
  'Philanthropist or sponsor making donations to the institution',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STEP 3: Add capabilities for recruiter role
-- ============================================

-- Get recruiter role ID
DO $$
DECLARE
  recruiter_role_id INT;
BEGIN
  SELECT id INTO recruiter_role_id FROM roles WHERE name = 'recruiter';
  
  -- Assign capabilities to recruiter role
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
    'job.create',
    'job.read',
    'job.update.own',
    'job.delete.own',
    'candidate.read',
    'candidate.shortlist',
    'candidate.contact',
    'event.read'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- STEP 4: Add capabilities for donor role
-- ============================================

-- Get donor role ID
DO $$
DECLARE
  donor_role_id INT;
BEGIN
  SELECT id INTO donor_role_id FROM roles WHERE name = 'donor';
  
  -- Assign capabilities to donor role
  INSERT INTO role_capabilities (role_id, capability_id, created_at)
  SELECT 
    donor_role_id,
    c.id,
    NOW()
  FROM capabilities c
  WHERE c.name IN (
    'profile.read.own',
    'profile.update.own',
    'fundraising.read',
    'fundraising.donate',
    'donation.history.own',
    'event.read'
  )
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- STEP 5: Update modules table metadata
-- ============================================

-- Update mentor module to show it's only for alumni
UPDATE modules
SET available_to_roles = ARRAY['alumni']::VARCHAR[],
    updated_at = NOW()
WHERE name = 'mentor';

-- Update community_moderator module
UPDATE modules
SET available_to_roles = ARRAY['alumni']::VARCHAR[],
    updated_at = NOW()
WHERE name = 'community_moderator';

-- Update event_host module
UPDATE modules
SET available_to_roles = ARRAY['alumni']::VARCHAR[],
    updated_at = NOW()
WHERE name = 'event_host';

-- ============================================
-- STEP 6: Create module_requests table
-- ============================================

CREATE TABLE IF NOT EXISTS module_requests (
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
  UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_module_requests_status ON module_requests(status);
CREATE INDEX IF NOT EXISTS idx_module_requests_user ON module_requests(user_id);

-- ============================================
-- STEP 7: Add comments for documentation
-- ============================================

COMMENT ON TABLE roles IS 'Primary roles representing user identity: admin, student, alumni, recruiter, donor';
COMMENT ON TABLE modules IS 'Optional modules for alumni only: mentor, community_moderator, event_host';
COMMENT ON TABLE user_modules IS 'Junction table linking alumni users to their enabled optional modules';
COMMENT ON TABLE module_requests IS 'Tracks user requests for optional modules, pending admin approval';

COMMENT ON COLUMN users.primary_role IS 'User primary identity: admin, student, alumni, recruiter, or donor';
COMMENT ON COLUMN modules.available_to_roles IS 'Array of roles that can enable this module (currently only alumni)';

-- ============================================
-- STEP 8: Verification queries
-- ============================================

-- Verify roles
DO $$
DECLARE
  role_count INT;
BEGIN
  SELECT COUNT(*) INTO role_count FROM roles WHERE name IN ('admin', 'student', 'alumni', 'recruiter', 'donor');
  IF role_count != 5 THEN
    RAISE EXCEPTION 'Expected 5 roles, found %', role_count;
  END IF;
  RAISE NOTICE '✓ All 5 primary roles exist';
END $$;

-- Verify modules
DO $$
DECLARE
  module_count INT;
BEGIN
  SELECT COUNT(*) INTO module_count FROM modules WHERE name IN ('mentor', 'community_moderator', 'event_host');
  IF module_count != 3 THEN
    RAISE EXCEPTION 'Expected 3 modules, found %', module_count;
  END IF;
  RAISE NOTICE '✓ All 3 optional modules exist';
END $$;

-- Verify no recruiter or donor modules exist
DO $$
DECLARE
  invalid_module_count INT;
BEGIN
  SELECT COUNT(*) INTO invalid_module_count FROM modules WHERE name IN ('recruiter', 'donor');
  IF invalid_module_count > 0 THEN
    RAISE EXCEPTION 'Found invalid modules (recruiter/donor should be roles, not modules)';
  END IF;
  RAISE NOTICE '✓ No invalid modules (recruiter/donor removed from modules)';
END $$;

RAISE NOTICE '✓ Migration 009 completed successfully';
RAISE NOTICE '  - 5 Primary Roles: admin, student, alumni, recruiter, donor';
RAISE NOTICE '  - 3 Optional Modules: mentor, community_moderator, event_host';
RAISE NOTICE '  - module_requests table created for user module requests';
