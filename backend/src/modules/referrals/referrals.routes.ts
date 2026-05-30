import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { referralsController } from './referrals.controller';

const router = Router();

// Leaderboard can be public or require auth. We'll require auth.
router.get('/leaderboard', requireAuth, referralsController.getLeaderboard.bind(referralsController));

// Referrals CRUD
router.post('/', requireAuth, referralsController.createReferral.bind(referralsController));
router.get('/admin/reported', requireAuth, referralsController.getAdminReportedReferrals.bind(referralsController));
router.get('/', requireAuth, referralsController.getAllReferrals.bind(referralsController));
router.get('/my-posted', requireAuth, referralsController.getMyPostedReferrals.bind(referralsController));
router.get('/:id', requireAuth, referralsController.getReferralById.bind(referralsController));
router.patch('/:id/close', requireAuth, referralsController.closeReferral.bind(referralsController));
router.post('/:id/report', requireAuth, referralsController.reportReferral.bind(referralsController));
router.delete('/:id', requireAuth, referralsController.deleteReferral.bind(referralsController));

// Applications
router.post('/:id/apply', requireAuth, referralsController.applyToReferral.bind(referralsController));
router.get('/:id/applications', requireAuth, referralsController.getApplications.bind(referralsController));
router.patch('/applications/:appId/status', requireAuth, referralsController.updateApplicationStatus.bind(referralsController));

export default router;
