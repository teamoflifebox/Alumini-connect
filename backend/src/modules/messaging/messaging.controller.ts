import { Response, NextFunction } from 'express';
import { messagingService } from './messaging.service';
import { AuthRequest } from '../auth/auth.middleware';
import { io } from '../../core/socket';

export class MessagingController {
  async getOrCreateConversation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { user2Id } = req.body;
      const conversation = await messagingService.getOrCreateConversation(req.user.id, user2Id);
      res.status(200).json({ status: 'success', data: conversation });
    } catch (error: any) {
      next(error);
    }
  }

  async getConversations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversations = await messagingService.getConversations(req.user.id);
      res.status(200).json({ status: 'success', data: conversations });
    } catch (error: any) {
      next(error);
    }
  }

  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const messages = await messagingService.getMessages(req.params.id as string, Number(limit), offset);
      res.status(200).json({ status: 'success', data: messages });
    } catch (error: any) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await messagingService.markAsRead(req.params.id as string, req.user.id);
      res.status(200).json({ status: 'success', message: 'Marked as read' });
    } catch (error: any) {
      next(error);
    }
  }

  async saveMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;
      const conversationId = req.params.id as string;
      const message = await messagingService.saveMessage(conversationId, req.user.id, content);
      
      // Emit real-time event to the room
      io?.to(`conversation_${conversationId}`).emit('receive_message', message);
      
      res.status(201).json({ status: 'success', data: message });
    } catch (error: any) {
      next(error);
    }
  }
}

export const messagingController = new MessagingController();
