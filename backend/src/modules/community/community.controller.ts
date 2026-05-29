import { Response, NextFunction } from 'express';
import { communityService } from './community.service';
import { communityRepository } from './community.repository';
import { AuthRequest } from '../auth/auth.middleware';
import { io } from '../../core/socket';

export class CommunityController {
  async sendConnectionRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { recipientId } = req.body;
      const connection = await communityService.sendConnectionRequest(req.user.id, recipientId);
      
      // Emit notification
      io?.to(`user_${recipientId}`).emit('notification', {
        type: 'connection_request',
        from: req.user.id,
        message: 'Someone sent you a connection request'
      });
      
      res.status(201).json({ status: 'success', data: connection });
    } catch (error: any) {
      next(error);
    }
  }

  async respondConnectionRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const connection = await communityService.respondConnectionRequest(req.params.id as string, req.user.id, status);

      if (status === 'accepted') {
        io?.to(`user_${connection.requester_id}`).emit('notification', {
          type: 'connection_accepted',
          from: req.user.id,
          message: 'Your connection request was accepted'
        });
      }

      res.status(200).json({ status: 'success', data: connection });
    } catch (error: any) {
      next(error);
    }
  }

  async getConnections(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const connections = await communityService.getConnections(req.user.id);
      res.status(200).json({ status: 'success', data: connections });
    } catch (error: any) {
      next(error);
    }
  }

  async createPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { content, type, imageUrl, groupId } = req.body;
      const post = await communityService.createPost(req.user.id, content, type, imageUrl, groupId);
      res.status(201).json({ status: 'success', data: post });
    } catch (error: any) {
      next(error);
    }
  }

  async getFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, groupId } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const data = await communityService.getFeed(
        req.user.id, 
        Number(limit), 
        offset, 
        groupId ? Number(groupId) : undefined
      );
      res.status(200).json({ status: 'success', data: data.posts, total: data.total, page: Number(page) });
    } catch (error: any) {
      next(error);
    }
  }

  async getPost(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await communityService.getPost(req.params.id as string, req.user.id);
      if (!post) {
        return res.status(404).json({ status: 'error', message: 'Post not found' });
      }
      res.status(200).json({ status: 'success', data: post });
    } catch (error: any) {
      next(error);
    }
  }

  async toggleLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await communityService.toggleLike(req.params.id as string, req.user.id);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      next(error);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { content, parentId } = req.body;
      const comment = await communityService.addComment(req.params.id as string, req.user.id, content, parentId);
      res.status(201).json({ status: 'success', data: comment });
    } catch (error: any) {
      next(error);
    }
  }

  async getComments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comments = await communityService.getComments(req.params.id as string, req.user.id);
      res.status(200).json({ status: 'success', data: comments });
    } catch (error: any) {
      next(error);
    }
  }

  async toggleCommentLike(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await communityService.toggleCommentLike(req.params.commentId as string, req.user.id);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      next(error);
    }
  }

  // --- Groups / Communities ---
  
  async getGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const groups = await communityRepository.getGroups(req.user.id);
      res.status(200).json({ status: 'success', data: groups });
    } catch (error: any) {
      next(error);
    }
  }

  async joinGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await communityRepository.joinGroup(req.params.id as string, req.user.id);
      res.status(200).json({ status: 'success', data: group });
    } catch (error: any) {
      next(error);
    }
  }

  async createGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, tags, color } = req.body;
      const group = await communityRepository.createGroup(name, description, tags, color || 'from-blue-500/20 to-cyan-500/5', req.user.id);
      res.status(201).json({ status: 'success', data: group });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await communityRepository.deleteGroup(req.params.id as string, req.user.id);
      res.status(200).json({ status: 'success', data: group });
    } catch (error: any) {
      next(error);
    }
  }

  async getTrendingDiscussions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const discussions = await communityRepository.getTrendingDiscussions();
      res.status(200).json({ status: 'success', data: discussions });
    } catch (error: any) {
      next(error);
    }
  }

  async uploadMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'No file uploaded' });
      }
      res.status(200).json({ status: 'success', data: { url: req.file.path } });
    } catch (error: any) {
      next(error);
    }
  }

  async getGroupMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const members = await communityRepository.getGroupMembers(req.params.id as string);
      res.status(200).json({ status: 'success', data: members });
    } catch (error: any) {
      next(error);
    }
  }

  async removeGroupMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, userId } = req.params;
      const group = await communityRepository.removeGroupMember(id as string, userId as string, req.user.id);
      res.status(200).json({ status: 'success', data: group });
    } catch (error: any) {
      next(error);
    }
  }

  async leaveGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await communityRepository.leaveGroup(req.params.id as string, req.user.id);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      next(error);
    }
  }

  async reportGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await communityRepository.reportGroup(req.params.id as string, req.user.id);
      res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
      next(error);
    }
  }
}

export const communityController = new CommunityController();
