export interface Profile {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  work_experience?: any[];
  education?: any[];
  is_open_to_work?: boolean;
}

export interface Connection {
  id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  user_id: number;
  name: string;
  avatar_url?: string;
  role: string;
  headline?: string;
}

export interface Post {
  id: number;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  author_role: string;
  content: string;
  post_type: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  updated_at: string;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_read?: boolean;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
