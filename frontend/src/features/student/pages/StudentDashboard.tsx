import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, Settings, UserCircle, Briefcase, GraduationCap, ChevronRight, Check, Users, Award, Bell } from 'lucide-react';
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
import { MessageSquare, Users as UsersIcon, Newspaper, BookOpen, CheckCircle, MapPin, Search, Plus, UserPlus, Heart, Calendar, ImageIcon, Video, BarChart2, Eye, Bookmark, MoreHorizontal, ArrowRight, MessageCircle } from 'lucide-react';
import { useCommunityStore } from '../../community/store';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { SuccessStoriesPage } from '../../success-stories/pages/SuccessStoriesPage';
import { successStoriesApi } from '../../../api/success-stories.api';
import { eventsApi } from '../../../api/events';
import { mentorshipApi } from '../../../api/mentorship.api';
import { getFeed, getConnections, createPost } from '../../community/api';
import { profilesApi } from '../../../api/profiles.api';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [oppTab, setOppTab] = useState('Jobs & Internships');
  const [jobs] = useState<any[]>([]);
  const [mentors] = useState<any[]>([]);
  const [scholarships] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [settingsState, setSettingsState] = useState({
    emailNotifs: true,
    publicProfile: false,
    twoFactor: false
  });
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const toggleSetting = (key: keyof typeof settingsState) => {
    setSettingsState(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const { data: profileRes } = useQuery({ queryKey: ['my-profile'], queryFn: profilesApi.getProfile });
  const profileDataFromApi = profileRes?.data || {};

  const firstName = profileDataFromApi.first_name || user?.name?.split(' ')[0] || '';
  const lastName = profileDataFromApi.last_name || user?.name?.split(' ')[1] || '';
  const avatarUrl = localAvatarUrl || profileDataFromApi.avatar_url || user?.avatar_url || null;
  const headline = profileDataFromApi.headline || '';

  const handlePostSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!postContent.trim() || isPosting) return;
    setIsPosting(true);
    try {
      await createPost(postContent);
      setPostContent('');
      queryClient.invalidateQueries({ queryKey: ['dash-feed'] });
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
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
      // Refresh connection data on connection events
      if (notif.type === 'connection_accepted' || notif.type === 'connection_request') {
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        alert(notif.message);
      }
    };
    socket.on('notification', handleNotification);
    return () => { socket.off('notification', handleNotification); }
  }, [socket, queryClient]);

  // DYNAMIC DASHBOARD DATA FETCHING
  const { data: dashboardStories } = useQuery({ queryKey: ['dash-stories'], queryFn: successStoriesApi.getStories });
  const { data: dashboardEvents } = useQuery({ queryKey: ['dash-events'], queryFn: () => eventsApi.getAll() });
  const { data: dashboardFeed } = useQuery({ queryKey: ['dash-feed'], queryFn: () => getFeed(1, 10) });
  const { data: dashboardConnections } = useQuery({ queryKey: ['dash-connections'], queryFn: getConnections });
  const { data: recommendedMentors } = useQuery({ queryKey: ['dash-mentors'], queryFn: mentorshipApi.getRecommended });

  const timelineItems = useMemo(() => {
    const items: any[] = [];
    if (dashboardStories) {
      items.push(...dashboardStories.map((s: any) => ({ type: 'story', data: s, date: new Date(s.created_at).getTime() })));
    }
    if (dashboardEvents) {
      items.push(...dashboardEvents.map((e: any) => ({ type: 'event', data: e, date: new Date(e.created_at || e.start_time).getTime() })));
    }
    if (dashboardFeed?.posts) {
      items.push(...dashboardFeed.posts.map((p: any) => ({ type: 'post', data: p, date: new Date(p.created_at).getTime() })));
    }
    return items.sort((a, b) => b.date - a.date).slice(0, 15);
  }, [dashboardStories, dashboardEvents, dashboardFeed]);

  // Unused constants removed
  const upcomingEvents = dashboardEvents?.filter((e: any) => new Date(e.start_time) > new Date()).slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground flex relative">
      
      {/* ONBOARDING OVERLAY */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#15171c] border border-white/10 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${(step / 3) * 100}%` }} 
                  className="h-full bg-primary"
                />
              </div>

              <div className="mb-8">
                <span className="text-primary text-sm font-bold tracking-wider uppercase mb-2 block">Step {step} of 3</span>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {step === 1 && "What are your primary goals?"}
                  {step === 2 && "What are your core interests?"}
                  {step === 3 && "You're all set!"}
                </h2>
                <p className="text-muted-foreground">
                  {step === 1 && "Select all that apply so we can customize your network feed."}
                  {step === 2 && "We'll use this to match you with the perfect mentors and scholarships."}
                  {step === 3 && "Your profile is optimized. Let's start connecting you with opportunities."}
                </p>
              </div>

              {step === 1 && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['Find a Mentor', 'Apply for Scholarships', 'Networking', 'Job Opportunities'].map(goal => (
                    <button 
                      key={goal} onClick={() => toggleSelection(goal, goals, setGoals)}
                      className={`p-4 rounded-xl border text-left transition-all ${goals.includes(goal) ? 'bg-primary/20 border-primary text-white' : 'bg-[#1c1f26] border-white/5 text-muted-foreground hover:border-white/20'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{goal}</span>
                        {goals.includes(goal) && <Check size={16} className="text-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {['Software Engineering', 'Data Science', 'Marketing', 'Finance', 'Design', 'Product Management', 'Cybersecurity', 'AI/ML'].map(skill => (
                    <button 
                      key={skill} onClick={() => toggleSelection(skill, skills, setSkills)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${skills.includes(skill) ? 'bg-primary text-white border-primary' : 'bg-[#1c1f26] border-white/5 text-muted-foreground hover:text-white hover:border-white/20'}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="flex justify-center py-8">
                  <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center">
                    <Check size={48} />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-8">
                <button 
                  onClick={handleSkipOnboarding} 
                  className="text-muted-foreground hover:text-white transition-colors text-sm font-medium"
                >
                  Skip for now
                </button>
                <button 
                  onClick={handleNext}
                  className="bg-primary hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)] flex items-center gap-2"
                >
                  {step === 3 ? "Enter Dashboard" : "Continue"}
                  {step !== 3 && <ChevronRight size={18} />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-[#0c0c0e] p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-primary text-white p-1.5 rounded-lg">
            <GraduationCap size={20} />
          </div>
          <span className="font-bold tracking-tight text-lg text-white">AlumniConnect</span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'profile', label: 'My Profile', icon: UserCircle },
            { id: 'opportunities', label: 'Opportunity Hub', icon: Briefcase },
            { id: 'mentorship', label: 'Mentorship', icon: Users },
            { id: 'directory', label: 'Directory', icon: UsersIcon },
            { id: 'community', label: 'Community Feed', icon: Users },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'events', label: 'Events', icon: Award },
            { id: 'referrals', label: 'Referrals', icon: Users },
            { id: 'donations', label: 'Donations', icon: Award },
            { id: 'success-stories', label: 'Success Stories', icon: Award },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}>
              <item.icon size={18} className={activeTab === item.id ? "text-primary" : ""} /> {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => setShowSignOutModal(true)} className="mt-auto flex items-center gap-3 text-muted-foreground hover:text-destructive py-2 px-3 rounded-lg transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSignOutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#15171c] border border-white/10 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                <LogOut size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Sign Out?</h3>
              <p className="text-muted-foreground text-sm text-center mb-7">You'll need to sign in again to access your dashboard and network.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignOutModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto relative ${activeTab === 'dashboard' ? 'bg-[#f8f9fc] text-slate-900' : 'bg-[#050505] text-white'}`}>
        {/* Top Header - Hidden for dashboard since it has its own custom search header */}
        {activeTab !== 'dashboard' && (
          <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/95 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold tracking-tight text-white/90">Overview</h2>
              <span className="hidden md:flex px-2.5 py-0.5 bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold rounded-full uppercase tracking-wider">{user?.role || 'Student'} MODE</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Bell size={20} className="text-white/60 hover:text-white cursor-pointer transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border border-[#050505]" />
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1c1f26] border border-white/10 flex items-center justify-center font-bold text-white/80 text-sm cursor-pointer overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <>{firstName?.[0] || 'U'}</>}
              </div>
            </div>
          </header>
        )}

        {/* Dashboard Canvas */}
        <div className={activeTab === 'dashboard' ? "" : "p-8 max-w-[1600px] mx-auto"}>
           
           {activeTab === 'dashboard' && (
             <div className="bg-[#f8f9fc] min-h-full">
               {/* Search Header for Dashboard */}
               <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-40">
                 <div className="relative w-96 hidden md:block">
                   <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="text" placeholder="Search for people, communities, jobs..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 text-slate-800" />
                 </div>
                 <div className="flex items-center gap-4 ml-auto">
                   <button className="flex items-center gap-2 border border-blue-200 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition shadow-sm"><Plus size={16}/> Create</button>
                   <div className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"><MessageSquare size={18}/></div>
                   <div className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer relative"><Bell size={18}/><span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span></div>
                   <div className="flex items-center gap-2 cursor-pointer pl-2">
                     <div className="text-right hidden md:block">
                       <p className="text-sm font-bold text-slate-800 leading-none">{firstName || 'Student'}</p>
                       <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase">Alumni</p>
                     </div>
                     <img src={avatarUrl || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-full border border-slate-200" />
                   </div>
                 </div>
               </div>

               <div className="p-8 max-w-[1600px] mx-auto space-y-6">
                 {/* Hero Banner */}
                 <div className="bg-[#1e293b] rounded-2xl p-8 text-white flex flex-col lg:flex-row justify-between items-center relative overflow-hidden shadow-lg">
                   {/* Background pattern overlay */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                   
                   <div className="flex items-center gap-6 relative z-10 w-full">
                     <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-slate-800 shrink-0 shadow-xl">
                       <img src={avatarUrl || "https://i.pravatar.cc/150"} className="w-full h-full object-cover" />
                     </div>
                     <div>
                       <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">Welcome back,</p>
                       <h2 className="text-3xl font-extrabold flex items-center gap-2">
                         {firstName || 'Student'} {lastName}
                         <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M11.602 1.673l.794.793a4.015 4.015 0 002.839 1.175h1.124a4.01 4.01 0 014.01 4.01v1.124c0 1.066.423 2.088 1.175 2.839l.793.794a4.013 4.013 0 010 5.676l-.793.793a4.015 4.015 0 00-1.175 2.84v1.123a4.01 4.01 0 01-4.01 4.01h-1.124a4.015 4.015 0 00-2.839 1.176l-.794.793a4.013 4.013 0 01-5.676 0l-.793-.794a4.015 4.015 0 00-2.84-1.175H5.683a4.01 4.01 0 01-4.01-4.01v-1.124a4.015 4.015 0 00-1.176-2.839l-.793-.793a4.013 4.013 0 010-5.676l.794-.794a4.015 4.015 0 001.175-2.839V5.682a4.01 4.01 0 014.01-4.01h1.124a4.015 4.015 0 002.839-1.175l.793-.793a4.013 4.013 0 015.676 0zm-1.895 10.97a1.505 1.505 0 00-2.126-2.132l-2.43 2.42-1.077-1.077a1.505 1.505 0 00-2.128 2.128l2.14 2.14a1.505 1.505 0 002.128 0l3.493-3.48z" />
                         </svg>
                       </h2>
                       <p className="text-white/80 text-sm mt-1 font-medium">{user?.role === 'alumni' ? 'Alumni Network Member' : 'Student Member'}</p>
                       <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-white/90">
                         <span className="flex items-center gap-2 font-medium"><Briefcase size={16} className="text-blue-400"/> {user?.role === 'alumni' ? 'Professional' : 'Student'} at <strong className="font-bold text-white">AlumniConnect</strong></span>
                         <span className="flex items-center gap-2 font-medium"><MapPin size={16} className="text-red-400"/> Global Network</span>
                       </div>
                     </div>
                   </div>

                   <div className="relative z-10 w-full lg:w-72 mt-8 lg:mt-0 lg:shrink-0 pl-0 lg:pl-8 lg:border-l border-white/10">
                     <div className="flex justify-between text-sm mb-2">
                       <span className="font-medium text-white/90">Profile Completion</span>
                       <span className="font-bold">{Math.round((([user?.name, user?.email, avatarUrl].filter(Boolean).length) / 3) * 100)}%</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full mb-3 overflow-hidden shadow-inner">
                       <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${Math.round((([user?.name, user?.email, avatarUrl].filter(Boolean).length) / 3) * 100)}%` }}></div>
                     </div>
                     <p className="text-xs text-white/60 mb-4 leading-relaxed">Complete your profile to get better opportunities</p>
                     <button onClick={() => setActiveTab('profile')} className="text-xs font-semibold py-2 px-5 rounded-lg border border-white/20 hover:bg-white/10 transition flex items-center gap-2">Complete Profile <ArrowRight size={14}/></button>
                   </div>
                 </div>

                 {/* Stats Row */}
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                   {[
                     { icon: Users, label: 'Mentors Available', value: recommendedMentors?.length || 0, trend: 'Latest', color: 'text-purple-600', bg: 'bg-purple-100' },
                     { icon: Briefcase, label: 'Active Events', value: dashboardEvents?.length || 0, trend: 'Updated', color: 'text-blue-600', bg: 'bg-blue-100' },
                     { icon: UserPlus, label: 'Connections', value: dashboardConnections?.length || 0, trend: 'Network', color: 'text-green-600', bg: 'bg-green-100' },
                     { icon: MessageSquare, label: 'Community Posts', value: dashboardFeed?.posts?.length || 0, trend: 'Recent', color: 'text-orange-600', bg: 'bg-orange-100' },
                     { icon: Newspaper, label: 'Success Stories', value: dashboardStories?.length || 0, trend: 'Inspiring', color: 'text-pink-600', bg: 'bg-pink-100' },
                     { icon: Calendar, label: 'Network Updates', value: timelineItems.length, trend: 'Live', color: 'text-teal-600', bg: 'bg-teal-100' },
                   ].map((stat, i) => (
                     <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} mb-4`}>
                         <stat.icon size={20} strokeWidth={2.5} />
                       </div>
                       <h3 className="text-2xl font-extrabold text-slate-800 leading-none">{stat.value}</h3>
                       <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
                       <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1"><ArrowRight size={10} className="-rotate-45" /> {stat.trend}</p>
                     </div>
                   ))}
                 </div>

                 {/* Main Dashboard Layout */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                   
                   {/* Middle Feed Column (6 cols) */}
                   <div className="lg:col-span-6 space-y-6">
                     {/* Share Update Box */}
                     <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                       <div className="flex items-center gap-4 mb-4">
                         <img src={avatarUrl || "https://i.pravatar.cc/150"} className="w-12 h-12 rounded-full border border-slate-100" />
                         <input 
                           type="text" 
                           value={postContent}
                           onChange={(e) => setPostContent(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handlePostSubmit(e)}
                           disabled={isPosting}
                           placeholder="Share an update, opportunity, or ask the community..." 
                           className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 ring-blue-50 text-slate-800 transition-all font-medium" 
                         />
                       </div>
                       <div className="flex gap-2 sm:gap-6 px-0 sm:px-16 flex-wrap mt-2">
                         <button className="flex items-center gap-2 text-xs text-slate-600 font-bold hover:bg-slate-50 px-3 py-2 rounded-lg transition"><ImageIcon size={16} className="text-purple-500"/> Image</button>
                         <button className="flex items-center gap-2 text-xs text-slate-600 font-bold hover:bg-slate-50 px-3 py-2 rounded-lg transition"><Video size={16} className="text-blue-500"/> Video</button>
                         <button className="flex items-center gap-2 text-xs text-slate-600 font-bold hover:bg-slate-50 px-3 py-2 rounded-lg transition"><Briefcase size={16} className="text-green-500"/> Job</button>
                         <button className="flex items-center gap-2 text-xs text-slate-600 font-bold hover:bg-slate-50 px-3 py-2 rounded-lg transition"><BarChart2 size={16} className="text-orange-500"/> Poll</button>
                         <button className="flex items-center gap-2 text-xs text-slate-600 font-bold hover:bg-slate-50 px-3 py-2 rounded-lg transition"><Calendar size={16} className="text-pink-500"/> Event</button>
                       </div>
                     </div>

                     {/* Recent Activity */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                       <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                         <h3 className="font-bold text-slate-800 text-base">Recent Activity</h3>
                         <button className="text-blue-600 font-bold text-sm hover:underline">See all</button>
                       </div>
                       <div className="divide-y divide-slate-100">
                         {timelineItems.length > 0 ? timelineItems.map((item, i) => (
                           <div key={i} className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer flex gap-4">
                             <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-slate-50 overflow-hidden border border-slate-200">
                               {item.type === 'story' && <BookOpen size={20} className="text-orange-500" />}
                               {item.type === 'event' && <Calendar size={20} className="text-purple-600" />}
                               {item.type === 'post' && (item.data.author?.avatar_url ? <img src={item.data.author.avatar_url} className="w-full h-full object-cover"/> : <Users size={20} className="text-blue-600"/>)}
                             </div>
                             <div className="flex-1">
                               <div className="flex items-start justify-between">
                                 <div>
                                   <p className="text-sm font-bold text-slate-800 leading-snug">
                                     {item.type === 'story' && `${item.data.title}`}
                                     {item.type === 'event' && `${item.data.title} - Registrations are open! `}
                                     {item.type === 'post' && `${item.data.content} `}
                                     
                                     <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest ml-2 align-middle ${
                                       item.type === 'story' ? 'bg-green-100 text-green-700' :
                                       item.type === 'event' ? 'bg-purple-100 text-purple-700' :
                                       'bg-blue-100 text-blue-700'
                                     }`}>
                                       {item.type === 'story' ? 'Success Story' : item.type === 'event' ? 'Event' : 'Community'}
                                     </span>
                                   </p>
                                   <p className="text-[11px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wide">
                                     {item.type === 'story' && `${item.data.alumni_name} • Posted ${new Date(item.date).toLocaleDateString()}`}
                                     {item.type === 'event' && `Alumni Network • ${new Date(item.date).toLocaleDateString()}`}
                                     {item.type === 'post' && `${item.data.author?.name} • ${new Date(item.date).toLocaleDateString()}`}
                                   </p>
                                 </div>
                               </div>
                             </div>
                             <div className="flex flex-col items-end gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity justify-center">
                               <span className="flex items-center gap-1 text-[11px] font-bold"><Eye size={14}/> {Math.floor(Math.random() * 200)}</span>
                               <Bookmark size={16} className="hover:text-blue-500"/>
                             </div>
                           </div>
                         )) : (
                           <div className="p-8 text-center text-slate-500 text-sm font-medium">No recent activity</div>
                         )}
                       </div>
                       <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                         <button className="text-blue-600 text-sm font-bold hover:underline">Load more activities v</button>
                       </div>
                     </div>
                   </div>

                   {/* Right Column 1: Events & Communities (3 cols) */}
                   <div className="lg:col-span-3 space-y-6">
                     {/* Upcoming Events */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                       <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-slate-800 text-base">Upcoming Events</h3>
                         <button onClick={() => setActiveTab('events')} className="text-blue-600 font-bold text-sm hover:underline">See all</button>
                       </div>
                       <div className="space-y-5">
                         {upcomingEvents.length > 0 ? upcomingEvents.map((event: any, i: number) => {
                           const d = new Date(event.start_time);
                           return (
                             <div key={i} className="flex gap-4 items-start group cursor-pointer" onClick={() => setActiveTab('events')}>
                               <div className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center shrink-0 group-hover:border-blue-300 transition-colors">
                                 <span className="text-lg font-extrabold text-slate-800 leading-none">{d.getDate()}</span>
                                 <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{d.toLocaleString('default', {month:'short'})}</span>
                               </div>
                               <div>
                                 <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                                 <p className="text-[11px] font-semibold text-slate-500 mt-1.5 flex items-center gap-1.5"><MapPin size={12} className="text-slate-400"/> {event.location_type}</p>
                                 <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1.5"><Calendar size={12} className="text-slate-400"/> {d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
                               </div>
                             </div>
                           );
                         }) : (
                           <p className="text-sm font-medium text-slate-500 text-center py-4">No events scheduled.</p>
                         )}
                       </div>
                     </div>

                     {/* My Communities */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                       <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-slate-800 text-base">My Communities</h3>
                         <button onClick={() => setActiveTab('community')} className="text-blue-600 font-bold text-sm hover:underline">See all</button>
                       </div>
                       <div className="space-y-4">
                         <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('community')}>
                           <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform"><Users size={20}/></div>
                           <div className="flex-1"><h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">AI & ML Community</h4><p className="text-[11px] font-medium text-slate-500 mt-0.5">2.4K members</p></div>
                           <span className="bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg">9+</span>
                         </div>
                         <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('community')}>
                           <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform"><Briefcase size={20}/></div>
                           <div className="flex-1"><h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Entrepreneurship Hub</h4><p className="text-[11px] font-medium text-slate-500 mt-0.5">1.8K members</p></div>
                           <span className="bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg">5</span>
                         </div>
                         <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('community')}>
                           <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform"><GraduationCap size={20}/></div>
                           <div className="flex-1"><h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">2018 Batch Alumni</h4><p className="text-[11px] font-medium text-slate-500 mt-0.5">350 members</p></div>
                           <span className="bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg">9+</span>
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Right Column 2: People & Mentorship (3 cols) */}
                   <div className="lg:col-span-3 space-y-6">
                     
                     {/* People You May Know */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                       <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-slate-800 text-base">People You May Know</h3>
                         <button className="text-blue-600 font-bold text-sm hover:underline">See all</button>
                       </div>
                       <div className="space-y-5">
                         {(recommendedMentors?.length || 0) > 0 ? (recommendedMentors || []).slice(0, 3).map((person: any, i: number) => (
                           <div key={i} className="flex items-center gap-3">
                             <img src={person.thumbnail_url || `https://i.pravatar.cc/150?u=${i}`} className="w-10 h-10 rounded-full border border-slate-200" />
                             <div className="flex-1 overflow-hidden">
                               <h4 className="text-sm font-bold text-slate-800 truncate">{person.mentor_name || person.name || 'Alumni Mentor'}</h4>
                               <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{person.mentor_headline || person.title || 'Experienced Professional'}</p>
                             </div>
                             <button className="text-[11px] font-bold text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-full transition">Connect</button>
                           </div>
                         )) : (
                           <p className="text-xs text-slate-500">No suggestions available.</p>
                         )}
                       </div>
                     </div>

                     {/* Mentorship Overview */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                       <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-slate-800 text-base">Mentorship Overview</h3>
                         <button onClick={() => setActiveTab('mentorship')} className="text-blue-600 font-bold text-sm hover:underline">See all</button>
                       </div>
                       <div className="space-y-4 mb-6">
                         <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2 text-slate-600 text-xs font-bold"><UserCircle size={16} className="text-blue-500"/> Pending Requests</div>
                           <span className="font-extrabold text-slate-800">3</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2 text-slate-600 text-xs font-bold"><Users size={16} className="text-purple-500"/> Active Mentees</div>
                           <span className="font-extrabold text-slate-800">5</span>
                         </div>
                         <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2 text-slate-600 text-xs font-bold"><Calendar size={16} className="text-orange-500"/> Sessions This Month</div>
                           <span className="font-extrabold text-slate-800">4</span>
                         </div>
                       </div>
                       <button onClick={() => setActiveTab('mentorship')} className="w-full border border-blue-200 text-blue-600 font-bold py-2.5 rounded-xl text-sm hover:bg-blue-50 transition shadow-sm">View Mentorship Dashboard</button>
                     </div>

                     {/* Engagement Score */}
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                       <div className="flex justify-between items-center mb-6">
                         <h3 className="font-bold text-slate-800 text-base">Engagement Score</h3>
                         <span className="text-green-600 font-bold text-xs uppercase tracking-wide">Excellent</span>
                       </div>
                       <div className="flex items-center gap-6 mb-6">
                         <div className="w-24 h-24 rounded-full border-[10px] border-slate-100 relative flex items-center justify-center shrink-0">
                           <div className="absolute inset-0 border-[10px] border-blue-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 78%, 0 78%)' }}></div>
                           <div className="text-center mt-1">
                             <span className="text-2xl font-extrabold text-slate-800 leading-none">78</span>
                             <span className="text-[10px] font-bold text-slate-400 block mt-0.5">/100</span>
                           </div>
                         </div>
                         <div className="flex-1 space-y-2.5 text-[11px] font-bold text-slate-600">
                           <div className="flex justify-between"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Community</span><span className="text-slate-400">35/40</span></div>
                           <div className="flex justify-between"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Mentorship</span><span className="text-slate-400">20/25</span></div>
                           <div className="flex justify-between"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Referrals</span><span className="text-slate-400">15/20</span></div>
                           <div className="flex justify-between"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400"></span> Events</span><span className="text-slate-400">8/15</span></div>
                         </div>
                       </div>
                       <button className="w-full border border-blue-200 text-blue-600 font-bold py-2.5 rounded-xl text-sm hover:bg-blue-50 transition shadow-sm">View Analytics Dashboard</button>
                     </div>

                   </div>
                 </div>

                 {/* Bottom Quick Links Cards */}
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
                   {[
                     { label: 'Mentorship Hub', sub: 'Guide the next generation', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', tab: 'mentorship' },
                     { label: 'Recruiter Hub', sub: 'Post jobs & connect', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100', tab: 'opportunities' },
                     { label: 'Jobs & Referrals', sub: 'Discover jobs', icon: UserPlus, color: 'text-green-600', bg: 'bg-green-100', tab: 'referrals' },
                     { label: 'Donations & Impact', sub: 'Support scholarships', icon: Heart, color: 'text-red-500', bg: 'bg-red-100', tab: 'donations' },
                     { label: 'Analytics', sub: 'Track your engagement', icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100', tab: 'dashboard' },
                     { label: 'Messages', sub: 'Connect with network', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-100', tab: 'messages' },
                   ].map((link, i) => (
                     <div key={i} onClick={() => setActiveTab(link.tab)} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${link.bg} ${link.color}`}>
                         <link.icon size={24} />
                       </div>
                       <h4 className="font-bold text-slate-800 text-sm leading-tight">{link.label}</h4>
                       <p className="text-[11px] font-medium text-slate-500 mt-1 mb-4 leading-snug">{link.sub}</p>
                       <span className={`text-[11px] font-bold ${link.color} flex items-center gap-1 uppercase tracking-wide`}>Go to {link.label.split(' ')[0]} <ArrowRight size={12}/></span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'profile' && (
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
               <div className="flex items-center gap-6 mb-8">
                 <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-3xl uppercase overflow-hidden shrink-0">
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
                       setLocalAvatarUrl(objUrl);
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

           {activeTab === 'opportunities' && (
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
               <h3 className="text-3xl font-bold text-white mb-2">Opportunity Hub</h3>
               <p className="text-muted-foreground mb-8">Access the network's exclusive pipeline of jobs, mentorship rounds, and scholarships.</p>
               <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
                 {['Jobs & Internships', 'Mentorship Directory', 'Alumni Scholarships'].map((tab) => (
                   <button 
                     key={tab} 
                     onClick={() => setOppTab(tab)}
                     className={`px-4 py-2 font-medium rounded-lg text-sm transition-all ${oppTab === tab ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,98,10,0.3)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                   >
                     {tab}
                   </button>
                 ))}
               </div>

               {oppTab === 'Jobs & Internships' && (
                 <div className="space-y-4">
                   <div className="flex justify-between items-center mb-6">
                     <h4 className="text-xl font-bold text-white">Recommended Roles</h4>
                     <input type="text" placeholder="Search roles..." className="bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                   </div>
                   {jobs.length > 0 ? jobs.map((job, i) => (
                     <div key={i} className="group p-6 rounded-2xl border border-white/5 bg-[#12141a] hover:bg-[#15171c] transition-all flex items-center justify-between cursor-default">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                           <Briefcase size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                         </div>
                         <div>
                           <h5 className="font-bold text-lg text-white mb-1">{job.title}</h5>
                           <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                         </div>
                       </div>
                       <button className="text-sm font-semibold text-white bg-white/10 hover:bg-primary px-4 py-2 rounded-lg transition-colors border border-white/5">
                         Easy Apply
                       </button>
                     </div>
                   )) : (
                     <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                       <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                       <h5 className="text-white font-bold mb-2">No Active Roles Found</h5>
                       <p className="text-sm text-muted-foreground">The API hasn't resolved any active job postings from recruiters yet.</p>
                     </div>
                   )}
                 </div>
               )}

               {oppTab === 'Mentorship Directory' && (
                 <div className="grid md:grid-cols-2 gap-6">
                   {mentors.length > 0 ? mentors.map((mentor, i) => (
                     <div key={i} className="p-6 rounded-2xl border border-white/5 bg-[#12141a] group relative overflow-hidden flex flex-col justify-between">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none" />
                       <div className="flex items-start gap-4 mb-6 relative z-10">
                         <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center -translate-y-1">
                           <UserCircle size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
                         </div>
                         <div>
                           <h5 className="font-bold text-lg text-white">{mentor.name}</h5>
                           <p className="text-sm text-primary font-medium">{mentor.title}</p>
                         </div>
                       </div>
                       <button className="w-full text-sm font-bold text-black bg-white hover:bg-neutral-200 px-4 py-3 rounded-xl transition-colors relative z-10">
                         Request 1-on-1 Session
                       </button>
                     </div>
                   )) : (
                     <div className="p-12 md:col-span-2 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                       <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                       <h5 className="text-white font-bold mb-2">Network is Empty</h5>
                       <p className="text-sm text-muted-foreground">No alumni have marked themselves as open for mentorship at this time.</p>
                     </div>
                   )}
                 </div>
               )}

               {oppTab === 'Alumni Scholarships' && (
                 <div className="space-y-4">
                   {scholarships.length > 0 ? scholarships.map((scholarship, i) => (
                     <div key={i} className="p-8 border border-white/5 rounded-3xl bg-[#12141a] flex flex-col md:flex-row gap-8 items-center">
                       <div className="w-24 h-24 shrink-0 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                         <GraduationCap size={40} />
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center gap-3 mb-2">
                           <h5 className="font-bold text-2xl text-white">{scholarship.title}</h5>
                           <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">Open</span>
                         </div>
                         <p className="text-sm text-muted-foreground mb-4">{scholarship.description}</p>
                       </div>
                       <button className="w-full md:w-auto bg-primary hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)]">
                         Apply Now
                       </button>
                     </div>
                   )) : (
                     <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                       <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                       <h5 className="text-white font-bold mb-2">No Active Scholarships</h5>
                       <p className="text-sm text-muted-foreground">There are currently no active fund pools available from the Alumni Network.</p>
                     </div>
                   )}
                 </div>
               )}
             </motion.div>
           )}

           {activeTab === 'mentorship' && <MentorshipTab />}
           {activeTab === 'community' && <CommunityTab />}
           {activeTab === 'directory' && <DirectoryTab />}
           {activeTab === 'messages' && <MessagingTab />}
           {activeTab === 'events' && <EventsTab />}
           {activeTab === 'referrals' && <ReferralsTab />}
           {activeTab === 'donations' && <DonationsTab />}
           {activeTab === 'success-stories' && <SuccessStoriesPage />}
           {activeTab === 'notifications' && <NotificationsTab />}

           {activeTab === 'settings' && (
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="border border-white/10 rounded-3xl p-8 bg-[#15171c]">
               <h3 className="text-3xl font-bold text-white mb-2">System Preferences</h3>
               <p className="text-muted-foreground mb-8">Manage your hardware security protocols and global network visibility attributes.</p>
               
               <div className="space-y-4">
                 
                 <div className="flex items-center justify-between p-6 border border-white/5 rounded-2xl bg-[#1c1f26] transition-all hover:bg-white/[0.03]">
                   <div>
                     <h4 className="font-bold text-white text-md">Email Notifications</h4>
                     <p className="text-sm text-muted-foreground mt-1">Receive strictly tailored daily digests of new job pipelines and mentorship matches.</p>
                   </div>
                   <div onClick={() => toggleSetting('emailNotifs')} className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${settingsState.emailNotifs ? 'bg-primary' : 'bg-white/10'}`}>
                     <motion.div layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} className={`w-5 h-5 bg-white rounded-full absolute top-1 ${settingsState.emailNotifs ? 'right-1' : 'left-1'}`} />
                   </div>
                 </div>

                 <div className="flex items-center justify-between p-6 border border-white/5 rounded-2xl bg-[#1c1f26] transition-all hover:bg-white/[0.03]">
                   <div>
                     <h4 className="font-bold text-white text-md">Public Profile Visibility</h4>
                     <p className="text-sm text-muted-foreground mt-1">Permit verified external corporate recruiters to discover your portfolio actively.</p>
                   </div>
                   <div onClick={() => toggleSetting('publicProfile')} className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${settingsState.publicProfile ? 'bg-primary' : 'bg-white/10'}`}>
                     <motion.div layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} className={`w-5 h-5 bg-white rounded-full absolute top-1 ${settingsState.publicProfile ? 'right-1' : 'left-1'}`} />
                   </div>
                 </div>

                 <div className="flex items-center justify-between p-6 border border-white/5 rounded-2xl bg-[#1c1f26] transition-all hover:bg-white/[0.03]">
                   <div>
                     <h4 className="font-bold text-white text-md">Two-Factor Authentication (2FA)</h4>
                     <p className="text-sm text-muted-foreground mt-1">Require an advanced biometric or authenticator security layer during login execution.</p>
                   </div>
                   <div onClick={() => {
                     toggleSetting('twoFactor');
                     if (!settingsState.twoFactor) alert("2FA Setup Initiated");
                   }} className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${settingsState.twoFactor ? 'bg-primary' : 'bg-white/10'}`}>
                     <motion.div layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} className={`w-5 h-5 bg-white rounded-full absolute top-1 ${settingsState.twoFactor ? 'right-1' : 'left-1'}`} />
                   </div>
                 </div>

               </div>
               
               <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Exporting data compiles your complete operational history and connected endpoints as mandated by GDPR infrastructure regulations.
                  </p>
                  <button onClick={() => alert("GDPR Extract Triggered")} className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-8 rounded-xl transition-all border border-white/5 w-full md:w-auto">
                    Export Security Data
                  </button>
               </div>
             </motion.div>
           )}
        </div>
      </main>
    </div>
  );
}
