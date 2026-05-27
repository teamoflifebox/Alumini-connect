import { Router } from 'express';
import { profilesController } from './profiles.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

router.get('/me', profilesController.getMyProfile);
router.patch('/me', profilesController.updateMyProfile);
router.get('/search', profilesController.searchUsers);

export default router;
