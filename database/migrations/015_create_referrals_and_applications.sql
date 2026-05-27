-- 015_create_referrals_and_applications.sql

-- 1. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    role_position VARCHAR(255) NOT NULL,
    referral_link VARCHAR(1024),
    job_description TEXT NOT NULL,
    skills_required TEXT[],
    deadline TIMESTAMPTZ,
    location VARCHAR(255),
    work_type VARCHAR(50), -- Remote, Hybrid, Onsite
    salary VARCHAR(255),
    experience_required VARCHAR(255),
    openings INTEGER,
    status VARCHAR(50) DEFAULT 'Open', -- Open, Closed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_user ON referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- 2. Create applications table
CREATE TABLE IF NOT EXISTS referral_applications (
    id SERIAL PRIMARY KEY,
    referral_id INTEGER NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    resume_url VARCHAR(1024),
    skills TEXT[],
    course VARCHAR(255),
    year VARCHAR(50),
    cgpa VARCHAR(50),
    portfolio_links JSONB,
    current_status VARCHAR(50) DEFAULT 'Applied',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referral_id, applicant_id) -- Prevent multiple applications per user per referral
);

CREATE INDEX IF NOT EXISTS idx_ref_apps_referral ON referral_applications(referral_id);
CREATE INDEX IF NOT EXISTS idx_ref_apps_applicant ON referral_applications(applicant_id);

-- 3. Create application status history table
CREATE TABLE IF NOT EXISTS referral_application_history (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES referral_applications(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    changed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ref_app_history_app ON referral_application_history(application_id);

-- 4. Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard_scores (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0
);
