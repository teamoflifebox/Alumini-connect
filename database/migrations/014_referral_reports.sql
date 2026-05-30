-- Add reports_count to referrals
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reports_count INTEGER DEFAULT 0;

-- Create referral_reports table
CREATE TABLE IF NOT EXISTS referral_reports (
  id SERIAL PRIMARY KEY,
  referral_id INTEGER NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referral_id, reporter_id)
);
