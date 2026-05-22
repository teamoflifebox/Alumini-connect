import { api } from './client';

export const profilesApi = {
  getProfile: async () => {
    const response = await api.get('/profiles/me');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch('/profiles/me', data);
    return response.data;
  }
};
