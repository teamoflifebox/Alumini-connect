/**
 * Central controller exports
 * This file aggregates all controller modules for easy importing
 */

// Auth controllers
export { authController } from '../modules/auth/auth.controller';

// RBAC controllers
export { rbacController } from '../modules/rbac/rbac.controller';

// User management controllers
export { userManagementController } from '../modules/user-management/user-management.controller';

// Profile controllers
export { profilesController } from '../modules/profiles/profiles.controller';

// Job controllers
export { jobsController } from '../modules/jobs/jobs.controller';
