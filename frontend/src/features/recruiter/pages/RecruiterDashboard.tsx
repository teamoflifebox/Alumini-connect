import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, LayoutDashboard, Settings, UserCircle, Briefcase,
  Users, TrendingUp, Building, MapPin, RefreshCw, Plus,
  ChevronRight, X, FileText
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Mock data
  const stats = { activeJobs: 2, totalApplications: 45, interviewsScheduled: 12 };

  const fetchData = async () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: Users },
    { id: 'company', label: 'Company Profile', icon: Building },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/10 bg-[#0f1117] p-5">
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/30 bg-purple-500/10 cursor-pointer flex items-center justify-center text-lg font-bold text-purple-400"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : (user?.name?.[0]?.toUpperCase() || 'R')}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
          <div>
            <p className="font-bold text-sm text-white truncate max-w-[140px]">{user?.name}</p>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Recruiter</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
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
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-white font-medium">Active</span>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-5xl mx-auto">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Welcome Banner */}
              <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-semibold mb-1">👋 Welcome to Recruiter Hub</p>
                    <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
                    <p className="text-muted-foreground">Find top talent from the alumni and student network.</p>
                  </div>
                  <button onClick={() => setActiveTab('jobs')} className="flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-all">
                    <Plus size={14} /> Post New Job
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-purple-400', bg: 'from-purple-500/10' },
                  { label: 'Total Applications', value: stats.totalApplications, icon: FileText, color: 'text-blue-400', bg: 'from-blue-500/10' },
                  { label: 'Interviews Scheduled', value: stats.interviewsScheduled, icon: Users, color: 'text-emerald-400', bg: 'from-emerald-500/10' },
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
            </motion.div>
          )}

          {activeTab !== 'overview' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
              <LayoutDashboard size={40} className="mx-auto text-muted-foreground mb-4 opacity-40" />
              <h3 className="font-bold text-white text-lg mb-2">Module Coming Soon</h3>
              <p className="text-muted-foreground text-sm">This section is currently being integrated with the backend.</p>
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
