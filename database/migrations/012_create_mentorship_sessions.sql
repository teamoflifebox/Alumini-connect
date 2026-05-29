-- Create mentorship_sessions and mentorship_session_attendees tables

CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id SERIAL PRIMARY KEY,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    skills JSONB DEFAULT '[]', -- JSON array of strings e.g. ["React", "Node.js"]
    duration VARCHAR(100) NOT NULL, -- e.g. "30 mins", "1 hour"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentorship_session_attendees (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES mentorship_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_mentor ON mentorship_sessions (mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_session_attendees_session ON mentorship_session_attendees (session_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_session_attendees_user ON mentorship_session_attendees (user_id);
