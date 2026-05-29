import { Router } from 'express';
import { messagingController } from './messaging.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/conversations', messagingController.getOrCreateConversation);
router.get('/conversations', messagingController.getConversations);
router.get('/conversations/:id/messages', messagingController.getMessages);
router.post('/conversations/:id/messages', messagingController.saveMessage);
router.post('/conversations/:id/read', messagingController.markAsRead);

export default router;
