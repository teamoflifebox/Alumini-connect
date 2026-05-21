import { Router } from 'express';
import { rbacController } from './rbac.controller';
import { authenticate } from '../auth/auth.middleware';
import { requireCapability, requireRole } from './rbac.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// All RBAC management routes require authentication
router.use(authenticate);

// ==================== PUBLIC PERMISSION CHECK ====================

// Check if current user has a capability
router.post(
  '/check',
  asyncHandler(rbacController.checkPermission.bind(rbacController))
);

// Get current user's permissions
router.get(
  '/permissions/me',
  asyncHandler(rbacController.getUserPermissions.bind(rbacController))
);

// ==================== ADMIN ONLY ROUTES ====================

// Roles management
router.get(
  '/roles',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.getAllRoles.bind(rbacController))
);

router.post(
  '/roles',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.createRole.bind(rbacController))
);

// Capabilities management
router.get(
  '/capabilities',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.getAllCapabilities.bind(rbacController))
);

router.post(
  '/capabilities',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.createCapability.bind(rbacController))
);

// Role-Capability assignment
router.get(
  '/roles/:roleId/capabilities',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.getRoleCapabilities.bind(rbacController))
);

router.post(
  '/roles/:roleId/capabilities',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.assignCapabilityToRole.bind(rbacController))
);

router.delete(
  '/roles/:roleId/capabilities/:capabilityId',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.removeCapabilityFromRole.bind(rbacController))
);

// User-Capability assignment (custom permissions)
router.get(
  '/users/:userId/capabilities',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.getUserCapabilities.bind(rbacController))
);

router.post(
  '/users/:userId/capabilities',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.grantCapabilityToUser.bind(rbacController))
);

router.delete(
  '/users/:userId/capabilities/:capabilityId',
  requireRole('admin'),
  requireCapability('capability.manage'),
  asyncHandler(rbacController.revokeCapabilityFromUser.bind(rbacController))
);

// User permissions view
router.get(
  '/users/:userId/permissions',
  requireRole('admin'),
  requireCapability('user.read'),
  asyncHandler(rbacController.getUserPermissions.bind(rbacController))
);

// User approval management
router.get(
  '/users/pending',
  requireRole('admin'),
  requireCapability('user.approve'),
  asyncHandler(rbacController.getPendingUsers.bind(rbacController))
);

router.patch(
  '/users/:userId/approve',
  requireRole('admin'),
  requireCapability('user.approve'),
  asyncHandler(rbacController.approveUser.bind(rbacController))
);

router.patch(
  '/users/:userId/reject',
  requireRole('admin'),
  requireCapability('user.reject'),
  asyncHandler(rbacController.rejectUser.bind(rbacController))
);

// ==================== MODULE MANAGEMENT ====================

// Get all available modules
router.get(
  '/modules',
  requireRole('admin'),
  asyncHandler(rbacController.getAllModules.bind(rbacController))
);

// Get user's enabled modules
router.get(
  '/users/:userId/modules',
  requireRole('admin'),
  asyncHandler(rbacController.getUserModules.bind(rbacController))
);

// Enable module for user
router.post(
  '/users/:userId/modules',
  requireRole('admin'),
  requireCapability('user.update'),
  asyncHandler(rbacController.enableModuleForUser.bind(rbacController))
);

// Disable module for user
router.delete(
  '/users/:userId/modules/:moduleName',
  requireRole('admin'),
  requireCapability('user.update'),
  asyncHandler(rbacController.disableModuleForUser.bind(rbacController))
);

// ==================== CAPABILITY GROUP REQUESTS ====================

// User requests a capability group (any authenticated user can request)
router.post(
  '/capability-requests',
  asyncHandler(rbacController.requestCapability.bind(rbacController))
);

// Get current user's capability requests
router.get(
  '/capability-requests/me',
  asyncHandler(rbacController.getUserCapabilityRequests.bind(rbacController))
);

// Admin: Get all pending capability requests
router.get(
  '/capability-requests/pending',
  requireRole('admin'),
  requireCapability('user.approve'),
  asyncHandler(rbacController.getPendingCapabilityRequests.bind(rbacController))
);

// Admin: Approve capability request
router.patch(
  '/capability-requests/:requestId/approve',
  requireRole('admin'),
  requireCapability('user.approve'),
  asyncHandler(rbacController.approveCapabilityRequest.bind(rbacController))
);

// Admin: Reject capability request
router.patch(
  '/capability-requests/:requestId/reject',
  requireRole('admin'),
  requireCapability('user.reject'),
  asyncHandler(rbacController.rejectCapabilityRequest.bind(rbacController))
);

// Admin: Get user's capability requests
router.get(
  '/users/:userId/capability-requests',
  requireRole('admin'),
  asyncHandler(rbacController.getUserCapabilityRequests.bind(rbacController))
);

export default router;
