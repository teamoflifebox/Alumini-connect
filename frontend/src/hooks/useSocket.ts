import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

// Share a single global socket connection across all component hook instances
let globalSocket: Socket | null = null;

export const useSocket = () => {
  const { accessToken, user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(globalSocket);

  useEffect(() => {
    if (!accessToken || !user) {
      if (globalSocket) {
        console.log('Logging out, disconnecting global socket...');
        globalSocket.disconnect();
        globalSocket = null;
        setSocket(null);
      }
      return;
    }

    if (!globalSocket) {
      console.log('Initializing global socket connection...');
      globalSocket = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling']
      });

      globalSocket.on('connect', () => {
        console.log('Connected to realtime server globally:', globalSocket?.id);
        // Force a re-render of the hook to propagate the socket instance
        setSocket(globalSocket);
      });

      globalSocket.on('disconnect', () => {
        console.log('Disconnected from realtime server globally');
      });
    }

    setSocket(globalSocket);

    // Keep global connection alive between page transitions. 
    // It will only be torn down if the user logs out or token changes.
  }, [accessToken, user]);

  const joinSessionRoom = (sessionId: string | number) => {
    if (globalSocket?.connected) {
      globalSocket.emit('join_session', sessionId);
    } else if (globalSocket) {
      globalSocket.once('connect', () => {
        globalSocket?.emit('join_session', sessionId);
      });
    }
  };

  const leaveSessionRoom = (sessionId: string | number) => {
    if (globalSocket?.connected) {
      globalSocket.emit('leave_session', sessionId);
    }
  };

  const sendChatMessage = (sessionId: string | number, message: string) => {
    if (globalSocket?.connected) {
      globalSocket.emit('send_message', { sessionId, message });
    }
  };

  return {
    socket,
    joinSessionRoom,
    leaveSessionRoom,
    sendChatMessage
  };
};
