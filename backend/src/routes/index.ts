import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userManagementRoutes from '../modules/user-management/user-management.routes';
import profilesRoutes from '../modules/profiles/profiles.routes';
import roleProfilesRoutes from '../modules/role-profiles/role-profiles.routes';
import jobsRoutes from '../modules/jobs/jobs.routes';
import rbacRoutes from '../modules/rbac/rbac.routes';

const router = Router();

// Authentication (login, register, OAuth, password reset)
router.use('/auth', authRoutes);

// Admin: User creation, role management, onboarding approvals
router.use('/user-management', userManagementRoutes);

// Profile: Simple community-facing profile (skills, experience, bio)
router.use('/profiles', profilesRoutes);

// Role-Based Profiles: Rich JSONB profiles per role
router.use('/role-profiles', roleProfilesRoutes);

// Jobs & Referrals
router.use('/jobs', jobsRoutes);

// RBAC: Roles, capabilities, permissions management
router.use('/rbac', rbacRoutes);

export default router;
