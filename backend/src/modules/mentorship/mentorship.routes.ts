import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware';
import { mentorshipController } from './mentorship.controller';

const router = Router();

// Apply requireAuth globally to all mentorship routes as they require active user context
router.use(requireAuth);

router.post('/sessions', mentorshipController.createSession);
router.get('/sessions', mentorshipController.getSessions);
router.get('/recommended', mentorshipController.getRecommended);
router.delete('/sessions/:id', mentorshipController.deleteSession);
router.post('/sessions/:id/join', mentorshipController.joinSession);
router.post('/sessions/:id/leave', mentorshipController.leaveSession);

// Invitations
router.post('/invite', mentorshipController.inviteUser);
router.get('/invitations', mentorshipController.getInvitations);
router.post('/invitations/:id/respond', mentorshipController.respondToInvitation);

export default router;
