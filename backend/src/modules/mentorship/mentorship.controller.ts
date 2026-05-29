import { Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { mentorshipService } from './mentorship.service';

export class MentorshipController {
  async createSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const { 
        title, skills, duration, session_type, meeting_mode, meeting_url, 
        start_time, end_time, max_participants, visibility, thumbnail_url, target_domain,
        selected_participants 
      } = req.body;
      
      const errors: string[] = [];

      if (!title || title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long.');
      }
      if (!duration || duration.trim().length === 0) {
        errors.push('Duration is required.');
      }
      
      let parsedSkills: string[] = [];
      if (Array.isArray(skills)) {
        parsedSkills = skills.map((s: any) => String(s).trim()).filter(Boolean);
      } else if (typeof skills === 'string') {
        parsedSkills = skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (parsedSkills.length === 0) {
        errors.push('At least one topic or skill is required.');
      }

      if (errors.length > 0) {
        res.status(400).json({ status: 'error', errors });
        return;
      }

      const mentorId = Number(req.user.id);
      const session = await mentorshipService.createSession({
        mentorId,
        title: title.trim(),
        skills: parsedSkills,
        duration: duration.trim(),
        session_type,
        meeting_mode,
        meeting_url,
        start_time,
        end_time,
        max_participants: max_participants ? Number(max_participants) : undefined,
        visibility,
        thumbnail_url,
        target_domain,
        selected_participants: selected_participants || []
      });

      res.status(201).json({ status: 'success', data: session });
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      const sessions = await mentorshipService.listAndSearchSessions(
        search ? String(search) : undefined
      );
      res.status(200).json({ status: 'success', data: sessions });
    } catch (error) {
      next(error);
    }
  }

  async getRecommended(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }
      const userId = Number(req.user.id);
      const sessions = await mentorshipService.getRecommendedSessions(userId);
      res.status(200).json({ status: 'success', data: sessions });
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const sessionId = Number(req.params.id);
      const userId = Number(req.user.id);

      if (isNaN(sessionId)) {
        res.status(400).json({ status: 'error', message: 'Invalid session ID' });
        return;
      }

      await mentorshipService.deleteSession(sessionId, userId);
      res.status(200).json({ status: 'success', message: 'Mentorship session deleted successfully.' });
    } catch (error) {
      res.status(400).json({ status: 'error', message: (error as Error).message });
    }
  }

  async joinSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const sessionId = Number(req.params.id);
      const userId = Number(req.user.id);

      if (isNaN(sessionId)) {
        res.status(400).json({ status: 'error', message: 'Invalid session ID' });
        return;
      }

      const result = await mentorshipService.joinSession(sessionId, userId);
      res.status(200).json({ status: 'success', message: 'Joined mentorship session successfully.', data: result });
    } catch (error) {
      res.status(400).json({ status: 'error', message: (error as Error).message });
    }
  }

  async leaveSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ status: 'error', message: 'Unauthorized' });
        return;
      }

      const sessionId = Number(req.params.id);
      const userId = Number(req.user.id);

      if (isNaN(sessionId)) {
        res.status(400).json({ status: 'error', message: 'Invalid session ID' });
        return;
      }

      await mentorshipService.leaveSession(sessionId, userId);
      res.status(200).json({ status: 'success', message: 'Left mentorship session successfully.' });
    } catch (error) {
      res.status(400).json({ status: 'error', message: (error as Error).message });
    }
  }

  async inviteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const { sessionId, targetUserId } = req.body;
      const mentorId = Number(req.user.id);
      
      if (!sessionId || !targetUserId) {
        return res.status(400).json({ status: 'error', message: 'Missing parameters' });
      }

      const invite = await mentorshipService.inviteUser(Number(sessionId), Number(targetUserId), mentorId);
      res.status(200).json({ status: 'success', data: invite });
    } catch (error) {
      next(error);
    }
  }

  async getInvitations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const userId = Number(req.user.id);
      
      const invites = await mentorshipService.getInvitations(userId);
      res.status(200).json({ status: 'success', data: invites });
    } catch (error) {
      next(error);
    }
  }

  async respondToInvitation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const userId = Number(req.user.id);
      const inviteId = Number(req.params.id);
      const { action } = req.body; // 'accepted' | 'rejected'
      
      if (action !== 'accepted' && action !== 'rejected') {
        return res.status(400).json({ status: 'error', message: 'Invalid action' });
      }

      const invite = await mentorshipService.respondToInvitation(inviteId, userId, action);
      res.status(200).json({ status: 'success', data: invite });
    } catch (error) {
      next(error);
    }
  }
}

export const mentorshipController = new MentorshipController();
