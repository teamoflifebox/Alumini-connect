import { api } from './client';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  type: string;
  message: string;
  is_read: boolean;
  target_id?: string;
  link_url?: string;
  created_at: string;
}

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await api.get('/notifications');
    return res.data.data;
  },
  
  getUnreadCount: async (): Promise<number> => {
    const res = await api.get('/notifications/unread/count');
    return res.data.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
  
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  }
};
