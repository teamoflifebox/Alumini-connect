import { Router } from 'express';
import { successStoriesController } from './success-stories.controller';
import { authenticate, authorizeRoles } from '../auth/auth.middleware';

const router = Router();

router.get('/', successStoriesController.getAllStories);

// Authenticated routes
router.use(authenticate);

// Any authenticated user can create a story
router.post('/', successStoriesController.createStory);

// Only admins can delete stories
router.delete('/:id', authorizeRoles('admin'), successStoriesController.deleteStory);

export default router;
