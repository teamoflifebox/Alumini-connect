CREATE TABLE IF NOT EXISTS donation_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT NOT NULL,
    purpose TEXT NOT NULL,
    beneficiary_details TEXT NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    collected_amount DECIMAL(12, 2) DEFAULT 0.00,
    supporter_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    campaign_status VARCHAR(50) DEFAULT 'Draft',
    verification_status VARCHAR(50) DEFAULT 'Pending',
    contact_information VARCHAR(255),
    payment_instructions TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES donation_campaigns(id) ON DELETE CASCADE,
    donor_id INTEGER REFERENCES users(id),
    donor_name VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'Razorpay',
    payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_status VARCHAR(50) DEFAULT 'initiated',
    payment_method VARCHAR(100),
    donated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaign_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES donation_campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    posted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimization Indexes for Analytics & Fast Queries
CREATE INDEX IF NOT EXISTS idx_donation_campaigns_status ON donation_campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_donation_transactions_campaign ON donation_transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donation_transactions_status ON donation_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_donation_transactions_donor ON donation_transactions(donor_id);
