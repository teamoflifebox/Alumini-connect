import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Send, Image as ImageIcon, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { getConversations, getMessages, saveMessage, markAsRead } from '../../community/api';
import { useCommunityStore } from '../../community/store';
import { useAuthStore } from '../../../store/authStore';
import { motion } from 'framer-motion';

export default function MessagingTab() {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { socket } = useCommunityStore();

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => getMessages(activeConversationId!),
    enabled: !!activeConversationId
  });

  // Separate effect to mark messages as read reliably
  useEffect(() => {
    if (activeConversationId) {
      const initializeChat = async () => {
        try {
          await markAsRead(activeConversationId);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        } catch (e) {
          console.error('Failed to mark read', e);
        }
      };
      initializeChat();
    }
  }, [activeConversationId, queryClient]);

  // Socket effect for real-time messaging
  useEffect(() => {
    if (activeConversationId && socket) {
      socket.emit('join_conversation', activeConversationId);

      const handleNewMessage = async (msg: any) => {
        if (msg.conversation_id == activeConversationId) {
          queryClient.setQueryData(['messages', activeConversationId], (old: any) => {
            if (!old) return [msg];
            // Prevent duplicate messages by checking id
            const exists = old.some((m: any) => m.id === msg.id);
            return exists ? old : [...old, msg];
          });
          if (msg.sender_id != user?.id) {
             await markAsRead(activeConversationId);
          }
        }
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      };

      socket.on('receive_message', handleNewMessage);
      
      return () => {
        socket.emit('leave_conversation', activeConversationId);
        socket.off('receive_message', handleNewMessage);
      };
    }
  }, [activeConversationId, socket, queryClient, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleOpenConv = (e: any) => {
      if (e.detail?.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        setActiveConversationId(e.detail.conversationId);
      }
    };
    window.addEventListener('open-conversation', handleOpenConv);
    return () => window.removeEventListener('open-conversation', handleOpenConv);
  }, [queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => saveMessage(activeConversationId!, content),
    onSuccess: (newMsg) => {
      setNewMessage('');
      // Instantly inject the new message into the cache
      if (newMsg) {
        queryClient.setQueryData(['messages', activeConversationId], (old: any) => {
          if (!old) return [newMsg];
          const exists = old.some((m: any) => m.id === newMsg.id);
          return exists ? old : [...old, newMsg];
        });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;
    sendMessageMutation.mutate(newMessage);
  };

  const activeConversation = conversations?.find((c: any) => c.id === activeConversationId);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-10rem)] flex overflow-hidden bg-[#15171c] border border-white/5 rounded-3xl shadow-xl">
      {/* Sidebar - Conversations */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-white/5 bg-[#101216]">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search messages..."
              className="w-full bg-[#1c1f26] border border-white/5 pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-primary text-white transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-2 animate-pulse">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl"></div>
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                    <div className="h-3 bg-white/5 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No conversations yet. Start connecting!
            </div>
          ) : (
            conversations?.map((conv: any) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-5 flex gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors border-b border-white/5 ${activeConversationId === conv.id ? 'bg-white/[0.04] border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="relative">
                  {conv.other_user_avatar ? (
                    <img src={conv.other_user_avatar} alt={conv.other_user_name} className="w-14 h-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="font-bold text-primary text-xl">{conv.other_user_name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`font-semibold truncate ${!conv.last_message_read && Number(conv.unread_count) > 0 ? 'text-white' : 'text-gray-400'}`}>
                      {conv.other_user_name}
                    </h4>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-sm truncate ${!conv.last_message_read && Number(conv.unread_count) > 0 ? 'font-medium text-white' : 'text-muted-foreground'}`}>
                      {conv.last_message || 'No messages yet'}
                    </p>
                    {Number(conv.unread_count) > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(255,98,10,0.4)]">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeConversationId ? 'hidden md:flex' : 'flex'} bg-[#15171c]`}>
        {activeConversationId ? (
          <>
            {/* Chat Header */}
            <div className="px-8 py-5 border-b border-white/5 bg-[#15171c] flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                {activeConversation?.other_user_avatar ? (
                  <img src={activeConversation.other_user_avatar} className="w-12 h-12 rounded-2xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="font-bold text-primary text-lg">{activeConversation?.other_user_name?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white text-lg">{activeConversation?.other_user_name}</h3>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex gap-3 text-muted-foreground">
                <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"><Video className="w-5 h-5" /></button>
                <button className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white flex items-center justify-center transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 bg-[#09090b]/50 space-y-6">
              {loadingMessages ? (
                <div className="flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
              ) : (
                messages?.map((msg: any) => {
                  const isMe = msg.sender_id == user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-6 py-4 shadow-xl overflow-hidden ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-[#1c1f26] text-white border border-white/5 rounded-tl-sm'}`}>
                        <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                        <span className={`text-[10px] mt-2 block font-medium ${isMe ? 'text-white/70 text-right' : 'text-muted-foreground'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[#15171c] border-t border-white/5">
              <form onSubmit={handleSend} className="flex items-end gap-3 bg-[#1c1f26] p-2 rounded-2xl border border-white/10 focus-within:border-primary transition-all shadow-lg">
                <button type="button" className="p-3 text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button type="button" className="p-3 text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 max-h-32 min-h-[44px] resize-none py-3 px-2 text-white placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="p-3.5 bg-primary hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0 shadow-[0_0_15px_rgba(255,98,10,0.4)]"
                >
                  <Send className="w-5 h-5 ml-1 mb-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/10">
              <Send className="w-10 h-10 text-white/20 ml-2 mb-2" />
            </div>
            <h3 className="text-2xl font-bold text-white">Your Messages</h3>
            <p className="mt-2 text-sm">Select a conversation or start a new one to connect</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
