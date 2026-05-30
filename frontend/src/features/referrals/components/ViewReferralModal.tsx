import { motion } from 'framer-motion';
import { X, Building2, MapPin, Calendar, Clock, IndianRupee, Briefcase, ExternalLink, User } from 'lucide-react';
import { referralsApi, type Referral } from '../../../api/referrals.api';
import { useAuthStore } from '../../../store/authStore';

interface ViewReferralModalProps {
  referral: Referral;
  onClose: () => void;
  updateReferralStatus?: (ref: Referral, status: string) => void;
}

export default function ViewReferralModal({ referral, onClose, updateReferralStatus }: ViewReferralModalProps) {
  const { user } = useAuthStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#15171c] border border-white/10 rounded-3xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-start p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex gap-4 items-start">
            <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10">
              <Building2 className="text-primary" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{referral.role_position}</h2>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <span className="text-primary">{referral.company_name}</span>
                {referral.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {referral.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {referral.work_type && (
              <div className="bg-[#1c1f26] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase">
                  <Briefcase size={14} /> Work Type
                </div>
                <div className="font-bold text-white">{referral.work_type}</div>
              </div>
            )}
            
            {referral.salary && (
              <div className="bg-[#1c1f26] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase">
                  <IndianRupee size={14} /> CTC / Package
                </div>
                <div className="font-bold text-white">{referral.salary}</div>
              </div>
            )}

            {referral.experience_required && (
              <div className="bg-[#1c1f26] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase">
                  <Clock size={14} /> Experience
                </div>
                <div className="font-bold text-white">{referral.experience_required}</div>
              </div>
            )}

            {referral.deadline && (
              <div className="bg-[#1c1f26] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase">
                  <Calendar size={14} /> Deadline
                </div>
                <div className="font-bold text-white">{new Date(referral.deadline).toLocaleDateString()}</div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Job Description
            </h3>
            <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap bg-[#1c1f26] p-6 rounded-2xl border border-white/5">
              {referral.job_description}
            </div>
          </div>

          {referral.skills_required && referral.skills_required.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {referral.skills_required.map((skill, i) => (
                  <span key={i} className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4 pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Posted By</h3>
            <div className="flex items-center gap-4 bg-[#1c1f26] border border-white/5 p-4 rounded-2xl inline-flex pr-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                <User size={20} className="text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-white">{referral.posted_by_name}</div>
                <div className="text-xs text-muted-foreground">Community Member</div>
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-4 shrink-0 bg-[#15171c]">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:text-white transition-colors bg-white/5 hover:bg-white/10">
            Close
          </button>
          {Number(referral.user_id) !== Number(user?.id) && user?.role !== 'admin' && (
            referral.user_application_id ? (
              <select
                value={referral.user_application_status || 'Applied'}
                onChange={(e) => updateReferralStatus && updateReferralStatus(referral, e.target.value)}
                className="bg-primary/20 border border-primary/30 text-primary px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:border-primary transition-all cursor-pointer"
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
                  // Always open the link immediately so the user isn't blocked
                  if (referral.referral_link) {
                    window.open(
                      referral.referral_link.startsWith('http') ? referral.referral_link : `https://${referral.referral_link}`, 
                      '_blank'
                    );
                  }
                  
                  try {
                    // Track the application click in the backend
                    const newApp = await referralsApi.applyToReferral(referral.id, {
                      fullName: user?.name || 'External Applicant',
                      email: user?.email || 'external@example.com',
                      phoneNumber: user?.phone || 'External',
                      resumeUrl: 'Applied via external link',
                      skills: [],
                      course: '',
                      year: '',
                      cgpa: '',
                      portfolioLinks: {}
                    });
                    
                    if (updateReferralStatus) {
                      updateReferralStatus({
                        ...referral, 
                        user_application_id: newApp.id, 
                        user_application_status: 'Applied'
                      }, 'Applied');
                    }
                  } catch (e) {
                    console.error('Tracking failed', e);
                  } finally {
                    onClose(); // close modal after attempting to track
                  }
                }}
                className="bg-primary hover:bg-brand-600 text-white px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              >
                Apply Now <ExternalLink size={16} />
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
