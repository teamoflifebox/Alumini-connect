import { Response, NextFunction } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { referralsService } from './referrals.service';

export class ReferralsController {
  async createReferral(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const userId = Number(req.user.id);
      
      const {
        companyName, rolePosition, referralLink, jobDescription, skillsRequired,
        deadline, location, workType, salary, experienceRequired, openings
      } = req.body;

      // Basic validation
      if (!companyName || !rolePosition || !jobDescription) {
        return res.status(400).json({ status: 'error', message: 'Company name, role, and description are required' });
      }

      const referral = await referralsService.createReferral({
        userId,
        companyName,
        rolePosition,
        referralLink,
        jobDescription,
        skillsRequired: skillsRequired || [],
        deadline: deadline || null,
        location: location || null,
        workType: workType || null,
        salary: salary || null,
        experienceRequired: experienceRequired || null,
        openings: openings ? Number(openings) : null
      });

      res.status(201).json({ status: 'success', data: referral });
    } catch (error) {
      next(error);
    }
  }

  async getAllReferrals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const userId = Number(req.user.id);
      
      const { search, company, role, location } = req.query;
      const referrals = await referralsService.getAllReferrals(
        userId, search as string, company as string, role as string, location as string
      );
      res.status(200).json({ status: 'success', data: referrals });
    } catch (error) {
      next(error);
    }
  }

  async getReferralById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ status: 'error', message: 'Invalid ID' });
      
      const referral = await referralsService.getReferralById(id);
      if (!referral) return res.status(404).json({ status: 'error', message: 'Referral not found' });
      
      res.status(200).json({ status: 'success', data: referral });
    } catch (error) {
      next(error);
    }
  }

  async getMyPostedReferrals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const userId = Number(req.user.id);
      
      const referrals = await referralsService.getReferralsByUser(userId);
      res.status(200).json({ status: 'success', data: referrals });
    } catch (error) {
      next(error);
    }
  }

  async closeReferral(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const userId = Number(req.user.id);
      const id = Number(req.params.id);
      
      const referral = await referralsService.closeReferral(id, userId);
      if (!referral) return res.status(404).json({ status: 'error', message: 'Referral not found or unauthorized' });
      
      res.status(200).json({ status: 'success', data: referral });
    } catch (error) {
      next(error);
    }
  }

  async applyToReferral(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const applicantId = Number(req.user.id);
      const referralId = Number(req.params.id);
      
      const {
        fullName, email, phoneNumber, resumeUrl, skills, course, year, cgpa, portfolioLinks
      } = req.body;

      if (!fullName || !email || !resumeUrl) {
        return res.status(400).json({ status: 'error', message: 'Name, email, and resume are required' });
      }

      const application = await referralsService.applyToReferral({
        referralId,
        applicantId,
        fullName,
        email,
        phoneNumber,
        resumeUrl,
        skills: skills || [],
        course: course || null,
        year: year || null,
        cgpa: cgpa || null,
        portfolioLinks: portfolioLinks || {}
      });

      res.status(201).json({ status: 'success', data: application });
    } catch (error: any) {
      if (error.message.includes('already applied')) {
        return res.status(400).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async getApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const ownerId = Number(req.user.id);
      const referralId = Number(req.params.id);
      
      const applications = await referralsService.getApplicationsForReferral(referralId, ownerId, req.user.primary_role);
      res.status(200).json({ status: 'success', data: applications });
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async updateApplicationStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const changedBy = Number(req.user.id);
      const appId = Number(req.params.appId);
      const { status } = req.body;

      if (!status) return res.status(400).json({ status: 'error', message: 'Status is required' });

      const updated = await referralsService.updateApplicationStatus(appId, status, changedBy);
      res.status(200).json({ status: 'success', data: updated });
    } catch (error: any) {
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      next(error);
    }
  }

  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leaderboard = await referralsService.getLeaderboard();
      res.status(200).json({ status: 'success', data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  async reportReferral(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      const reporterId = Number(req.user.id);
      const referralId = req.params.id as string;
      const { reason } = req.body;

      if (!reason) return res.status(400).json({ status: 'error', message: 'Reason is required' });

      const result = await referralsService.reportReferral(referralId, reporterId, reason);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAdminReportedReferrals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.primary_role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Admin access required' });
      }
      const referrals = await referralsService.getAdminReportedReferrals();
      res.status(200).json({ status: 'success', data: referrals });
    } catch (error) {
      next(error);
    }
  }

  async deleteReferral(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.primary_role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Admin access required' });
      }
      const referralId = req.params.id as string;
      const result = await referralsService.deleteReferral(referralId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const referralsController = new ReferralsController();
