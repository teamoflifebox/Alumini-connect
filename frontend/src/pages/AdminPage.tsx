import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, GraduationCap, Settings, LogOut, Shield, BarChart2, Bell, ChevronDown, Trash2, Eye, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  onboarding_completed: boolean;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, students: 0, alumni: 0, recruiters: 0 });
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Role-based guard — only 'admin' can enter
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') { navigate('/dashboard'); return; }
  }, [user]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_all_profiles');

    if (error) {
      console.error('Admin fetch error:', error.message);
    }

    if (!error && data) {
      setProfiles(data);
      setStats({
        total: data.length,
        students: data.filter((p: Profile) => p.role === 'student').length,
        alumni: data.filter((p: Profile) => p.role === 'alumni').length,
        recruiters: data.filter((p: Profile) => p.role === 'recruiter').length,
      });
    }
    setIsLoading(false);
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await supabase.from('profiles').delete().eq('id', id);
    setProfiles(prev => prev.filter(p => p.id !== id));
  };

  const updateRole = async (id: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const roleColors: Record<string, string> = {
    admin: 'text-red-400 bg-red-400/10 border-red-400/20',
    student: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    alumni: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    recruiter: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    donor: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  };

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/10 bg-[#0f1117] p-5">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Shield size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">Admin Console</p>
            <p className="text-xs text-muted-foreground">Gnan-AI Platform</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <BarChart2 size={16} /> Back to Dashboard
          </button>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-muted-foreground hover:text-red-400 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-40">
          <h1 className="text-lg font-bold text-white capitalize">{navItems.find(n => n.id === activeTab)?.label}</h1>
          <div className="flex items-center gap-4">
            <button onClick={fetchProfiles} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
              <RefreshCw size={16} />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white">{user?.firstName}</span>
              <span className="text-xs text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">ADMIN</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', value: stats.total, icon: Users, color: 'text-white', bg: 'from-white/5' },
                  { label: 'Students', value: stats.students, icon: GraduationCap, color: 'text-blue-400', bg: 'from-blue-500/10' },
                  { label: 'Alumni', value: stats.alumni, icon: Users, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
                  { label: 'Recruiters', value: stats.recruiters, icon: Briefcase, color: 'text-purple-400', bg: 'from-purple-500/10' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl border border-white/5 bg-[#15171c] relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} to-transparent pointer-events-none`} />
                    <stat.icon size={20} className={`${stat.color} mb-4 relative z-10`} />
                    <p className="text-3xl font-bold text-white relative z-10">{stat.value}</p>
                    <p className="text-sm text-muted-foreground relative z-10 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 rounded-3xl border border-white/5 bg-[#15171c] text-center">
                <BarChart2 size={40} className="text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-bold text-white text-lg mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground text-sm">Charts for signups, engagement, and job applications will appear here once data is collected.</p>
              </div>
            </motion.div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">{profiles.length} total users registered</p>
                <button onClick={fetchProfiles} className="flex items-center gap-2 text-sm text-primary hover:text-brand-400 transition-colors">
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              <div className="border border-white/5 rounded-2xl overflow-hidden bg-[#15171c]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">User</th>
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Role</th>
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Joined</th>
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Onboarded</th>
                      <th className="text-right px-6 py-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading users...</td></tr>
                    ) : profiles.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No users found in database yet.</td></tr>
                    ) : profiles.map((profile, i) => (
                      <tr key={profile.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary uppercase">
                              {profile.first_name?.[0] || '?'}
                            </div>
                            <span className="font-medium text-white">{profile.first_name} {profile.last_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={profile.role}
                            onChange={e => updateRole(profile.id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded border bg-transparent cursor-pointer ${roleColors[profile.role] || 'text-muted-foreground'}`}
                          >
                            {['student', 'alumni', 'recruiter', 'admin', 'donor'].map(r => (
                              <option key={r} value={r} className="bg-[#1c1f26] text-white">{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${profile.onboarding_completed ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-muted-foreground bg-white/5 border-white/10'}`}>
                            {profile.onboarding_completed ? 'Done' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => deleteUser(profile.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <Briefcase size={40} className="mx-auto text-muted-foreground mb-4 opacity-40" />
              <h3 className="font-bold text-white text-lg mb-2">No Job Postings Yet</h3>
              <p className="text-muted-foreground text-sm">Recruiters haven't posted any jobs yet. They'll appear here for moderation.</p>
            </motion.div>
          )}

          {/* Scholarships Tab */}
          {activeTab === 'scholarships' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <GraduationCap size={40} className="mx-auto text-muted-foreground mb-4 opacity-40" />
              <h3 className="font-bold text-white text-lg mb-2">No Scholarships Yet</h3>
              <p className="text-muted-foreground text-sm">Donors haven't created any scholarship funds yet.</p>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {[
                { label: 'Allow New Registrations', desc: 'Toggle whether new users can sign up on this platform.' },
                { label: 'Maintenance Mode', desc: 'Temporarily take the platform offline for updates.' },
                { label: 'Email Verification Required', desc: 'Require users to verify email before accessing the dashboard.' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-6 border border-white/5 rounded-2xl bg-[#15171c] hover:bg-white/[0.03] transition-all">
                  <div>
                    <h4 className="font-bold text-white mb-1">{s.label}</h4>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                  <div className="w-12 h-6 bg-primary/30 rounded-full relative cursor-pointer border border-primary/30">
                    <div className="w-4 h-4 bg-primary rounded-full absolute right-1 top-1" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </div>
      </main>

      {/* Sign Out Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSignOutModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()}
            className="bg-[#15171c] border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white text-center mb-2">Sign Out?</h3>
            <p className="text-muted-foreground text-sm text-center mb-7">You'll be returned to the login page.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowSignOutModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={() => { logout(); navigate('/'); supabase.auth.signOut(); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Sign Out</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
