import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, Star, Clock, Search, Plus, 
  Trash2, Check, X, Users, BookOpen, AlertCircle, Video, Lock, Unlock, Globe
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { mentorshipApi, type MentorshipSession } from '../../../api/mentorship.api';
import { profilesApi } from '../../../api/profiles.api';
import { useSocket } from '../../../hooks/useSocket';
import MentorshipChat from './MentorshipChat';

export default function MentorshipTab() {
  const { user } = useAuthStore();
  const currentUserId = user ? Number(user.id) : null;

  // Real-time integration
  const { socket, joinSessionRoom, leaveSessionRoom } = useSocket();

  // State Management
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [recommendedSessions, setRecommendedSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'recommended'>('all');
  const [activeChatSessionId, setActiveChatSessionId] = useState<number | null>(null);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  // New Form Fields
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [sessionType, setSessionType] = useState('One-to-One');
  const [meetingMode, setMeetingMode] = useState('Video Call (Auto-Generated)');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [visibility, setVisibility] = useState('Public');
  const [targetDomain, setTargetDomain] = useState('');

  // Participant Selection State
  const [selectedParticipants, setSelectedParticipants] = useState<{id: number, name: string}[]>([]);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [participantResults, setParticipantResults] = useState<{id: number, name: string, role: string, email: string}[]>([]);
  
  // Search users for participants
  useEffect(() => {
    const searchUsers = async () => {
      if (participantSearchTerm.trim().length < 2) {
        setParticipantResults([]);
        return;
      }
      try {
        const users = await profilesApi.searchUsers(participantSearchTerm);
        // Filter out already selected and the current user
        const filtered = users.filter((u: any) => 
          u.id !== currentUserId && 
          !selectedParticipants.find(sp => sp.id === u.id)
        );
        setParticipantResults(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    
    const timer = setTimeout(searchUsers, 400);
    return () => clearTimeout(timer);
  }, [participantSearchTerm, selectedParticipants, currentUserId]);

  // Listen to socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (payload) => {
      console.log('MentorshipTab Notification:', payload);
      // Auto-refresh sessions if a new public one is created
      if (payload.type === 'session_created') {
        fetchSessions(debouncedSearch);
      }
    });

    socket.on('session_updated', (payload) => {
      // Refresh to get new attendee count when someone joins/leaves
      fetchSessions(debouncedSearch);
    });

    return () => {
      socket.off('notification');
      socket.off('session_updated');
    };
  }, [socket, debouncedSearch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch sessions
  const fetchSessions = async (searchVal?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await mentorshipApi.getSessions(searchVal);
      setSessions(data);
      
      if (!searchVal && currentUserId) {
        const recommendedData = await mentorshipApi.getRecommended();
        setRecommendedSessions(recommendedData);
      }
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load mentorship sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(debouncedSearch);
  }, [debouncedSearch]);

  // Form submission
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    
    // Validation
    const errors = [];
    if (!title.trim() || title.trim().length < 3) {
      errors.push('Title must be at least 3 characters.');
    }
    if (!skills.trim()) {
      errors.push('At least one topic or skill is required.');
    }
    if (!startTime) {
      errors.push('Start time is required.');
    }
    const needsSelection = sessionType === 'One-to-One' || sessionType === 'Group' || visibility === 'Private';
    if (needsSelection && selectedParticipants.length === 0) {
      errors.push('Please select at least one participant for this session type.');
    }
    if (sessionType === 'One-to-One' && selectedParticipants.length > 1) {
      errors.push('One-to-One sessions can only have 1 participant.');
    }
    
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await mentorshipApi.createSession({
        title: title.trim(),
        skills: parsedSkills,
        duration,
        session_type: sessionType,
        meeting_mode: meetingMode,
        meeting_url: meetingUrl,
        start_time: new Date(startTime).toISOString(),
        max_participants: maxParticipants ? Number(maxParticipants) : undefined,
        visibility,
        target_domain: targetDomain || undefined,
        selected_participants: selectedParticipants.map(p => p.id)
      });

      // Reset & Refresh
      setTitle('');
      setSkills('');
      setDuration('45 mins');
      setSessionType('One-to-One');
      setMeetingMode('Video Call (Auto-Generated)');
      setMeetingUrl('');
      setStartTime('');
      setMaxParticipants('');
      setVisibility('Public');
      setTargetDomain('');
      setSelectedParticipants([]);
      setParticipantSearchTerm('');
      setIsModalOpen(false);
      fetchSessions(debouncedSearch);
    } catch (err: any) {
      console.error('Error creating session:', err);
      const serverMsg = err.response?.data?.errors?.[0] || err.response?.data?.message || 'Failed to create session.';
      setFormErrors([serverMsg]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Join session
  const handleJoin = async (sessionId: number) => {
    try {
      await mentorshipApi.joinSession(sessionId);
      joinSessionRoom(sessionId); // Realtime room for chat/updates
      
      // Update local state dynamically
      setSessions(prev => 
        prev.map(s => {
          if (s.id === sessionId && currentUserId) {
            const hasJoined = s.attendee_ids.includes(currentUserId);
            return {
              ...s,
              attendee_ids: hasJoined ? s.attendee_ids : [...s.attendee_ids, currentUserId]
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Error joining session:', err);
    }
  };

  // Leave session
  const handleLeave = async (sessionId: number) => {
    try {
      await mentorshipApi.leaveSession(sessionId);
      leaveSessionRoom(sessionId); // Leave Realtime room
      
      // Update local state dynamically
      setSessions(prev => 
        prev.map(s => {
          if (s.id === sessionId && currentUserId) {
            return {
              ...s,
              attendee_ids: s.attendee_ids.filter(id => id !== currentUserId)
            };
          }
          return s;
        })
      );
    } catch (err) {
      console.error('Error leaving session:', err);
    }
  };

  // Delete session
  const handleDelete = async (sessionId: number) => {
    if (!window.confirm('Are you sure you want to delete this mentorship session?')) return;
    try {
      await mentorshipApi.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeChatSessionId === sessionId) {
        setActiveChatSessionId(null);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  // Predefined pill colors for tags
  const getTagColorClass = (index: number) => {
    const colors = [
      'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'bg-pink-500/10 text-pink-400 border-pink-500/20',
    ];
    return colors[index % colors.length];
  };

  const displayedSessions = activeTab === 'recommended' ? recommendedSessions : sessions;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-6xl mx-auto space-y-8 px-4 md:px-0 pb-16"
    >
      {/* Header section with glassmorphism effects */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h3 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="text-primary w-8 h-8" />
            Mentorship Hub
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Schedule sessions, share knowledge, and connect with mentors or mentees to grow professionally.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-[0_0_25px_rgba(255,98,10,0.4)]"
        >
          <Plus size={18} />
          Create Session
        </motion.button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center bg-white/5 rounded-2xl p-1 backdrop-blur-md border border-white/10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              activeTab === 'all' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setActiveTab('recommended')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'recommended' ? 'bg-white text-black' : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Star size={14} className={activeTab === 'recommended' ? 'fill-black' : 'fill-transparent'} />
            Recommended
          </button>
        </div>

        {/* Advanced search section */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, skills, mentors..."
            className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300 backdrop-blur-md"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Fetching sessions...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto">
          <AlertCircle size={24} className="shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Sessions Grid list */}
      {!loading && !error && (
        <>
          {displayedSessions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md space-y-4"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                <Search size={28} />
              </div>
              <h4 className="text-xl font-bold text-white">No Mentorship Sessions Found</h4>
              <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                Try refining your search terms or wait for alumni to post new sessions!
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {displayedSessions.map((session) => {
                  const isMentorOfSession = currentUserId === session.mentor_id;
                  const isAttendee = currentUserId ? session.attendee_ids.includes(currentUserId) : false;
                  
                  const startTimeStr = session.start_time ? new Date(session.start_time).toLocaleString() : 'TBA';
                  
                  // Calculate if session is expired
                  let isExpired = false;
                  if (session.start_time) {
                    const startMs = new Date(session.start_time).getTime();
                    let durationMs = 60 * 60000;
                    const dur = session.duration.toLowerCase();
                    if (dur.includes('30 min')) durationMs = 30 * 60000;
                    else if (dur.includes('45 min')) durationMs = 45 * 60000;
                    else if (dur.includes('1 hour') || dur.includes('1 hr')) durationMs = 60 * 60000;
                    else if (dur.includes('2 hour') || dur.includes('2 hr')) durationMs = 120 * 60000;
                    
                    if (startMs + durationMs < Date.now()) {
                      isExpired = true;
                    }
                  }

                  return (
                    <motion.div 
                      key={session.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={isExpired ? {} : { y: -5 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-[#15171c]/80 border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden group backdrop-blur-md transition-all ${isExpired ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                    >
                      {/* Premium accent gradient on card hover */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div>
                        {/* Mentor and Rating header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
                              <UserCircle size={28} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-white font-bold truncate">{session.mentor_name || 'Mentor'}</h5>
                              <p className="text-xs text-muted-foreground truncate">{session.mentor_headline || 'Alumni Mentor'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {session.visibility === 'Private' ? (
                              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-md">
                                <Lock size={12} /> Invite Only
                              </span>
                            ) : session.visibility === 'Skill-Targeted' ? (
                              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md">
                                <Star size={12} /> Targeted
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">
                                <Globe size={12} /> Public
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Session title and info */}
                        <h4 className="text-xl font-bold text-white mb-2 line-clamp-2">
                          {session.title}
                        </h4>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5 font-medium bg-white/5 px-2 py-1 rounded-md">
                            <Clock size={12} /> {startTimeStr}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium bg-white/5 px-2 py-1 rounded-md">
                            <Video size={12} /> {session.meeting_mode}
                          </span>
                        </div>

                        {/* Predefined skill pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {session.skills.map((skill, index) => (
                            <span 
                              key={skill} 
                              className={`px-3 py-1 border rounded-xl text-xs font-semibold tracking-wide ${getTagColorClass(index)}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer containing duration, attendees and actions */}
                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock size={14} className="text-primary" />
                            {session.duration}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Users size={14} className="text-blue-400" />
                            {session.attendee_ids.length} {session.max_participants ? `/ ${session.max_participants}` : ''} attendees
                          </span>
                        </div>

                        {/* Conditional Buttons based on User context */}
                        {isExpired ? (
                          <div className="px-5 py-2 bg-white/5 border border-white/10 text-muted-foreground rounded-xl font-bold text-xs flex items-center gap-2">
                            <Clock size={14} /> Session Ended
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pointer-events-auto">
                            {session.meeting_url && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (!isAttendee && !isMentorOfSession) {
                                    handleJoin(session.id);
                                  }
                                  window.open(session.meeting_url, '_blank');
                                }}
                                className="px-5 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all duration-300 mr-2"
                                title="Join Video Call"
                              >
                                <Video size={14} /> Join Video
                              </motion.button>
                            )}
                            {isMentorOfSession ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(session.id)}
                                className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300"
                                title="Delete Session"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            ) : isAttendee ? (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  handleLeave(session.id);
                                  if (activeChatSessionId === session.id) setActiveChatSessionId(null);
                                }}
                                className="px-5 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 group/btn"
                              >
                                <Check size={14} className="group-hover/btn:hidden" />
                                <span className="group-hover/btn:hidden">Joined</span>
                                <X size={14} className="hidden group-hover/btn:block" />
                                <span className="hidden group-hover/btn:block">Leave</span>
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleJoin(session.id)}
                                className="px-5 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold text-xs transition-all duration-300"
                              >
                                Join Session
                              </motion.button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Chat Toggle & Render */}
                      {(isAttendee || isMentorOfSession) && (
                        <div className="border-t border-white/5 pt-4 mt-4">
                          <button
                            onClick={() => setActiveChatSessionId(activeChatSessionId === session.id ? null : session.id)}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold text-white transition-colors pointer-events-auto"
                          >
                            {activeChatSessionId === session.id ? 'Hide Chat' : 'Open Live Chat'}
                          </button>
                          
                          <AnimatePresence>
                            {activeChatSessionId === session.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4"
                              >
                                <MentorshipChat sessionId={session.id} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Become a Mentor Popup Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#15171c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Premium abstract background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] pointer-events-none" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Star className="text-primary fill-primary w-6 h-6 animate-pulse" />
                  Create Mentorship Session
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-muted-foreground hover:text-white transition-colors bg-white/5 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Error list */}
              {formErrors.length > 0 && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl space-y-1 text-xs">
                  {formErrors.map((err, i) => (
                    <p key={i} className="font-medium flex items-center gap-1.5">
                      <AlertCircle size={12} /> {err}
                    </p>
                  ))}
                </div>
              )}

              <form onSubmit={handleCreateSession} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Session Title
                  </label>
                  <input 
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mock Technical Interview & Resume Feedback"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Skills/Topics */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Skills / Topics Covered
                  </label>
                  <input 
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, Frontend, Career Strategy"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Session Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Session Type
                    </label>
                    <select 
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="One-to-One" className="bg-[#15171c]">One-to-One</option>
                      <option value="Group" className="bg-[#15171c]">Group</option>
                      <option value="Workshop" className="bg-[#15171c]">Workshop</option>
                    </select>
                  </div>

                  {/* Visibility */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Visibility
                    </label>
                    <select 
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="Public" className="bg-[#15171c]">Public</option>
                      <option value="Skill-Targeted" className="bg-[#15171c]">Skill-Targeted</option>
                      <option value="Domain-Targeted" className="bg-[#15171c]">Domain-Targeted</option>
                      <option value="Private" className="bg-[#15171c]">Invite-Only (Private)</option>
                    </select>
                  </div>

                  {/* Participant Selector */}
                  <AnimatePresence>
                    {(sessionType === 'One-to-One' || sessionType === 'Group' || visibility === 'Private') && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 col-span-1 md:col-span-2 bg-white/5 p-4 rounded-2xl border border-white/10"
                      >
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Select Participant(s) {sessionType === 'One-to-One' ? '(Max 1)' : ''}
                        </label>
                        
                        {/* Selected Pills */}
                        {selectedParticipants.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedParticipants.map(p => (
                              <div key={p.id} className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-sm border border-blue-500/30">
                                <span>{p.name}</span>
                                <button 
                                  type="button" 
                                  onClick={() => setSelectedParticipants(prev => prev.filter(sp => sp.id !== p.id))}
                                  className="hover:text-white transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <input 
                            type="text"
                            value={participantSearchTerm}
                            onChange={(e) => setParticipantSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#15171c] border border-white/10 rounded-xl text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 text-sm transition-colors"
                          />
                          
                          {/* Search Dropdown Results */}
                          {participantSearchTerm.length >= 2 && participantResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1e26] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                              {participantResults.map(u => (
                                <button
                                  key={u.id}
                                  type="button"
                                  onClick={() => {
                                    if (sessionType === 'One-to-One' && selectedParticipants.length >= 1) {
                                      alert('One-to-One sessions can only have 1 selected participant.');
                                      return;
                                    }
                                    setSelectedParticipants(prev => [...prev, { id: u.id, name: u.name }]);
                                    setParticipantSearchTerm('');
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-center justify-between"
                                >
                                  <div>
                                    <div className="text-sm font-bold text-white">{u.name}</div>
                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                  </div>
                                  <div className="text-[10px] uppercase font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                                    {u.role}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Target Domain (shows only if Domain-Targeted) */}
                  <AnimatePresence>
                    {visibility === 'Domain-Targeted' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 col-span-1 md:col-span-2"
                      >
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Target Domain
                        </label>
                        <select 
                          value={targetDomain}
                          onChange={(e) => setTargetDomain(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#15171c]">Select a domain...</option>
                          <option value="Software Engineering" className="bg-[#15171c]">Software Engineering</option>
                          <option value="Data Science" className="bg-[#15171c]">Data Science</option>
                          <option value="Marketing" className="bg-[#15171c]">Marketing</option>
                          <option value="Design" className="bg-[#15171c]">Design</option>
                          <option value="Product Management" className="bg-[#15171c]">Product Management</option>
                          <option value="Finance" className="bg-[#15171c]">Finance</option>
                          <option value="Consulting" className="bg-[#15171c]">Consulting</option>
                          <option value="Education" className="bg-[#15171c]">Education</option>
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Meeting Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Meeting Mode
                    </label>
                    <select 
                      value={meetingMode}
                      onChange={(e) => setMeetingMode(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="Video Call (Auto-Generated)" className="bg-[#15171c]">Video Call (Auto-Generated)</option>
                      <option value="Zoom" className="bg-[#15171c]">Zoom</option>
                      <option value="Custom Link" className="bg-[#15171c]">Custom Link</option>
                      <option value="In-Person" className="bg-[#15171c]">In-Person</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Session Duration
                    </label>
                    <select 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="30 mins" className="bg-[#15171c]">30 Minutes</option>
                      <option value="45 mins" className="bg-[#15171c]">45 Minutes</option>
                      <option value="1 hour" className="bg-[#15171c]">1 Hour</option>
                      <option value="2 hours" className="bg-[#15171c]">2 Hours</option>
                    </select>
                  </div>

                  {/* Start Time */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Start Date & Time
                    </label>
                    <input 
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Max Participants */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Max Participants (Optional)
                    </label>
                    <input 
                      type="number"
                      min="1"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      placeholder="Leave blank for unlimited"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
                
                {/* Meeting URL */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Meeting URL / Location
                  </label>
                  <input 
                    type="text"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/xyz"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-primary hover:bg-brand-600 text-white rounded-2xl font-bold text-sm transition-colors shadow-[0_0_20px_rgba(255,98,10,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Session'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
