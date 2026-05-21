import { rbacRepository } from './rbac.repository';
import { UserPermissions, PermissionCheckOptions } from './rbac.types';
import { AppError } from '../../utils/AppError';

export class RBACService {
  // ==================== PERMISSION CHECKING ====================

  /**
   * Check if user has a specific capability
   */
  async hasCapability(userId: number, capability: string): Promise<boolean> {
    const permissions = await rbacRepository.getUserPermissions(userId);
    if (!permissions) return false;

    return this.checkCapability(permissions.allCapabilities, capability);
  }

  /**
   * Check if user has any of the specified capabilities
   */
  async hasAnyCapability(userId: number, capabilities: string[]): Promise<boolean> {
    const permissions = await rbacRepository.getUserPermissions(userId);
    if (!permissions) return false;

    return capabilities.some(cap => this.checkCapability(permissions.allCapabilities, cap));
  }

  /**
   * Check if user has all of the specified capabilities
   */
  async hasAllCapabilities(userId: number, capabilities: string[]): Promise<boolean> {
    const permissions = await rbacRepository.getUserPermissions(userId);
    if (!permissions) return false;

    return capabilities.every(cap => this.checkCapability(permissions.allCapabilities, cap));
  }

  /**
   * Check capability with wildcard support
   * Examples:
   * - admin.* matches ALL capabilities (special case for admin)
   * - job.* matches job.create, job.read, etc.
   */
  private checkCapability(userCapabilities: string[], requiredCapability: string): boolean {
    // Direct match
    if (userCapabilities.includes(requiredCapability)) {
      return true;
    }

    // Check for wildcard matches
    for (const userCap of userCapabilities) {
      if (userCap.endsWith('.*')) {
        const prefix = userCap.slice(0, -2); // Remove .*
        
        // Special case: admin.* grants ALL permissions
        if (prefix === 'admin') {
          return true;
        }
        
        // Regular wildcard: job.* matches job.create, job.read, etc.
        if (requiredCapability.startsWith(prefix + '.') || requiredCapability === prefix) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get all user permissions
   */
  async getUserPermissions(userId: number): Promise<UserPermissions | null> {
    return rbacRepository.getUserPermissions(userId);
  }

  // ==================== ROLE MANAGEMENT ====================

  async getAllRoles() {
    return rbacRepository.getAllRoles();
  }

  async createRole(name: string, displayName: string, description?: string) {
    const existing = await rbacRepository.getRoleByName(name);
    if (existing) {
      throw new AppError('Role already exists', 409);
    }
    return rbacRepository.createRole(name, displayName, description);
  }

  // ==================== CAPABILITY MANAGEMENT ====================

  async getAllCapabilities() {
    return rbacRepository.getAllCapabilities();
  }

  async createCapability(
    name: string,
    displayName: string,
    description?: string,
    category?: string
  ) {
    const existing = await rbacRepository.getCapabilityByName(name);
    if (existing) {
      throw new AppError('Capability already exists', 409);
    }
    return rbacRepository.createCapability(name, displayName, description, category);
  }

  // ==================== ROLE-CAPABILITY ASSIGNMENT ====================

  async getRoleCapabilities(roleId: number) {
    return rbacRepository.getRoleCapabilities(roleId);
  }

  async assignCapabilityToRole(roleId: number, capabilityId: number) {
    await rbacRepository.assignCapabilityToRole(roleId, capabilityId);
  }

  async removeCapabilityFromRole(roleId: number, capabilityId: number) {
    await rbacRepository.removeCapabilityFromRole(roleId, capabilityId);
  }

  // ==================== USER-CAPABILITY ASSIGNMENT ====================

  async getUserCapabilities(userId: number) {
    return rbacRepository.getUserCapabilities(userId);
  }

  async grantCapabilityToUser(userId: number, capabilityId: number, grantedBy: number) {
    await rbacRepository.grantCapabilityToUser(userId, capabilityId, grantedBy);
  }

  async revokeCapabilityFromUser(userId: number, capabilityId: number) {
    await rbacRepository.revokeCapabilityFromUser(userId, capabilityId);
  }

  // ==================== USER APPROVAL ====================

  async getPendingUsers() {
    return rbacRepository.getPendingUsers();
  }

  async approveUser(userId: number, approvedBy: number) {
    await rbacRepository.approveUser(userId, approvedBy);
  }

  async rejectUser(userId: number, approvedBy: number, reason?: string) {
    await rbacRepository.rejectUser(userId, approvedBy, reason);
  }

  // ==================== MODULE MANAGEMENT ====================

  async getAllModules() {
    return rbacRepository.getAllModules();
  }

  async getUserModules(userId: number): Promise<string[]> {
    return rbacRepository.getUserModules(userId);
  }

  async enableModuleForUser(userId: number, moduleName: string, activatedBy: number) {
    await rbacRepository.enableModuleForUser(userId, moduleName, activatedBy);
  }

  async disableModuleForUser(userId: number, moduleName: string) {
    await rbacRepository.disableModuleForUser(userId, moduleName);
  }

  // ==================== CAPABILITY GROUP REQUESTS ====================

  async createCapabilityRequest(userId: number, capabilityGroupName: string, reason?: string) {
    return rbacRepository.createCapabilityRequest(userId, capabilityGroupName, reason);
  }

  async getPendingCapabilityRequests() {
    return rbacRepository.getPendingCapabilityRequests();
  }

  async approveCapabilityRequest(requestId: number, adminId: number) {
    await rbacRepository.approveCapabilityRequest(requestId, adminId);
  }

  async rejectCapabilityRequest(requestId: number, adminId: number, reason?: string) {
    await rbacRepository.rejectCapabilityRequest(requestId, adminId, reason);
  }

  async getUserCapabilityRequests(userId: number) {
    return rbacRepository.getUserCapabilityRequests(userId);
  }
}

export const rbacService = new RBACService();
