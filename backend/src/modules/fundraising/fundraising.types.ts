export interface Campaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  organizer_id: string; // References UserProfile
  end_date: Date;
  status: 'Active' | 'Completed' | 'Cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface Donation {
  id: string;
  campaign_id: string; // References Campaign
  donor_id?: string; // References UserProfile (Optional for anonymous)
  amount: number;
  payment_status: 'Pending' | 'Completed' | 'Failed';
  transaction_id?: string;
  is_anonymous: boolean;
  donated_at: Date;
}

export interface CreateCampaignDTO {
  title: string;
  description: string;
  target_amount: number;
  end_date: Date;
}
