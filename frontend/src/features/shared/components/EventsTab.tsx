import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Calendar as CalendarIcon, Share2, HelpCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function EventsTab() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data representing the reference image
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Khilkhilaht Rainbow Home, Rajkiya Navin Madhya Vidyalay Campus',
      location: 'Near Navin Sinha Smriti Park, Rajvanshi Nagar, Bihar, India, Patna',
      date: 'Jun 07, 2026, 12:30 PM - Jun 07, 2026, 2:30 PM',
      attendees: 12,
      status: 'Online Registration Open',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop', // Group photo placeholder
      type: 'Upcoming'
    },
    {
      id: 2,
      title: 'Dhaka Bangladesh | Alumni Reunion 2025-26',
      location: 'Hawa Rooftop Restaurant Sujat Mansion, Mirpur - 12, lift 8, Dhaka, Bangladesh, Dhaka District',
      date: 'May 15, 2026, 6:30 PM - May 15, 2026, 10:30 PM',
      attendees: 40,
      status: 'Past Event',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=600&auto=format&fit=crop', // Architecture placeholder
      type: 'Past'
    },
    {
      id: 3,
      title: 'Bhutan Virtual Alumni Meet 2025-26',
      location: 'Online / Zoom Platform',
      date: 'Apr 20, 2026, 10:00 AM - Apr 20, 2026, 12:00 PM',
      attendees: 150,
      status: 'Past Event',
      image: 'https://images.unsplash.com/photo-1588196749597-9ff047892305?q=80&w=600&auto=format&fit=crop', // Bhutan placeholder
      type: 'Past'
    }
  ]);

  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', location: '', date: '', image: '', mode: 'Offline' });

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.location || !newEvent.date) return;
    
    setEvents(prev => [{
      id: Date.now(),
      title: newEvent.title,
      location: newEvent.location,
      date: newEvent.date,
      attendees: 0,
      status: 'Online Registration Open',
      image: newEvent.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop', // generic event placeholder
      type: 'Upcoming'
    }, ...prev]);
    
    setNewEvent({ title: '', location: '', date: '', image: '', mode: 'Offline' });
    setShowEventForm(false);
  };


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-[#15171c] border border-white/5 rounded-2xl p-4 shadow-lg">
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
                <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary accent-primary" />
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
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary accent-primary" />
                  Upcoming events
                </label>
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary accent-primary" />
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
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary accent-primary" />
                  Offline
                </label>
                <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-white transition-colors">
                  <input type="checkbox" className="rounded border-white/20 bg-transparent text-primary accent-primary" />
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
                  <input type="date" className="w-full bg-[#1c1f26] border border-white/10 rounded-lg px-3 py-2 text-sm text-muted-foreground [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                  <input type="date" className="w-full bg-[#1c1f26] border border-white/10 rounded-lg px-3 py-2 text-sm text-muted-foreground [color-scheme:dark]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Event List */}
      <div className="flex-1 space-y-6">
        {(user?.primary_role === 'alumni' || user?.primary_role === 'admin') && (
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
                <input 
                  type="text" 
                  placeholder="Date & Time (e.g. Oct 10, 2026, 10:00 AM) *" 
                  value={newEvent.date} 
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
                <input 
                  type="url" 
                  placeholder="Cover Image URL (optional)" 
                  value={newEvent.image} 
                  onChange={e => setNewEvent({...newEvent, image: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <button onClick={handleCreateEvent} className="bg-primary hover:bg-brand-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)]">
                  Publish Event
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {events.map((event) => (
          <div key={event.id} className="bg-[#15171c] border border-white/5 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-xl hover:border-white/10 transition-colors group">
            <div className="w-full md:w-72 h-48 md:h-auto shrink-0 overflow-hidden relative">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white leading-tight pr-8">{event.title}</h3>
                <button className="text-muted-foreground hover:text-white transition-colors p-1">
                  <Share2 size={20} />
                </button>
              </div>
              
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CalendarIcon size={16} className="mt-0.5 shrink-0" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[#15171c] bg-orange-500 flex items-center justify-center text-xs font-bold text-white">A</div>
                    <div className="w-8 h-8 rounded-full border-2 border-[#15171c] bg-blue-500 flex items-center justify-center text-xs font-bold text-white">B</div>
                    <div className="w-8 h-8 rounded-full border-2 border-[#15171c] bg-purple-500 flex items-center justify-center text-xs font-bold text-white">C</div>
                  </div>
                  <span className="text-sm text-muted-foreground">{event.attendees} attendees</span>
                </div>
                <span className={`text-sm font-semibold ${event.status.includes('Open') ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                  {event.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
