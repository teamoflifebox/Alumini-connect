import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Link as LinkIcon, BookOpen, GraduationCap, Award } from 'lucide-react';
import { referralsApi, ApplyReferralParams, Referral } from '../../../api/referrals.api';

interface ApplyReferralModalProps {
  referral: Referral;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplyReferralModal({ referral, onClose, onSuccess }: ApplyReferralModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ApplyReferralParams>({
    fullName: '',
    email: '',
    phoneNumber: '',
    resumeUrl: '',
    skills: [],
    course: '',
    year: '',
    cgpa: '',
    portfolioLinks: { linkedin: '', github: '', portfolio: '' }
  });

  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill)
    }));
  };

  const handleLinkChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      portfolioLinks: { ...prev.portfolioLinks, [key]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await referralsApi.applyToReferral(referral.id, formData);
      onSuccess();
      
      // Redirect to external link if provided
      if (referral.referral_link) {
        window.open(referral.referral_link, '_blank');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application.');
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
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Apply for Referral</h2>
            <p className="text-sm text-muted-foreground">{referral.role_position} at {referral.company_name}</p>
          </div>
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

          <form id="apply-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. John Doe" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="tel" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="+91 9876543210" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Resume URL *</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="url" required value={formData.resumeUrl} onChange={e => setFormData({...formData, resumeUrl: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="Google Drive / Dropbox link..." />
                </div>
                <p className="text-[11px] text-muted-foreground">Make sure the link is publicly accessible.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Your Skills</label>
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} className="flex-1 bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. React, Node.js (Press Enter)" />
                <button type="button" onClick={addSkill} className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl font-bold transition-colors">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills?.map(skill => (
                  <span key={skill} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    {skill}
                    <X size={12} className="cursor-pointer hover:text-white" onClick={() => removeSkill(skill)} />
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Course / Major</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. B.Tech CSE" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Grad. Year</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 2026" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">CGPA / Grade</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="text" value={formData.cgpa} onChange={e => setFormData({...formData, cgpa: e.target.value})} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 8.5" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">Portfolio & Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">LinkedIn</label>
                  <input type="url" value={formData.portfolioLinks?.linkedin || ''} onChange={e => handleLinkChange('linkedin', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">GitHub</label>
                  <input type="url" value={formData.portfolioLinks?.github || ''} onChange={e => handleLinkChange('github', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="https://github.com/..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Personal Portfolio</label>
                  <input type="url" value={formData.portfolioLinks?.portfolio || ''} onChange={e => handleLinkChange('portfolio', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors" placeholder="https://..." />
                </div>
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
            form="apply-form" 
            disabled={loading}
            className="bg-primary hover:bg-brand-600 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
