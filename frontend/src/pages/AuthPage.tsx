import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, GraduationCap, ChevronRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth.api';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  
  // Registration defaults to alumni/recruiter/donor in the new system.
  const [role, setRole] = useState('alumni');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
  });
  
  const { setAuth } = useAuth();

  // Clear errors when switching modes
  useEffect(() => {
    setErrorMsg('');
  }, [isLogin]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (!isLogin) {
        // ── SIGNUP ────────────────────────────────────────────────
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match!');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (role === 'student') {
            throw new Error('Students must be registered by an administrator. Please contact your institution.');
        }

        // Call backend API
        await authApi.register({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          role: role
        });
        
        // Registration successful -> go to pending verification page
        navigate('/pending-verification');

      } else {
        // ── LOGIN ──────────────────────────────────────────────────
        const response = await authApi.login({
          email: formData.email,
          password: formData.password,
        });

        const { user, accessToken } = response.data.data;
        // The backend uses 'primary_role', but the frontend expects 'role'
        const mappedUser = { ...user, role: user.primary_role || user.role };
        setAuth(mappedUser, accessToken);
        
        // Redirect to dashboard router (will handle role-based redirection)
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('AUTH ERROR:', err);
      // Extract backend error message if available
      const message = err.response?.data?.message || err.response?.data?.errors?.[0] || err.message || 'Authentication failed.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-white overflow-hidden">
      {/* Branding Panel */}
      <div className="hidden md:flex flex-col flex-1 p-12 relative overflow-hidden bg-gradient-to-br from-[#0c0c0e] to-[#12141a]">
        <div className="absolute inset-0 bg-primary/10 blur-[100px]" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-primary text-white p-2 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold">AlumniConnect</span>
          </div>
          <div className="mt-auto mb-auto max-w-lg">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              {isLogin ? "Welcome back." : "Join the circle."}
            </h1>
            <p className="text-lg text-muted-foreground">Networking that actually works.</p>
          </div>
        </div>
      </div>

      {/* Main Auth Panel */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative bg-background shadow-2xl overflow-y-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mx-auto">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold mb-2">{isLogin ? 'Sign In' : 'Create Account'}</h2>
            <p className="text-muted-foreground">Manage your alumni and student network.</p>
          </div>

          {!isLogin && (
            <div className="flex gap-2 mb-8 p-1 bg-[#15171c] rounded-xl border border-white/5">
              {['alumni', 'recruiter', 'donor'].map((r) => (
                <button 
                  key={r} type="button" onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${role === r ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold rounded-xl flex items-center gap-3">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Jane" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Doe" required />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#1c1f26] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="jane@example.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#1c1f26] border border-white/5 rounded-xl pl-12 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Confirm Password</label>
                <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="••••••••" required />
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all mt-6 shadow-xl shadow-primary/20 flex justify-center items-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            {isLogin ? "New here? " : "Already joined? "}
            <span onClick={() => navigate(isLogin ? '/register' : '/login')} className="text-primary font-bold cursor-pointer hover:underline">
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
