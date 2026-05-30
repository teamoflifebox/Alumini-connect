import { type ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../../features/shared/components/NotificationBell';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { user, logout, isAdmin, isAlumni, isStudent, isRecruiter, isDonor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLinks = () => {
    if (isAdmin) {
      return [
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Directory', path: '/community/directory' },
        { label: 'Feed', path: '/community/feed' },
        { label: 'Success Stories', path: '/success-stories' },
      ];
    }
    if (isStudent) {
      return [
        { label: 'Dashboard', path: '/student/dashboard' },
        { label: 'Feed', path: '/community/feed' },
        { label: 'Directory', path: '/community/directory' },
        { label: 'Messages', path: '/community/messages' },
        { label: 'Jobs', path: '/student/jobs' },
        { label: 'Mentorship', path: '/student/mentorship' },
        { label: 'Events', path: '/events' },
        { label: 'Success Stories', path: '/success-stories' },
      ];
    }
    if (isAlumni) {
      return [
        { label: 'Dashboard', path: '/alumni/dashboard' },
        { label: 'Feed', path: '/community/feed' },
        { label: 'Directory', path: '/community/directory' },
        { label: 'Messages', path: '/community/messages' },
        { label: 'Referrals', path: '/alumni/jobs' },
        { label: 'Mentorship', path: '/alumni/mentorship' },
        { label: 'Events', path: '/events' },
        { label: 'Success Stories', path: '/success-stories' },
      ];
    }
    if (isRecruiter) {
      return [
        { label: 'Dashboard', path: '/recruiter/dashboard' },
        { label: 'Post Job', path: '/recruiter/post-job' },
      ];
    }
    if (isDonor) {
      return [
        { label: 'Dashboard', path: '/donor/dashboard' },
        { label: 'Campaigns', path: '/donor/campaigns' },
      ];
    }
    return [];
  };

  const links = getRoleLinks();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-600">AlumniConnect</h2>
          <p className="text-sm text-gray-500 capitalize">{user?.role} Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="block px-4 py-2 text-gray-700 rounded hover:bg-blue-50 hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="mb-4">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b p-6 flex justify-between items-center sticky top-0 z-40">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
