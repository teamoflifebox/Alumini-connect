import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Target, TrendingUp, ChevronRight, Award, Users, Plus, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function DonationsTab() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: 'Scholarship Fund 2026',
      description: 'Support underprivileged students with full-ride scholarships for the upcoming academic year.',
      raised: 45000,
      goal: 50000,
      donors: 124,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'New Innovation Lab Building',
      description: 'Help us build a state-of-the-art AI & Robotics laboratory for computer science students.',
      raised: 120000,
      goal: 500000,
      donors: 45,
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop'
    }
  ]);

  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ title: '', description: '', goal: '', image: '' });

  const handleCreateCampaign = () => {
    if (!newCampaign.title || !newCampaign.description || !newCampaign.goal) return;
    
    setCampaigns(prev => [{
      id: Date.now(),
      title: newCampaign.title,
      description: newCampaign.description,
      raised: 0,
      goal: Number(newCampaign.goal),
      donors: 0,
      image: newCampaign.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?q=80&w=600&auto=format&fit=crop'
    }, ...prev]);
    
    setNewCampaign({ title: '', description: '', goal: '', image: '' });
    setShowCampaignForm(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-600 to-rose-500 p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-[500px] h-full bg-white/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm font-bold mb-4">
            <Heart size={16} className="fill-white" /> Make an Impact
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">Empower the next generation of innovators.</h2>
          <p className="text-pink-100 text-lg mb-8">100% of your donation directly funds student scholarships, campus infrastructure, and specialized academic programs.</p>
          <button className="bg-white text-pink-600 hover:bg-neutral-100 px-8 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center gap-2">
            Donate Now <ChevronRight size={20} />
          </button>
        </div>
        <div className="relative z-10 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full md:w-72">
            <h4 className="text-white font-bold mb-2 text-lg">My Impact</h4>
            <div className="text-4xl font-bold text-white mb-4">$0.00</div>
            <div className="flex items-center gap-2 text-pink-100 text-sm">
              <Award size={16} /> Seed Level Supporter
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Active Campaigns</h3>
          {user?.primary_role === 'admin' && (
            <button onClick={() => setShowCampaignForm(true)} className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              <Plus size={18} /> Create Campaign
            </button>
          )}
        </div>

        <AnimatePresence>
          {showCampaignForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-[#15171c] border border-pink-500/30 rounded-3xl p-8 shadow-2xl mb-8 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Launch New Campaign</h3>
                <button onClick={() => setShowCampaignForm(false)} className="text-muted-foreground hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Campaign Title *" 
                  value={newCampaign.title} 
                  onChange={e => setNewCampaign({...newCampaign, title: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors md:col-span-2"
                />
                <textarea 
                  placeholder="Campaign Description & Impact *" 
                  value={newCampaign.description} 
                  rows={3}
                  onChange={e => setNewCampaign({...newCampaign, description: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors md:col-span-2 resize-none"
                />
                <input 
                  type="number" 
                  placeholder="Funding Goal ($) *" 
                  value={newCampaign.goal} 
                  onChange={e => setNewCampaign({...newCampaign, goal: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                />
                <input 
                  type="url" 
                  placeholder="Cover Image URL (optional)" 
                  value={newCampaign.image} 
                  onChange={e => setNewCampaign({...newCampaign, image: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button onClick={handleCreateCampaign} className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  Launch Campaign
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid md:grid-cols-2 gap-6">
          {campaigns.map(campaign => {
            const progress = (campaign.raised / campaign.goal) * 100;
            return (
              <div key={campaign.id} className="bg-[#15171c] border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-white/10 transition-colors flex flex-col">
                <div className="h-48 overflow-hidden relative">
                  <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15171c] to-transparent" />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h4 className="text-xl font-bold text-white mb-2">{campaign.title}</h4>
                  <p className="text-muted-foreground text-sm mb-6 flex-1">{campaign.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-pink-500">${campaign.raised.toLocaleString()} raised</span>
                      <span className="text-white">Goal: ${campaign.goal.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }} 
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Users size={12} /> {campaign.donors} donors</span>
                      <span>{progress.toFixed(0)}% funded</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors">
                    Support Campaign
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </motion.div>
  );
}
