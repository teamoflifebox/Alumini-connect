import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, UserCircle } from 'lucide-react';
import { useSocket } from '../../../hooks/useSocket';
import { useAuthStore } from '../../../store/authStore';

interface Message {
  id: string;
  sender_id: number;
  sender_name: string;
  content: string;
  timestamp: string;
}

interface MentorshipChatProps {
  sessionId: number;
}

export default function MentorshipChat({ sessionId }: MentorshipChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const { socket, sendChatMessage } = useSocket();
  const { user } = useAuthStore();
  const currentUserId = user ? Number(user.id) : null;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('chat_message', handleMessage);

    return () => {
      socket.off('chat_message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(sessionId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex flex-col h-96 bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <h4 className="text-sm font-bold text-white">Live Session Chat</h4>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
            No messages yet. Be the first to say hello!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id || idx}
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <UserCircle size={18} className="text-white/70" />
                </div>
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-muted-foreground mb-1 px-1">
                    {msg.sender_name} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-white/10 text-white rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-primary text-white p-2.5 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
