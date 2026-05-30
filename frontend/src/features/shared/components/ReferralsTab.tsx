import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, UserPlus, CheckCircle, Search, Trophy, MapPin, Clock, ExternalLink, Flag, AlertTriangle } from 'lucide-react';
import { referralsApi, type Referral } from '../../../api/referrals.api';
import { useAuthStore } from '../../../store/authStore';
import CreateReferralModal from '../../referrals/components/CreateReferralModal';
import ViewReferralModal from '../../referrals/components/ViewReferralModal';
import ApplicationTrackingList from '../../referrals/components/ApplicationTrackingList';

type TabType = 'Explore' | 'My Posted' | 'Leaderboard';

export default function ReferralsTab() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('Explore');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedApplyReferral, setSelectedApplyReferral] = useState<Referral | null>(null);
  const [selectedTrackingReferral, setSelectedTrackingReferral] = useState<Referral | null>(null);
  const [selectedReportReferral, setSelectedReportReferral] = useState<Referral | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const [exploreReferrals, setExploreReferrals] = useState<Referral[]>([]);
  const [myReferrals, setMyReferrals] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Applicant Status Updater (Syncs with backend)
  const updateReferralStatus = async (ref: Referral, newStatus: string) => {
    if (!ref.user_application_id) return;
    
    try {
      await referralsApi.updateApplicationStatus(ref.user_application_id, newStatus);
      
      // Update local state instantly
      setExploreReferrals(prev => prev.map(r => 
        r.id === ref.id ? { ...r, user_application_status: newStatus } : r
      ));
      
      // Also update selected apply referral if open
      if (selectedApplyReferral?.id === ref.id) {
        setSelectedApplyReferral(prev => prev ? { ...prev, user_application_status: newStatus } : prev);
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Explore') {
        const data = await referralsApi.getAllReferrals();
        // Filter out referrals posted by the current user
        setExploreReferrals(data.filter((ref: Referral) => Number(ref.user_id) !== Number(user?.id)));
      } else if (activeTab === 'My Posted') {
        const data = await referralsApi.getMyPostedReferrals();
        setMyReferrals(data);
      } else if (activeTab === 'Leaderboard') {
        const data = await referralsApi.getLeaderboard();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Failed to fetch referrals data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'Explore') return;
    setLoading(true);
    try {
      const data = await referralsApi.getAllReferrals({ search: searchQuery });
      setExploreReferrals(data.filter((ref: Referral) => Number(ref.user_id) !== Number(user?.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!selectedReportReferral || !reportReason) return;
    setIsReporting(true);
    try {
      const res = await referralsApi.reportReferral(selectedReportReferral.id, reportReason);
      if (res.action === 'auto_deleted') {
        setExploreReferrals(prev => prev.filter(r => r.id !== selectedReportReferral.id));
      }
      setSelectedReportReferral(null);
      setReportReason('');
      alert('Referral has been reported successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to report referral.');
    } finally {
      setIsReporting(false);
    }
  };

  const renderExploreTab = () => (
    <div className="grid grid-cols-1 gap-6">
      <form onSubmit={handleSearch} className="flex gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, companies, skills..." 
            className="w-full bg-[#1c1f26] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-primary transition-colors" 
          />
        </div>
        <button type="submit" className="bg-white/5 hover:bg-white/10 text-white px-6 rounded-2xl font-bold transition-colors">
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading opportunities...</div>
      ) : exploreReferrals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-[#15171c] rounded-3xl border border-white/5">
          No referrals found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exploreReferrals.map(ref => (
            <div key={ref.id} className="bg-[#15171c] border border-white/5 rounded-3xl p-6 hover:border-primary/30 transition-all flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{ref.role_position}</h4>
                  <p className="text-sm font-medium text-muted-foreground">{ref.company_name}</p>
                </div>
                {ref.work_type && (
                  <span className="text-xs font-bold px-3 py-1 bg-white/5 rounded-full text-gray-300">
                    {ref.work_type}
                  </span>
                )}
                <button 
                  onClick={() => setSelectedReportReferral(ref)}
                  className="ml-2 text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Report Fake Referral"
                >
                  <Flag size={16} />
                </button>
              </div>
              
              <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1">
                {ref.job_description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {ref.skills_required?.slice(0, 3).map(skill => (
                  <span key={skill} className="text-[11px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-md">
                    {skill}
                  </span>
                ))}
                {(ref.skills_required?.length || 0) > 3 && (
                  <span className="text-[11px] font-bold px-2 py-1 bg-white/5 text-gray-400 rounded-md">
                    +{(ref.skills_required?.length || 0) - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                    <UserPlus size={14} className="text-primary" />
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-400">Posted by</p>
                    <p className="font-bold text-white">{ref.posted_by_name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedApplyReferral(ref)}
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  >
                    View
                  </button>
                  {ref.user_application_id ? (
                    <select
                      value={ref.user_application_status || 'Applied'}
                      onChange={(e) => updateReferralStatus(ref, e.target.value)}
                      className="bg-primary/20 border border-primary/30 text-primary px-3 py-2 rounded-xl text-sm font-bold focus:outline-none focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Attended Interview">Attended Interview</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Offer Received">Offer Received</option>
                    </select>
                  ) : (
                    <button 
                      onClick={async () => {
                        if (ref.referral_link) {
                          window.open(
                            ref.referral_link.startsWith('http') ? ref.referral_link : `https://${ref.referral_link}`, 
                            '_blank'
                          );
                        } else {
                          // Fallback if no link
                          setSelectedApplyReferral(ref);
                        }

                        try {
                          const newApp = await referralsApi.applyToReferral(ref.id, {
                            fullName: user?.name || 'External Applicant',
                            email: user?.email || 'external@example.com',
                            phoneNumber: user?.phone || 'External',
                            resumeUrl: 'Applied via external link',
                            skills: [], course: '', year: '', cgpa: '', portfolioLinks: {}
                          });
                          
                          // Instantly update the local exploreReferrals state to show the dropdown
                          setExploreReferrals(prev => prev.map(r => 
                            r.id === ref.id ? { ...r, user_application_id: newApp.id, user_application_status: 'Applied' } : r
                          ));
                        } catch (e) { 
                          console.error(e); 
                        }
                      }}
                      className="bg-primary hover:bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMyPostedTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#15171c] p-6 rounded-3xl border border-white/5">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">My Posted Referrals</h3>
          <p className="text-sm text-muted-foreground">Manage your posted opportunities and track applicants.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <Briefcase size={18} />
          Post New Referral
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading your referrals...</div>
      ) : myReferrals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-[#15171c] rounded-3xl border border-white/5">
          You haven't posted any referrals yet.
        </div>
      ) : (
        <div className="bg-[#15171c] border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.02] text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Role & Company</th>
                  <th className="px-6 py-4 text-center">Applicants</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myReferrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{ref.role_position}</p>
                      <p className="text-xs text-muted-foreground">{ref.company_name}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-500/10 text-blue-400 font-bold px-3 py-1 rounded-full text-xs">
                        {ref.application_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(ref.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${ref.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedApplyReferral(ref)}
                          className="text-white hover:text-primary transition-colors font-semibold bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-lg text-xs"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => setSelectedTrackingReferral(ref)}
                          className="text-primary hover:text-white transition-colors font-semibold bg-primary/10 px-4 py-1.5 rounded-lg text-xs"
                        >
                          View Applicants
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderLeaderboard = () => (
    <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-500/20 rounded-2xl">
          <Trophy className="text-amber-400" size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Top Referrers</h3>
          <p className="text-sm text-muted-foreground">Help the community grow and earn points.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading leaderboard...</div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-400 text-black' : index === 1 ? 'bg-gray-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-white'}`}>
                  #{index + 1}
                </div>
                <div className="flex items-center gap-3">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.primary_role}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-xl">{user.total_score}</span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">pts</span>
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No scores recorded yet.</div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Header Tabs */}
      <div className="flex bg-[#15171c] border border-white/5 rounded-2xl p-1 gap-1">
        {(['Explore', 'My Posted', 'Leaderboard'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'Explore' && renderExploreTab()}
        {activeTab === 'My Posted' && renderMyPostedTab()}
        {activeTab === 'Leaderboard' && renderLeaderboard()}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateReferralModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              if (activeTab === 'My Posted') fetchData();
              else setActiveTab('My Posted');
            }}
          />
        )}
        
        {selectedApplyReferral && (
          <ViewReferralModal 
            referral={selectedApplyReferral}
            onClose={() => setSelectedApplyReferral(null)}
            updateReferralStatus={updateReferralStatus}
          />
        )}

        {selectedTrackingReferral && (
          <ApplicationTrackingList 
            referralId={selectedTrackingReferral.id}
            referralTitle={`${selectedTrackingReferral.role_position} at ${selectedTrackingReferral.company_name}`}
            onClose={() => setSelectedTrackingReferral(null)}
          />
        )}

        {selectedReportReferral && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#15171c] border border-red-500/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Report Referral</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to report this referral for <strong>{selectedReportReferral.role_position}</strong> at <strong>{selectedReportReferral.company_name}</strong>? Please provide a reason.
              </p>
              
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this? (e.g. Fake post, Scam, Inappropriate)"
                className="w-full bg-[#1c1f26] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none h-32 mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedReportReferral(null); setReportReason(''); }}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={isReporting || !reportReason.trim()}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isReporting ? 'Reporting...' : 'Submit Report'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
