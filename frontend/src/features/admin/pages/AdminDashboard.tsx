import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Briefcase, GraduationCap, Settings, LogOut, Shield, BarChart2, Bell, ChevronDown, Trash2, Eye, RefreshCw, UserCircle, Award } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../api/client';
import ProfileForm from '../../profiles/components/ProfileForm';
import EventsTab from '../../shared/components/EventsTab';
import CommunityTab from '../../shared/components/CommunityTab';
import DonationsTab from '../../shared/components/DonationsTab';
import NotificationsTab from '../../shared/components/NotificationsTab';
import MentorshipTab from '../../shared/components/MentorshipTab';
import { SuccessStoriesPage } from '../../success-stories/pages/SuccessStoriesPage';
import AdminReferralsTab from '../components/AdminReferralsTab';
import AdminSettingsTab from '../components/AdminSettingsTab';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, students: 0, alumni: 0, recruiters: 0 });
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/user-management/users');
      const users = response.data.data.users;
      setProfiles(users);
      setStats({
        total: users.length,
        students: users.filter((u: any) => u.role === 'student').length,
        alumni: users.filter((u: any) => u.role === 'alumni').length,
        recruiters: users.filter((u: any) => u.role === 'recruiter').length,
      });
    } catch (error) {
      console.error('Admin fetch error:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/user-management/users/${id}`);
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const updateRole = async (id: string, newRole: string) => {
    try {
      await api.patch(`/user-management/users/${id}/role`, { role: newRole });
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
    } catch (err) {
      alert('Failed to update role');
    }
  };



  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'events', label: 'Events', icon: Award },
    { id: 'donations', label: 'Donations & Campaigns', icon: GraduationCap },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'success-stories', label: 'Success Stories', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
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
            <p className="text-xs text-muted-foreground">AlumniConnect Platform</p>
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
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white">{user?.name}</span>
              <span className="text-xs text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">ADMIN</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Users Overview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="p-6 rounded-2xl border border-white/5 bg-[#15171c] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <Users size={24} className="text-blue-400" />
                    <span className="text-xs font-bold px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">+12%</span>
                  </div>
                  <p className="text-3xl font-bold text-white relative z-10">{stats.total}</p>
                  <p className="text-sm text-muted-foreground relative z-10 mt-1 font-medium">Total Users</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-muted-foreground">
                    <span>Students: <span className="text-white font-medium">{stats.students}</span></span>
                    <span>Alumni: <span className="text-white font-medium">{stats.alumni}</span></span>
                  </div>
                </motion.div>

                {/* Referrals Overview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="p-6 rounded-2xl border border-white/5 bg-[#15171c] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <Briefcase size={24} className="text-purple-400" />
                    <span className="text-xs font-bold px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">+5%</span>
                  </div>
                  <p className="text-3xl font-bold text-white relative z-10">142</p>
                  <p className="text-sm text-muted-foreground relative z-10 mt-1 font-medium">Active Referrals</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-muted-foreground">
                    <span>Applications: <span className="text-white font-medium">856</span></span>
                    <span className="text-red-400">Reports: <span className="font-medium">3</span></span>
                  </div>
                </motion.div>

                {/* Events Overview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="p-6 rounded-2xl border border-white/5 bg-[#15171c] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <Award size={24} className="text-emerald-400" />
                    <span className="text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">Active</span>
                  </div>
                  <p className="text-3xl font-bold text-white relative z-10">28</p>
                  <p className="text-sm text-muted-foreground relative z-10 mt-1 font-medium">Upcoming Events</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-muted-foreground">
                    <span>Registrations: <span className="text-white font-medium">1.2k</span></span>
                    <span>Completed: <span className="text-white font-medium">154</span></span>
                  </div>
                </motion.div>

                {/* Mentorship Overview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="p-6 rounded-2xl border border-white/5 bg-[#15171c] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <GraduationCap size={24} className="text-orange-400" />
                    <span className="text-xs font-bold px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">+18%</span>
                  </div>
                  <p className="text-3xl font-bold text-white relative z-10">45</p>
                  <p className="text-sm text-muted-foreground relative z-10 mt-1 font-medium">Active Mentorships</p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs text-muted-foreground">
                    <span>Mentors: <span className="text-white font-medium">{stats.alumni}</span></span>
                    <span>Pending: <span className="text-white font-medium">12</span></span>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donations & Campaigns */}
                <div className="p-6 rounded-3xl border border-white/5 bg-[#15171c] relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-white text-lg">Donations & Campaigns</h3>
                      <p className="text-sm text-muted-foreground">Platform fundraising overview</p>
                    </div>
                    <button className="text-sm font-medium text-red-400 hover:text-red-300">View All</button>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          <Award size={20} className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Alumni Scholarship Fund</p>
                          <p className="text-xs text-muted-foreground">75% of goal reached</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">$45,000</p>
                        <p className="text-xs text-muted-foreground">Raised</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <GraduationCap size={20} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">Campus Infrastructure</p>
                          <p className="text-xs text-muted-foreground">30% of goal reached</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">$15,000</p>
                        <p className="text-xs text-muted-foreground">Raised</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community */}
                <div className="p-6 rounded-3xl border border-white/5 bg-[#15171c] relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-white text-lg">Community Activity</h3>
                      <p className="text-sm text-muted-foreground">Recent discussions and posts</p>
                    </div>
                    <button className="text-sm font-medium text-red-400 hover:text-red-300">View Feed</button>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white mb-1">How to prepare for FAANG interviews?</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">I've been preparing for a few months and wanted to ask alumni...</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">2h ago</span>
                      </div>
                    ))}
                  </div>
                </div>
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
                      <th className="text-left px-6 py-4 text-muted-foreground font-medium">Email Status</th>
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
                              {profile.name?.[0] || '?'}
                            </div>
                            <div className="flex flex-col">
                               <span className="font-medium text-white">{profile.name}</span>
                               <span className="text-xs text-muted-foreground">{profile.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={profile.role}
                            onChange={e => updateRole(profile.id, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded border bg-transparent cursor-pointer ${roleColors[profile.role] || 'text-muted-foreground'}`}
                          >
                            {['student', 'alumni', 'admin'].map(r => (
                              <option key={r} value={r} className="bg-[#1c1f26] text-white">{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${profile.is_verified ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>
                            {profile.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => deleteUser(profile.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
                               <Trash2 size={14} />
                             </button>
                          </div>
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
              <h3 className="font-bold text-white text-lg mb-2">Job Postings Management</h3>
              <p className="text-muted-foreground text-sm">Create and moderate job postings across the platform.</p>
              <button className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold transition-colors">Create Job Post</button>
            </motion.div>
          )}

          {activeTab === 'referrals' && <AdminReferralsTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'donations' && <DonationsTab />}
          {activeTab === 'mentorship' && <MentorshipTab />}
          { activeTab === 'community' && <CommunityTab /> }
          { activeTab === 'success-stories' && <SuccessStoriesPage /> }
          { activeTab === 'notifications' && <NotificationsTab /> }
          
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-white">Admin Profile</h3>
                <p className="text-muted-foreground">Manage your personal admin account details.</p>
              </div>
              <ProfileForm />
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && <AdminSettingsTab />}

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
              <button onClick={() => { logout(); navigate('/login'); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Sign Out</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
