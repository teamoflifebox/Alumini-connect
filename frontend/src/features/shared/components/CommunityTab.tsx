import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, TrendingUp, MessageSquare, Plus, ChevronLeft, Image, Link, FileText, Send, MoreHorizontal, ThumbsUp, Share2, Award, Clock, ChevronRight } from 'lucide-react';

export default function CommunityTab() {
  const [activeCommunity, setActiveCommunity] = useState<any | null>(null);

  const yourCommunities = [
    { id: 1, name: 'Placement Preparation', members: 1240, active: 340, recentActivity: '2 mins ago', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop' },
    { id: 2, name: 'AI & ML Enthusiasts', members: 890, active: 120, recentActivity: '15 mins ago', image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=600&auto=format&fit=crop' },
    { id: 3, name: 'Class of 2026', members: 4500, active: 890, recentActivity: '1 min ago', image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=600&auto=format&fit=crop' },
  ];

  const discoverCommunities = [
    { id: 4, name: 'Startup Founders', description: 'Network with alumni who have successfully built and scaled startups. Get funding advice and pitch reviews.', tags: ['Entrepreneurship', 'Funding'], members: 450, image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=600&auto=format&fit=crop' },
    { id: 5, name: 'Cybersecurity Hub', description: 'Discuss the latest vulnerabilities, certifications, and career paths in infosec.', tags: ['Security', 'Tech'], members: 620, image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop' },
    { id: 6, name: 'Higher Studies Abroad', description: 'Guidance for GRE, TOEFL, university selection, and scholarship opportunities.', tags: ['Masters', 'Admissions'], members: 2100, image: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=600&auto=format&fit=crop' },
    { id: 7, name: 'Open Source', description: 'Collaborate on university open-source projects and prepare for GSoC.', tags: ['Development', 'GSoC'], members: 1100, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop' },
  ];

  const trendingDiscussions = [
    { id: 1, title: 'Backend roadmap for placements 2026', author: 'Michael Chang', role: 'Alumni (Google)', comments: 45, likes: 120, time: '2 hours ago' },
    { id: 2, title: 'Resume review thread - Drop your PDFs here', author: 'Sarah Jenkins', role: 'Recruiter (Microsoft)', comments: 128, likes: 340, time: '5 hours ago' },
    { id: 3, title: 'My Google Interview Experience (L3)', author: 'David Kumar', role: 'Alumni (Google)', comments: 89, likes: 450, time: '1 day ago' },
  ];

  const communityPosts = [
    {
      id: 1,
      author: 'Jogendra Sravani',
      role: 'Alumni (Google)',
      avatar: 'J',
      content: 'Just successfully deployed our new microservices architecture! The key was breaking down our monolith gradually rather than doing a big bang rewrite. Happy to answer any questions about the transition strategy for students looking to understand real-world enterprise architecture.',
      likes: 45,
      comments: 12,
      time: '2 hours ago',
      isMentor: true
    },
    {
      id: 2,
      author: 'Jane Doe',
      role: 'Student (3rd Year)',
      avatar: 'D',
      content: 'Looking for advice on how to structure a resume for entry-level React roles. Should I focus more on projects or my coursework? Would love any templates or examples if anyone is willing to share!',
      likes: 12,
      comments: 8,
      time: '5 hours ago',
      isMentor: false
    }
  ];

  if (activeCommunity) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-6xl mx-auto flex gap-6 pb-12">
        {/* Main Feed Column */}
        <div className="flex-1 space-y-6">
          <button onClick={() => setActiveCommunity(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-2">
            <ChevronLeft size={16} /> Back to Communities
          </button>

          {/* Community Header */}
          <div className="bg-[#15171c] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <div className="h-48 overflow-hidden relative">
              <img src={activeCommunity.image} alt={activeCommunity.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#15171c] to-transparent" />
            </div>
            <div className="p-8 relative -mt-16 z-10 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{activeCommunity.name}</h2>
                <p className="text-muted-foreground mb-4 max-w-2xl">{activeCommunity.description || 'A dedicated space for students and alumni to collaborate.'}</p>
                <div className="flex items-center gap-4 text-sm font-medium text-white/70">
                  <span className="flex items-center gap-1"><Users size={16} className="text-blue-400" /> {activeCommunity.members} Members</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> 120 Online</span>
                </div>
              </div>
              <button className="bg-primary hover:bg-brand-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,98,10,0.3)]">
                Leave Community
              </button>
            </div>
          </div>

          {/* Post Composer */}
          <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                U
              </div>
              <div className="flex-1 space-y-4">
                <textarea 
                  rows={3}
                  placeholder="Share career guidance, opportunities, discussions, or updates with your community..." 
                  className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button className="p-2 text-muted-foreground hover:bg-white/5 hover:text-blue-400 rounded-lg transition-colors" title="Add Image">
                      <Image size={20} />
                    </button>
                    <button className="p-2 text-muted-foreground hover:bg-white/5 hover:text-purple-400 rounded-lg transition-colors" title="Add Link">
                      <Link size={20} />
                    </button>
                    <button className="p-2 text-muted-foreground hover:bg-white/5 hover:text-orange-400 rounded-lg transition-colors" title="Add Document">
                      <FileText size={20} />
                    </button>
                  </div>
                  <button className="bg-white text-black hover:bg-neutral-200 font-bold py-2 px-6 rounded-xl transition-colors flex items-center gap-2">
                    <Send size={16} /> Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {communityPosts.map(post => (
              <div key={post.id} className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${post.isMentor ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white border border-white/10'}`}>
                      {post.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white leading-tight flex items-center gap-2">
                        {post.author} 
                        {post.isMentor && <Award size={14} className="text-blue-400" title="Verified Mentor" />}
                      </h4>
                      <p className="text-xs text-muted-foreground">{post.role} • {post.time}</p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-white p-1">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <p className="text-white text-sm leading-relaxed mb-6 whitespace-pre-line">{post.content}</p>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                      <ThumbsUp size={18} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 transition-colors text-sm font-medium">
                      <MessageSquare size={18} /> {post.comments}
                    </button>
                  </div>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-medium">
                    <Share2 size={18} /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0 space-y-6">
          <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-emerald-400" size={18} /> Top Contributors
            </h4>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white">M</div>
                  <div>
                    <h5 className="text-sm font-bold text-white group-hover:text-primary transition-colors">Michael Chang</h5>
                    <p className="text-xs text-muted-foreground">Alumni (Meta)</p>
                  </div>
                  <button className="ml-auto text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded">Follow</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl">
            <h4 className="font-bold text-white mb-4">Upcoming Events</h4>
            <div className="space-y-4">
              <div className="border-l-2 border-primary pl-3 py-1 cursor-pointer group">
                <h5 className="text-sm font-bold text-white group-hover:text-primary transition-colors">System Design AMA</h5>
                <p className="text-xs text-muted-foreground mt-1">Tomorrow, 10:00 AM</p>
              </div>
              <div className="border-l-2 border-blue-500 pl-3 py-1 cursor-pointer group">
                <h5 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Resume Review Workshop</h5>
                <p className="text-xs text-muted-foreground mt-1">Friday, 4:00 PM</p>
              </div>
            </div>
          </div>
        </aside>
      </motion.div>
    );
  }

  // LANDING PAGE (Discoverability Dashboard)
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-12 pb-12">
      
      {/* Top Header / Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Network Communities</h2>
          <p className="text-muted-foreground">Discover professional groups, connect with alumni, and engage in specific domains.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search communities, topics, or people..." 
            className="w-full bg-[#15171c] border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-colors shadow-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Your Communities & Trending */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Users className="text-blue-400" size={20} /> Your Communities
              </h3>
              <button className="text-primary text-sm font-semibold hover:text-white transition-colors">See all</button>
            </div>
            <div className="space-y-4">
              {yourCommunities.map(comm => (
                <div key={comm.id} onClick={() => setActiveCommunity(comm)} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                    <img src={comm.image} alt={comm.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{comm.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{comm.members.toLocaleString()} members</p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {comm.active} active now
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#15171c] border border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <TrendingUp className="text-purple-400" size={20} /> Trending Discussions
              </h3>
            </div>
            <div className="space-y-4">
              {trendingDiscussions.map(disc => (
                <div key={disc.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] cursor-pointer transition-colors">
                  <h4 className="font-bold text-white text-sm mb-2 leading-tight">{disc.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{disc.author} • {disc.role}</p>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1"><MessageSquare size={12} /> {disc.comments} replies</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={12} /> {disc.likes}</span>
                    <span className="ml-auto text-white/40"><Clock size={12} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Discover Communities Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-white">Discover Communities</h3>
            <button className="text-muted-foreground text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
              Explore more <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {discoverCommunities.map(comm => (
              <div key={comm.id} className="bg-[#15171c] border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-white/10 transition-colors flex flex-col group cursor-pointer" onClick={() => setActiveCommunity(comm)}>
                <div className="h-32 overflow-hidden relative">
                  <img src={comm.image} alt={comm.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15171c] to-transparent" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 className="text-lg font-bold text-white mb-2">{comm.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{comm.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {comm.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/5 rounded-lg text-xs font-medium text-white/70">{tag}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-sm font-semibold text-muted-foreground">{comm.members.toLocaleString()} members</span>
                    <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </motion.div>
  );
}
