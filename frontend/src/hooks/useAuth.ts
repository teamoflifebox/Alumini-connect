import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

/**
 * Central hook for all auth-related data.
 * Components should NEVER import useAuthStore directly — use this hook.
 */
export const useAuth = () => {
  const { user, accessToken, isAuthenticated, logout, setAuth } = useAuthStore();

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  const isAdmin = user?.role === 'admin';
  const isAlumni = user?.role === 'alumni';
  const isStudent = user?.role === 'student';

  // Pending verification: logged in but not yet verified by email OR not approved by admin
  const isPendingVerification = isAuthenticated && (user?.is_verified === false || user?.is_approved === false);

  return {
    user,
    accessToken,
    isAuthenticated,
    isPendingVerification,
    isAdmin,
    isAlumni,
    isStudent,
    hasRole,
    logout,
    setAuth,
  };
};
