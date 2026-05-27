import { api } from './client';

export interface DonationCampaign {
  id: string;
  title: string;
  category: string;
  description: string;
  purpose: string;
  beneficiary_details: string;
  target_amount: string;
  collected_amount: string;
  supporter_count: number;
  start_date: string;
  end_date: string;
  campaign_status: string;
  verification_status: string;
  contact_information: string;
  payment_instructions: string;
  created_at: string;
  recent_donations?: any[];
}

export const donationsApi = {
  getPublic: async (): Promise<DonationCampaign[]> => {
    const res = await api.get('/donations');
    return res.data.data;
  },
  getTopDonors: async () => {
    const res = await api.get('/donations/top-donors');
    return res.data.data;
  },
  getAdminAll: async (): Promise<DonationCampaign[]> => {
    const res = await api.get('/donations/admin/all');
    return res.data.data;
  },
  getById: async (id: string): Promise<DonationCampaign> => {
    const res = await api.get(`/donations/${id}`);
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await api.post('/donations/admin/create', data);
    return res.data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await api.put(`/donations/admin/${id}/status`, { status });
    return res.data.data;
  },
  createOrder: async (campaignId: string, amount: number) => {
    const res = await api.post('/donations/order', { campaignId, amount });
    return res.data.data;
  },
  verifyPayment: async (data: any) => {
    const res = await api.post('/donations/verify', data);
    return res.data.data;
  }
};
