import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, Share2, Search, Plus } from 'lucide-react';

export default function CommunityTab() {
  const posts = [
    {
      id: 1,
      author: 'Jogendra Sravani',
      role: 'Alumni',
      avatar: 'J',
      content: 'Just successfully deployed our new microservices architecture at Google! The key was breaking down our monolith gradually rather than doing a big bang rewrite. Happy to answer any questions about the transition strategy for students looking to understand real-world enterprise architecture.',
      likes: 45,
      comments: 12,
      tags: ['Engineering', 'Architecture', 'Advice'],
      time: '2 hours ago'
    },
    {
      id: 2,
      author: 'Jane Doe',
      role: 'Student',
      avatar: 'D',
      content: 'Looking for advice on how to structure a resume for entry-level React roles. Should I focus more on projects or my coursework? Would love any templates or examples if anyone is willing to share!',
      likes: 12,
      comments: 8,
      tags: ['Career Advice', 'Resume'],
      time: '5 hours ago'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header & Post Composer */}
      <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
            U
          </div>
          <div className="flex-1 space-y-3">
            <input 
              type="text" 
              placeholder="Start a discussion or ask a question..." 
              className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                  + Add Tags
                </button>
              </div>
              <button className="bg-primary hover:bg-brand-600 text-white font-bold py-2 px-6 rounded-xl transition-colors text-sm">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Filters */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex gap-2">
          {['Recent', 'Popular', 'My Cohort', 'Career Advice'].map((filter, i) => (
            <button key={filter} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${i === 0 ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}>
              {filter}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input type="text" placeholder="Search discussions..." className="bg-[#1c1f26] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-64" />
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  {post.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm leading-tight">{post.author}</h4>
                  <p className="text-xs text-muted-foreground">{post.role} • {post.time}</p>
                </div>
              </div>
            </div>
            
            <p className="text-white text-sm leading-relaxed mb-4">{post.content}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-muted-foreground">{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-6 border-t border-white/5 pt-4">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                <ThumbsUp size={16} /> {post.likes}
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 transition-colors text-sm font-medium">
                <MessageSquare size={16} /> {post.comments}
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-medium ml-auto">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
