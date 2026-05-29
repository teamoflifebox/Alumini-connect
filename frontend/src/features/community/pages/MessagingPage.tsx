import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Send, Image as ImageIcon, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { getConversations, getMessages, saveMessage, markAsRead } from '../api';
import { useCommunityStore } from '../store';
import { useAuthStore } from '../../../store/authStore';

export const MessagingPage = () => {
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { socket, connectSocket, disconnectSocket } = useCommunityStore();

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket]);

  const { data: conversations, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => getMessages(activeConversationId!),
    enabled: !!activeConversationId
  });

  useEffect(() => {
    if (activeConversationId && socket) {
      socket.emit('join_conversation', activeConversationId);
      markAsRead(activeConversationId);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      const handleNewMessage = (msg: any) => {
        if (msg.conversation_id === activeConversationId) {
          queryClient.setQueryData(['messages', activeConversationId], (old: any) => [...(old || []), msg]);
          if (msg.sender_id !== user?.id) {
             markAsRead(activeConversationId);
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

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => saveMessage(activeConversationId!, content),
    onSuccess: () => {
      setNewMessage('');
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;
    sendMessageMutation.mutate(newMessage);
  };

  const activeConversation = conversations?.find((c: any) => c.id === activeConversationId);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      {/* Sidebar - Conversations */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messaging</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search messages..."
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            conversations?.map((conv: any) => (
              <div 
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-4 flex gap-3 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800/50 ${activeConversationId === conv.id ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="relative">
                  {conv.other_user_avatar ? (
                    <img src={conv.other_user_avatar} alt={conv.other_user_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="font-bold text-blue-600 dark:text-blue-300">{conv.other_user_name?.charAt(0)}</span>
                    </div>
                  )}
                  {/* Status dot could go here */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`font-semibold truncate ${!conv.last_message_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {conv.other_user_name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${!conv.last_message_read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                    {conv.last_message || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        {activeConversationId ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                {activeConversation?.other_user_avatar ? (
                  <img src={activeConversation.other_user_avatar} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="font-bold text-blue-600 dark:text-blue-300">{activeConversation?.other_user_name?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{activeConversation?.other_user_name}</h3>
                  <p className="text-xs text-green-500 font-medium">Online</p>
                </div>
              </div>
              <div className="flex gap-4 text-gray-400">
                <button className="hover:text-blue-600 transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="hover:text-blue-600 transition-colors"><Video className="w-5 h-5" /></button>
                <button className="hover:text-gray-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900/50 space-y-6">
              {loadingMessages ? (
                <div className="flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
              ) : (
                messages?.map((msg: any) => {
                  const isMe = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-tl-sm'}`}>
                        <p>{msg.content}</p>
                        <span className={`text-[10px] mt-1 block ${isMe ? 'text-blue-100 text-right' : 'text-gray-400'}`}>
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
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <form onSubmit={handleSend} className="flex items-end gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 max-h-32 min-h-[44px] resize-none py-3 text-gray-900 dark:text-white"
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
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <Send className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Your Messages</h3>
            <p className="mt-2">Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};
