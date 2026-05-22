import { Router } from 'express';
import { roleProfilesController } from './role-profiles.controller';
import {
  validateUUID,
  validateRoleParam,
  validatePagination,
  preventRoleChange,
  preventDuplicateProfile,
  ensureProfileExists,
  logProfileOperation,
} from './role-profiles.middleware';

const router = Router();

/**
 * @route   POST /api/role-profiles
 * @desc    Create a new role-based profile
 * @access  Private (requires authentication)
 * @note    Add authentication middleware when integrating: authMiddleware
 */
router.post(
  '/',
  preventDuplicateProfile,
  logProfileOperation('CREATE_PROFILE'),
  (req, res, next) => roleProfilesController.createProfile(req, res, next)
);

/**
 * @route   GET /api/role-profiles
 * @desc    Get all profiles with pagination
 * @access  Private (Admin only)
 * @query   page, limit, sortBy, sortOrder
 * @note    Add authentication and admin middleware when integrating: authMiddleware, adminOnly
 */
router.get(
  '/',
  validatePagination,
  (req, res, next) => roleProfilesController.getAllProfiles(req, res, next)
);

/**
 * @route   GET /api/role-profiles/stats
 * @desc    Get profile statistics by role
 * @access  Private (Admin only)
 * @note    Add authentication and admin middleware when integrating: authMiddleware, adminOnly
 */
router.get(
  '/stats',
  (req, res, next) => roleProfilesController.getProfileStats(req, res, next)
);

/**
 * @route   GET /api/role-profiles/search
 * @desc    Search profiles by name or email
 * @access  Private
 * @query   q (search term), role (optional), page, limit
 * @note    Add authentication middleware when integrating: authMiddleware
 */
router.get(
  '/search',
  validatePagination,
  (req, res, next) => roleProfilesController.searchProfiles(req, res, next)
);

/**
 * @route   GET /api/role-profiles/role/:role
 * @desc    Get profiles by role with pagination
 * @access  Private
 * @query   page, limit, sortBy, sortOrder
 * @note    Add authentication middleware when integrating: authMiddleware
 */
router.get(
  '/role/:role',
  validateRoleParam,
  validatePagination,
  (req, res, next) => roleProfilesController.getProfilesByRole(req, res, next)
);

/**
 * @route   GET /api/role-profiles/user/:userId
 * @desc    Get profile by user ID
 * @access  Private (User can only access their own profile or admin)
 * @note    Add authentication and authorization middleware when integrating: authMiddleware, canAccessProfile
 */
router.get(
  '/user/:userId',
  validateUUID('userId'),
  ensureProfileExists,
  logProfileOperation('VIEW_PROFILE'),
  (req, res, next) => roleProfilesController.getProfileByUserId(req, res, next)
);

/**
 * @route   GET /api/role-profiles/user/:userId/exists
 * @desc    Check if profile exists for user
 * @access  Private
 * @note    Add authentication middleware when integrating: authMiddleware
 */
router.get(
  '/user/:userId/exists',
  validateUUID('userId'),
  (req, res, next) => roleProfilesController.checkProfileExists(req, res, next)
);

/**
 * @route   GET /api/role-profiles/:profileId
 * @desc    Get profile by profile ID
 * @access  Private
 * @note    Add authentication middleware when integrating: authMiddleware
 */
router.get(
  '/:profileId',
  validateUUID('profileId'),
  (req, res, next) => roleProfilesController.getProfileById(req, res, next)
);

/**
 * @route   PUT /api/role-profiles/user/:userId
 * @desc    Update profile by user ID
 * @access  Private (User can only update their own profile or admin)
 * @note    Add authentication and authorization middleware when integrating: authMiddleware, canModifyProfile
 */
router.put(
  '/user/:userId',
  validateUUID('userId'),
  ensureProfileExists,
  preventRoleChange,
  logProfileOperation('UPDATE_PROFILE'),
  (req, res, next) => roleProfilesController.updateProfile(req, res, next)
);

/**
 * @route   POST /api/role-profiles/user/:userId/activity
 * @desc    Add activity log to profile
 * @access  Private
 * @note    Add authentication middleware when integrating: authMiddleware
 */
router.post(
  '/user/:userId/activity',
  validateUUID('userId'),
  ensureProfileExists,
  (req, res, next) => roleProfilesController.addActivity(req, res, next)
);

/**
 * @route   DELETE /api/role-profiles/user/:userId
 * @desc    Delete profile by user ID
 * @access  Private (Admin only or user themselves)
 * @note    Add authentication and authorization middleware when integrating: authMiddleware, canModifyProfile
 */
router.delete(
  '/user/:userId',
  validateUUID('userId'),
  ensureProfileExists,
  logProfileOperation('DELETE_PROFILE'),
  (req, res, next) => roleProfilesController.deleteProfile(req, res, next)
);

export default router;
