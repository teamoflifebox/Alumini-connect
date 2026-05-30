import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { successStoriesApi } from '../../../api/success-stories.api';
import { useAuth } from '../../../hooks/useAuth';
import { AddSuccessStoryModal } from '../components/AddSuccessStoryModal';
import { Plus, Trash2, BookOpen, Clock, Users, Globe, Building2, Award, ArrowRight, Quote, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SuccessStoriesPage = ({ standalone = false }: { standalone?: boolean }) => {
  const { isAdmin, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: stories, isLoading } = useQuery({
    queryKey: ['success-stories'],
    queryFn: successStoriesApi.getStories
  });

  const deleteMutation = useMutation({
    mutationFn: successStoriesApi.deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['success-stories'] });
    }
  });

  const handleShareStory = () => {
    if (isAuthenticated) {
      setIsModalOpen(true);
    } else {
      navigate('/login');
    }
  };

  const featuredStory = stories?.[0];
  const moreStories = stories?.slice(1) || [];

  const uniqueRoles = new Set(stories?.map(s => s.alumni_designation)).size || 0;
  const recentStories = stories?.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0;

  const containerClass = standalone 
    ? "bg-[#09090b] min-h-screen text-white overflow-x-hidden pt-20" // added pt-20 for navbar if standalone
    : "w-full text-white";

  const innerContainerClass = standalone ? "max-w-7xl mx-auto px-6" : "w-full";

  return (
    <div className={containerClass}>
      {/* HERO SECTION */}
      <section className="relative p-8 md:p-10 overflow-hidden bg-gradient-to-br from-[#ea580c] to-[#9a3412] rounded-3xl mb-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className={`${innerContainerClass} relative z-10 px-0`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/30 bg-white/10 text-white text-[10px] font-bold tracking-widest uppercase mb-4 shadow-sm">
                <Globe size={12} /> Our Alumni
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-[1.1] text-white">
                Success Stories<br />
                <span className="text-white/80">That Inspire</span>
              </h1>
              <p className="text-base text-white/90 mb-6 leading-relaxed font-medium">
                Discover how our alumni are making a monumental impact across the globe and building a better tomorrow.
              </p>
              <button
                onClick={handleShareStory}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-[#ea580c] hover:bg-neutral-100 rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] font-bold text-sm group"
              >
                Share Your Story
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 w-full md:w-auto mt-6 md:mt-0">
              {[
                { icon: Users, label: 'Published Stories', value: stories?.length || 0 },
                { icon: Building2, label: 'Unique Roles', value: uniqueRoles },
                { icon: Award, label: 'New This Month', value: recentStories },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 border border-white/20 shadow-md">
                    <stat.icon size={16} className="text-white" />
                  </div>
                  <div className="text-xl font-extrabold text-white mb-0.5">{stat.value}</div>
                  <div className="text-[10px] font-medium text-white/80 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className={`${innerContainerClass} pb-12 relative z-20`}>
        
        {isLoading ? (
          <div className="animate-pulse bg-[#15171c] rounded-3xl h-[500px] shadow-2xl border border-white/5" />
        ) : stories?.length === 0 ? (
          <div className="text-center py-32 bg-[#15171c] rounded-3xl border border-white/5 shadow-2xl">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-30 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">The Canvas is Empty</h3>
            <p className="text-lg text-muted-foreground mb-8">Be the first to share your journey and inspire the next generation.</p>
            <button onClick={handleShareStory} className="px-8 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)]">
              Write the First Story
            </button>
          </div>
        ) : (
          <>
            {/* FEATURED STORY */}
            {featuredStory && (
              <div className="bg-[#15171c] rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col lg:flex-row mb-8 group relative lg:max-h-72">
                <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-[#ea580c]/10 to-transparent blur-[80px] pointer-events-none" />
                
                <div className="lg:w-[35%] h-56 lg:h-auto relative overflow-hidden shrink-0">
                  {featuredStory.image_url ? (
                    <img src={featuredStory.image_url} alt={featuredStory.alumni_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#ea580c] to-[#9a3412] flex items-center justify-center">
                      <BookOpen size={48} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <div className="bg-[#ea580c] text-white text-[9px] font-bold px-2 py-1 rounded shadow uppercase tracking-wider">
                      Featured {featuredStory.category === 'news' ? 'News' : featuredStory.category === 'blog' ? 'Blog' : 'Story'}
                    </div>
                  </div>
                </div>

                <div className="lg:w-[65%] p-6 lg:p-8 flex flex-col justify-center relative z-10">
                  <h2 className="text-xl font-bold text-white mb-1 leading-tight line-clamp-1">
                    {featuredStory.alumni_name}
                  </h2>
                  <p className="text-[#ea580c] text-xs font-bold mb-4">
                    {featuredStory.alumni_designation}
                  </p>
                  
                  <div className="relative mb-4">
                    <Quote size={18} className="text-white/5 absolute -top-1 -left-1" />
                    <p className="text-sm text-white/90 leading-relaxed font-medium italic relative z-10 line-clamp-2">
                      "{featuredStory.title}"
                    </p>
                  </div>
                  
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
                    {featuredStory.content}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                      {new Date(featuredStory.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                    </span>
                    {isAdmin && (
                      <button onClick={() => {
                        if (window.confirm('Delete featured story?')) deleteMutation.mutate(featuredStory.id);
                      }} className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MORE STORIES GRID */}
            {moreStories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">More Stories & Updates</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {moreStories.map((story) => (
                    <div key={story.id} className="bg-[#12141a] rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(234,88,12,0.15)] hover:border-[#ea580c]/30 transition-all duration-300 border border-white/5 flex flex-col group relative">
                      
                      <div className="h-48 relative overflow-hidden">
                        {story.image_url ? (
                          <img src={story.image_url} alt={story.alumni_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#ea580c]/20 to-[#9a3412]/20 flex items-center justify-center">
                             <BookOpen size={40} className="text-[#ea580c]/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-transparent opacity-80" />
                        
                        {story.category && story.category !== 'story' && (
                          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase tracking-wider border border-white/20">
                            {story.category === 'news' ? <Newspaper size={10} /> : <BookOpen size={10} />}
                            {story.category}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col relative z-10 -mt-8">
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-white leading-tight mb-1">{story.alumni_name}</h4>
                          <p className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">{story.alumni_designation}</p>
                        </div>
                        
                        <h3 className="text-base font-semibold text-white/90 mb-3 line-clamp-2 group-hover:text-[#ea580c] transition-colors">
                          {story.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                          {story.content}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                          <div className="flex items-center text-xs font-bold text-white/30 uppercase tracking-wider gap-1.5">
                            <Clock size={12} />
                            {new Date(story.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </div>
                          
                          {isAdmin && (
                            <button onClick={() => {
                              if (window.confirm('Delete story?')) deleteMutation.mutate(story.id);
                            }} className="text-red-500/70 hover:text-red-400 p-1.5 rounded-full hover:bg-red-500/10 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* LOWER CTA */}
      <section className={`${innerContainerClass} pb-8`}>
        {/* Words That Inspire Section */}
        {stories && stories.length > 0 && (
          <div className="mb-8 flex flex-col lg:flex-row gap-6 items-start">
            <div className="lg:w-1/4">
              <h3 className="text-xl font-bold text-white mb-1.5">Words That<br/><span className="text-[#ea580c]">Inspire</span></h3>
              <div className="flex items-start gap-1.5 mt-2 text-muted-foreground">
                <Quote className="text-[#ea580c] shrink-0" size={16} />
                <p className="text-xs">Success is not just about personal achievements but about lifting others along the way.</p>
              </div>
            </div>
            
            <div className="lg:w-3/4 flex flex-col md:flex-row gap-4 bg-[#12141a] rounded-2xl p-5 border border-white/5 relative shadow-sm">
              <div className="md:w-1/2 relative flex items-center p-2">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border border-white/10">
                    {stories[0].image_url ? (
                      <img src={stories[0].image_url} alt={stories[0].alumni_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#ea580c] flex items-center justify-center font-bold text-lg text-white">
                        {stories[0].alumni_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white/90 italic mb-2 text-xs font-medium leading-relaxed line-clamp-2">
                      "{stories[0].content}"
                    </p>
                    <h5 className="font-bold text-xs text-white">{stories[0].alumni_name}</h5>
                    <p className="text-[10px] text-[#ea580c]">{stories[0].alumni_designation}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 grid grid-cols-3 grid-rows-2 gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-white/5 overflow-hidden border border-white/5">
                    {stories[i % stories.length]?.image_url ? (
                      <img src={stories[i % stories.length].image_url} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Gallery" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {isModalOpen && <AddSuccessStoryModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
