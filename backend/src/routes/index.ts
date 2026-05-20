import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from '../modules/auth/auth.routes';
import legacyAuthRoutes from '../modules/auth/legacy.routes';
import adminRoutes from '../modules/auth/admin.routes';
import { studentRouter, alumniRouter } from '../modules/auth/role.routes';
import usersRoutes from '../modules/users/users.routes';

/**
 * Central API route registration (API Gateway style)
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/student', studentRouter);
router.use('/alumni', alumniRouter);
router.use('/users', usersRoutes);

// Backward-compatible v1 routes
router.use('/v1/auth', legacyAuthRoutes);
router.use('/v1/users', usersRoutes);

export { healthRoutes };
export default router;
