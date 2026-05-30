import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userManagementRoutes from '../modules/user-management/user-management.routes';
import profilesRoutes from '../modules/profiles/profiles.routes';
import jobsRoutes from '../modules/jobs/jobs.routes';
import rbacRoutes from '../modules/rbac/rbac.routes';
import eventsRoutes from '../modules/events/events.routes';
import donationsRoutes from '../modules/donations/donations.routes';
import communityRoutes from '../modules/community/community.routes';
import messagingRoutes from '../modules/messaging/messaging.routes';
import mentorshipRoutes from '../modules/mentorship/mentorship.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';
import referralsRoutes from '../modules/referrals/referrals.routes';
import successStoriesRoutes from '../modules/success-stories/success-stories.routes';
import { settingsRoutes } from '../modules/settings/settings.routes';
import { statsRoutes } from '../modules/stats/stats.routes';

/**
 * Central API route registration
 * All routes are prefixed with /api (set in createApp.ts)
 * 
 * Auth Flow:
 *  - Alumni/Recruiters/Donors self-register via /auth/alumni/register
 *  - Students are created exclusively by Admins via /user-management/students
 *  - All login happens via /auth/login
 */
const router = Router();

// Authentication (login, register, OAuth, password reset)
router.use('/auth', authRoutes);

// Admin: User creation, role management, onboarding approvals
router.use('/user-management', userManagementRoutes);

// Profile: Community-facing data (skills, experience, bio)
router.use('/profiles', profilesRoutes);

// Jobs & Referrals
router.use('/jobs', jobsRoutes);

// RBAC: Roles, capabilities, permissions management
router.use('/rbac', rbacRoutes);

// Events
router.use('/events', eventsRoutes);

// Donations
router.use('/donations', donationsRoutes);

// Community
router.use('/community', communityRoutes);

// Messaging
router.use('/messaging', messagingRoutes);

// Mentorship Sessions & Search
router.use('/mentorship', mentorshipRoutes);

// Notifications
router.use('/notifications', notificationsRoutes);

// Referrals
router.use('/referrals', referralsRoutes);

// Success Stories
router.use('/success-stories', successStoriesRoutes);

// Settings
router.use('/settings', settingsRoutes);

// Public Stats
router.use('/stats', statsRoutes);

export default router;
