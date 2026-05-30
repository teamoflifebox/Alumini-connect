import { mentorshipRepository, CreateSessionParams } from './mentorship.repository';
import { typesenseService } from '../../services/typesense.service';

import { socketService } from '../../services/socket.service';
import { googleMeetService } from '../../services/google-meet.service';
import { notificationsRepository } from '../notifications/notifications.repository';
import { userManagementRepository } from '../user-management/user-management.repository';
export class MentorshipService {
  async createSession(params: CreateSessionParams) {
    if (params.meeting_mode === 'Video Call (Auto-Generated)' && (!params.meeting_url || params.meeting_url.trim() === '')) {
      try {
        // Generate a unique, secure Jitsi Meet room name
        const roomName = `AlumniConnect-Session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        params.meeting_url = `https://meet.jit.si/${roomName}`;
      } catch (err: any) {
        console.error('Failed to auto-generate video link:', err);
        throw new Error('Failed to generate video link. Please provide your own meeting URL.');
      }
    } else if (params.meeting_mode === 'Google Meet' && (!params.meeting_url || params.meeting_url.trim() === '')) {
      try {
        const startTimeStr = params.start_time || new Date().toISOString();
        let endMs = new Date(startTimeStr).getTime();
        const dur = params.duration.toLowerCase();
        if (dur.includes('30 min')) endMs += 30 * 60000;
        else if (dur.includes('45 min')) endMs += 45 * 60000;
        else if (dur.includes('1 hour') || dur.includes('1 hr')) endMs += 60 * 60000;
        else if (dur.includes('2 hour') || dur.includes('2 hr')) endMs += 120 * 60000;
        else endMs += 60 * 60000; // default 1 hr

        params.meeting_url = await googleMeetService.createMeeting({
          summary: params.title,
          description: `Mentorship Session: ${params.title}\nSkills: ${params.skills.join(', ')}`,
          startTime: new Date(startTimeStr).toISOString(),
          endTime: new Date(endMs).toISOString()
        });
      } catch (err: any) {
        console.error('Failed to auto-generate Google Meet link:', err);
        throw new Error(err.message || 'Failed to generate Google Meet link. Please provide your own meeting URL.');
      }
    }

    // 1. Create the session in the database
    const session = await mentorshipRepository.createSession(params);

    // 2. Fetch the fully joined session details (includes mentor name and profile headline)
    const fullSession = await mentorshipRepository.getSessionById(session.id);

    if (fullSession) {
      // 3. Index it in Typesense asynchronously
      // Fallback is built-in; if Typesense is offline, this call safely returns/logs a warning
      typesenseService.indexSession({
        id: fullSession.id,
        title: fullSession.title,
        skills: fullSession.skills,
        duration: fullSession.duration,
        mentor_name: fullSession.mentor_name || 'Mentor',
        headline: fullSession.mentor_headline || '',
      });
      // Direct One-to-One, Invite-Only or Private sessions:
      // ONLY notify explicitly selected / invited participants
      if (
        fullSession.session_type === 'One-to-One' || 
        fullSession.visibility === 'Private' || 
        (params.selected_participants && params.selected_participants.length > 0)
      ) {
        if (params.selected_participants && params.selected_participants.length > 0) {
          for (const userId of params.selected_participants) {
            // Send an invite (or auto-join them, depending on logic, let's use inviteUser)
            await mentorshipRepository.inviteUser(fullSession.id, userId);
            
            // Persist notification in database
            const notif = await notificationsRepository.createNotification(
              userId,
              'Mentorship Invitation',
              `You have been specifically invited to "${fullSession.title}"!`,
              'session_invite',
              String(fullSession.id)
            );

            if (notif) {
              socketService.sendNotificationToUser(userId, {
                type: 'session_invite',
                message: `You have been specifically invited to "${fullSession.title}"!`,
                sessionId: fullSession.id
              });
            }
          }
        }
      } else {
        // Public/Group/Workshop session (and NOT One-to-One or Private):
        // Notify targeted domain or all public users (EXCLUDING admins and the creator)
        if (params.target_domain) {
          // Find users in this domain
          const targetedUsers = await mentorshipRepository.getUsersByDomain(params.target_domain);
          for (const user of targetedUsers) {
            if (user.id === params.mentorId || user.role === 'admin') continue; // don't notify creator or admins
            
            // Persist notification in database
            const notif = await notificationsRepository.createNotification(
              user.id,
              'New Targeted Session',
              `New session "${fullSession.title}" tailored for ${params.target_domain} has been created!`,
              'session_created',
              String(fullSession.id)
            );

            if (notif) {
              socketService.sendNotificationToUser(user.id, {
                type: 'session_created',
                message: `New session "${fullSession.title}" tailored for ${params.target_domain} has been created!`,
                sessionId: fullSession.id
              });
            }
          }
        } else {
          // Persist notification for all active users except admins and creator
          try {
            const allUsers = await userManagementRepository.getAllUsers();
            const userIds = allUsers
              .filter((u: any) => u.id !== params.mentorId && u.role !== 'admin')
              .map((u: any) => u.id);

            if (userIds.length > 0) {
              const insertedIds = await notificationsRepository.createBulkNotifications(
                userIds,
                'New Mentorship Session',
                `New session "${fullSession.title}" has been created!`,
                'session_created',
                String(fullSession.id)
              );
              
              // Only emit to users who have notifications enabled
              insertedIds.forEach(id => {
                socketService.sendNotificationToUser(id, {
                  type: 'session_created',
                  message: `New session "${fullSession.title}" has been created!`,
                  sessionId: fullSession.id
                });
              });
            }
          } catch (bulkErr) {
            console.error('Failed to create bulk notifications for public session:', bulkErr);
          }
        }
      }
    }

    return fullSession || session;
  }

  async deleteSession(sessionId: number, currentUserId: number) {
    // Check if the session exists and current user is the mentor
    const session = await mentorshipRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Mentorship session not found.');
    }

    if (session.mentor_id !== currentUserId) {
      throw new Error('Unauthorized to delete this mentorship session.');
    }

    // 1. Delete from PostgreSQL
    const deletedSession = await mentorshipRepository.deleteSession(sessionId);

    // Persist session cancellation notification for all registered attendees
    if (session.attendee_ids && session.attendee_ids.length > 0) {
      const attendeeIds = session.attendee_ids.filter((id: any) => typeof id === 'number');
      if (attendeeIds.length > 0) {
        try {
          const insertedIds = await notificationsRepository.createBulkNotifications(
            attendeeIds,
            'Session Cancelled',
            `The session "${session.title}" has been cancelled by the mentor.`,
            'session_deleted',
            String(sessionId)
          );
          
          insertedIds.forEach((id: number) => {
            socketService.sendNotificationToUser(id, {
              type: 'session_deleted',
              message: `The session "${session.title}" has been cancelled by the mentor.`,
              sessionId
            });
          });
        } catch (notifErr) {
          console.error('Failed to notify attendees of session deletion:', notifErr);
        }
      }
    }

    // We also should remove the global socket emit since attendees get individual socket messages above.
    // socketService.emitGlobally('notification', { ... })


    return deletedSession;
  }

  async listAndSearchSessions(searchQuery?: string) {
    // If no search query is provided, return all sessions directly from the database
    if (!searchQuery || searchQuery.trim() === '') {
      return await mentorshipRepository.getAllSessions();
    }

    console.log(`Searching mentorship sessions for: "${searchQuery}"`);

    // 1. Try searching through Typesense
    const typesenseIds = await typesenseService.searchSessions(searchQuery);

    if (typesenseIds !== null) {
      console.log(`Typesense returned ${typesenseIds.length} matches.`);
      // If Typesense successfully responded, fetch the specific matching sessions from the database
      if (typesenseIds.length === 0) {
        return [];
      }
      return await mentorshipRepository.getSessionsByIds(typesenseIds.map(Number));
    }

    // 2. Fall back to PostgreSQL text query if Typesense was offline or failed
    console.log('Typesense search offline. Falling back to PostgreSQL query...');
    return await mentorshipRepository.searchSessionsInPostgres(searchQuery);
  }
  
  async getRecommendedSessions(userId: number) {
    return await mentorshipRepository.getRecommendedSessions(userId);
  }

  async joinSession(sessionId: number, userId: number) {
    const session = await mentorshipRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Mentorship session not found.');
    }
    
    // Check participant limit
    if (session.max_participants && session.attendee_ids.length >= session.max_participants) {
      throw new Error('Session is already full.');
    }

    const joined = await mentorshipRepository.joinSession(sessionId, userId);

    // Notify globally to update counts in real time
    socketService.emitGlobally('session_updated', {
      sessionId,
      action: 'user_joined',
      userId
    });

    // Notify mentor about new attendee
    try {
      const joiningUser = await userManagementRepository.findUserById(String(userId));
      const userName = joiningUser ? joiningUser.name : 'A student';
      
      const notif = await notificationsRepository.createNotification(
        session.mentor_id,
        'Attendee Joined',
        `${userName} has joined your session "${session.title}"!`,
        'session_updated',
        String(sessionId)
      );

      if (notif) {
        socketService.sendNotificationToUser(session.mentor_id, {
          type: 'session_updated',
          message: `${userName} has joined your session "${session.title}"!`,
          sessionId
        });
      }
    } catch (err) {
      console.error('Failed to notify mentor of new attendee:', err);
    }

    return joined;
  }

  async leaveSession(sessionId: number, userId: number) {
    const session = await mentorshipRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error('Mentorship session not found.');
    }
    const left = await mentorshipRepository.leaveSession(sessionId, userId);
    
    // Notify globally to update counts in real time
    socketService.emitGlobally('session_updated', {
      sessionId,
      action: 'user_left',
      userId
    });
    
    return left;
  }

  async inviteUser(sessionId: number, targetUserId: number, mentorId: number) {
    const session = await mentorshipRepository.getSessionById(sessionId);
    if (!session) throw new Error('Session not found.');
    if (session.mentor_id !== mentorId) throw new Error('Unauthorized.');

    const invite = await mentorshipRepository.inviteUser(sessionId, targetUserId);
    
    // Notify the target user
    if (invite) {
      const notif = await notificationsRepository.createNotification(
        targetUserId,
        'Mentorship Invitation',
        `You have been invited to join the session "${session.title}"`,
        'session_invite',
        String(sessionId)
      );

      if (notif) {
        socketService.sendNotificationToUser(targetUserId, {
          type: 'session_invite',
          message: `You have been invited to join the session "${session.title}"`,
          sessionId
        });
      }
    }
    
    return invite;
  }

  async getInvitations(userId: number) {
    return await mentorshipRepository.getInvitations(userId);
  }

  async respondToInvitation(invitationId: number, userId: number, status: 'accepted' | 'rejected') {
    const invite = await mentorshipRepository.respondToInvitation(invitationId, userId, status);
    if (!invite) throw new Error('Invitation not found.');

    if (status === 'accepted') {
      await this.joinSession(invite.session_id, userId);
    }
    return invite;
  }
}

export const mentorshipService = new MentorshipService();
