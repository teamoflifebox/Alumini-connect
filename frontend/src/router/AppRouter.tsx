import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

// Public pages (always loaded)
import LandingPage from '../pages/LandingPage';
import AuthPage from '../pages/AuthPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerifyEmailPage from '../pages/auth/VerifyEmailPage';

// Lazy-loaded pages per role (only loads what the user needs)
// ADMIN
const AdminDashboard = lazy(() => import('../features/admin/pages/AdminDashboard'));
const AdminUserManagement = lazy(() => import('../features/admin/pages/AdminUserManagement'));

// STUDENT
const StudentDashboard = lazy(() => import('../features/student/pages/StudentDashboard'));
const StudentJobs = lazy(() => import('../features/student/pages/StudentJobs'));
const StudentMentorship = lazy(() => import('../features/student/pages/StudentMentorship'));

// ALUMNI
const AlumniDashboard = lazy(() => import('../features/alumni/pages/AlumniDashboard'));
const AlumniJobs = lazy(() => import('../features/alumni/pages/AlumniJobs'));
const AlumniMentorship = lazy(() => import('../features/alumni/pages/AlumniMentorship'));

// RECRUITER
const RecruiterDashboard = lazy(() => import('../features/recruiter/pages/RecruiterDashboard'));
const RecruiterPostJob = lazy(() => import('../features/recruiter/pages/RecruiterPostJob'));

// DONOR
const DonorDashboard = lazy(() => import('../features/donor/pages/DonorDashboard'));
const DonorCampaigns = lazy(() => import('../features/donor/pages/DonorCampaigns'));

// Shared
const PendingVerificationPage = lazy(() => import('../pages/PendingVerificationPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

/** Redirect logged-in users to their role-based dashboard */
const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  switch (user?.role) {
    case 'admin':     return <Navigate to="/admin/dashboard" replace />;
    case 'student':   return <Navigate to="/student/dashboard" replace />;
    case 'alumni':    return <Navigate to="/alumni/dashboard" replace />;
    case 'recruiter': return <Navigate to="/recruiter/dashboard" replace />;
    case 'donor':     return <Navigate to="/donor/dashboard" replace />;
    default:          return <Navigate to="/login" replace />;
  }
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

export const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ─── Public Routes ─────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/pending-verification" element={<PendingVerificationPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ─── Role Redirect (after login) ───────────────────── */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* ─── Admin Routes ──────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
        </Route>

        {/* ─── Student Routes ────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/jobs" element={<StudentJobs />} />
          <Route path="/student/mentorship" element={<StudentMentorship />} />
        </Route>

        {/* ─── Alumni Routes ─────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['alumni']} />}>
          <Route path="/alumni/dashboard" element={<AlumniDashboard />} />
          <Route path="/alumni/jobs" element={<AlumniJobs />} />
          <Route path="/alumni/mentorship" element={<AlumniMentorship />} />
        </Route>

        {/* ─── Recruiter Routes ──────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/post-job" element={<RecruiterPostJob />} />
        </Route>

        {/* ─── Donor Routes ──────────────────────────────────── */}
        <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/campaigns" element={<DonorCampaigns />} />
        </Route>

        {/* ─── Catch All ─────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
