import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, User, Info, AlertCircle, Calendar } from 'lucide-react';
import { useSocket } from '../../../hooks/useSocket';
import { notificationsApi, type Notification } from '../../../api/notifications.api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { socket } = useSocket();

  // Initial fetch
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationsApi.getNotifications();
        setNotifications(data);
        const unread = await notificationsApi.getUnreadCount();
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;
    
    socket.on('notification', (payload: any) => {
      // Build a synthetic notification to show immediately without refetching
      const newNotif: Notification = {
        id: Date.now(), // temporary ID
        user_id: 0,
        title: payload.title || 'Notification',
        type: payload.type,
        message: payload.message,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('notification');
    };
  }, [socket]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'session_invite': return <User size={16} className="text-blue-500" />;
      case 'session_created': return <Calendar size={16} className="text-emerald-500" />;
      case 'session_updated': return <Info size={16} className="text-purple-500" />;
      case 'session_deleted': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-b border-gray-100 backdrop-blur-md">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="px-4 py-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Bell size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">You're all caught up!</p>
                  <p className="text-xs text-gray-400 mt-1">No new notifications at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`relative flex gap-4 p-4 transition-colors hover:bg-gray-50 group ${!notif.is_read ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Unread indicator dot */}
                      {!notif.is_read && (
                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}

                      <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                        {getIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium leading-snug">
                          {notif.message}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-400 mt-1.5 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(notif.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>

                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 h-fit bg-white border border-gray-200 rounded-md text-gray-400 hover:text-blue-600 hover:border-blue-200 shadow-sm"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-100 p-2 text-center">
              <button className="text-xs font-semibold text-gray-500 hover:text-gray-800">
                View notification settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
