import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.get('/me', authenticate, asyncHandler(usersController.getMe.bind(usersController)));
router.get('/', asyncHandler(usersController.getAllUsers.bind(usersController)));
router.get('/:id', asyncHandler(usersController.getUser.bind(usersController)));

export default router;
