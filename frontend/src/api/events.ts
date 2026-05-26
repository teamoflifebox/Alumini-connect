import { api } from './client';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'Webinar' | 'Meetup' | 'Reunion' | 'Workshop';
  organizer_id: number;
  start_time: string;
  end_time: string;
  location_type: 'Online' | 'In-Person';
  location_details: string;
  capacity?: number;
  attendee_count?: number;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time: string;
  location_type: string;
  location_details: string;
  capacity?: number;
}

export const eventsApi = {
  getAll: async (q?: string) => {
    const res = await api.get<{status: string, data: Event[]}>('/events' + (q ? `?q=${encodeURIComponent(q)}` : ''));
    return res.data.data;
  },
  getMyEvents: async () => {
    const res = await api.get<{status: string, data: Event[]}>('/events/my-events');
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/events/${id}`);
    return res.data.data;
  },
  getAdminAll: async () => {
    const res = await api.get('/events/admin/all');
    return res.data.data;
  },
  approve: async (id: string) => {
    const res = await api.put(`/events/${id}/approve`);
    return res.data.data;
  },
  create: async (data: Partial<Event>) => {
    const res = await api.post('/events', data);
    return res.data.data;
  },
  update: async ({ id, data }: { id: string, data: Partial<Event> }) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete('/events/' + id);
    return res.data;
  },
  register: async (id: string) => {
    const res = await api.post<{status: string, data: any}>('/events/' + id + '/register');
    return res.data.data;
  },
  unregister: async (id: string) => {
    const res = await api.delete(`/events/${id}/register`);
    return res.data;
  },
  report: async ({ id, reason }: { id: string, reason: string }) => {
    const res = await api.post(`/events/${id}/report`, { reason });
    return res.data;
  }
};
