import { Router } from 'express';
import { userManagementController } from './user-management.controller';
import { authenticate, authorizeRoles } from '../auth/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { validate } from '../../core/middlewares/validate';
import {
  createStudentSchema,
  createAdminSchema,
  updateUserRoleSchema,
  userIdParamSchema,
  roleParamSchema,
} from './user-management.schema';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorizeRoles('admin'));

/**
 * Admin User Management Routes
 */

// Create a student account (admin only)
router.post(
  '/students',
  validate(createStudentSchema),
  asyncHandler(userManagementController.createStudent.bind(userManagementController))
);

// Create an admin account (admin only)
router.post(
  '/admins',
  validate(createAdminSchema),
  asyncHandler(userManagementController.createAdmin.bind(userManagementController))
);

// Get all users
router.get(
  '/users',
  asyncHandler(userManagementController.getAllUsers.bind(userManagementController))
);

// Get users by role
router.get(
  '/users/role/:role',
  asyncHandler(userManagementController.getUsersByRole.bind(userManagementController))
);



// Update user role
router.patch(
  '/users/:userId/role',
  validate(updateUserRoleSchema),
  asyncHandler(userManagementController.updateUserRole.bind(userManagementController))
);

// Delete user
router.delete(
  '/users/:userId',
  asyncHandler(userManagementController.deleteUser.bind(userManagementController))
);

export default router;
