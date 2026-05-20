import { Router } from 'express';
import { userManagementController } from './user-management.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// In a real app, you would also have an requireAdmin middleware here!
router.use(requireAuth); 

router.get('/', userManagementController.getAllUsers);
router.patch('/verify', userManagementController.verifyAlumni);

export default router;
