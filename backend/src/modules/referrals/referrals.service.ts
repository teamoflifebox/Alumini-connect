import { referralsRepository, CreateReferralDTO, ApplyReferralDTO } from './referrals.repository';
import { notificationsRepository } from '../notifications/notifications.repository';
import { userManagementRepository } from '../user-management/user-management.repository';
import { socketService } from '../../services/socket.service';
import { sendNotificationEmail } from '../../utils/email';
import pool from '../../core/config/db';

export class ReferralsService {
  async createReferral(data: CreateReferralDTO) {
    const referral = await referralsRepository.createReferral(data);
    
    // Gamification: Posting referral = +10
    await referralsRepository.addLeaderboardScore(data.userId, 10);
    
    // Notify all students and alumni
    const targetUsers = await userManagementRepository.getUsersByRoles(['student', 'alumni']);
    const targetUserIds = targetUsers.filter(u => u.id !== data.userId).map(u => u.id); // don't notify the poster
    
    if (targetUserIds.length > 0) {
      const title = 'New Referral Posted';
      const message = `A new referral for ${data.rolePosition} at ${data.companyName} was just posted!`;
      const type = 'new_referral';
      
      const insertedIds = await notificationsRepository.createBulkNotifications(
        targetUserIds,
        title,
        message,
        type,
        String(referral.id)
      );
      
      // Emit via sockets ONLY to users who didn't opt out (the ones we actually inserted notifications for)
      insertedIds.forEach(id => {
        socketService.sendNotificationToUser(id, {
          title,
          type,
          message
        });
      });
    }

    return referral;
  }

  async getAllReferrals(userId: number, search?: string, company?: string, role?: string, location?: string) {
    return await referralsRepository.getAllReferrals(userId, search, company, role, location);
  }

  async getReferralById(id: number) {
    return await referralsRepository.getReferralById(id);
  }

  async getReferralsByUser(userId: number) {
    return await referralsRepository.getReferralsByUser(userId);
  }

  async closeReferral(id: number, userId: number) {
    return await referralsRepository.updateReferralStatus(id, 'Closed', userId);
  }

  async applyToReferral(data: ApplyReferralDTO) {
    try {
      const application = await referralsRepository.applyToReferral(data);
      
      // Notify the referral owner
      const referral = await referralsRepository.getReferralById(data.referralId);
      
      if (referral) {
        // Gamification: Each application = +5 to the referral owner
        await referralsRepository.addLeaderboardScore(referral.user_id, 5);

        const notif = await notificationsRepository.createNotification(
          referral.user_id,
          'New Referral Application',
          `${data.fullName} applied for ${referral.role_position} at ${referral.company_name}`,
          'referral_application',
          String(application.id)
        );

        if (notif) {
          socketService.sendNotificationToUser(referral.user_id, {
            title: 'New Referral Application',
            type: 'referral_application',
            message: `${data.fullName} applied for ${referral.role_position} at ${referral.company_name}`
          });
          
          // Get user email
          const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [referral.user_id]);
          if (userRes.rows.length > 0) {
            sendNotificationEmail(referral.user_id, {
              to: userRes.rows[0].email,
              subject: 'New Referral Application',
              html: `<p>Hi,</p><p>${data.fullName} has applied for your referral for <b>${referral.role_position}</b> at ${referral.company_name}.</p><p>Log in to view their application.</p>`
            }).catch(e => console.error('Failed to send email:', e));
          }
        }
      }

      return application;
    } catch (error: any) {
      if (error.code === '23505') { // Postgres unique violation code
        throw new Error('You have already applied to this referral.');
      }
      throw error;
    }
  }

  async getApplicationsForReferral(referralId: number, ownerId: number, userRole?: string) {
    return await referralsRepository.getApplicationsForReferral(referralId, ownerId, userRole);
  }

  async updateApplicationStatus(applicationId: number, status: string, changedBy: number) {
    const application = await referralsRepository.getApplication(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    
    // Check if the user updating is the owner of the referral or the applicant
    if (application.referral_owner_id !== changedBy && application.applicant_id !== changedBy) {
      throw new Error('Unauthorized to update this application');
    }

    const updated = await referralsRepository.updateApplicationStatus(applicationId, status, changedBy);

    // Gamification points based on status
    let points = 0;
    if (status === 'Shortlisted') points = 15;
    if (status === 'Selected') points = 50;

    if (points > 0) {
      await referralsRepository.addLeaderboardScore(changedBy, points);
    }

    // Notify the other party
    const targetUserId = application.referral_owner_id === changedBy 
      ? application.applicant_id 
      : application.referral_owner_id;

    const notificationMessage = application.referral_owner_id === changedBy
      ? `Your application for ${application.role_position} at ${application.company_name} is now: ${status}`
      : `Applicant ${application.full_name} updated their status to: ${status} for ${application.role_position}`;

    const notif = await notificationsRepository.createNotification(
      targetUserId,
      'Application Status Updated',
      notificationMessage,
      'referral_status_update',
      String(applicationId)
    );

    if (notif) {
      socketService.sendNotificationToUser(targetUserId, {
        title: 'Application Status Updated',
        type: 'referral_status_update',
        message: notificationMessage
      });
      
      const userRes = await pool.query('SELECT email FROM users WHERE id = $1', [targetUserId]);
      if (userRes.rows.length > 0) {
        sendNotificationEmail(targetUserId, {
          to: userRes.rows[0].email,
          subject: 'Application Status Updated',
          html: `<p>Hi,</p><p>${notificationMessage}</p><p>Log in to check the details.</p>`
        }).catch(e => console.error('Failed to send email:', e));
      }
    }

    return updated;
  }

  async getLeaderboard() {
    return await referralsRepository.getLeaderboard();
  }

  async reportReferral(referralId: string, reporterId: number, reason: string) {
    const reportCount = await referralsRepository.reportReferral(referralId, reporterId, reason);

    if (reportCount >= 5) {
      const referral = await referralsRepository.getReferralById(Number(referralId));
      if (referral) {
        // Auto-ban/hide referral if it reaches 5 reports
        await referralsRepository.updateReferralStatus(Number(referralId), 'Deleted', referral.user_id);
        return { success: true, reportCount, action: 'auto_deleted' };
      }
    }
    
    return { success: true, reportCount, action: 'reported' };
  }

  async getAdminReportedReferrals() {
    return await referralsRepository.getAdminReportedReferrals();
  }

  async deleteReferral(id: string) {
    return await referralsRepository.deleteReferral(id);
  }
}

export const referralsService = new ReferralsService();
