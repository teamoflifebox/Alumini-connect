import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, GraduationCap, Filter, UserPlus, Check, X, MessageSquare, ArrowLeft, Users } from 'lucide-react';
import { searchProfiles, sendConnectionRequest, getConnections, respondConnectionRequest, getOrCreateConversation } from '../../community/api';
import type { Profile } from '../../community/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';

export default function DirectoryTab() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', skills: '' });
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'discover' | 'requests'>('discover');

  React.useEffect(() => {
    const handleOpenProfile = (e: any) => {
      if (e.detail?.id) setSelectedProfileId(e.detail.id);
    };
    
    // Check if there was a pending profile to view from another tab
    const pending = localStorage.getItem('pendingProfileView');
    if (pending) {
      setSelectedProfileId(Number(pending));
      localStorage.removeItem('pendingProfileView');
    }

    window.addEventListener('open-profile', handleOpenProfile);
    return () => window.removeEventListener('open-profile', handleOpenProfile);
  }, []);

  const { data: searchData, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['profiles', searchTerm, filters],
    queryFn: () => searchProfiles({ name: searchTerm, ...filters })
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: getConnections,
    refetchInterval: 60000 // Increase to 1 minute to prevent 429 Too Many Requests
  });

  const handleConnect = async (id: number) => {
    try {
      await sendConnectionRequest(id);
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert('A connection request already exists between you and this user.');
      } else {
        alert('Failed to send request');
      }
    }
  };

  const handleMessageClick = async (targetUserId: number) => {
    try {
      const conv = await getOrCreateConversation(targetUserId);
      
      // Inject into cache so it's instantly available in the MessagingTab
      queryClient.setQueryData(['conversations'], (oldData: any) => {
        if (!oldData) return [conv];
        const exists = oldData.some((c: any) => c.id === conv.id);
        return exists ? oldData : [conv, ...oldData];
      });

      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'messages' }));
      // Give the tab a moment to render before firing open-conversation
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-conversation', { detail: { conversationId: conv.id } }));
      }, 50);
    } catch (err) {
      console.error(err);
      alert('Failed to start conversation');
    }
  };

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: 'accepted' | 'rejected' }) => respondConnectionRequest(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    }
  });

  const getConnectionStatus = (targetUserId: number | string) => {
    const conn = connections?.find(
      (c: any) => 
        (c.requester_id == user?.id && c.recipient_id == targetUserId) ||
        (c.recipient_id == user?.id && c.requester_id == targetUserId)
    );
    return conn ? conn.status : null;
  };

  // Calculate pending incoming requests
  const pendingRequests = connections?.filter(
    (c: any) => c.status === 'pending' && c.recipient_id == user?.id
  ) || [];

  // Dedicated Profile View
  if (selectedProfileId) {
    const profile = searchData?.data?.find((p: Profile) => p.user_id === selectedProfileId);
    
    if (!profile) return null;

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-5xl mx-auto pb-12">
        <button 
          onClick={() => setSelectedProfileId(null)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Back to Directory
        </button>

        <div className="bg-[#15171c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="h-48 bg-gradient-to-r from-primary to-blue-600 relative">
            <div className="absolute -bottom-16 left-8">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-32 h-32 rounded-2xl object-cover border-4 border-[#15171c]" />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-primary/10 border-4 border-[#15171c] flex items-center justify-center bg-[#1c1f26]">
                  <span className="text-4xl font-bold text-primary">{profile.name?.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">{profile.name} <span className="text-xs bg-white/10 px-2 py-1 rounded text-muted-foreground uppercase">{profile.role}</span></h2>
                <p className="text-xl text-primary font-medium mt-1">{profile.headline || 'No headline provided'}</p>
                <p className="text-sm text-muted-foreground mt-2">{profile.address?.city} {profile.address?.state}</p>
              </div>
              <div className="flex gap-2">
                {(() => {
                  const status = getConnectionStatus(profile.user_id);
                  if (status === 'accepted') {
                    return (
                      <button onClick={() => handleMessageClick(profile.user_id)} className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center gap-2 border border-white/10">
                        <MessageSquare size={18} /> Message
                      </button>
                    );
                  }
                  if (status === 'pending') {
                    return (
                      <button disabled className="px-8 py-3 bg-white/5 text-muted-foreground font-bold rounded-xl flex items-center gap-2 border border-white/5 cursor-not-allowed">
                        <Check size={18} /> Pending
                      </button>
                    );
                  }
                  return (
                    <button onClick={() => handleConnect(profile.user_id)} className="px-8 py-3 bg-primary hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)] flex items-center gap-2">
                      <UserPlus size={18} /> Connect
                    </button>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-8 mt-10">
              <section>
                <h3 className="text-xl font-bold text-white mb-3">About</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{profile.bio || 'This user has not provided a bio yet.'}</p>
              </section>

              {profile.skills && profile.skills.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-white mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-white/80">{skill}</span>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Briefcase size={20} className="text-primary"/> Experience</h3>
                  <div className="space-y-4">
                    {profile.work_experience && profile.work_experience.length > 0 ? profile.work_experience.map((exp: any, i: number) => (
                      <div key={i} className="bg-[#1c1f26] p-5 rounded-2xl border border-white/5">
                        <h4 className="font-bold text-white text-lg">{exp.title}</h4>
                        <p className="text-sm text-primary font-medium">{exp.company}</p>
                        <p className="text-xs text-muted-foreground mt-1">{exp.startDate} - {exp.endDate || 'Present'}</p>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No experience listed.</p>}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><GraduationCap size={20} className="text-primary"/> Education</h3>
                  <div className="space-y-4">
                    {profile.education && profile.education.length > 0 ? profile.education.map((edu: any, i: number) => (
                      <div key={i} className="bg-[#1c1f26] p-5 rounded-2xl border border-white/5">
                        <h4 className="font-bold text-white text-lg">{edu.degree}</h4>
                        <p className="text-sm text-primary font-medium">{edu.institution}</p>
                        <p className="text-xs text-muted-foreground mt-1">Class of {edu.graduationYear}</p>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No education listed.</p>}
                  </div>
                </section>
              </div>
            </div>
            
            {/* Similar Profiles Section */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">People you may know</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {searchData?.data?.filter((p: Profile) => p.user_id !== profile.user_id).slice(0, 3).map((p: Profile) => (
                  <div key={p.user_id} className="bg-[#1c1f26] border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors flex flex-col items-center text-center cursor-pointer" onClick={() => setSelectedProfileId(p.user_id)}>
                    <div className="w-16 h-16 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-3">
                      <span className="text-xl font-bold text-primary">{p.name?.charAt(0)}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{p.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{p.headline}</p>
                    <button className="mt-4 w-full py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg text-xs transition-colors">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Alumni Directory</h2>
          <p className="text-muted-foreground">Discover, connect, and network with students and alumni.</p>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('discover')} 
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg text-sm transition-all ${activeTab === 'discover' ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,98,10,0.3)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
        >
          <Search size={16} /> Discover
        </button>
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg text-sm transition-all relative ${activeTab === 'requests' ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,98,10,0.3)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
        >
          <Users size={16} /> Connection Requests
          {pendingRequests.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div className="bg-[#15171c] border border-white/5 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Pending Invitations</h3>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-muted-foreground opacity-50" size={24} />
              </div>
              <p className="text-white font-medium mb-1">You're all caught up!</p>
              <p className="text-sm text-muted-foreground">No pending connection requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req: any) => (
                <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#1c1f26] hover:bg-[#20242c] transition-colors">
                  <div className="flex items-center gap-4">
                    {req.avatar_url ? (
                      <img src={req.avatar_url} alt={req.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                        {req.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">{req.name} <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-muted-foreground ml-2 capitalize">{req.role}</span></h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.headline || 'Wants to connect with you'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => respondMutation.mutate({ id: req.id, status: 'rejected' })}
                      className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-medium text-white transition-colors flex items-center gap-1"
                    >
                      <X size={16} /> Ignore
                    </button>
                    <button 
                      onClick={() => {
                        respondMutation.mutate({ id: req.id, status: 'accepted' }, {
                          onSuccess: () => {
                            // Optionally show a toast, but do not redirect
                          }
                        });
                      }}
                      className="px-4 py-2 bg-primary hover:bg-brand-600 rounded-xl text-sm font-bold text-white transition-all shadow-[0_0_15px_rgba(255,98,10,0.3)] flex items-center gap-1"
                    >
                      <Check size={16} /> Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search by name, company, or skills..."
                className="w-full bg-[#1c1f26] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select 
                className="bg-[#1c1f26] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none min-w-[150px]"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="alumni">Alumni</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
              </select>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-semibold text-white transition-colors">
                <Filter size={16} /> Filters
              </button>
            </div>
          </div>

          {/* Results */}
          {isLoadingSearch ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="bg-[#15171c] border border-white/5 rounded-3xl p-6 h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchData?.data?.map((profile: Profile) => (
                <div key={profile.user_id} className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl hover:border-white/10 transition-all flex flex-col items-center text-center group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  
                  <div className="relative mb-4 mt-2">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{profile.name?.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{profile.name}</h3>
                  <p className="text-sm text-primary font-medium mb-3">{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
                  
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 h-8">
                    {profile.headline || 'No headline provided'}
                  </p>

                  <div className="w-full space-y-2 mb-6 text-left">
                    {profile.work_experience?.[0] && (
                      <div className="flex items-center text-xs text-white/70 bg-white/5 p-2 rounded-xl">
                        <Briefcase className="w-3.5 h-3.5 mr-2 text-primary" />
                        <span className="truncate">{profile.work_experience[0].company}</span>
                      </div>
                    )}
                    {profile.education?.[0] && (
                      <div className="flex items-center text-xs text-white/70 bg-white/5 p-2 rounded-xl">
                        <GraduationCap className="w-3.5 h-3.5 mr-2 text-primary" />
                        <span className="truncate">{profile.education[0].institution}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 w-full mt-auto">
                    <button onClick={() => setSelectedProfileId(profile.user_id)} className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-sm">
                      View
                    </button>
                    {(() => {
                      const status = getConnectionStatus(profile.user_id);
                      if (status === 'accepted') {
                        return (
                          <button onClick={() => handleMessageClick(profile.user_id)} className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1 text-sm border border-white/10">
                            <MessageSquare size={16} /> Message
                          </button>
                        );
                      }
                      if (status === 'pending') {
                        return (
                          <button disabled className="flex-1 py-2.5 px-4 bg-white/5 text-muted-foreground font-bold rounded-xl flex items-center justify-center gap-1 text-sm border border-white/5 cursor-not-allowed">
                            <Check size={16} /> Pending
                          </button>
                        );
                      }
                      return (
                        <button onClick={() => handleConnect(profile.user_id)} className="flex-1 py-2.5 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary font-bold rounded-xl transition-all flex items-center justify-center gap-1 text-sm">
                          <UserPlus size={16} /> Connect
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}

              {searchData?.data?.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No profiles found</h3>
                  <p className="text-muted-foreground">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
