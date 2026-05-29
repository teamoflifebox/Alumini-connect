import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';


export let io: SocketServer;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    jwt.verify(token, process.env.SECRET_KEY || 'secret', (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error'));
      socket.data.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.data.user.id}`);
    
    // Join a room unique to the user for direct notifications/messages
    socket.join(`user_${socket.data.user.id}`);

    // Join conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Real-time typing indicators
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit('typing', {
        userId: socket.data.user.id,
        isTyping
      });
    });

    // Handle messages
    socket.on('send_message', (data) => {
      // The actual DB saving is handled by REST API, this is just for real-time broadcast
      io.to(`conversation_${data.conversationId}`).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });

  return io;
};
