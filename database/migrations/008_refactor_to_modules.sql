-- Refactor RBAC to Primary Role + Optional Modules Architecture

-- Step 1: Rename role column to primary_role (if not already renamed)
DO $$ 
BEGIN
    IF EXISTS(SELECT 1 FROM information_schema.columns 
              WHERE table_name='users' AND column_name='role') THEN
        ALTER TABLE users RENAME COLUMN role TO primary_role;
    END IF;
END $$;

-- Step 2: Update primary_role values (remove recruiter and donor as primary roles)
UPDATE users SET primary_role = 'alumni' WHERE primary_role IN ('recruiter', 'donor');

-- Step 3: Create modules table
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    available_to_roles TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create user_modules junction table
CREATE TABLE IF NOT EXISTS user_modules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT TRUE,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    activated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Step 5: Create module_capabilities junction table
CREATE TABLE IF NOT EXISTS module_capabilities (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    capability_id INTEGER NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, capability_id)
);

-- Step 6: Seed modules
INSERT INTO modules (name, display_name, description, available_to_roles) VALUES
('mentor', 'Mentor', 'Offer mentorship to students', ARRAY['alumni']),
('recruiter', 'Recruiter', 'Post jobs and manage hiring pipeline', ARRAY['alumni']),
('donor', 'Donor', 'Make donations and sponsor scholarships', ARRAY['alumni', 'student']),
('community_moderator', 'Community Moderator', 'Moderate community content', ARRAY['alumni']),
('event_host', 'Event Host', 'Create and manage events', ARRAY['alumni'])
ON CONFLICT (name) DO NOTHING;

-- Step 7: Assign capabilities to modules

-- Mentor module capabilities
INSERT INTO module_capabilities (module_id, capability_id)
SELECT m.id, c.id
FROM modules m, capabilities c
WHERE m.name = 'mentor' AND c.name IN (
    'mentorship.offer',
    'mentorship.manage'
)
ON CONFLICT DO NOTHING;

-- Recruiter module capabilities
INSERT INTO module_capabilities (module_id, capability_id)
SELECT m.id, c.id
FROM modules m, capabilities c
WHERE m.name = 'recruiter' AND c.name IN (
    'profile.read.all',
    'job.create',
    'job.read',
    'job.update.own',
    'job.delete.own',
    'candidate.read',
    'candidate.shortlist',
    'candidate.contact'
)
ON CONFLICT DO NOTHING;

-- Donor module capabilities
INSERT INTO module_capabilities (module_id, capability_id)
SELECT m.id, c.id
FROM modules m, capabilities c
WHERE m.name = 'donor' AND c.name IN (
    'fundraising.read',
    'fundraising.donate',
    'donation.history.own'
)
ON CONFLICT DO NOTHING;

-- Community Moderator module capabilities
INSERT INTO module_capabilities (module_id, capability_id)
SELECT m.id, c.id
FROM modules m, capabilities c
WHERE m.name = 'community_moderator' AND c.name IN (
    'profile.read.all'
)
ON CONFLICT DO NOTHING;

-- Event Host module capabilities
INSERT INTO module_capabilities (module_id, capability_id)
SELECT m.id, c.id
FROM modules m, capabilities c
WHERE m.name = 'event_host' AND c.name IN (
    'event.create',
    'event.update.own',
    'event.delete.own'
)
ON CONFLICT DO NOTHING;

-- Step 8: Update roles table to only have primary roles
DELETE FROM role_capabilities WHERE role_id IN (
    SELECT id FROM roles WHERE name IN ('recruiter', 'donor')
);
DELETE FROM roles WHERE name IN ('recruiter', 'donor');

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_modules_user ON user_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_module ON user_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_enabled ON user_modules(enabled);
CREATE INDEX IF NOT EXISTS idx_module_capabilities_module ON module_capabilities(module_id);
CREATE INDEX IF NOT EXISTS idx_module_capabilities_capability ON module_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_users_primary_role ON users(primary_role);
