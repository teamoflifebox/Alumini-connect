-- Groups & Communities Tables

CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(100) DEFAULT 'from-blue-500/20 to-cyan-500/5',
    tags TEXT[], -- array of string tags
    members_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- admin, member
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- Add group_id to community_posts
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_community_posts_group ON community_posts(group_id);

-- Trigger to increment members_count on group
CREATE OR REPLACE FUNCTION increment_group_members()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE groups SET members_count = members_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_increment_group_members
    AFTER INSERT ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION increment_group_members();

-- Trigger to decrement members_count on group
CREATE OR REPLACE FUNCTION decrement_group_members()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE groups SET members_count = GREATEST(members_count - 1, 0) WHERE id = OLD.group_id;
    RETURN OLD;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_decrement_group_members
    AFTER DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION decrement_group_members();

-- Insert initial dummy groups so the user has something to see!
INSERT INTO groups (name, description, tags, color) VALUES 
('Placement Preparation', 'Discuss interview strategies, resume building, and placement test prep.', ARRAY['Interview', 'Resumes'], 'from-blue-500/20 to-cyan-500/5'),
('AI & ML Enthusiasts', 'Share research papers, projects, and collaborate on AI/ML models.', ARRAY['AI', 'Machine Learning'], 'from-purple-500/20 to-pink-500/5'),
('Startup Founders', 'Network with alumni who have successfully built and scaled startups.', ARRAY['Entrepreneurship', 'Funding'], 'from-orange-500/20 to-red-500/5'),
('Cybersecurity Hub', 'Discuss the latest vulnerabilities, certifications, and career paths in infosec.', ARRAY['Security', 'Tech'], 'from-green-500/20 to-emerald-500/5'),
('Higher Studies Abroad', 'Guidance for GRE, TOEFL, university selection, and scholarship opportunities.', ARRAY['Masters', 'Admissions'], 'from-blue-500/20 to-cyan-500/5')
ON CONFLICT DO NOTHING;
