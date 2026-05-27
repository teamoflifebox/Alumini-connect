import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Building2, Briefcase, Link as LinkIcon, MapPin, Calendar, Users, IndianRupee } from 'lucide-react';
import { referralsApi, type CreateReferralParams } from '../../../api/referrals.api';

interface CreateReferralModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateReferralModal({ onClose, onSuccess }: CreateReferralModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CreateReferralParams>({
    companyName: '',
    rolePosition: '',
    jobDescription: '',
    referralLink: '',
    skillsRequired: [],
    deadline: '',
    location: '',
    workType: 'Hybrid',
    salary: '',
    experienceRequired: '',
    openings: undefined,
  });

  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !formData.skillsRequired?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...(prev.skillsRequired || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired?.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await referralsApi.createReferral(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post referral.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#15171c] border border-white/10 rounded-3xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-primary" />
            Post a Referral
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <form id="referral-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Google" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Role / Position *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" required value={formData.rolePosition} onChange={e => setFormData({...formData, rolePosition: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Frontend Engineer" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">External Job Portal / Referral Link</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input type="url" value={formData.referralLink} onChange={e => setFormData({...formData, referralLink: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="https://careers.google.com/..." />
              </div>
              <p className="text-[11px] text-muted-foreground">Applicants will be redirected here after applying internally.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Job Description *</label>
              <textarea required value={formData.jobDescription} onChange={e => setFormData({...formData, jobDescription: e.target.value})} rows={4} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none" placeholder="Describe the role and responsibilities..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Bangalore, India" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Work Type</label>
                <select value={formData.workType} onChange={e => setFormData({...formData, workType: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors">
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Skills Required</label>
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} className="flex-1 bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. React, Node.js (Press Enter)" />
                <button type="button" onClick={addSkill} className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl font-bold transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skillsRequired?.map(skill => (
                  <span key={skill} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    {skill}
                    <X size={12} className="cursor-pointer hover:text-white" onClick={() => removeSkill(skill)} />
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Openings</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="number" min="1" value={formData.openings || ''} onChange={e => setFormData({...formData, openings: parseInt(e.target.value) || undefined})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Salary / CTC (Optional)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 15-20 LPA" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Experience Required</label>
                <input type="text" value={formData.experienceRequired} onChange={e => setFormData({...formData, experienceRequired: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 2-4 years" />
              </div>
            </div>
            
          </form>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-4 shrink-0 bg-[#15171c]">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            form="referral-form" 
            disabled={loading}
            className="bg-primary hover:bg-brand-600 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            {loading ? 'Posting...' : 'Post Referral'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
