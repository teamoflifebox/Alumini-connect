import { api } from './client';

export interface LandingStats {
  activeUsers: number;
  verificationProgress: number;
  mentorships: number;
  jobsPlaced: number;
  scholarshipFunds: number;
  activeCampaigns: { title: string; raised: number }[];
}

export const statsApi = {
  getLandingStats: () =>
    api.get<{ data: LandingStats }>('/stats'),
};
