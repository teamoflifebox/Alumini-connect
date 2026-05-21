-- RBAC Tables and User Approval System

-- Add approval columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Update existing users to be approved (admin and students)
UPDATE users SET is_approved = TRUE, approval_status = 'approved' WHERE role IN ('admin', 'student');

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create capabilities table
CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_capabilities junction table
CREATE TABLE IF NOT EXISTS role_capabilities (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    capability_id INTEGER NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, capability_id)
);

-- Create user_capabilities table (for custom user permissions)
CREATE TABLE IF NOT EXISTS user_capabilities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    capability_id INTEGER NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    granted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, capability_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status);
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);
CREATE INDEX IF NOT EXISTS idx_role_capabilities_role ON role_capabilities(role_id);
CREATE INDEX IF NOT EXISTS idx_role_capabilities_capability ON role_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_user_capabilities_user ON user_capabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_capabilities_capability ON user_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_category ON capabilities(category);
CREATE INDEX IF NOT EXISTS idx_capabilities_name ON capabilities(name);
