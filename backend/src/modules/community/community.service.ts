import { communityRepository } from './community.repository';

export class CommunityService {
  async sendConnectionRequest(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) throw new Error("Cannot connect with yourself");
    return await communityRepository.sendConnectionRequest(requesterId, recipientId);
  }

  async respondConnectionRequest(connectionId: string, userId: string, status: 'accepted' | 'rejected') {
    return await communityRepository.respondConnectionRequest(connectionId, userId, status);
  }

  async getConnections(userId: string) {
    return await communityRepository.getConnections(userId);
  }

  async createPost(authorId: string, content: string, type?: string, imageUrl?: string, groupId?: number) {
    return await communityRepository.createPost(authorId, content, type, imageUrl, groupId);
  }

  async getFeed(userId: string, limit: number, offset: number, groupId?: number) {
    return await communityRepository.getFeed(userId, limit, offset, groupId);
  }

  async getPost(postId: string, userId: string) {
    return await communityRepository.getPost(postId, userId);
  }

  async toggleLike(postId: string, userId: string) {
    return await communityRepository.toggleLike(postId, userId);
  }

  async addComment(postId: string, authorId: string, content: string, parentId?: string) {
    return await communityRepository.addComment(postId, authorId, content, parentId);
  }

  async getComments(postId: string, userId: string) {
    return await communityRepository.getComments(postId, userId);
  }

  async toggleCommentLike(commentId: string, userId: string) {
    return await communityRepository.toggleCommentLike(commentId, userId);
  }
}

export const communityService = new CommunityService();
