import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import AlumniDashboard from './pages/AlumniDashboard';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

function AppRoutes() {
  const { login, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🚀 App initialized: Setting up auth listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth Event:', event, session?.user?.id);
      
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) console.error('❌ Profile fetch error:', error);

          let userRole = 'student';
          let firstName = session.user.user_metadata?.first_name || '';
          let lastName = session.user.user_metadata?.last_name || '';

          if (profile) {
            console.log('✅ Profile found:', profile.role);
            userRole = profile.role || 'student';
            firstName = profile.first_name || firstName;
            lastName = profile.last_name || lastName;
            
            login({
              firstName,
              lastName,
              email: session.user.email || '',
              role: userRole,
              avatarUrl: profile.avatar_url,
              onboardingCompleted: profile.onboarding_completed || false,
            });
          } else {
            console.warn('⚠️ No profile found. Creating default...');
            const newProfile = {
              id: session.user.id,
              first_name: firstName,
              last_name: lastName,
              role: session.user.user_metadata?.role || 'student',
            };
            await supabase.from('profiles').upsert(newProfile);
            userRole = newProfile.role;
            login({
              ...newProfile,
              firstName: newProfile.first_name,
              lastName: newProfile.last_name,
              email: session.user.email || '',
            });
          }

          // Force redirect to dashboard if user is on auth pages and just logged in
          const path = window.location.pathname;
          if (path === '/login' || path === '/register' || path === '/') {
            console.log('🔄 Auto-redirecting to:', userRole);
            if (userRole === 'admin') navigate('/admin');
            else if (userRole === 'alumni') navigate('/alumni-dashboard');
            else navigate('/dashboard');
          }

        } catch (e) {
          console.error('🛑 App auth sync failed:', e);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        logout();
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [login, logout, navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/alumni-dashboard" element={<AlumniDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <div className="dark">
        <div className="min-h-screen bg-background text-foreground selection:bg-brand-500/30">
          <AppRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;
