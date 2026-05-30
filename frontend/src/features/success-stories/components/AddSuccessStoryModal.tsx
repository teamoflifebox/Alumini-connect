import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { successStoriesApi } from '../../../api/success-stories.api';
import { X, Upload, Loader2, Newspaper, BookOpen, Quote } from 'lucide-react';
import { uploadFile } from '../../community/api'; // Reuse image upload
import { useAuth } from '../../../hooks/useAuth';

interface AddSuccessStoryModalProps {
  onClose: () => void;
}

export const AddSuccessStoryModal = ({ onClose }: AddSuccessStoryModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    alumniName: '',
    alumniDesignation: '',
    imageUrl: '',
    category: 'story'
  });
  const [isUploading, setIsUploading] = useState(false);
  const { isAdmin } = useAuth();

  const createMutation = useMutation({
    mutationFn: successStoriesApi.createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['success-stories'] });
      onClose();
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.alumniName) {
      alert('Please fill in the required fields.');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#15171c] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">{isAdmin ? 'Add Story / News / Blog' : 'Add Success Story'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="story-form" onSubmit={handleSubmit} className="space-y-5">
            {isAdmin && (
              <div className="flex gap-4">
                {['story', 'news', 'blog'].map((cat) => (
                  <label key={cat} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.category === cat ? 'bg-[#ea580c]/10 border-[#ea580c] text-[#ea580c]' : 'bg-[#1c1f26] border-white/10 text-muted-foreground hover:bg-white/5'}`}>
                    <input type="radio" name="category" value={cat} checked={formData.category === cat} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="hidden" />
                    {cat === 'story' && <Quote size={16} />}
                    {cat === 'news' && <Newspaper size={16} />}
                    {cat === 'blog' && <BookOpen size={16} />}
                    <span className="font-bold capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Headline / Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                placeholder="e.g. From Campus to Google: The Journey of Jane Doe"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Alumni Name *</label>
                <input
                  type="text"
                  value={formData.alumniName}
                  onChange={e => setFormData(prev => ({ ...prev, alumniName: e.target.value }))}
                  className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.alumniDesignation}
                  onChange={e => setFormData(prev => ({ ...prev, alumniDesignation: e.target.value }))}
                  className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                  placeholder="Senior Engineer at Google"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Cover Image</label>
              {formData.imageUrl ? (
                <div className="relative rounded-xl overflow-hidden h-48 border border-white/10 group">
                  <img src={formData.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-bold transition-colors"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground opacity-50 mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isUploading ? 'Uploading...' : 'Click to upload cover image'}
                    </p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Story Content *</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full bg-[#1c1f26] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[200px] resize-y placeholder:text-gray-600"
                placeholder="Share the struggles, experiences, and suggestions..."
                required
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/10 bg-[#12141a] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-white border border-white/10 hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="story-form"
            disabled={createMutation.isPending || isUploading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-[0_0_20px_rgba(255,98,10,0.3)] transition-all flex items-center gap-2"
          >
            {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            Publish Story
          </button>
        </div>
      </div>
    </div>
  );
};
