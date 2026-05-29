import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Users, TrendingUp, MessageSquare, Plus, Image, Link, FileText, Send, MoreHorizontal, ThumbsUp, Share2, Award, Clock, Heart, Lightbulb, Trophy, Smile, Flame, ArrowLeft, SendHorizontal, Trash2, X, Settings } from 'lucide-react';
import { getFeed, createPost, toggleLike, getGroups, joinGroup, getTrendingDiscussions, createGroup, deleteGroup, addComment, getComments, searchProfiles, uploadFile, getGroupMembers, removeGroupMember, toggleCommentLike, getPost, leaveGroup, reportGroup } from '../../community/api';
import type { Post } from '../../community/types';
import { useAuthStore } from '../../../store/authStore';

const REACTIONS = [
  { icon: ThumbsUp, label: 'Like', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: Flame, label: 'Inspiring', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: Trophy, label: 'Congrats', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { icon: Lightbulb, label: 'Helpful', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { icon: Heart, label: 'Support', color: 'text-red-400', bg: 'bg-red-400/10' }
];

const PostComments = ({ postId }: { postId: number }) => {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId)
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: number) => toggleCommentLike(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    }
  });

  const addReplyMutation = useMutation({
    mutationFn: ({ parentId, content }: { parentId: number, content: string }) => addComment(postId, content, parentId),
    onSuccess: () => {
      setReplyContent('');
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    }
  });

  if (isLoading) return <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">Loading comments...</div>;
  if (!comments || comments.length === 0) return null;

  const topLevelComments = comments.filter((c: any) => !c.parent_id);
  const replies = comments.filter((c: any) => c.parent_id);

  const renderComment = (comment: any, isReply: boolean = false) => {
    const commentReplies = replies.filter((r: any) => r.parent_id === comment.id);
    
    return (
      <div key={comment.id} className={`flex gap-3 ${isReply ? 'mt-3 ml-8 border-l-2 border-white/5 pl-4' : 'mt-4'}`}>
        {comment.author_avatar ? (
          <img src={comment.author_avatar} alt={comment.author_name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {comment.author_name?.charAt(0) || 'U'}
          </div>
        )}
        <div className="flex-1">
          <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 relative mb-1">
            <h5 className="font-bold text-white text-xs mb-1">{comment.author_name}</h5>
            <p className="text-white/80 text-xs leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 px-2 mb-2">
            <button 
              onClick={() => likeCommentMutation.mutate(comment.id)}
              disabled={likeCommentMutation.isPending}
              className={`text-[10px] font-bold transition-colors flex items-center gap-1 ${comment.is_liked ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}
            >
              <ThumbsUp size={10} className={comment.is_liked ? 'fill-current' : ''} />
              {comment.is_liked ? 'Liked' : 'Like'}
            </button>
            {!isReply && (
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-[10px] font-bold text-muted-foreground hover:text-white transition-colors"
              >
                Reply
              </button>
            )}
            <span className="text-[10px] text-white/30">•</span>
            <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>

          {replyingTo === comment.id && (
            <div className="flex gap-2 mt-2 mb-4 animate-in fade-in slide-in-from-top-2">
              <input 
                type="text" 
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..." 
                className="flex-1 bg-[#1c1f26] border border-white/10 rounded-full pl-4 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && replyContent.trim()) {
                    addReplyMutation.mutate({ parentId: comment.id, content: replyContent });
                  }
                }}
              />
              <button 
                onClick={() => addReplyMutation.mutate({ parentId: comment.id, content: replyContent })}
                disabled={!replyContent.trim() || addReplyMutation.isPending}
                className="p-1.5 text-primary hover:text-brand-400 disabled:opacity-50"
              >
                <SendHorizontal size={14} />
              </button>
            </div>
          )}

          {commentReplies.map(reply => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {topLevelComments.map(c => renderComment(c, false))}
    </div>
  );
};

const PostDetailView = ({ postId, onBack }: { postId: number; onBack: () => void }) => {
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId)
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pb-12 pt-4">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold w-fit"
      >
        <ArrowLeft size={16} /> Back to Feed
      </button>

      <div className="bg-[#15171c] border border-white/10 rounded-2xl w-full shadow-2xl relative">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground animate-pulse">Loading post...</div>
        ) : post ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt={post.author_name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-white shadow-inner">
                    {post.author_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-base leading-tight flex items-center gap-1.5">
                    {post.author_name}
                    {post.author_role === 'alumni' && <Award size={14} className="text-primary" title="Alumni" />}
                  </h4>
                  <p className="text-xs text-muted-foreground capitalize">{post.author_role} • {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <p className="text-white/90 text-base leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

            {post.image_url && (
              <div className="mb-6 rounded-xl overflow-hidden border border-white/10 bg-[#1c1f26]">
                {post.image_url.match(/\.(pdf|doc|docx|ppt|pptx)$/i) ? (
                  <div className="relative w-full" style={{ height: '500px' }}>
                    <iframe 
                      src={post.image_url.endsWith('.pdf') ? post.image_url : `https://docs.google.com/gview?url=${encodeURIComponent(post.image_url)}&embedded=true`}
                      className="w-full h-full border-none"
                      title="Document Viewer"
                    />
                    <a 
                      href={post.image_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                    >
                      <FileText size={14} /> Download File
                    </a>
                  </div>
                ) : post.image_url.match(/\.(txt|csv|xls|xlsx)$/i) ? (
                  <a href={post.image_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Attached Document</p>
                      <p className="text-xs text-muted-foreground">Click to view or download</p>
                    </div>
                  </a>
                ) : (
                  <img src={post.image_url} alt="Post media" className="w-full object-cover max-h-[500px]" />
                )}
              </div>
            )}
            
            <div className="border-t border-white/10 pt-6">
              <h4 className="font-bold text-white mb-4">Comments</h4>
              <PostComments postId={post.id} />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">Post not found</div>
        )}
      </div>
    </motion.div>
  );
};

export default function CommunityTab() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState('Standard');
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null);
  
  // Create Group Modal State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', description: '', tags: '' });

  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [trendingComments, setTrendingComments] = useState<{[key: number]: string}>({});
  const [activeTrendingPostId, setActiveTrendingPostId] = useState<number | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState('');
  
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showManageMembersModal, setShowManageMembersModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['feed', activeGroupId],
    queryFn: () => getFeed(1, 20, activeGroupId || undefined)
  });

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups
  });

  const { data: trending } = useQuery({
    queryKey: ['trending_discussions'],
    queryFn: getTrendingDiscussions
  });

  const { data: suggestedAlumni } = useQuery({
    queryKey: ['suggested_alumni'],
    queryFn: () => searchProfiles({ role: 'alumni', limit: 3 })
  });

  const { data: groupMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['group_members', activeGroupId],
    queryFn: () => activeGroupId ? getGroupMembers(activeGroupId) : [],
    enabled: !!activeGroupId && showManageMembersModal
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; type: string; imageUrl: string; groupId?: number }) => 
      createPost(data.content, data.type, data.imageUrl, data.groupId),
    onSuccess: () => {
      setNewPostContent('');
      setUploadedMediaUrl('');
      queryClient.invalidateQueries({ queryKey: ['feed', activeGroupId] });
    }
  });

  const handlePostSubmit = () => {
    if (!newPostContent.trim() && !uploadedMediaUrl) return;
    const finalContent = postType !== 'Standard' ? `[${postType}] ${newPostContent}` : newPostContent;
    createPostMutation.mutate({ content: finalContent, type: postType === 'Standard' ? 'text' : postType.toLowerCase(), imageUrl: uploadedMediaUrl, groupId: activeGroupId || undefined });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setUploadedMediaUrl(url);
    } catch (err) {
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const renderContentWithHashtags = (text: string) => {
    return text.split(/(#[a-zA-Z0-9_]+)/g).map((part, index) => {
      if (part.startsWith('#')) {
        return <span key={index} className="text-primary hover:underline cursor-pointer">{part}</span>;
      }
      return part;
    });
  };

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: number) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed', activeGroupId] });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: number, content: string }) => addComment(postId, content),
    onSuccess: (_, variables) => {
      setCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['feed', activeGroupId] });
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
    }
  });

  const handleCommentSubmit = (postId: number) => {
    if (!commentContent.trim()) return;
    addCommentMutation.mutate({ postId, content: commentContent });
  };

  const handleTrendingCommentSubmit = (postId: number) => {
    const content = trendingComments[postId];
    if (!content?.trim()) return;
    addCommentMutation.mutate({ postId, content });
    setTrendingComments(prev => ({ ...prev, [postId]: '' }));
    setActiveTrendingPostId(null);
  };

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: number) => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: any) => createGroup(data),
    onSuccess: () => {
      setShowCreateGroupModal(false);
      setNewGroupData({ name: '', description: '', tags: '' });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => deleteGroup(groupId),
    onSuccess: () => {
      setActiveGroupId(null);
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => leaveGroup(groupId),
    onSuccess: () => {
      setActiveGroupId(null);
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const reportGroupMutation = useMutation({
    mutationFn: (groupId: number) => reportGroup(groupId),
    onSuccess: (data) => {
      if (data.banned) {
        alert('This group has received too many reports and has been automatically banned.');
        setActiveGroupId(null);
        queryClient.invalidateQueries({ queryKey: ['groups'] });
      } else if (data.reported === false) {
        alert('You have already reported this group.');
      } else {
        alert('Group reported successfully.');
      }
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => activeGroupId ? removeGroupMember(activeGroupId, userId) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group_members', activeGroupId] });
    }
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupData.name || !newGroupData.description) return;
    const tagsArray = newGroupData.tags.split(',').map(t => t.trim()).filter(t => t);
    createGroupMutation.mutate({
      name: newGroupData.name,
      description: newGroupData.description,
      tags: tagsArray
    });
  };

  const myGroups = groups?.filter((g: any) => g.is_member) || [];
  const discoverGroups = groups?.filter((g: any) => !g.is_member) || [];

  if (selectedPostId) {
    return <PostDetailView postId={selectedPostId} onBack={() => setSelectedPostId(null)} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Network Communities</h2>
          <p className="text-muted-foreground">Discover professional groups, connect with alumni, and engage in specific domains.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search communities, topics, or people..."
              className="w-full bg-[#15171c] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowCreateGroupModal(true)}
            className="bg-primary hover:bg-brand-600 text-white px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> Create Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Profile & Your Communities */}
        <div className="space-y-6 lg:col-span-1">
          {/* Mini Profile */}
          <div className="bg-[#15171c] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-16 bg-gradient-to-r from-primary/40 to-brand-600/40 w-full relative">
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-[#15171c] bg-primary/20 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                   <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar"/>
                ) : (
                  <span className="font-bold text-xl text-primary">{user?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
            </div>
            <div className="pt-10 pb-4 px-4 text-center">
              <h3 className="font-bold text-white text-lg">{user?.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'User'}</p>
            </div>
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'directory' }))}
              className="border-t border-white/5 py-3 px-4 flex justify-between items-center text-sm hover:bg-white/5 cursor-pointer transition-colors"
            >
              <span className="text-muted-foreground">Connections</span>
              <span className="text-primary font-bold">Manage</span>
            </div>
          </div>

          {/* Your Communities */}
          <div className="bg-[#15171c] border border-white/5 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm"><Users size={16} className="text-primary"/> Your Groups</h3>
            </div>
            <div className="space-y-3">
              {loadingGroups ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl"></div>)}
                </div>
              ) : myGroups.length > 0 ? (
                myGroups.map((group: any) => (
                  <div 
                    key={group.id} 
                    onClick={() => setActiveGroupId(group.id)}
                    className={`flex items-center gap-3 cursor-pointer p-2 -mx-2 rounded-xl transition-colors ${activeGroupId === group.id ? 'bg-primary/20' : 'hover:bg-white/5'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-gradient-to-br ${group.color} text-white`}>
                      {group.name.charAt(0)}
                    </div>
                    <div className="flex-1 truncate">
                      <h4 className={`font-bold text-xs truncate ${activeGroupId === group.id ? 'text-primary' : 'text-white'}`}>{group.name}</h4>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">You haven't joined any groups yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column - Composer & Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Discover Communities Grid (Only show if not inside a specific group) */}
          {!activeGroupId && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Discover Communities</h3>
                <button className="text-sm text-muted-foreground hover:text-white flex items-center gap-1">Explore more <MoreHorizontal size={14}/></button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {loadingGroups ? (
                  [1, 2].map(i => <div key={i} className="h-48 bg-[#15171c] border border-white/5 rounded-3xl animate-pulse"></div>)
                ) : discoverGroups.map((group: any) => (
                  <div key={group.id} className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl hover:border-white/10 transition-all flex flex-col group relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-24 bg-gradient-to-b ${group.color} opacity-50`}></div>
                    <div className="relative z-10 flex-1">
                      <h4 className="font-bold text-lg text-white mb-2">{group.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{group.description}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {group.tags?.map((tag: string, j: number) => (
                          <span key={j} className="text-[11px] font-medium px-2 py-1 bg-white/5 rounded-md text-white/70">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <span className="text-xs text-muted-foreground">{group.members_count} members</span>
                      <button 
                        onClick={() => joinGroupMutation.mutate(group.id)}
                        disabled={joinGroupMutation.isPending}
                        className="px-4 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold rounded-lg text-sm transition-colors border border-primary/20 hover:border-primary disabled:opacity-50"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
                {discoverGroups.length === 0 && !loadingGroups && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    You've joined all available communities!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Group Banner if active */}
          {activeGroupId && groups && (
            (() => {
              const activeGroup = groups.find((g: any) => g.id === activeGroupId);
              if (!activeGroup) return null;
              return (
                <div className="bg-[#15171c] border border-white/5 rounded-3xl shadow-xl relative overflow-hidden mb-6">
                  <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-r ${activeGroup.color} opacity-30`}></div>
                  <div className="relative z-10 p-6 pt-12">
                    <div className="flex items-end gap-4">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl bg-gradient-to-br ${activeGroup.color} text-white shadow-2xl border-4 border-[#15171c]`}>
                        {activeGroup.name.charAt(0)}
                      </div>
                      <div className="pb-1">
                        <h2 className="text-2xl font-bold text-white mb-1">{activeGroup.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Users size={14} /> {activeGroup.members_count} members</span>
                          <span>•</span>
                          <span className="text-primary font-bold">You are a member</span>
                        </div>
                      </div>
                      
                      {Number(activeGroup.creator_id) === Number(user?.id) ? (
                        <div className="ml-auto mb-1 flex items-center gap-2">
                          <button 
                            onClick={() => setShowManageMembersModal(true)}
                            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                            title="Manage Members"
                          >
                            <Settings size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm('Are you sure you want to delete this community? This cannot be undone.')) {
                                deleteGroupMutation.mutate(activeGroup.id);
                              }
                            }}
                            disabled={deleteGroupMutation.isPending}
                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-colors border border-red-500/20 disabled:opacity-50"
                            title="Delete Community"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="ml-auto mb-1 flex items-center gap-2">
                          <button 
                            onClick={() => {
                              if(window.confirm('Are you sure you want to leave this community?')) {
                                leaveGroupMutation.mutate(activeGroup.id);
                              }
                            }}
                            disabled={leaveGroupMutation.isPending}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors border border-white/10"
                          >
                            Leave Group
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm('Report this group for inappropriate content?')) {
                                reportGroupMutation.mutate(activeGroup.id);
                              }
                            }}
                            disabled={reportGroupMutation.isPending}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors border border-red-500/20"
                            title="Report Group"
                          >
                            <Flame size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {!activeGroupId && (
            <div className="flex items-center gap-4 py-4">
              <hr className="flex-1 border-white/10" />
              <span className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
                <MessageSquare size={16} className="text-primary"/> 
                Global Feed
              </span>
              <hr className="flex-1 border-white/10" />
            </div>
          )}
          
          {activeGroupId && (
            <div className="flex items-center gap-4 py-2 mb-2">
              <button 
                onClick={() => setActiveGroupId(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                <ArrowLeft size={16} /> Back to Global Feed
              </button>
            </div>
          )}

          {/* Post Composer */}
          <div className="bg-[#15171c] border border-white/5 rounded-2xl p-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex gap-3 relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 shadow-inner">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 space-y-3">
                <textarea 
                  rows={2}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Start a post, ask a question, or share an achievement..." 
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-inner placeholder:text-muted-foreground"
                />
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-1">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
                    <select 
                      value={postType} 
                      onChange={e => setPostType(e.target.value)}
                      className="bg-[#1c1f26] text-xs text-white border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer mr-2"
                    >
                      <option value="Standard">Standard Post</option>
                      <option value="Achievement">🎉 Achievement</option>
                      <option value="Ask Alumni">💡 Ask Alumni</option>
                      <option value="Poll">📊 Poll</option>
                    </select>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-muted-foreground hover:bg-white/5 hover:text-blue-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold" title="Add Media"
                    >
                      <Image size={16} /> <span className="hidden sm:inline">Media/Doc</span>
                    </button>
                  </div>
                  
                  {uploadedMediaUrl && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary font-bold">
                      <Image size={14} /> File Attached
                      <button onClick={() => setUploadedMediaUrl('')} className="hover:text-white"><X size={14} /></button>
                    </div>
                  )}

                  <button 
                    onClick={handlePostSubmit}
                    disabled={(!newPostContent.trim() && !uploadedMediaUrl) || createPostMutation.isPending || isUploading}
                    className="bg-primary hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-full text-sm transition-all flex items-center gap-2 ml-auto"
                  >
                    {isUploading ? 'Uploading...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed List */}
          <div className="space-y-4">
            {isLoading ? (
               [1, 2, 3].map(i => (
                <div key={i} className="bg-[#15171c] border border-white/5 rounded-2xl p-6 h-40 animate-pulse shadow-xl" />
              ))
            ) : (
              data?.data?.map((post: Post) => (
                <div key={post.id} id={`post-${post.id}`} className="bg-[#15171c] border border-white/5 rounded-2xl p-5 shadow-xl hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt={post.author_name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                          {post.author_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                          {post.author_name}
                          {post.author_role === 'alumni' && <Award size={12} className="text-primary" title="Alumni" />}
                        </h4>
                        <p className="text-[11px] text-muted-foreground capitalize">{post.author_role} • {new Date(post.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  
                  <p className="text-white/90 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{renderContentWithHashtags(post.content)}</p>

                  {post.image_url && (
                    <div className="mb-4 rounded-xl overflow-hidden border border-white/10 bg-[#1c1f26]">
                      {post.image_url.match(/\.(pdf|doc|docx|ppt|pptx)$/i) ? (
                        <div className="relative w-full" style={{ height: '500px' }}>
                          <iframe 
                            src={post.image_url.endsWith('.pdf') ? post.image_url : `https://docs.google.com/gview?url=${encodeURIComponent(post.image_url)}&embedded=true`}
                            className="w-full h-full border-none"
                            title="Document Viewer"
                          />
                          <a 
                            href={post.image_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                          >
                            <FileText size={14} /> Download File
                          </a>
                        </div>
                      ) : post.image_url.match(/\.(txt|csv|xls|xlsx)$/i) ? (
                        <a href={post.image_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">Attached Document</p>
                            <p className="text-xs text-muted-foreground">Click to view or download</p>
                          </div>
                        </a>
                      ) : (
                        <img src={post.image_url} alt="Post media" className="w-full object-cover max-h-96" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-6 border-t border-white/5 pt-3 relative">
                    <div 
                      className="relative"
                      onMouseEnter={() => setHoveredPostId(post.id)}
                      onMouseLeave={() => setHoveredPostId(null)}
                    >
                      {/* Advanced Reactions Hover Menu */}
                      {hoveredPostId === post.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: -45, scale: 1 }}
                          className="absolute -top-1 left-0 flex items-center gap-2 bg-[#1c1f26] border border-white/10 rounded-full px-3 py-2 shadow-2xl z-20"
                        >
                          {REACTIONS.map((reaction, idx) => {
                            const Icon = reaction.icon;
                            return (
                              <button 
                                key={idx}
                                onClick={() => { 
                                  if (!post.is_liked) toggleLikeMutation.mutate(post.id); 
                                  setHoveredPostId(null); 
                                }}
                                className={`p-2 rounded-full hover:${reaction.bg} hover:scale-110 transition-all group relative`}
                                title={reaction.label}
                              >
                                <Icon size={20} className={reaction.color} />
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                      
                      <button 
                        onClick={() => toggleLikeMutation.mutate(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${post.is_liked ? 'text-primary' : 'text-muted-foreground hover:text-primary hover:bg-white/5 py-1.5 px-3 rounded-lg -ml-3'}`}
                      >
                        <ThumbsUp size={16} className={post.is_liked ? 'fill-current' : ''} /> 
                        {post.likes_count}
                      </button>
                    </div>
                    <button 
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-blue-400 transition-colors text-xs font-semibold"
                    >
                      <MessageSquare size={16} /> {post.comments_count}
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);
                        alert('Link copied to clipboard!');
                      }}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors text-xs font-semibold ml-auto"
                    >
                      <Share2 size={16} /> Share
                    </button>
                  </div>

                  {/* Comment Section */}
                  {activeCommentPostId === post.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-white/5"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                          {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCommentSubmit(post.id);
                            }}
                            placeholder="Write a comment..." 
                            className="w-full bg-[#1c1f26] border border-white/10 rounded-full pl-4 pr-10 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                          />
                          <button 
                            onClick={() => handleCommentSubmit(post.id)}
                            disabled={!commentContent.trim() || addCommentMutation.isPending}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-brand-400 disabled:opacity-50 transition-colors"
                          >
                            <SendHorizontal size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Render Comments */}
                      <PostComments postId={post.id} />
                    </motion.div>
                  )}
                </div>
              ))
            )}

            {data?.data?.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No posts yet</h3>
                <p className="text-sm text-muted-foreground">Be the first to start a conversation!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Discover & Trending */}
        <div className="space-y-6 lg:col-span-1">
          {/* Trending Discussions */}
          <div className="bg-[#15171c] border border-white/5 rounded-2xl p-4 shadow-xl">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4 text-sm"><TrendingUp size={16} className="text-purple-400"/> Trending Now</h3>
            <div className="space-y-3">
              {!trending ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl"></div>)}
                </div>
              ) : trending.map((disc: any) => (
                <div 
                  key={disc.post_id} 
                  className="group relative" 
                >
                  <div className="cursor-pointer" onClick={() => setSelectedPostId(disc.post_id)}>
                    <h4 className="font-bold text-white/90 text-xs mb-1 line-clamp-2 group-hover:text-primary transition-colors">{disc.title}</h4>
                    <p className="text-[10px] text-muted-foreground mb-1 capitalize">{disc.author_name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-medium">{disc.replies || 0} replies</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTrendingPostId(activeTrendingPostId === disc.post_id ? null : disc.post_id);
                        }}
                        className="text-[10px] text-primary hover:text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Quick Reply
                      </button>
                    </div>
                  </div>
                  
                  {activeTrendingPostId === disc.post_id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 pt-2 border-t border-white/5 relative"
                    >
                      <input 
                        type="text" 
                        value={trendingComments[disc.post_id] || ''}
                        onChange={(e) => setTrendingComments(prev => ({ ...prev, [disc.post_id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleTrendingCommentSubmit(disc.post_id);
                        }}
                        placeholder="Join the fanwar..." 
                        className="w-full bg-[#1c1f26] border border-white/10 rounded-full pl-3 pr-8 py-1.5 text-[10px] text-white focus:outline-none focus:border-primary transition-colors"
                        autoFocus
                      />
                      <button 
                        onClick={() => handleTrendingCommentSubmit(disc.post_id)}
                        disabled={!trendingComments[disc.post_id]?.trim() || addCommentMutation.isPending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-brand-400 disabled:opacity-50 transition-colors mt-1"
                      >
                        <SendHorizontal size={12} />
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Discover Communities Grid */}
          <div className="bg-[#15171c] border border-white/5 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">Suggested Groups</h3>
            </div>
            
            <div className="space-y-4">
              {loadingGroups ? (
                [1, 2].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>)
              ) : discoverGroups.slice(0, 3).map((group: any) => (
                <div key={group.id} className="flex gap-3">
                   <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-bold text-sm bg-gradient-to-br ${group.color} text-white`}>
                      {group.name.charAt(0)}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-white text-xs truncate">{group.name}</h4>
                     <p className="text-[10px] text-muted-foreground mb-1">{group.members_count} members</p>
                     <button 
                      onClick={() => joinGroupMutation.mutate(group.id)}
                      disabled={joinGroupMutation.isPending}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full text-[10px] transition-colors border border-white/10 hover:border-white/20 disabled:opacity-50"
                    >
                      Join
                    </button>
                   </div>
                </div>
              ))}
              {discoverGroups.length === 0 && !loadingGroups && (
                <div className="text-center text-xs text-muted-foreground py-2">
                  No new groups to join.
                </div>
              )}
            </div>
          </div>

          {/* Connect & Mentor Suggestions */}
          <div className="bg-[#15171c] border border-white/5 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">Alumni to Follow</h3>
            </div>
            <div className="space-y-4">
              {suggestedAlumni?.data?.map((person: any) => (
                <div key={person.user_id} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm text-white border border-white/10 overflow-hidden">
                    {person.avatar_url ? (
                      <img src={person.avatar_url} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      person.name?.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">{person.name}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{person.headline || `${person.department} Alumni`}</p>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.setItem('pendingProfileView', person.user_id.toString());
                      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'directory' }));
                    }}
                    className="text-xs font-bold bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full transition-colors border border-white/10"
                  >
                    View
                  </button>
                </div>
              ))}
              {!suggestedAlumni?.data?.length && (
                <div className="text-center text-xs text-muted-foreground py-2">No suggestions available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#15171c] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-2xl font-bold text-white mb-6 relative z-10">Create a Community</h3>
            
            <form onSubmit={handleCreateGroup} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Community Name</label>
                <input 
                  type="text" 
                  value={newGroupData.name}
                  onChange={e => setNewGroupData({...newGroupData, name: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Frontend Masters"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Description</label>
                <textarea 
                  value={newGroupData.description}
                  onChange={e => setNewGroupData({...newGroupData, description: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none h-24"
                  placeholder="What is this community about?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={newGroupData.tags}
                  onChange={e => setNewGroupData({...newGroupData, tags: e.target.value})}
                  className="w-full bg-[#1c1f26] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="React, Design, Tech"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createGroupMutation.isPending}
                  className="flex-1 bg-primary hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg"
                >
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showManageMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#15171c] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-2xl font-bold text-white">Manage Members</h3>
              <button onClick={() => setShowManageMembersModal(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 relative z-10 custom-scrollbar">
              {loadingMembers ? (
                <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : groupMembers?.length > 0 ? (
                groupMembers.map((member: any) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 bg-[#1c1f26] border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm text-white">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          {member.name}
                          {member.group_role === 'admin' && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">{member.primary_role}</p>
                      </div>
                    </div>
                    
                    {member.user_id !== user?.id && (
                      <button 
                        onClick={() => {
                          if(window.confirm(`Are you sure you want to remove ${member.name}?`)) {
                            removeMemberMutation.mutate(member.user_id);
                          }
                        }}
                        disabled={removeMemberMutation.isPending}
                        className="p-2 text-red-400 hover:bg-red-400/10 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove Member"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-4">No members found.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
