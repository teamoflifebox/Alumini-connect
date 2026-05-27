import { referralsRepository, CreateReferralDTO, ApplyReferralDTO } from './referrals.repository';
import { notificationsRepository } from '../notifications/notifications.repository';
import { socketService } from '../../services/socket.service';

export class ReferralsService {
  async createReferral(data: CreateReferralDTO) {
    const referral = await referralsRepository.createReferral(data);
    
    // Gamification: Posting referral = +10
    await referralsRepository.addLeaderboardScore(data.userId, 10);
    
    // Notify globally
    socketService.emitGlobally('notification', {
      type: 'referral_created',
      message: `New referral posted for ${data.companyName} - ${data.rolePosition}!`,
      title: 'New Referral'
    });

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

        await notificationsRepository.createNotification(
          referral.user_id,
          'New Referral Application',
          `${data.fullName} applied for ${referral.rolePosition} at ${referral.companyName}`,
          'referral_application',
          String(application.id)
        );

        socketService.sendNotificationToUser(referral.user_id, {
          title: 'New Referral Application',
          type: 'referral_application',
          message: `${data.fullName} applied for ${referral.rolePosition} at ${referral.companyName}`
        });
      }

      return application;
    } catch (error: any) {
      if (error.code === '23505') { // Postgres unique violation code
        throw new Error('You have already applied to this referral.');
      }
      throw error;
    }
  }

  async getApplicationsForReferral(referralId: number, ownerId: number) {
    return await referralsRepository.getApplicationsForReferral(referralId, ownerId);
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

    await notificationsRepository.createNotification(
      targetUserId,
      'Application Status Updated',
      notificationMessage,
      'referral_status_update',
      String(applicationId)
    );

    socketService.sendNotificationToUser(targetUserId, {
      title: 'Application Status Updated',
      type: 'referral_status_update',
      message: notificationMessage
    });

    return updated;
  }

  async getLeaderboard() {
    return await referralsRepository.getLeaderboard();
  }
}

export const referralsService = new ReferralsService();
