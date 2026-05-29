import { api } from '../../api/client';
import type { Profile, Post, Comment, Conversation, Message, Connection } from './types';

// --- Profiles / Directory ---
export const searchProfiles = async (params: any) => {
  const { data } = await api.get('/profiles', { params });
  return data;
};

export const getProfileById = async (id: number) => {
  const { data } = await api.get(`/profiles/${id}`);
  return data.data as Profile;
};

// --- Connections ---
export const getConnections = async () => {
  const { data } = await api.get('/community/connections');
  return data.data as Connection[];
};

export const sendConnectionRequest = async (recipientId: number) => {
  const { data } = await api.post('/community/connections', { recipientId });
  return data.data;
};

export const respondConnectionRequest = async (connectionId: number, status: 'accepted' | 'rejected') => {
  const { data } = await api.patch(`/community/connections/${connectionId}`, { status });
  return data.data;
};

// --- Feed & Posts ---
export const getFeed = async (page = 1, limit = 10, groupId?: number) => {
  const params: any = { page, limit };
  if (groupId) params.groupId = groupId;
  const { data } = await api.get('/community/feed', { params });
  return data;
};

export const getPost = async (postId: number) => {
  const { data } = await api.get(`/community/posts/${postId}`);
  return data.data as Post;
};

export const createPost = async (content: string, type: string = 'text', imageUrl?: string, groupId?: number) => {
  const { data } = await api.post('/community/posts', { content, type, imageUrl, groupId });
  return data.data as Post;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/community/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.data.url;
};

export const toggleLike = async (postId: number) => {
  const { data } = await api.post(`/community/posts/${postId}/like`);
  return data.data;
};

export const addComment = async (postId: number, content: string, parentId?: number) => {
  const { data } = await api.post(`/community/posts/${postId}/comments`, { content, parentId });
  return data.data;
};

export const getComments = async (postId: number) => {
  const { data } = await api.get(`/community/posts/${postId}/comments`);
  return data.data as Comment[];
};

export const toggleCommentLike = async (postId: number, commentId: number) => {
  const { data } = await api.post(`/community/posts/${postId}/comments/${commentId}/like`);
  return data.data;
};

// --- Messaging ---
export const getConversations = async () => {
  const { data } = await api.get('/messaging/conversations');
  return data.data as Conversation[];
};

export const getMessages = async (conversationId: number, page = 1) => {
  const { data } = await api.get(`/messaging/conversations/${conversationId}/messages`, { params: { page } });
  return data.data as Message[];
};

// --- Groups & Discussions ---

export const getGroups = async () => {
  const { data } = await api.get('/community/groups');
  return data.data;
};

export const createGroup = async (groupData: { name: string; description: string; tags: string[]; color?: string }) => {
  const { data } = await api.post('/community/groups', groupData);
  return data.data;
};

export const deleteGroup = async (groupId: number) => {
  const { data } = await api.delete(`/community/groups/${groupId}`);
  return data.data;
};

export const getGroupMembers = async (groupId: number) => {
  const { data } = await api.get(`/community/groups/${groupId}/members`);
  return data.data;
};

export const removeGroupMember = async (groupId: number, userId: number) => {
  const { data } = await api.delete(`/community/groups/${groupId}/members/${userId}`);
  return data.data;
};

export const joinGroup = async (groupId: number) => {
  const { data } = await api.post(`/community/groups/${groupId}/join`);
  return data.data;
};

export const leaveGroup = async (groupId: number) => {
  const { data } = await api.post(`/community/groups/${groupId}/leave`);
  return data.data;
};

export const reportGroup = async (groupId: number) => {
  const { data } = await api.post(`/community/groups/${groupId}/report`);
  return data.data;
};

export const getTrendingDiscussions = async () => {
  const { data } = await api.get('/community/discussions/trending');
  return data.data;
};

export const getOrCreateConversation = async (user2Id: number) => {
  const { data } = await api.post('/messaging/conversations', { user2Id });
  return data.data as Conversation;
};

export const saveMessage = async (conversationId: number, content: string) => {
  const { data } = await api.post(`/messaging/conversations/${conversationId}/messages`, { content });
  return data.data as Message;
};

export const markAsRead = async (conversationId: number) => {
  const { data } = await api.post(`/messaging/conversations/${conversationId}/read`);
  return data;
};
