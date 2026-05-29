import { api } from './client';

export interface MentorshipSession {
  id: number;
  mentor_id: number;
  title: string;
  skills: string[];
  duration: string;
  created_at: string;
  updated_at: string;
  mentor_name?: string;
  mentor_headline?: string;
  attendee_ids: number[];
  session_type?: string;
  meeting_mode?: string;
  meeting_url?: string;
  start_time?: string;
  end_time?: string;
  max_participants?: number;
  visibility?: string;
  thumbnail_url?: string;
}

export interface CreateSessionDTO {
  title: string;
  skills: string[] | string;
  duration: string;
  session_type?: string;
  meeting_mode?: string;
  meeting_url?: string;
  start_time?: string;
  end_time?: string;
  max_participants?: number;
  visibility?: string;
  thumbnail_url?: string;
}

export const mentorshipApi = {
  getSessions: async (search?: string): Promise<MentorshipSession[]> => {
    const response = await api.get('/mentorship/sessions', {
      params: search ? { search } : undefined,
    });
    return response.data.data;
  },

  getRecommended: async (): Promise<MentorshipSession[]> => {
    const response = await api.get('/mentorship/recommended');
    return response.data.data;
  },

  createSession: async (data: CreateSessionDTO): Promise<MentorshipSession> => {
    const response = await api.post('/mentorship/sessions', data);
    return response.data.data;
  },

  deleteSession: async (id: number): Promise<void> => {
    await api.delete(`/mentorship/sessions/${id}`);
  },

  joinSession: async (id: number): Promise<void> => {
    await api.post(`/mentorship/sessions/${id}/join`);
  },

  leaveSession: async (id: number): Promise<void> => {
    await api.post(`/mentorship/sessions/${id}/leave`);
  },

  // Invitations
  getInvitations: async (): Promise<any[]> => {
    const response = await api.get('/mentorship/invitations');
    return response.data.data;
  },

  respondToInvitation: async (inviteId: number, action: 'accepted' | 'rejected'): Promise<any> => {
    const response = await api.post(`/mentorship/invitations/${inviteId}/respond`, { action });
    return response.data.data;
  },

  inviteUser: async (sessionId: number, targetUserId: number): Promise<any> => {
    const response = await api.post('/mentorship/invite', { sessionId, targetUserId });
    return response.data.data;
  }
};
