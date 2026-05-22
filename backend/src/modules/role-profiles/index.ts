/**
 * Role-Based Profile Service Module
 * 
 * A production-grade role-based profile system for managing user profiles
 * across different roles: Admin, Student, Alumni, Recruiter, and Donor
 */

// Export types
export * from './role-profiles.types';

// Export schemas and validation
export * from './role-profiles.schema';

// Export repository
export { roleProfilesRepository, RoleProfilesRepository } from './role-profiles.repository';

// Export service
export { roleProfilesService, RoleProfilesService } from './role-profiles.service';

// Export controller
export { roleProfilesController, RoleProfilesController } from './role-profiles.controller';

// Export routes
export { default as roleProfilesRoutes } from './role-profiles.routes';
