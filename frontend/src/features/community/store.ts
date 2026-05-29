import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';

interface CommunityState {
  socket: Socket | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
  notifications: any[];
  addNotification: (notification: any) => void;
  unreadCount: number;
  clearUnread: () => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  socket: null,
  notifications: [],
  unreadCount: 0,
  
  connectSocket: () => {
    const { socket } = get();
    if (socket?.connected) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('notification', (data) => {
      set((state) => ({
        notifications: [data, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),

  clearUnread: () => set({ unreadCount: 0 })
}));
