import { useState, useEffect, useRef } from 'react';
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
<<<<<<< HEAD
import SettingsPage from '../../../pages/SettingsPage';
=======
import DirectoryTab from '../../shared/components/DirectoryTab';
import MessagingTab from '../../shared/components/MessagingTab';
import { MessageSquare, Users as UsersIcon } from 'lucide-react';
import { useCommunityStore } from '../../community/store';
import { useQueryClient } from '@tanstack/react-query';
>>>>>>> 0343ee3084de6b4f32b2fa1838b41e120a5e8f97

export default function StudentDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, setAuth } = useAuth();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [oppTab, setOppTab] = useState('Jobs & Internships');
  const [jobs, setJobs] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [settingsState, setSettingsState] = useState({
    emailNotifs: true,
    publicProfile: false,
    twoFactor: false
  });
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const toggleSetting = (key: keyof typeof settingsState) => {
    setSettingsState(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const [profileData, setProfileData] = useState({ 
    firstName: user?.name?.split(' ')[0] || '', 
    lastName: user?.name?.split(' ')[1] || '', 
    bio: '' 
  });
  const [saveStatus, setSaveStatus] = useState('Save Profile');

  const handleProfileSave = () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      // Mock save
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus('Save Profile'), 2000);
    }, 800);
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
      <main className="flex-1 overflow-y-auto relative bg-[#09090b]">
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
            <span className="hidden md:flex px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase">{user?.role || 'Student'} VIEW</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-brand-400 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(255,98,10,0.4)] cursor-pointer uppercase overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <>{profileData.firstName?.[0] || 'U'}</>}
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">
           
           {activeTab === 'dashboard' && (
             <>
               {/* Welcome Section */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                 className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#15171c] to-[#0c0c0e] p-8 shadow-2xl"
               >
                  <div className="absolute right-0 top-0 w-[500px] h-full bg-primary/10 blur-[100px] pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-3xl font-bold mb-2 text-white capitalize">Good afternoon, {profileData.firstName || 'Student'} 👋</h3>
                      <p className="text-muted-foreground text-lg">
                        {profileData.lastName ? "You have 2 new mentorship matches and 5 recommended jobs based on your skills." : "Your dashboard is standing by. Optimize your profile to trigger matches."}
                      </p>
                    </div>
                    {profileData.lastName ? (
                      <button onClick={() => setActiveTab('opportunities')} className="bg-primary hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)] whitespace-nowrap">
                        View Matches
                      </button>
                    ) : (
                      <button onClick={() => setActiveTab('profile')} className="bg-primary hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)] whitespace-nowrap">
                        Complete Profile
                      </button>
                    )}
                  </div>
               </motion.div>
               
               {/* High Level Metrics */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { title: 'Profile Views', value: '—', trend: 'Awaiting Data', color: 'from-blue-500/20 to-transparent', text: 'text-muted-foreground' },
                    { title: 'Mentorship Matches', value: '0', trend: 'Awaiting Data', color: 'from-primary/20 to-transparent', text: 'text-muted-foreground' },
                    { title: 'Job Recommendations', value: '0', trend: 'Awaiting Data', color: 'from-emerald-500/20 to-transparent', text: 'text-muted-foreground' },
                    { title: 'Network Connections', value: '0', trend: 'Awaiting Data', color: 'from-purple-500/20 to-transparent', text: 'text-muted-foreground' }
                  ].map((metric, i) => (
                    <motion.div 
                      key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="rounded-2xl border border-white/5 bg-[#15171c] p-6 relative overflow-hidden group hover:border-white/10 transition-all opacity-80"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${metric.color} blur-[50px] opacity-20 pointer-events-none`} />
                      <div className="relative z-10">
                        <p className="text-muted-foreground text-sm font-medium mb-2">{metric.title}</p>
                        <div className="flex items-end justify-between">
                          <h4 className="text-3xl font-bold text-white/50">{metric.value}</h4>
                          <span className={`text-xs font-semibold ${metric.text} bg-white/5 px-2 py-1 rounded`}>{metric.trend}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
               </div>

               {/* Core Modules Split */}
               <div className="grid lg:grid-cols-3 gap-8">
                 
                 {/* Left Column: Activity & Jobs */}
                 <div className="lg:col-span-2 space-y-8">
                    {/* Recommended Jobs */}
                    <div className="rounded-3xl border border-white/5 bg-[#12141a] p-8 shadow-xl min-h-[300px] flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Recommended Opportunities</h3>
                      </div>
                      
                      {/* Empty State */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                          <Briefcase size={24} className="text-muted-foreground" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">No recommendations yet</h4>
                        <p className="text-sm text-muted-foreground max-w-sm mb-6">
                          Complete your profile and define your interests more thoroughly so our engine can match you with the best roles.
                        </p>
                        <button onClick={() => setActiveTab('profile')} className="px-6 py-2.5 border border-white/10 hover:bg-white/5 hover:text-white rounded-xl text-sm font-medium text-muted-foreground transition-all">
                          Update Profile Preferences
                        </button>
                      </div>
                    </div>
                 </div>

                 {/* Right Column: Mentorship & Agenda */}
                 <div className="space-y-8">
                    {/* Upcoming Mentorship */}
                    <div className="rounded-3xl border border-white/5 bg-[#12141a] p-8 shadow-xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Upcoming Session</h3>
                      </div>
                      
                      {/* Empty State */}
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                          <UserCircle size={20} />
                        </div>
                        <p className="text-sm font-medium text-white mb-1">Schedule Clear</p>
                        <p className="text-xs text-muted-foreground mb-4">You have no upcoming 1-on-1 mentorship sessions booked.</p>
                        <button onClick={() => setActiveTab('opportunities')} className="w-full py-2 bg-primary/10 text-primary font-bold hover:bg-primary/20 rounded-xl transition-colors text-sm">
                          Find a Mentor
                        </button>
                      </div>
                    </div>

                    {/* Scholarships Shortcut */}
                    <div onClick={() => setActiveTab('opportunities')} className="rounded-3xl border border-white/5 bg-[#12141a] p-8 shadow-xl hover:border-white/10 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4 transition-transform opacity-70">
                        <GraduationCap size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Active Scholarships</h3>
                      <p className="text-sm text-muted-foreground">0 available based on your current demographic parameters.</p>
                    </div>
                 </div>

               </div>
             </>
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
           {activeTab === 'notifications' && <NotificationsTab />}

           {activeTab === 'settings' && (
             <SettingsPage />
           )}
        </div>
      </main>
    </div>
  );
}
