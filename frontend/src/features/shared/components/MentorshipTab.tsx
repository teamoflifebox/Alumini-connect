import { motion } from 'framer-motion';
import { UserCircle, Calendar, Star, Clock } from 'lucide-react';

export default function MentorshipTab() {
  const mentors = [
    {
      id: 1,
      name: 'Michael Chang',
      role: 'Senior Staff Engineer at Meta',
      expertise: ['System Design', 'React', 'Career Growth'],
      rating: 4.9,
      sessions: 42,
      availability: 'Available next week'
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      role: 'Director of Product at Microsoft',
      expertise: ['Product Strategy', 'Interviews', 'Leadership'],
      rating: 5.0,
      sessions: 128,
      availability: 'Available tomorrow'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">Mentorship Hub</h3>
          <p className="text-muted-foreground">Connect with experienced alumni for 1-on-1 guidance, resume reviews, and mock interviews.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 border border-white/10 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
            My Sessions
          </button>
          <button className="bg-primary hover:bg-brand-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors shadow-[0_0_20px_rgba(255,98,10,0.3)]">
            Become a Mentor
          </button>
        </div>
      </div>

      {/* Recommended Mentors */}
      <div>
        <h4 className="text-xl font-bold text-white mb-6">Recommended Mentors</h4>
        <div className="grid md:grid-cols-2 gap-6">
          {mentors.map(mentor => (
            <div key={mentor.id} className="bg-[#15171c] border border-white/5 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-20 h-20 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
                <UserCircle size={40} className="text-muted-foreground" />
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-lg text-white">{mentor.name}</h4>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                    <Star size={14} className="fill-yellow-400" /> {mentor.rating}
                  </div>
                </div>
                <p className="text-sm text-primary font-medium mb-4">{mentor.role}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {mentor.expertise.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-muted-foreground">{skill}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={14} /> {mentor.availability}
                  </div>
                  <button className="bg-white text-black px-6 py-2 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors">
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Session */}
      <div className="bg-gradient-to-r from-[#1c1f26] to-[#15171c] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Calendar size={32} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">System Design Mock Interview</h4>
            <p className="text-sm text-muted-foreground">with Michael Chang • Tomorrow at 10:00 AM PST</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="flex-1 md:flex-none border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/5 transition-colors">
            Reschedule
          </button>
          <button className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            Join Call
          </button>
        </div>
      </div>

    </motion.div>
  );
}
