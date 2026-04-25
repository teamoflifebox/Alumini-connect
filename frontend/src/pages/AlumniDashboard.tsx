import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, LayoutDashboard, Settings, UserCircle, Briefcase,
  Users, TrendingUp, Award, BookOpen, Edit3, Plus,
  ChevronRight, X, Building, MapPin, RefreshCw, Link2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

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
  const { user, logout, login, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [myJobs, setMyJobs] = useState<JobPost[]>([]);
  const [mentorRequests, setMentorRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);

  // Profile state
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
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

  useEffect(() => {
    if (!isAuthenticated || !user) { navigate('/login'); return; }
    if (user.role !== 'alumni') { navigate('/dashboard'); return; }
    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setIsLoading(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    // Fetch profile
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileData) {
      setProfile({
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        headline: profileData.headline || '',
        bio: profileData.bio || '',
        company: profileData.industry || '',
        location: profileData.location || '',
        graduation_year: profileData.graduation_year?.toString() || '',
        degree: profileData.degree || '',
        major: profileData.major || '',
        linkedin_url: profileData.linkedin_url || '',
        github_url: profileData.github_url || '',
      });
      if (profileData.avatar_url) setAvatarUrl(profileData.avatar_url);
    }

    // Fetch jobs posted
    const { data: jobsData } = await supabase.from('jobs').select('*').eq('posted_by', userId).order('created_at', { ascending: false });
    if (jobsData) {
      setMyJobs(jobsData);
      setStats(prev => ({ ...prev, jobsPosted: jobsData.length }));
    }

    // Fetch mentorship requests
    const { data: mentorData } = await supabase.from('mentorships').select('*').eq('mentor_id', userId);
    if (mentorData) {
      setMentorRequests(mentorData);
      setStats(prev => ({ ...prev, menteeCount: mentorData.filter((m: any) => m.status === 'active').length }));
    }

    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaveStatus('Saving...');
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    if (!supaUser) return;

    const { error } = await supabase.from('profiles').update({
      first_name: profile.firstName,
      last_name: profile.lastName,
      headline: profile.headline,
      bio: profile.bio,
      industry: profile.company,
      location: profile.location,
      graduation_year: profile.graduation_year ? parseInt(profile.graduation_year) : null,
      degree: profile.degree,
      major: profile.major,
      linkedin_url: profile.linkedin_url,
      github_url: profile.github_url,
      updated_at: new Date().toISOString(),
    }).eq('id', supaUser.id);

    if (!error) {
      login({ ...user!, firstName: profile.firstName, lastName: profile.lastName });
      setSaveStatus('Saved! ✓');
      setTimeout(() => setSaveStatus('Save Profile'), 2000);
    } else {
      setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus('Save Profile'), 2000);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);
    login({ ...user!, avatarUrl: localUrl });
  };

  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.description) return;
    setPostingJob(true);
    const { data: { user: supaUser } } = await supabase.auth.getUser();
    if (!supaUser) return;

    const { data, error } = await supabase.from('jobs').insert({
      posted_by: supaUser.id,
      title: jobForm.title,
      company: jobForm.company,
      location: jobForm.location,
      type: jobForm.type,
      description: jobForm.description,
      salary_range: jobForm.salary_range,
      is_active: true,
    }).select().single();

    if (!error && data) {
      setMyJobs(prev => [data, ...prev]);
      setStats(prev => ({ ...prev, jobsPosted: prev.jobsPosted + 1 }));
      setJobForm({ title: '', company: '', location: '', type: 'Full-time', description: '', salary_range: '' });
      setShowJobForm(false);
    }
    setPostingJob(false);
  };

  const deleteJob = async (id: number) => {
    await supabase.from('jobs').delete().eq('id', id);
    setMyJobs(prev => prev.filter(j => j.id !== id));
    setStats(prev => ({ ...prev, jobsPosted: prev.jobsPosted - 1 }));
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'jobs', label: 'Job Board', icon: Briefcase },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/10 bg-[#0f1117] p-5">
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-500/10 cursor-pointer flex items-center justify-center text-lg font-bold text-emerald-400"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : (user?.firstName?.[0]?.toUpperCase() || 'A')}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div>
            <p className="font-bold text-sm text-white">{user?.firstName} {user?.lastName}</p>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Alumni</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-medium">Active</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-5xl mx-auto">

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Welcome Banner */}
              <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-emerald-400 text-sm font-semibold mb-1">👋 Welcome back</p>
                    <h2 className="text-3xl font-bold text-white mb-2">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-muted-foreground">{profile.headline || 'Add your headline in your profile'}</p>
                    {profile.company && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Building size={14} /> {profile.company}
                        {profile.location && <><MapPin size={14} className="ml-2" /> {profile.location}</>}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-all">
                    <Edit3 size={14} /> Edit Profile
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Jobs Posted', value: stats.jobsPosted, icon: Briefcase, color: 'text-blue-400', bg: 'from-blue-500/10' },
                  { label: 'Active Mentees', value: stats.menteeCount, icon: Users, color: 'text-purple-400', bg: 'from-purple-500/10' },
                  { label: 'Profile Views', value: stats.profileViews, icon: TrendingUp, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
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
              {/* Avatar */}
              <div className="flex items-center gap-6 p-6 border border-white/5 rounded-2xl bg-[#15171c]">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/30 cursor-pointer bg-emerald-500/10 flex items-center justify-center text-3xl font-bold text-emerald-400"
                  onClick={() => fileInputRef.current?.click()}>
                  {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : (user?.firstName?.[0]?.toUpperCase())}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{profile.firstName} {profile.lastName}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{profile.headline || 'No headline set'}</p>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-all">
                    Change Photo
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'First Name', key: 'firstName', placeholder: 'First name' },
                  { label: 'Last Name', key: 'lastName', placeholder: 'Last name' },
                  { label: 'Current Company', key: 'company', placeholder: 'e.g. Google' },
                  { label: 'Location', key: 'location', placeholder: 'City, Country' },
                  { label: 'Graduation Year', key: 'graduation_year', placeholder: 'e.g. 2020' },
                  { label: 'Degree', key: 'degree', placeholder: 'e.g. B.Tech' },
                  { label: 'Major', key: 'major', placeholder: 'e.g. Computer Science' },
                  { label: 'Headline', key: 'headline', placeholder: 'e.g. Senior Engineer at Google' },
                ].map(field => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</label>
                    <input
                      value={profile[field.key as keyof typeof profile]}
                      onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell students about your career journey, expertise, and how you can help them..."
                  rows={4}
                  className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none placeholder:text-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Link2 size={12} /> LinkedIn URL</label>
                  <input value={profile.linkedin_url} onChange={e => setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Link2 size={12} /> GitHub URL</label>
                  <input value={profile.github_url} onChange={e => setProfile(prev => ({ ...prev, github_url: e.target.value }))} placeholder="https://github.com/..." className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600" />
                </div>
              </div>

              <button onClick={handleSaveProfile}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                {saveStatus}
              </button>
            </motion.div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground text-sm">{myJobs.length} job{myJobs.length !== 1 ? 's' : ''} posted by you</p>
                <button onClick={() => setShowJobForm(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all">
                  <Plus size={15} /> Post New Job
                </button>
              </div>

              {/* Job post form */}
              <AnimatePresence>
                {showJobForm && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="border border-emerald-500/20 rounded-2xl bg-[#15171c] p-6 space-y-4">
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
                          placeholder={f.placeholder} className="bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600" />
                      ))}
                    </div>
                    <select value={jobForm.type} onChange={e => setJobForm(prev => ({ ...prev, type: e.target.value }))} className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                      {['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'].map(t => <option key={t} value={t} className="bg-[#1c1f26]">{t}</option>)}
                    </select>
                    <textarea value={jobForm.description} onChange={e => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Job description and requirements *" rows={4}
                      className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none placeholder:text-gray-600" />
                    <button onClick={handlePostJob} disabled={postingJob}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all disabled:opacity-60">
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
                          <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/20 text-emerald-400 bg-emerald-500/10">{job.type}</span>
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
          {activeTab === 'mentorship' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="p-6 border border-purple-500/20 rounded-2xl bg-purple-500/5">
                <div className="flex items-center gap-3 mb-2">
                  <Award size={20} className="text-purple-400" />
                  <h3 className="font-bold text-white">Mentorship Status</h3>
                </div>
                <p className="text-muted-foreground text-sm">You have <span className="text-white font-bold">{stats.menteeCount}</span> active mentee{stats.menteeCount !== 1 ? 's' : ''}. Students can find you in the Opportunity Hub and send mentorship requests.</p>
              </div>

              {mentorRequests.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl">
                  <Users size={40} className="mx-auto text-muted-foreground opacity-30 mb-4" />
                  <h3 className="font-bold text-white text-lg mb-2">No Mentorship Requests Yet</h3>
                  <p className="text-muted-foreground text-sm">Students who request mentorship from you will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mentorRequests.map(req => (
                    <div key={req.id} className="p-5 border border-white/5 rounded-2xl bg-[#15171c] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-400">
                          {req.mentee_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{req.mentee_name || 'Student'}</p>
                          <p className="text-xs text-muted-foreground">{req.goals || 'Career guidance'}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        req.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                        req.status === 'pending' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                        'text-muted-foreground bg-white/5 border-white/10'
                      }`}>{req.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

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
                  <div className="w-12 h-6 bg-emerald-500/30 rounded-full relative cursor-pointer border border-emerald-500/30">
                    <div className="w-4 h-4 bg-emerald-400 rounded-full absolute right-1 top-1" />
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
                <button onClick={() => { logout(); navigate('/'); supabase.auth.signOut(); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors">Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
