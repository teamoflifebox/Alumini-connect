import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface ServerToClientEvents {
  notification: (data: any) => void;
  session_updated: (data: any) => void;
  chat_message: (data: any) => void;
}

export interface ClientToServerEvents {
  join_session: (sessionId: string) => void;
  leave_session: (sessionId: string) => void;
  send_message: (data: { sessionId: string; message: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId: string;
  role: string;
}

class SocketService {
  private io: SocketServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

  public init(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Middleware to authenticate Socket connection
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }
        
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
        socket.data.userId = decoded.id;
        socket.data.role = decoded.primary_role || decoded.role;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);

      // Automatically join a room corresponding to the user's ID to receive targeted notifications
      socket.join(`user_${socket.data.userId}`);

      // Handle joining a session room (for live chat or live updates inside a session)
      socket.on('join_session', (sessionId) => {
        socket.join(`session_${sessionId}`);
        console.log(`User ${socket.data.userId} joined session room ${sessionId}`);
      });

      // Handle leaving a session room
      socket.on('leave_session', (sessionId) => {
        socket.leave(`session_${sessionId}`);
        console.log(`User ${socket.data.userId} left session room ${sessionId}`);
      });

      // Handle incoming chat messages for a session
      socket.on('send_message', (data) => {
        // Broadcast to everyone in the room EXCEPT the sender (sender can optimistically update UI)
        // Or broadcast to everyone including sender depending on frontend implementation.
        this.io?.to(`session_${data.sessionId}`).emit('chat_message', {
          sessionId: data.sessionId,
          userId: socket.data.userId,
          message: data.message,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  // --- Utility methods to send events from HTTP Controllers ---

  /**
   * Send a notification to a specific user
   */
  public sendNotificationToUser(userId: string | number, payload: any) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('notification', payload);
    }
  }

  /**
   * Send an event to all users connected to a specific session room
   */
  public emitToSession(sessionId: string | number, event: keyof ServerToClientEvents, payload: any) {
    if (this.io) {
      this.io.to(`session_${sessionId}`).emit(event as any, payload);
    }
  }

  /**
   * Send an event globally (e.g. for a new public session)
   */
  public emitGlobally(event: keyof ServerToClientEvents, payload: any) {
    if (this.io) {
      this.io.emit(event as any, payload);
    }
  }
}

export const socketService = new SocketService();
