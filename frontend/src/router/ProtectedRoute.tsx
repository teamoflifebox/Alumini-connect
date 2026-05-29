import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute
 * 
 * Usage:
 *  <Route element={<ProtectedRoute />}>                    // Any authenticated user
 *  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>  // Admin only
 */
export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isPendingVerification, hasRole } = useAuth();
  const location = useLocation();

  // Not logged in → redirect to login, remember where they came from
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // All checks passed — render the page
  return <Outlet />;
};
