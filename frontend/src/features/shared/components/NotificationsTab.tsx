import { motion } from 'framer-motion';
import { Bell, Briefcase, MessageSquare, Heart, Calendar } from 'lucide-react';

export default function NotificationsTab() {
  const notifications = [
    {
      id: 1,
      type: 'job',
      title: 'New Job Match: Senior Frontend Engineer at Google',
      time: '10 minutes ago',
      read: false,
      icon: <Briefcase className="text-blue-400" size={20} />,
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 2,
      type: 'community',
      title: 'Jane Doe replied to your discussion post about React architecture.',
      time: '2 hours ago',
      read: false,
      icon: <MessageSquare className="text-emerald-400" size={20} />,
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 3,
      type: 'event',
      title: 'Reminder: Alumni Reunion 2026 starts tomorrow!',
      time: '1 day ago',
      read: true,
      icon: <Calendar className="text-purple-400" size={20} />,
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 4,
      type: 'donation',
      title: 'Thank you for your $500 contribution to the Scholarship Fund.',
      time: '3 days ago',
      read: true,
      icon: <Heart className="text-pink-400" size={20} />,
      bg: 'bg-pink-500/10 border-pink-500/20'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-bold text-white flex items-center gap-3">
          <Bell className="text-primary" size={32} /> Notifications
        </h3>
        <button className="text-sm font-semibold text-muted-foreground hover:text-white transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map(notif => (
          <div key={notif.id} className={`p-6 rounded-2xl border transition-colors flex items-start gap-4 ${notif.read ? 'bg-[#12141a] border-white/5 opacity-80' : 'bg-[#15171c] border-white/10 shadow-xl'}`}>
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${notif.bg}`}>
              {notif.icon}
            </div>
            <div className="flex-1 pt-1">
              <h4 className={`text-base leading-tight mb-1 ${notif.read ? 'text-muted-foreground font-medium' : 'text-white font-bold'}`}>
                {notif.title}
              </h4>
              <p className="text-xs text-muted-foreground font-medium">{notif.time}</p>
            </div>
            {!notif.read && (
              <div className="w-3 h-3 rounded-full bg-primary mt-3 shrink-0 shadow-[0_0_10px_rgba(255,98,10,0.5)]" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
