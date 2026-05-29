import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, User, Info, AlertCircle, Calendar, 
  Check, CheckSquare, Clock, Trash2, ShieldAlert, Briefcase, RefreshCw, UserPlus
} from 'lucide-react';
import { useSocket } from '../../../hooks/useSocket';
import { notificationsApi, type Notification } from '../../../api/notifications.api';

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { socket } = useSocket();

  // Fetch notifications from the database
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsApi.getNotifications();
      // Ensure we get an array
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Listen to socket events for real-time delivery
  useEffect(() => {
    if (!socket) return;

    socket.on('notification', (payload: any) => {
      const newNotif: Notification = {
        id: Date.now(), // Synthetic ID for UI key
        user_id: 0,
        title: payload.title || 'Notification',
        type: payload.type,
        message: payload.message,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => {
      socket.off('notification');
    };
  }, [socket]);

  // Mark a single notification as read
  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Helper to determine notification metadata (icons, backgrounds, titles)
  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'session_invite':
        return {
          title: 'Mentorship Session Invite',
          icon: <User className="text-blue-400" size={20} />,
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        };
      case 'session_created':
      case 'new_session':
        return {
          title: 'New Mentorship Session',
          icon: <Calendar className="text-emerald-400" size={20} />,
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        };
      case 'session_updated':
        return {
          title: 'Session Updates',
          icon: <Info className="text-purple-400" size={20} />,
          bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
        };
      case 'session_deleted':
        return {
          title: 'Session Cancelled',
          icon: <AlertCircle className="text-red-400" size={20} />,
          bg: 'bg-red-500/10 border-red-500/20 text-red-400',
        };
      case 'new_referral':
        return {
          title: 'New Referral Posted',
          icon: <Briefcase className="text-cyan-400" size={20} />,
          bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        };
      case 'referral_status_update':
        return {
          title: 'Application Status Updated',
          icon: <RefreshCw className="text-indigo-400" size={20} />,
          bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        };
      case 'new_user':
        return {
          title: 'New User Joined',
          icon: <UserPlus className="text-orange-400" size={20} />,
          bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        };
      default:
        return {
          title: 'Notification',
          icon: <Bell className="text-orange-400" size={20} />,
          bg: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        };
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto px-4 md:px-0 pb-16 space-y-8"
    >
      {/* Header and Mark All */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h3 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bell className="text-primary w-8 h-8" />
            Notification Center
          </h3>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Keep track of your upcoming mentorship invites, meetings, events, and community updates in real time.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMarkAllAsRead}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-colors shadow-lg"
          >
            <CheckSquare size={16} />
            Mark all as read
          </motion.button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading notifications...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4 max-w-2xl mx-auto">
          <ShieldAlert size={24} className="shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && notifications.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-24 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md space-y-4"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Bell size={28} />
          </div>
          <h4 className="text-xl font-bold text-white">All Caught Up!</h4>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">
            You don't have any notifications at the moment. We'll alert you when something happens!
          </p>
        </motion.div>
      )}

      {/* Dynamic List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif) => {
              const config = getNotificationConfig(notif.type);
              
              return (
                <motion.div 
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className={`group relative p-6 rounded-3xl border transition-all flex items-start gap-5 backdrop-blur-md ${
                    notif.is_read 
                      ? 'bg-[#15171c]/50 border-white/5 opacity-75' 
                      : 'bg-[#15171c]/90 border-white/10 shadow-2xl hover:border-white/20'
                  }`}
                >
                  {/* Subtle decorative glow for unread notifications */}
                  {!notif.is_read && (
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary rounded-l-3xl shadow-[0_0_15px_rgba(255,98,10,0.8)]" />
                  )}

                  {/* Icon Circle */}
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner ${config.bg}`}>
                    {config.icon}
                  </div>

                  {/* Message Details */}
                  <div className="flex-1 pt-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-[10px] uppercase font-extrabold tracking-wider ${
                        notif.is_read ? 'text-muted-foreground' : 'text-primary'
                      }`}>
                        {config.title}
                      </span>
                      
                      <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>

                    <h4 className={`text-base leading-snug break-words ${
                      notif.is_read ? 'text-muted-foreground font-medium' : 'text-white font-bold'
                    }`}>
                      {notif.message}
                    </h4>
                  </div>

                  {/* Actions */}
                  {!notif.is_read && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/20 shadow-md shrink-0 self-center"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
