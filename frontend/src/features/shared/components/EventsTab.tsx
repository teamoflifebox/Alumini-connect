import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Calendar as CalendarIcon, Share2, HelpCircle, Plus, X, Video, CheckCircle, BadgeCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../../api/events';
import type { Event } from '../../../api/events';

export default function EventsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', searchTerm],
    queryFn: () => eventsApi.getAll(searchTerm),
  });

  const { data: myEvents = [] } = useQuery({
    queryKey: ['my-events'],
    queryFn: eventsApi.getMyEvents,
    enabled: !!user,
  });

  const myEventIds = new Set(myEvents.map(e => e.id));

  const createMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowEventForm(false);
      setNewEvent({ title: '', description: '', location: '', date: '', endDate: '', mode: 'Offline', type: 'Meetup' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: eventsApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: eventsApi.unregister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: eventsApi.report,
    onSuccess: () => {
      alert('Thank you for your report. Our automated systems will review this event immediately.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', date: '', endDate: '', mode: 'Offline', type: 'Meetup' });
  const [viewingAttendeesEventId, setViewingAttendeesEventId] = useState<string | null>(null);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Filters State
  const [filterRegistered, setFilterRegistered] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<string[]>([]);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const { data: fullEvent, isLoading: isLoadingAttendees } = useQuery({
    queryKey: ['event-details', viewingAttendeesEventId],
    queryFn: () => eventsApi.getById(viewingAttendeesEventId!),
    enabled: !!viewingAttendeesEventId,
  });

  const { data: adminEvents = [], refetch: refetchAdmin } = useQuery({
    queryKey: ['admin-events'],
    queryFn: eventsApi.getAdminAll,
    enabled: isAdminMode,
  });

  const approveMutation = useMutation({
    mutationFn: eventsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      alert('Event approved successfully!');
    },
  });

  const eventsList = isAdminMode ? adminEvents : events;

  const filteredEvents = eventsList.filter((event: any) => {
    if (filterRegistered && !myEventIds.has(event.id)) return false;

    const now = new Date();
    const end = new Date(event.end_time);
    const isPast = now > end;

    if (filterStatus.length > 0) {
      if (filterStatus.includes('Upcoming') && isPast) return false;
      if (filterStatus.includes('Past') && !isPast) return false;
    }

    if (filterMode.length > 0) {
      if (filterMode.includes('Offline') && event.location_type === 'Online') return false;
      if (filterMode.includes('Online') && event.location_type !== 'Online') return false;
    }

    if (filterDateFrom && new Date(event.start_time) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(event.start_time) > new Date(filterDateTo + 'T23:59:59')) return false;

    return true;
  });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.location || !newEvent.date || !newEvent.endDate) return;
    
    createMutation.mutate({
      title: newEvent.title,
      description: newEvent.description || newEvent.title,
      event_type: newEvent.type,
      start_time: new Date(newEvent.date).toISOString(),
      end_time: new Date(newEvent.endDate).toISOString(),
      location_type: newEvent.mode === 'Offline' ? 'In-Person' : 'Online',
      location_details: newEvent.location
    });
  };


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-[#15171c] border border-white/5 rounded-2xl p-4 shadow-lg">
          
          {user?.role === 'admin' && (
            <div className="mb-4 pb-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-white font-semibold text-sm">Admin View</span>
              <button 
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isAdminMode ? 'bg-primary' : 'bg-white/20'}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAdminMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1c1f26] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-white font-semibold mb-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                Filters
              </div>
              <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors">
                <input type="checkbox" checked={filterRegistered} onChange={(e) => setFilterRegistered(e.target.checked)} className="rounded border-white/20 bg-transparent text-primary accent-primary" />
                Registered by me
              </label>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                Events status
                <ChevronDown size={16} className="text-muted-foreground" />
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" checked={filterStatus.includes('Upcoming')} onChange={(e) => {
                    if (e.target.checked) setFilterStatus([...filterStatus, 'Upcoming']);
                    else setFilterStatus(filterStatus.filter(s => s !== 'Upcoming'));
                  }} className="rounded border-white/20 bg-transparent text-primary accent-primary" />
                  Upcoming events
                </label>
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" checked={filterStatus.includes('Past')} onChange={(e) => {
                    if (e.target.checked) setFilterStatus([...filterStatus, 'Past']);
                    else setFilterStatus(filterStatus.filter(s => s !== 'Past'));
                  }} className="rounded border-white/20 bg-transparent text-primary accent-primary" />
                  Past events
                </label>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                Event mode
                <ChevronDown size={16} className="text-muted-foreground" />
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" checked={filterMode.includes('Offline')} onChange={(e) => {
                    if (e.target.checked) setFilterMode([...filterMode, 'Offline']);
                    else setFilterMode(filterMode.filter(m => m !== 'Offline'));
                  }} className="rounded border-white/20 bg-transparent text-primary accent-primary" />
                  Offline
                </label>
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" checked={filterMode.includes('Online')} onChange={(e) => {
                    if (e.target.checked) setFilterMode([...filterMode, 'Online']);
                    else setFilterMode(filterMode.filter(m => m !== 'Online'));
                  }} className="rounded border-white/20 bg-transparent text-primary accent-primary" />
                  Online
                </label>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-white font-semibold mb-3 flex items-center justify-between">
                Date
                <ChevronDown size={16} className="text-muted-foreground" />
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">From</label>
                  <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-lg px-3 py-2 text-sm text-muted-foreground [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                  <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-lg px-3 py-2 text-sm text-muted-foreground [color-scheme:dark]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Event List */}
      <div className="flex-1 space-y-6">
        {user && (
          <div className="flex justify-end mb-2">
            <button onClick={() => setShowEventForm(true)} className="bg-primary hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)]">
              <Plus size={18} /> Host Event
            </button>
          </div>
        )}

        <AnimatePresence>
          {showEventForm && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-[#15171c] border border-primary/30 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Host a New Event</h3>
                <button onClick={() => setShowEventForm(false)} className="text-muted-foreground hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Event Title *" 
                  value={newEvent.title} 
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
                <input 
                  type="text"
                  list="event-types"
                  placeholder="Event Type (e.g. Meetup, AI Summit) *"
                  value={newEvent.type} 
                  onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
                <datalist id="event-types">
                  <option value="Meetup" />
                  <option value="Webinar" />
                  <option value="Reunion" />
                  <option value="Workshop" />
                  <option value="AI Summit" />
                </datalist>
                <select 
                  value={newEvent.mode} 
                  onChange={e => setNewEvent({...newEvent, mode: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="Offline">Offline / Physical Event</option>
                  <option value="Online">Online / Virtual Event</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Location / Platform Link *" 
                  value={newEvent.location} 
                  onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors md:col-span-2"
                />
                <div className="flex gap-2 w-full md:col-span-2">
                  <div className="w-1/2">
                    <label className="text-xs text-muted-foreground block mb-1">Start Time</label>
                    <input 
                      type="datetime-local" 
                      value={newEvent.date} 
                      onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs text-muted-foreground block mb-1">End Time</label>
                    <input 
                      type="datetime-local" 
                      value={newEvent.endDate} 
                      onChange={e => setNewEvent({...newEvent, endDate: e.target.value})}
                      className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
                <textarea 
                  placeholder="Description" 
                  value={newEvent.description} 
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors md:col-span-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button disabled={createMutation.isPending} onClick={handleCreateEvent} className="bg-primary hover:bg-brand-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)] disabled:opacity-50">
                  {createMutation.isPending ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading events...</div>
        ) : filteredEvents.map((event: any) => {
          const isRegistered = myEventIds.has(event.id);
          const isOrganizer = user && String(user.id) === String(event.organizer_id);
          const isOnline = event.location_type === 'Online';
          const now = new Date();
          const start = new Date(event.start_time);
          const end = new Date(event.end_time);
          const isOngoing = now >= start && now <= end;
          const isPast = now > end;
          const statusText = isPast ? 'Past Event' : isOngoing ? 'Ongoing Now' : 'Registration Open';
          
          return (
          <div key={event.id} className={`bg-[#15171c] border ${isOngoing ? 'border-green-500' : 'border-white/5'} rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-xl hover:border-white/10 transition-colors group relative`}>
            {isOngoing && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 font-bold z-10">Ongoing</div>}
            {isPast && <div className="absolute top-0 right-0 bg-gray-500 text-white text-xs px-3 py-1 font-bold z-10">Past</div>}
            
            <div className="w-full md:w-72 h-48 md:h-auto shrink-0 overflow-hidden relative bg-[#1c1f26] flex items-center justify-center">
              <span className="text-4xl text-primary opacity-50">{event.event_type?.[0] || 'E'}</span>
              {isAdminMode && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 text-xs text-white">
                  <div><strong>Host:</strong> {event.organizer_name || 'Unknown'}</div>
                  <div className="text-muted-foreground truncate">{event.organizer_email || ''}</div>
                </div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white leading-tight pr-8 flex items-center flex-wrap gap-2">
                  {event.title}
                  {event.verified_organizer && (
                    <span className="inline-flex items-center text-blue-400 text-sm font-medium bg-blue-400/10 px-2 py-0.5 rounded-full" title="Verified Organizer">
                      <BadgeCheck size={14} className="mr-1" /> Verified Organizer
                    </span>
                  )}
                  {event.status === 'pending' && (
                    <span className="inline-flex items-center text-yellow-400 text-xs font-medium bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20" title="Visible but pending automated verification">
                      Pending Moderation
                    </span>
                  )}
                  {event.status === 'flagged' && (
                    <span className="inline-flex items-center text-red-400 text-xs font-medium bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                      Flagged / Spam
                    </span>
                  )}
                  {event.status === 'verified' && (
                    <span className="inline-flex items-center text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      Verified
                    </span>
                  )}
                </h3>
                <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-semibold">{event.event_type}</span>
              </div>
              
              <div className="space-y-2 mb-6 flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CalendarIcon size={16} className="mt-0.5 shrink-0 text-primary" />
                  <span>{start.toLocaleDateString()} {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  {isOnline ? <Video size={16} className="mt-0.5 shrink-0 text-blue-500" /> : <MapPin size={16} className="mt-0.5 shrink-0 text-red-500" />}
                  <span>
                    {isRegistered || isOrganizer ? (
                      isOnline ? <a href={event.location_details} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Join Meeting</a> : event.location_details
                    ) : (
                      isOnline ? 'Online Meeting (Register to view link)' : event.location_details
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    <Users className="w-4 h-4 inline mr-1 text-primary" />
                    {event.capacity ? `${event.attendee_count || 0} / ${event.capacity}` : event.attendee_count || 0} Registered
                  </span>
                </div>
                
                <div className="flex gap-2 items-center">
                  {isAdminMode && event.status !== 'verified' && (
                    <button
                      onClick={() => approveMutation.mutate(event.id)}
                      disabled={approveMutation.isPending}
                      className="text-sm font-bold text-white bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      Approve Event
                    </button>
                  )}
                  {!isOrganizer && !isAdminMode && (
                    <button 
                      onClick={() => {
                        const reason = window.prompt('Reason for reporting (e.g. Spam, Fraud, Misleading, Inappropriate):');
                        if (reason) reportMutation.mutate({ id: event.id, reason });
                      }}
                      title="Report Event"
                      disabled={reportMutation.isPending}
                      className="text-sm font-semibold text-muted-foreground hover:text-red-400 bg-white/5 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 border border-white/5"
                    >
                      <AlertTriangle size={16} /> Report
                    </button>
                  )}
                  {isOrganizer ? (
                    <>
                      <button
                        onClick={() => {
                          const newTitle = window.prompt('Enter new title (leave blank to keep current):', event.title) || event.title;
                          const newTime = window.prompt('Enter new start time (YYYY-MM-DDTHH:mm) - NOTE: Cannot change if within 48h:', event.start_time.substring(0, 16));
                          
                          if (newTitle || newTime) {
                            eventsApi.update({
                              id: event.id,
                              data: { title: newTitle, start_time: newTime ? new Date(newTime).toISOString() : event.start_time }
                            }).then(() => {
                              alert('Event updated successfully!');
                              queryClient.invalidateQueries({ queryKey: ['events'] });
                            }).catch(err => alert(err.response?.data?.message || 'Failed to update event'));
                          }
                        }}
                        className="text-sm font-bold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setViewingAttendeesEventId(event.id)}
                        className="text-sm font-bold text-white bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition"
                      >
                        View Participants
                      </button>
                    </>
                  ) : isRegistered ? (
                    <button
                      onClick={() => unregisterMutation.mutate(event.id)}
                      disabled={unregisterMutation.isPending || isPast}
                      className="text-sm font-bold text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1"
                    >
                      <CheckCircle size={16} /> Registered
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (window.confirm('Confirm Registration: Do you want to join this event? Your basic profile information will be shared with the organizer.')) {
                          registerMutation.mutate(event.id);
                        }
                      }}
                      disabled={registerMutation.isPending || isPast}
                      className="text-sm font-bold text-white bg-white/10 hover:bg-primary px-4 py-2 rounded-lg transition border border-white/5 disabled:opacity-50"
                    >
                      {isPast ? 'Ended' : 'Register Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );})}
      </div>

      {/* Participants Modal */}
      <AnimatePresence>
        {viewingAttendeesEventId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#15171c] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Registered Participants</h3>
                <button onClick={() => { setViewingAttendeesEventId(null); setShowAllParticipants(false); }} className="text-muted-foreground hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="overflow-y-auto pr-2 space-y-3">
                {isLoadingAttendees ? (
                  <p className="text-muted-foreground text-center py-8">Loading participants...</p>
                ) : fullEvent?.attendees?.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      {(showAllParticipants ? fullEvent.attendees : fullEvent.attendees.slice(0, 3)).map((attendee: any, i: number) => (
                        <div key={i} className="bg-[#1c1f26] p-4 rounded-xl border border-white/5 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                            {(attendee.name || 'A')[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-white truncate">{attendee.name || 'Anonymous User'}</span>
                            <span className="text-xs text-muted-foreground truncate">{attendee.email || 'No email provided'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!showAllParticipants && fullEvent.attendees.length > 3 && (
                      <button 
                        onClick={() => setShowAllParticipants(true)}
                        className="w-full mt-4 py-3 border border-white/10 rounded-xl text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                      >
                        View all {fullEvent.attendees.length} participants
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No one has registered yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Help Button */}
      <button className="fixed bottom-8 right-8 bg-white text-black pl-3 pr-4 py-2 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:bg-neutral-200 transition-colors z-50">
        <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center -ml-1">
          <HelpCircle size={14} />
        </div>
        Need Help?
      </button>

    </motion.div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  );
}
