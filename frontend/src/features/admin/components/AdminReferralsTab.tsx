import { useState, useEffect } from 'react';
import { referralsApi, type Referral } from '../../../api/referrals.api';
import { AlertTriangle, Trash2, CheckCircle, Search, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminReferralsTab() {
  const [reportedReferrals, setReportedReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportedReferrals();
  }, []);

  const fetchReportedReferrals = async () => {
    setLoading(true);
    try {
      const data = await referralsApi.getAdminReportedReferrals();
      setReportedReferrals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this referral?')) return;
    try {
      await referralsApi.deleteReferral(id);
      setReportedReferrals(prev => prev.filter(r => r.id !== id));
      alert('Referral deleted successfully.');
    } catch (e) {
      console.error(e);
      alert('Failed to delete referral.');
    }
  };

  const handleDismiss = (id: number) => {
    // We could add an endpoint to clear reports, but for now we just remove from view
    setReportedReferrals(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#15171c] p-6 rounded-3xl border border-white/5">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Reported Referrals</h3>
          <p className="text-sm text-muted-foreground">Review referrals flagged by the community for moderation.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reported referrals...</div>
      ) : reportedReferrals.length === 0 ? (
        <div className="text-center py-24 bg-[#15171c] rounded-3xl border border-dashed border-white/10">
          <CheckCircle className="mx-auto w-12 h-12 text-emerald-500/50 mb-4" />
          <h4 className="text-lg font-bold text-white mb-1">No pending reports</h4>
          <p className="text-sm text-muted-foreground">The community feed looks clean.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reportedReferrals.map(ref => (
            <motion.div 
              key={ref.id} 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[#15171c] border border-red-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] pointer-events-none" />
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20">
                    <AlertTriangle size={12} />
                    {ref.reports_count || 0} Reports
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    Author Trust Score: {(ref as any).trust_score || 50}
                  </span>
                </div>
                
                <h4 className="text-xl font-bold text-white mb-1">{ref.role_position} at {ref.company_name}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{ref.job_description}</p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                  <span>Posted by: <span className="text-white">{ref.posted_by_name}</span></span>
                  <span>Email: <span className="text-white">{ref.posted_by_email}</span></span>
                  <span>Date: {new Date(ref.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-3 justify-center shrink-0 border-t border-white/5 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                <button 
                  onClick={() => handleDelete(ref.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors shadow-lg"
                >
                  <Trash2 size={16} /> Delete Post
                </button>
                <button 
                  onClick={() => handleDismiss(ref.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
