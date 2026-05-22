-- Create user_profiles table

CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    headline VARCHAR(255),
    bio TEXT,
    
    -- Contact & Personal Info
    phone VARCHAR(20),
    address JSONB, -- { street, city, state, country, zip }
    emergency_contacts JSONB, -- [ { name, relation, phone } ]
    
    -- Professional Info
    target_roles JSONB, -- [ 'Frontend Developer', 'Software Engineer' ]
    skills JSONB, -- [ 'React', 'Node.js', 'PostgreSQL' ]
    work_experience JSONB, -- [ { company, role, startDate, endDate, current, description } ]
    education JSONB, -- [ { institution, degree, major, year, cgpa } ]
    
    -- Social Links
    social_links JSONB, -- { linkedin, github, portfolio }
    
    -- Match/Search preferences
    is_open_to_work BOOLEAN DEFAULT TRUE,
    is_mentor_available BOOLEAN DEFAULT FALSE,
    preferences JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id);
