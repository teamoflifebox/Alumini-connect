import { api } from './client';

export interface SuccessStory {
  id: number;
  title: string;
  content: string;
  alumni_name: string;
  alumni_designation: string;
  image_url: string;
  category?: string;
  created_at: string;
}

export const successStoriesApi = {
  getStories: async () => {
    const response = await api.get('/success-stories');
    return response.data.data as SuccessStory[];
  },
  
  createStory: async (data: { title: string; content: string; alumniName: string; alumniDesignation: string; imageUrl: string; category?: string }) => {
    const response = await api.post('/success-stories', data);
    return response.data.data as SuccessStory;
  },

  deleteStory: async (id: number) => {
    const response = await api.delete(`/success-stories/${id}`);
    return response.data;
  }
};
