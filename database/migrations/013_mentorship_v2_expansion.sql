-- 013_mentorship_v2_expansion.sql

-- Enable pg_trgm extension for fuzzy matching if needed later
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Expand mentorship_sessions table
ALTER TABLE mentorship_sessions
ADD COLUMN IF NOT EXISTS session_type VARCHAR(50) DEFAULT 'Public', -- 'One-to-One', 'Group', 'Public', 'Invite-Only'
ADD COLUMN IF NOT EXISTS meeting_mode VARCHAR(50) DEFAULT 'Custom', -- 'Google Meet', 'Zoom', 'Custom'
ADD COLUMN IF NOT EXISTS meeting_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS visibility VARCHAR(50) DEFAULT 'Public', -- 'Public', 'Skill-Targeted', 'Private'
ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(255);

-- 2. Create session_invitations table
CREATE TABLE IF NOT EXISTS session_invitations (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES mentorship_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_session_invitations_user ON session_invitations (user_id);
CREATE INDEX IF NOT EXISTS idx_session_invitations_session ON session_invitations (session_id);

-- 3. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g., 'session_invite', 'session_created'
    target_id VARCHAR(100), -- E.g., the ID of the session
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id) WHERE is_read = false;

-- 4. Create session_chat_messages table for realtime chat
CREATE TABLE IF NOT EXISTS session_chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES mentorship_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_chat_messages_session ON session_chat_messages (session_id);

-- 5. Add GIN index on profiles.skills for faster skill-based searching
-- Using standard GIN for PostgreSQL ARRAY
CREATE INDEX IF NOT EXISTS idx_profiles_skills_gin ON profiles USING GIN (skills);
