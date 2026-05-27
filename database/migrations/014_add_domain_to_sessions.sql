-- Migration to add target_domain to mentorship_sessions
ALTER TABLE mentorship_sessions ADD COLUMN IF NOT EXISTS target_domain VARCHAR(100);
