import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donationsApi } from '../../../api/donations';
import type { DonationCampaign } from '../../../api/donations';
import { useAuth } from '../../../hooks/useAuth';
import { Heart, ShieldCheck, Users, Info, X, Quote, ArrowRight, Loader, Star, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function DonorWall() {
  const { data: donors = [], isLoading } = useQuery({
    queryKey: ['donors', 'top'],
    queryFn: donationsApi.getTopDonors,
  });

  if (isLoading) return <div className="text-center py-8 text-primary">Loading donors...</div>;
  if (donors.length === 0) return <div className="text-center py-8 text-muted-foreground">Be the first to donate and appear on the wall of gratitude!</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {donors.map((donor: any, i: number) => (
        <div key={i} className="bg-[#12141a] border border-white/5 rounded-2xl p-6 text-center hover:bg-white/[0.02] transition-colors shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-orange-400 to-primary flex items-center justify-center text-xl font-bold text-white mb-4 shadow-[0_0_15px_rgba(255,165,0,0.4)]">
            {donor.name?.[0] || 'A'}
          </div>
          <h4 className="font-bold text-white mb-1 line-clamp-1">{donor.name || 'Anonymous'}</h4>
          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-3">{donor.batch || 'Well Wisher'}</p>
          <div className="inline-block bg-white/5 px-3 py-1 rounded-full text-xs text-muted-foreground font-medium border border-white/10">
            ₹{Number(donor.total_amount).toLocaleString('en-IN')}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DonationsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [amountInput, setAmountInput] = useState<{ [key: string]: string }>({});
  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampaign | null>(null);

  const [newCampaign, setNewCampaign] = useState({
    title: '', description: '', purpose: '', beneficiary_details: '', target_amount: '',
    legal_declaration: false
  });

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: publicCampaigns = [], isLoading: loadingPublic } = useQuery({
    queryKey: ['campaigns', 'public'],
    queryFn: donationsApi.getPublic,
    enabled: !isAdminMode
  });

  const { data: adminCampaigns = [], isLoading: loadingAdmin } = useQuery({
    queryKey: ['campaigns', 'admin'],
    queryFn: donationsApi.getAdminAll,
    enabled: isAdminMode && isAdmin
  });

  const createMutation = useMutation({
    mutationFn: donationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setNewCampaign({ title: '', description: '', purpose: '', beneficiary_details: '', target_amount: '', legal_declaration: false });
      alert('Campaign created successfully! Please review and publish it.');
    },
    onError: (e: any) => alert(e.response?.data?.message || 'Error creating campaign')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => donationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (selectedCampaign) {
        setSelectedCampaign({ ...selectedCampaign, campaign_status: status });
      }
    },
  });

  const handleCreate = () => {
    if (!newCampaign.legal_declaration) return alert('You must accept the legal declaration!');
    createMutation.mutate(newCampaign);
  };

  const handleDonate = async (campaign: DonationCampaign) => {
    const amount = Number(amountInput[campaign.id]);
    if (!amount || amount < 10) return alert('Please enter a valid amount (minimum ₹10)');

    try {
      const orderData = await donationsApi.createOrder(campaign.id, amount);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Alumni Connect Foundation",
        description: `Donation for ${campaign.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            await donationsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            alert('Thank you for your generous support!');
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
          } catch (e) {
            alert('Payment verification pending. Our system will update it shortly.');
          }
        },
        prefill: {
          name: user?.name || user?.full_name || '',
          email: user?.email || ''
        },
        theme: { color: "#F97316" } // Orange theme for Razorpay
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const campaigns = isAdminMode ? adminCampaigns : publicCampaigns;
  const isLoading = isAdminMode ? loadingAdmin : loadingPublic;

  // Calculate some global stats for the UI
  const totalRaised = publicCampaigns.reduce((sum, c) => sum + Number(c.collected_amount || 0), 0);
  const totalDonors = publicCampaigns.reduce((sum, c) => sum + Number(c.supporter_count || 0), 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. EMOTIONAL HERO BANNER */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#15171c] shadow-2xl border border-white/5">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <img 
            src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Community Togetherness" 
            className="w-full h-full object-cover filter brightness-50"
          />
        </div>
        
        <div className="absolute top-0 right-0 w-[600px] h-full bg-gradient-to-l from-orange-500/20 to-transparent blur-[120px] pointer-events-none z-10" />
        
        <div className="relative z-20 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-primary font-semibold text-sm mb-6 uppercase tracking-wider shadow-[0_0_15px_rgba(255,165,0,0.2)]">
              <Heart size={16} className="fill-primary" /> The Joy of Giving
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6 drop-shadow-md">
              "We make a living by what we get, but we make a life by what we give."
            </h1>
            <p className="text-xl text-white/80 font-light mb-8 max-w-xl">
              Every contribution directly empowers students, fuels innovation, and leaves a lasting legacy at your Alma Mater.
            </p>
            <div className="flex items-center gap-6">
               <div className="text-left">
                  <p className="text-sm text-primary font-bold uppercase tracking-wider mb-1">Total Impact</p>
                  <p className="text-3xl font-extrabold text-white">₹{(totalRaised > 0 ? totalRaised : 4500000).toLocaleString('en-IN')}+</p>
               </div>
               <div className="w-px h-12 bg-white/20"></div>
               <div className="text-left">
                  <p className="text-sm text-primary font-bold uppercase tracking-wider mb-1">Lives Touched</p>
                  <p className="text-3xl font-extrabold text-white">{(totalDonors > 0 ? totalDonors : 1200).toLocaleString('en-IN')}+</p>
               </div>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shrink-0 shadow-2xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><ShieldCheck className="text-primary"/> Admin Controls</h3>
              <label className="flex items-center justify-between gap-6 text-sm text-white font-medium cursor-pointer bg-white/5 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
                Enable Admin Mode
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAdminMode ? 'bg-primary' : 'bg-white/20'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdminMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Admin Create Campaign Section */}
      {isAdminMode && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1c1f26] border border-primary/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(255,165,0,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-primary/20 text-primary text-xs font-bold rounded-bl-xl border-b border-l border-primary/20">ADMIN WORKSPACE</div>
          <h3 className="text-2xl font-bold text-white mb-6">Launch a New Giving Opportunity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Campaign Title (e.g. CSR Support for Classrooms)" value={newCampaign.title} onChange={e => setNewCampaign({...newCampaign, title: e.target.value})} className="bg-[#15171c] border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-colors shadow-inner" />
            <input type="number" placeholder="Target Amount (₹)" value={newCampaign.target_amount} onChange={e => setNewCampaign({...newCampaign, target_amount: e.target.value})} className="bg-[#15171c] border border-white/10 rounded-xl px-5 py-4 text-white focus:border-primary focus:outline-none transition-colors shadow-inner" />
            <textarea placeholder="The Story: Why does this matter?" value={newCampaign.description} onChange={e => setNewCampaign({...newCampaign, description: e.target.value})} className="bg-[#15171c] border border-white/10 rounded-xl px-5 py-4 text-white h-32 focus:border-primary focus:outline-none transition-colors shadow-inner" />
            <textarea placeholder="Who benefits from this fund?" value={newCampaign.purpose} onChange={e => setNewCampaign({...newCampaign, purpose: e.target.value, beneficiary_details: e.target.value})} className="bg-[#15171c] border border-white/10 rounded-xl px-5 py-4 text-white h-32 focus:border-primary focus:outline-none transition-colors shadow-inner" />
          </div>
          <label className="flex items-start gap-4 mt-6 text-sm text-orange-400 p-5 bg-orange-500/10 rounded-xl border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors">
            <input type="checkbox" checked={newCampaign.legal_declaration} onChange={e => setNewCampaign({...newCampaign, legal_declaration: e.target.checked})} className="mt-1 accent-primary w-5 h-5 cursor-pointer" />
            <span className="leading-relaxed"><strong>Mandatory Declaration:</strong> I confirm this initiative is officially vetted by the institute. All funds raised will be allocated exclusively for the stated purpose under strict financial compliance.</span>
          </label>
          <button onClick={handleCreate} disabled={createMutation.isPending || !newCampaign.legal_declaration} className="mt-6 bg-primary text-white font-bold px-10 py-4 rounded-xl disabled:opacity-50 hover:bg-orange-500 transition-colors shadow-[0_0_20px_rgba(255,165,0,0.4)]">
            Create Campaign 
          </button>
        </motion.div>
      )}

      {/* 2. FEATURED OPPORTUNITIES HEADER */}
      <div className="flex flex-col items-center justify-center text-center mt-16 mb-8">
         <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Featured Giving Opportunities</h2>
         <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full opacity-70"></div>
      </div>

      {/* 3. CAMPAIGNS GRID WITH IMAGES */}
      {isLoading ? (
        <div className="text-center py-20"><Loader className="animate-spin text-primary mx-auto mb-4" size={40} /> <span className="text-muted-foreground text-lg">Loading opportunities...</span></div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-[#15171c] rounded-2xl border border-white/5 text-lg shadow-xl">No active campaigns right now. Your generosity is appreciated!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {campaigns.map((c: any, index: number) => {
            const target = Number(c.target_amount);
            const collected = Number(c.collected_amount);
            const progress = Math.min(100, Math.round((collected / target) * 100));
            const isActive = c.campaign_status === 'Active';
            // Use picsum for consistent, professional placeholders if no image provided
            const imageId = 1010 + index * 5; 

            return (
              <motion.div 
                key={c.id} 
                className="bg-[#12141a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex flex-col group hover:border-white/20 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(255,165,0,0.15)]"
              >
                {/* Image Header */}
                <div className="h-48 relative overflow-hidden bg-black">
                   <img 
                      src={`https://picsum.photos/id/${imageId}/600/400`} 
                      alt="Campaign" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-transparent" />
                   {isActive && <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1"><ShieldCheck size={14}/> Verified</div>}
                   {!isActive && <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">{c.campaign_status}</div>}
                </div>

                {/* Progress Bar overlapping the image */}
                <div className="h-1.5 bg-white/5 w-full relative z-10 -mt-1.5">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-primary shadow-[0_0_15px_rgba(255,165,0,0.8)]" style={{ width: `${progress}%` }}></div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col relative">
                  <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-primary transition-colors">{c.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-8 flex-1 leading-relaxed">{c.description}</p>
                  
                  {/* Financials */}
                  <div className="space-y-1 mb-8">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-black text-white tracking-tight">₹{(collected/100000).toFixed(2)}L</span>
                      <span className="text-sm text-muted-foreground font-medium">of ₹{(target/100000).toFixed(2)}L goal</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-primary tracking-wider uppercase">
                      <span className="flex items-center gap-1.5"><Users size={14} /> {c.supporter_count} Donors</span>
                      <span>{progress}% Reached</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <button 
                      onClick={() => setSelectedCampaign(c)}
                      className="w-full py-3 rounded-xl bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors border border-white/5"
                    >
                      Read the Story
                    </button>
                  </div>

                  {isAdminMode ? (
                    <div className="flex gap-2 pt-4 border-t border-white/5">
                      {c.campaign_status === 'Draft' && (
                        <button onClick={() => updateStatusMutation.mutate({ id: c.id, status: 'Active' })} className="flex-1 bg-green-500/20 text-green-400 font-bold py-2.5 rounded-lg text-xs transition">Publish</button>
                      )}
                      {c.campaign_status === 'Active' && (
                        <button onClick={() => updateStatusMutation.mutate({ id: c.id, status: 'Completed' })} className="flex-1 bg-white/5 text-white font-bold py-2.5 rounded-lg text-xs transition border border-white/10">Mark Done</button>
                      )}
                      <button onClick={() => updateStatusMutation.mutate({ id: c.id, status: 'Suspended' })} className="flex-1 bg-red-500/10 text-red-400 font-bold py-2.5 rounded-lg text-xs transition">Suspend</button>
                    </div>
                  ) : isActive ? (
                    <div className="pt-4 border-t border-white/5 flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">₹</span>
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          value={amountInput[c.id] || ''} 
                          onChange={e => setAmountInput({...amountInput, [c.id]: e.target.value})}
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-3 py-3 text-white text-sm font-bold focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <button 
                        onClick={() => handleDonate(c)}
                        className="bg-primary hover:bg-orange-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_25px_rgba(255,165,0,0.6)] hover:-translate-y-0.5 whitespace-nowrap"
                      >
                        Donate
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-white/5 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      {c.campaign_status}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 4. DONOR WALL */}
      <div className="mt-20 border-t border-white/10 pt-16">
        <div className="flex flex-col items-center justify-center text-center mb-12">
           <Star className="text-yellow-500 mb-4 fill-yellow-500/20" size={32} />
           <h2 className="text-3xl font-bold text-white mb-3">Wall of Gratitude</h2>
           <p className="text-muted-foreground max-w-xl">We recognize and deeply appreciate the alumni whose generosity continues to shape the future of our institute.</p>
        </div>
        
        <DonorWall />
      </div>

      {/* Full Details Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedCampaign(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#12141a] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
            >
              <button onClick={() => setSelectedCampaign(null)} className="absolute top-6 right-6 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors border border-white/10 backdrop-blur">
                <X size={20} />
              </button>

              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {/* Modal Hero Image */}
                <div className="h-64 md:h-80 w-full relative">
                  <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80" alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-[#12141a]/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Project Fund</span>
                      {selectedCampaign.campaign_status === 'Active' && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><ShieldCheck size={12}/> Verified</span>}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{selectedCampaign.title}</h2>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-white/5 relative shrink-0">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-primary shadow-[0_0_15px_rgba(255,165,0,0.5)]" style={{ width: `${Math.min(100, Math.round((Number(selectedCampaign.collected_amount) / Number(selectedCampaign.target_amount)) * 100))}%` }} />
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="md:col-span-2 space-y-8">
                    <section>
                      <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><Quote className="text-primary"/> The Story</h4>
                      <div className="text-muted-foreground leading-relaxed space-y-4 text-lg">
                        {selectedCampaign.description.split('\n').map((para: string, i: number) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </section>
                    
                    <section className="bg-white/5 p-6 rounded-2xl border border-white/5">
                      <h4 className="text-lg font-bold text-white mb-3">Beneficiary Impact</h4>
                      <p className="text-muted-foreground leading-relaxed">{selectedCampaign.purpose || selectedCampaign.beneficiary_details}</p>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#1c1f26] p-8 rounded-3xl border border-primary/20 shadow-[0_0_30px_rgba(255,165,0,0.1)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px]" />
                      
                      <div className="relative z-10">
                        <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Funds Raised</p>
                        <p className="text-4xl font-black text-white mb-2">₹{Number(selectedCampaign.collected_amount).toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground mb-8 font-medium">out of ₹{Number(selectedCampaign.target_amount).toLocaleString('en-IN')} goal</p>

                        <div className="flex items-center gap-4 py-4 border-t border-b border-white/10 mb-8">
                          <div className="w-12 h-12 rounded-full bg-orange-500/10 text-primary flex items-center justify-center shrink-0">
                            <Users size={20} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-white">{selectedCampaign.supporter_count}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Generous Donors</p>
                          </div>
                        </div>

                        {!isAdminMode && selectedCampaign.campaign_status === 'Active' && (
                          <div className="space-y-4">
                            <input 
                              type="number" 
                              placeholder="Enter amount (₹)" 
                              value={amountInput[selectedCampaign.id] || ''} 
                              onChange={e => setAmountInput({...amountInput, [selectedCampaign.id]: e.target.value})}
                              className="w-full bg-[#12141a] border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-lg focus:outline-none focus:border-primary transition-colors text-center"
                            />
                            <button 
                              onClick={() => handleDonate(selectedCampaign)}
                              className="w-full bg-primary hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,165,0,0.4)] hover:shadow-[0_0_30px_rgba(255,165,0,0.6)] text-lg uppercase tracking-wider"
                            >
                              Support Cause
                            </button>
                            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                              <ShieldCheck size={12} /> Secure payments powered by Razorpay
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
