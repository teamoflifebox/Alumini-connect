/**
 * Central service exports
 * This file aggregates all service modules for easy importing
 */

// Auth services
export { authService } from '../modules/auth/auth.service';
export { authPasswordService } from '../modules/auth/auth.password.service';
export { authVerificationService } from '../modules/auth/auth.verification.service';
export { authOAuthService } from '../modules/auth/auth.oauth.service';

// RBAC services
export { rbacService } from '../modules/rbac/rbac.service';

// User management services
export { userManagementService } from '../modules/user-management/user-management.service';

// Profile services
export { profilesService } from '../modules/profiles/profiles.service';

// Job services
export { jobsService } from '../modules/jobs/jobs.service';
