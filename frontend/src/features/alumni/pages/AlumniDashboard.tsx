import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, LayoutDashboard, Settings, UserCircle, Briefcase,
  Users, TrendingUp, Award, BookOpen, Edit3, Plus,
  ChevronRight, X, Building, MapPin, RefreshCw, Link2
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import ProfileForm from '../../profiles/components/ProfileForm';
import EventsTab from '../../shared/components/EventsTab';
import CommunityTab from '../../shared/components/CommunityTab';
import ReferralsTab from '../../shared/components/ReferralsTab';
import DonationsTab from '../../shared/components/DonationsTab';
import NotificationsTab from '../../shared/components/NotificationsTab';
import MentorshipTab from '../../shared/components/MentorshipTab';
import DirectoryTab from '../../shared/components/DirectoryTab';
import MessagingTab from '../../shared/components/MessagingTab';
import { MessageSquare, Users as UsersIcon } from 'lucide-react';
import { useCommunityStore } from '../../community/store';
import { useQueryClient } from '@tanstack/react-query';
import { SuccessStoriesPage } from '../../success-stories/pages/SuccessStoriesPage';

interface JobPost {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  created_at: string;
}

interface MentorshipRequest {
  id: number;
  mentee_id: string;
  mentee_name: string;
  goals: string;
  status: string;
  created_at: string;
}

export default function AlumniDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [myJobs, setMyJobs] = useState<JobPost[]>([]);
  const [mentorRequests, setMentorRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    headline: '',
    bio: '',
    company: '',
    location: '',
    graduation_year: '',
    degree: '',
    major: '',
    linkedin_url: '',
    github_url: '',
  });
  const [saveStatus, setSaveStatus] = useState('Save Profile');

  // Job post form
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', type: 'Full-time', description: '', salary_range: '' });
  const [postingJob, setPostingJob] = useState(false);

  // Stats
  const [stats, setStats] = useState({ jobsPosted: 0, menteeCount: 0, profileViews: 0 });

  const fetchData = async () => {
    setIsLoading(true);
    // Mock fetching data
    setTimeout(() => {
        setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('navigate-tab', handleNavigate);
    return () => window.removeEventListener('navigate-tab', handleNavigate);
  }, []);

  const { connectSocket, disconnectSocket, socket } = useCommunityStore();

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket]);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notif: any) => {
      if (notif.type === 'connection_accepted' || notif.type === 'connection_request') {
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        alert(notif.message);
      }
    };
    socket.on('notification', handleNotification);
    return () => { socket.off('notification', handleNotification); }
  }, [socket, queryClient]);

  const handleSaveProfile = async () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
        setSaveStatus('Saved! ✓');
        setTimeout(() => setSaveStatus('Save Profile'), 2000);
    }, 1000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);
  };

  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.description) return;
    setPostingJob(true);
    setTimeout(() => {
        setMyJobs(prev => [{
            id: Date.now(),
            title: jobForm.title,
            company: jobForm.company,
            location: jobForm.location,
            type: jobForm.type,
            description: jobForm.description,
            created_at: new Date().toISOString()
        }, ...prev]);
        setStats(prev => ({ ...prev, jobsPosted: prev.jobsPosted + 1 }));
        setJobForm({ title: '', company: '', location: '', type: 'Full-time', description: '', salary_range: '' });
        setShowJobForm(false);
        setPostingJob(false);
    }, 1000);
  };

  const deleteJob = async (id: number) => {
    setMyJobs(prev => prev.filter(j => j.id !== id));
    setStats(prev => ({ ...prev, jobsPosted: prev.jobsPosted - 1 }));
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'jobs', label: 'Job Board', icon: Briefcase },
    { id: 'directory', label: 'Directory', icon: UsersIcon },
    { id: 'community', label: 'Community Feed', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'events', label: 'Events', icon: Award },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'donations', label: 'Donations', icon: Award },
    { id: 'success-stories', label: 'Success Stories', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/10 bg-[#0f1117] p-5">
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl overflow-hidden border border-primary/30 bg-primary/10 cursor-pointer flex items-center justify-center text-lg font-bold text-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : (user?.name?.[0]?.toUpperCase() || 'A')}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div>
            <p className="font-bold text-sm text-white">{user?.name}</p>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Alumni</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={17} /> {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => setShowSignOutModal(true)} className="mt-4 flex items-center gap-3 py-2 px-3 rounded-lg text-sm text-muted-foreground hover:text-red-400 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 sticky top-0 bg-[#09090b]/80 backdrop-blur-md z-40">
          <h1 className="text-lg font-bold text-white">
            {navItems.find(n => n.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
              <RefreshCw size={15} />
            </button>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-white font-medium">Active</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-5xl mx-auto">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Welcome Banner */}
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-primary text-sm font-semibold mb-1">👋 Welcome back</p>
                    <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
                    <p className="text-muted-foreground">{profile.headline || 'Add your headline in your profile'}</p>
                    {profile.company && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Building size={14} /> {profile.company}
                        {profile.location && <><MapPin size={14} className="ml-2" /> {profile.location}</>}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all">
                    <Edit3 size={14} /> Edit Profile
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Jobs Posted', value: stats.jobsPosted, icon: Briefcase, color: 'text-blue-400', bg: 'from-blue-500/10' },
                  { label: 'Active Mentees', value: stats.menteeCount, icon: Users, color: 'text-purple-400', bg: 'from-purple-500/10' },
                  { label: 'Profile Views', value: stats.profileViews, icon: TrendingUp, color: 'text-primary', bg: 'from-primary/10' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl border border-white/5 bg-[#15171c] relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} to-transparent pointer-events-none`} />
                    <s.icon size={20} className={`${s.color} mb-3 relative z-10`} />
                    <p className="text-3xl font-bold text-white relative z-10">{s.value}</p>
                    <p className="text-sm text-muted-foreground relative z-10 mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setActiveTab('jobs'); setShowJobForm(true); }}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-[#15171c] hover:bg-white/[0.03] hover:border-blue-500/20 transition-all text-left group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Post a Job</p>
                    <p className="text-xs text-muted-foreground">Share opportunities with students</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground ml-auto group-hover:text-white transition-colors" />
                </button>
                <button onClick={() => setActiveTab('mentorship')}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-[#15171c] hover:bg-white/[0.03] hover:border-purple-500/20 transition-all text-left group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">View Mentees</p>
                    <p className="text-xs text-muted-foreground">Manage your mentorship requests</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground ml-auto group-hover:text-white transition-colors" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               <div className="flex items-center gap-6 mb-8">
                 <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-bold text-3xl uppercase overflow-hidden shrink-0">
                   {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <>{user?.name?.[0] || 'U'}</>}
                 </div>
                 
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const objUrl = URL.createObjectURL(file);
                       setAvatarUrl(objUrl);
                     }
                   }} 
                 />
                 <div>
                   <h3 className="text-3xl font-bold text-white mb-2">My Profile</h3>
                   <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-medium text-sm hover:bg-white/10 transition-colors text-white">
                     Upload Avatar
                   </button>
                 </div>
               </div>
               
               <ProfileForm />
             </motion.div>
           )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">{myJobs.length} job{myJobs.length !== 1 ? 's' : ''} posted by you</p>
                <button onClick={() => setShowJobForm(true)} className="flex items-center gap-2 bg-primary hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                  <Plus size={15} /> Post New Job
                </button>
              </div>

              {/* Job post form */}
              <AnimatePresence>
                {showJobForm && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="border border-primary/20 rounded-2xl bg-[#15171c] p-6 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-white">New Job Posting</h3>
                      <button onClick={() => setShowJobForm(false)} className="text-muted-foreground hover:text-white"><X size={18} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'title', placeholder: 'Job Title *' },
                        { key: 'company', placeholder: 'Company Name *' },
                        { key: 'location', placeholder: 'Location' },
                        { key: 'salary_range', placeholder: 'Salary Range (e.g. ₹8-12 LPA)' },
                      ].map(f => (
                        <input key={f.key} value={jobForm[f.key as keyof typeof jobForm]} onChange={e => setJobForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          placeholder={f.placeholder} className="bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600" />
                      ))}
                    </div>
                    <select value={jobForm.type} onChange={e => setJobForm(prev => ({ ...prev, type: e.target.value }))} className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'].map(t => <option key={t} value={t} className="bg-[#1c1f26]">{t}</option>)}
                    </select>
                    <textarea value={jobForm.description} onChange={e => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Job description and requirements *" rows={4}
                      className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder:text-gray-600" />
                    <button onClick={handlePostJob} disabled={postingJob}
                      className="w-full py-3 rounded-xl bg-primary hover:bg-brand-600 text-white font-bold transition-all disabled:opacity-60">
                      {postingJob ? 'Posting...' : 'Post Job'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {myJobs.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl">
                  <Briefcase size={40} className="mx-auto text-muted-foreground opacity-30 mb-4" />
                  <h3 className="font-bold text-white text-lg mb-2">No Jobs Posted Yet</h3>
                  <p className="text-muted-foreground text-sm">Share opportunities with students at your alma mater.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myJobs.map(job => (
                     <div key={job.id} className="p-5 border border-white/5 rounded-2xl bg-[#15171c] hover:border-white/10 transition-all flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h4 className="font-bold text-white">{job.title}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/10">{job.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.company} · {job.location}</p>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                      </div>
                      <button onClick={() => deleteJob(job.id)} className="text-muted-foreground hover:text-red-400 transition-colors p-1">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Mentorship Tab */}
          {activeTab === 'mentorship' && <MentorshipTab />}
          {activeTab === 'community' && <CommunityTab />}
          {activeTab === 'directory' && <DirectoryTab />}
          {activeTab === 'messages' && <MessagingTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'referrals' && <ReferralsTab />}
          {activeTab === 'donations' && <DonationsTab />}
          {activeTab === 'success-stories' && <SuccessStoriesPage />}
          {activeTab === 'notifications' && <NotificationsTab />}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {[
                { label: 'Open to Mentorship', desc: 'Allow students to send you mentorship requests.' },
                { label: 'Email Notifications', desc: 'Get notified when a student reaches out.' },
                { label: 'Public Profile', desc: 'Make your profile visible in the alumni directory.' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-6 border border-white/5 rounded-2xl bg-[#15171c] hover:bg-white/[0.02] transition-all">
                  <div>
                    <h4 className="font-bold text-white mb-1">{s.label}</h4>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                  <div className="w-12 h-6 bg-primary/30 rounded-full relative cursor-pointer border border-primary/30">
                    <div className="w-4 h-4 bg-primary rounded-full absolute right-1 top-1" />
                  </div>
                </div>
              ))}
              <div className="mt-8 p-6 border border-red-500/10 rounded-2xl bg-red-500/5">
                <h4 className="font-bold text-white mb-1">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all your data.</p>
                <button className="text-sm text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-all">Delete Account</button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Sign Out Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSignOutModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}
              className="bg-[#15171c] border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                <LogOut size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Sign Out?</h3>
              <p className="text-muted-foreground text-sm text-center mb-7">You'll need to sign in again to access your dashboard.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowSignOutModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={() => { logout(); navigate('/login'); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
