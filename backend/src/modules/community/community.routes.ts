import { Router } from 'express';
import { communityController } from './community.controller';
import { requireAuth } from '../auth/auth.middleware';
import { upload } from '../../core/config/cloudinary';

const router = Router();

router.use(requireAuth);

// Connections
router.post('/connections', communityController.sendConnectionRequest);
router.patch('/connections/:id', communityController.respondConnectionRequest);
router.get('/connections', communityController.getConnections);

// Feed & Posts
router.post('/posts', communityController.createPost);
router.get('/feed', communityController.getFeed);
router.get('/posts/:id', communityController.getPost);
router.post('/posts/:id/like', communityController.toggleLike);
router.post('/posts/:id/comments', communityController.addComment);
router.get('/posts/:id/comments', communityController.getComments);
router.post('/posts/:id/comments/:commentId/like', communityController.toggleCommentLike);
router.post('/upload', upload.single('file'), communityController.uploadMedia);

// Groups & Discussions
router.get('/groups', communityController.getGroups);
router.post('/groups', communityController.createGroup);
router.get('/groups/:id/members', communityController.getGroupMembers);
router.delete('/groups/:id/members/:userId', communityController.removeGroupMember);
router.post('/groups/:id/join', communityController.joinGroup);
router.post('/groups/:id/leave', communityController.leaveGroup);
router.post('/groups/:id/report', communityController.reportGroup);
router.get('/discussions/trending', communityController.getTrendingDiscussions);

router.delete('/groups/:id', communityController.deleteGroup);

export default router;