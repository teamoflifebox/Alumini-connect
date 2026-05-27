import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, Clock, XCircle, ChevronDown, User, ExternalLink } from 'lucide-react';
import { referralsApi, type ReferralApplication } from '../../../api/referrals.api';

interface ApplicationTrackingListProps {
  referralId: number;
  referralTitle: string;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  'Applied',
  'Referral Sent',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'HR Round',
  'Selected',
  'Rejected'
];

export default function ApplicationTrackingList({ referralId, referralTitle, onClose }: ApplicationTrackingListProps) {
  const [applications, setApplications] = useState<ReferralApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [referralId]);

  const fetchApplications = async () => {
    try {
      const data = await referralsApi.getApplications(referralId);
      setApplications(data);
    } catch (err: any) {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: number, newStatus: string) => {
    try {
      await referralsApi.updateApplicationStatus(appId, newStatus);
      setApplications(prev => 
        prev.map(app => app.id === appId ? { ...app, current_status: newStatus } : app)
      );
    } catch (err: any) {
      alert('Failed to update status.');
    }
  };

  const getStatusColor = (status: string) => {
    if (['Selected', 'Shortlisted', 'Referral Sent'].includes(status)) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (status === 'Rejected') return 'text-red-400 bg-red-400/10 border-red-400/20';
    return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#15171c] border border-white/10 rounded-3xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Applicant Tracking</h2>
            <p className="text-sm text-muted-foreground">{referralTitle}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading applications...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <UsersIcon className="text-muted-foreground/30 mb-4" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
              <p className="text-sm text-muted-foreground">When someone applies, they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.02] text-muted-foreground text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Applied On</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {app.avatar_url ? (
                          <img src={app.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {app.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{app.full_name}</p>
                          {app.course && <p className="text-[10px] text-muted-foreground">{app.course} • {app.year}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-300">
                        <p>{app.email}</p>
                        {app.phone_number && <p className="text-muted-foreground">{app.phone_number}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                      <td className="px-6 py-4">
                        <div className="relative group">
                          <select 
                            value={app.current_status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className={`appearance-none px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer pr-8 ${getStatusColor(app.current_status)}`}
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt} value={opt} className="bg-[#1c1f26] text-white">{opt}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
