import { messagingRepository } from './messaging.repository';

export class MessagingService {
  async getOrCreateConversation(user1Id: string, user2Id: string) {
    return await messagingRepository.getOrCreateConversation(user1Id, user2Id);
  }

  async getConversations(userId: string) {
    return await messagingRepository.getConversations(userId);
  }

  async getMessages(conversationId: string, limit: number, offset: number) {
    return await messagingRepository.getMessages(conversationId, limit, offset);
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    return await messagingRepository.saveMessage(conversationId, senderId, content);
  }

  async markAsRead(conversationId: string, userId: string) {
    return await messagingRepository.markAsRead(conversationId, userId);
  }
}

export const messagingService = new MessagingService();
