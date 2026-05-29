import { Router } from 'express';
import { profilesController } from './profiles.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

router.get('/', profilesController.searchProfiles);
router.get('/me', profilesController.getMyProfile);
router.patch('/me', profilesController.updateMyProfile);
router.get('/:id', profilesController.getProfileById);

export default router;
