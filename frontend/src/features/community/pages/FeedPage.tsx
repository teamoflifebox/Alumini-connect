import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image, Video, FileText, Send, Heart, MessageSquare, Share2, MoreHorizontal } from 'lucide-react';
import { getFeed, createPost, toggleLike } from '../api';
import type { Post } from '../types';

export const FeedPage = () => {
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => getFeed(1, 20)
  });

  const createPostMutation = useMutation({
    mutationFn: (content: string) => createPost(content),
    onSuccess: () => {
      setNewPostContent('');
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    createPostMutation.mutate(newPostContent);
  };

  const toggleLikeMutation = useMutation({
    mutationFn: (postId: number) => toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Create Post Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0"></div>
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-900 dark:text-white placeholder-gray-500"
            placeholder="Start a post..."
            rows={3}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          ></textarea>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Image className="w-5 h-5 text-blue-500" />
              <span className="hidden sm:inline font-medium text-sm">Media</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-green-500" />
              <span className="hidden sm:inline font-medium text-sm">Video</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <FileText className="w-5 h-5 text-orange-500" />
              <span className="hidden sm:inline font-medium text-sm">Article</span>
            </button>
          </div>
          <button 
            onClick={handlePostSubmit}
            disabled={!newPostContent.trim() || createPostMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-full font-medium transition-colors flex items-center gap-2"
          >
            Post
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feed Divider */}
      <div className="flex items-center gap-4 mb-6">
        <hr className="flex-1 border-gray-200 dark:border-gray-700" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort by: Top</span>
        <hr className="flex-1 border-gray-200 dark:border-gray-700" />
      </div>

      {/* Feed List */}
      <div className="space-y-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 animate-pulse h-48 border border-gray-100 dark:border-gray-700"></div>
          ))
        ) : (
          data?.data?.map((post: Post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt={post.author_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 flex items-center justify-center">
                        <span className="font-bold text-blue-600 dark:text-blue-300">{post.author_name?.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white leading-tight hover:text-blue-600 cursor-pointer">{post.author_name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{post.author_role}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-50">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>

                {post.image_url && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                    <img src={post.image_url} alt="Post media" className="w-full object-cover max-h-96" />
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center gap-4 mt-4 py-2 border-b border-gray-100 dark:border-gray-700 text-sm text-gray-500">
                  <span>{post.likes_count} Likes</span>
                  <span>{post.comments_count} Comments</span>
                </div>

                {/* Post Actions */}
                <div className="flex gap-1 mt-2">
                  <button 
                    onClick={() => toggleLikeMutation.mutate(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${post.is_liked ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                  >
                    <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                    Like
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    Comment
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
