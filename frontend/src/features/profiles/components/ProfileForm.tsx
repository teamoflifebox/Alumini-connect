import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Briefcase, GraduationCap, Link2, MapPin, Phone, User, Settings, Save, AlertCircle } from 'lucide-react';
import { profilesApi } from '../../../api/profiles.api';

export default function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    headline: '',
    bio: '',
    phone: '',
    address: { street: '', city: '', state: '', country: '', zip: '' },
    emergency_contacts: [] as any[],
    target_roles: [] as string[],
    skills: [] as string[],
    work_experience: [] as any[],
    education: [] as any[],
    social_links: { linkedin: '', github: '', portfolio: '' },
    is_open_to_work: true,
    is_mentor_available: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profilesApi.getProfile();
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            ...res.data,
            address: res.data.address || prev.address,
            social_links: res.data.social_links || prev.social_links,
            emergency_contacts: res.data.emergency_contacts || prev.emergency_contacts,
            target_roles: res.data.target_roles || prev.target_roles,
            skills: res.data.skills || prev.skills,
            work_experience: res.data.work_experience || prev.work_experience,
            education: res.data.education || prev.education,
          }));
        }
      } catch (err: any) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent as keyof typeof prev] as any, [field]: value }
    }));
  };

  const handleArrayChange = (field: 'skills' | 'target_roles', value: string) => {
    const arr = formData[field];
    if (value && !arr.includes(value)) {
      setFormData(prev => ({ ...prev, [field]: [...arr, value] }));
    }
  };

  const removeArrayItem = (field: 'skills' | 'target_roles', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      work_experience: [...prev.work_experience, { company: '', role: '', start_date: '', end_date: '', current: false, description: '' }]
    }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...formData.work_experience];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, work_experience: updated }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({ ...prev, work_experience: prev.work_experience.filter((_, i) => i !== index) }));
  };
  
  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', major: '', year: new Date().getFullYear(), cgpa: '' }]
    }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, education: updated }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts, { name: '', relation: '', phone: '' }]
    }));
  };

  const updateEmergencyContact = (index: number, field: string, value: any) => {
    const updated = [...formData.emergency_contacts];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, emergency_contacts: updated }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({ ...prev, emergency_contacts: prev.emergency_contacts.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await profilesApi.updateProfile(formData);
      // Success feedback could be a toast in a real app
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || 'Failed to save profile. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Profile...</div>;
  }

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* 1. Personal Information */}
      <section className="bg-[#15171c] border border-white/5 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <User className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Personal Information</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">First Name</label>
            <input value={formData.first_name} onChange={e => handleChange('first_name', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="John" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Name</label>
            <input value={formData.last_name} onChange={e => handleChange('last_name', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Doe" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Professional Headline</label>
            <input value={formData.headline} onChange={e => handleChange('headline', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Aspiring Software Engineer | B.Tech Computer Science" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</label>
            <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={4} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none" placeholder="Tell us about your background and aspirations..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Phone size={14}/> Phone Number</label>
            <input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </section>

      {/* 2. Location & Address */}
      <section className="bg-[#15171c] border border-white/5 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <MapPin className="text-blue-500" size={24} />
          <h3 className="text-xl font-bold text-white">Location & Address</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Street Address</label>
            <input value={formData.address.street} onChange={e => handleNestedChange('address', 'street', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="123 Main St, Apt 4B" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</label>
            <input value={formData.address.city} onChange={e => handleNestedChange('address', 'city', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="San Francisco" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">State / Province</label>
            <input value={formData.address.state} onChange={e => handleNestedChange('address', 'state', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="CA" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Country</label>
            <input value={formData.address.country} onChange={e => handleNestedChange('address', 'country', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="USA" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zip / Postal Code</label>
            <input value={formData.address.zip} onChange={e => handleNestedChange('address', 'zip', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="94105" />
          </div>
        </div>
      </section>

      {/* 3. Professional Info */}
      <section className="bg-[#15171c] border border-white/5 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <Briefcase className="text-emerald-500" size={24} />
          <h3 className="text-xl font-bold text-white">Professional Information</h3>
        </div>
        
        {/* Skills & Target Roles */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Skills</label>
            <div className="flex gap-2 mb-3">
              <input type="text" id="skillInput" className="flex-1 bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. React, Python" onKeyDown={(e) => { if (e.key === 'Enter') { handleArrayChange('skills', e.currentTarget.value); e.currentTarget.value = ''; } }} />
              <button onClick={() => { const el = document.getElementById('skillInput') as HTMLInputElement; handleArrayChange('skills', el.value); el.value = ''; }} className="px-4 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors font-bold"><Plus size={16}/></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, i) => (
                <span key={i} className="flex items-center gap-1 bg-[#1c1f26] border border-white/10 text-xs text-white px-3 py-1.5 rounded-lg">
                  {skill} <X size={12} className="cursor-pointer text-muted-foreground hover:text-red-400" onClick={() => removeArrayItem('skills', i)} />
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Target Roles</label>
            <div className="flex gap-2 mb-3">
              <input type="text" id="roleInput" className="flex-1 bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="e.g. Data Scientist" onKeyDown={(e) => { if (e.key === 'Enter') { handleArrayChange('target_roles', e.currentTarget.value); e.currentTarget.value = ''; } }} />
              <button onClick={() => { const el = document.getElementById('roleInput') as HTMLInputElement; handleArrayChange('target_roles', el.value); el.value = ''; }} className="px-4 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors font-bold"><Plus size={16}/></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.target_roles.map((role, i) => (
                <span key={i} className="flex items-center gap-1 bg-[#1c1f26] border border-white/10 text-xs text-white px-3 py-1.5 rounded-lg">
                  {role} <X size={12} className="cursor-pointer text-muted-foreground hover:text-red-400" onClick={() => removeArrayItem('target_roles', i)} />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Work Experience */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-bold text-white">Work Experience</label>
            <button onClick={addExperience} className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1"><Plus size={14}/> Add Experience</button>
          </div>
          <div className="space-y-4">
            {formData.work_experience.map((exp, i) => (
              <div key={i} className="p-5 border border-white/5 rounded-2xl bg-[#1c1f26] relative group">
                <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={16}/></button>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Company</label>
                    <input value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. Tech Corp" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Role</label>
                    <input value={exp.role} onChange={e => updateExperience(i, 'role', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. Intern" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Start Date</label>
                    <input type="month" value={exp.start_date} onChange={e => updateExperience(i, 'start_date', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">End Date</label>
                    <input type="month" disabled={exp.current} value={exp.end_date || ''} onChange={e => updateExperience(i, 'end_date', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 [color-scheme:dark]" />
                    <div className="mt-1 flex items-center gap-2">
                      <input type="checkbox" id={`curr-${i}`} checked={exp.current} onChange={e => updateExperience(i, 'current', e.target.checked)} className="accent-emerald-500" />
                      <label htmlFor={`curr-${i}`} className="text-xs text-muted-foreground">I currently work here</label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
                    <textarea value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} rows={2} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none" placeholder="What did you do?" />
                  </div>
                </div>
              </div>
            ))}
            {formData.work_experience.length === 0 && (
              <div className="text-center p-6 border border-dashed border-white/10 rounded-2xl">
                <p className="text-sm text-muted-foreground">No work experience added yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Education */}
      <section className="bg-[#15171c] border border-white/5 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <GraduationCap className="text-purple-500" size={24} />
          <h3 className="text-xl font-bold text-white">Education</h3>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-bold text-white">Degrees & Certifications</label>
          <button onClick={addEducation} className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center gap-1"><Plus size={14}/> Add Education</button>
        </div>
        <div className="space-y-4">
          {formData.education.map((edu, i) => (
            <div key={i} className="p-5 border border-white/5 rounded-2xl bg-[#1c1f26] relative group">
              <button onClick={() => removeEducation(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={16}/></button>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Institution</label>
                  <input value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" placeholder="e.g. University of Example" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Degree</label>
                  <input value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" placeholder="e.g. Bachelor's" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Major</label>
                  <input value={edu.major} onChange={e => updateEducation(i, 'major', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" placeholder="e.g. Computer Science" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Graduation Year</label>
                  <input type="number" value={edu.year} onChange={e => updateEducation(i, 'year', parseInt(e.target.value))} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">CGPA / Grade</label>
                  <input value={edu.cgpa} onChange={e => updateEducation(i, 'cgpa', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" placeholder="e.g. 3.8/4.0" />
                </div>
              </div>
            </div>
          ))}
          {formData.education.length === 0 && (
            <div className="text-center p-6 border border-dashed border-white/10 rounded-2xl">
              <p className="text-sm text-muted-foreground">No education history added yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Emergency Contacts */}
      <section className="bg-[#15171c] border border-white/5 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <Phone className="text-orange-500" size={24} />
          <h3 className="text-xl font-bold text-white">Emergency Contacts</h3>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-bold text-white">Primary Contacts</label>
          <button onClick={addEmergencyContact} className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition-colors flex items-center gap-1"><Plus size={14}/> Add Contact</button>
        </div>
        <div className="space-y-4">
          {formData.emergency_contacts.map((contact, i) => (
            <div key={i} className="p-5 border border-white/5 rounded-2xl bg-[#1c1f26] relative group flex flex-col md:flex-row gap-4">
              <button onClick={() => removeEmergencyContact(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={16}/></button>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Name</label>
                <input value={contact.name} onChange={e => updateEmergencyContact(i, 'name', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500" placeholder="Jane Doe" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Relationship</label>
                <input value={contact.relation} onChange={e => updateEmergencyContact(i, 'relation', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500" placeholder="Parent / Sibling" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Phone</label>
                <input value={contact.phone} onChange={e => updateEmergencyContact(i, 'phone', e.target.value)} className="w-full bg-[#15171c] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          ))}
          {formData.emergency_contacts.length === 0 && (
            <div className="text-center p-6 border border-dashed border-white/10 rounded-2xl">
              <p className="text-sm text-muted-foreground">We recommend adding at least one emergency contact.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. Social Links & Settings */}
      <section className="bg-[#15171c] border border-white/5 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <Link2 className="text-pink-500" size={24} />
          <h3 className="text-xl font-bold text-white">Social & Preferences</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LinkedIn</label>
            <input value={formData.social_links.linkedin} onChange={e => handleNestedChange('social_links', 'linkedin', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors" placeholder="https://linkedin.com/in/..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GitHub</label>
            <input value={formData.social_links.github} onChange={e => handleNestedChange('social_links', 'github', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors" placeholder="https://github.com/..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Portfolio / Website</label>
            <input value={formData.social_links.portfolio} onChange={e => handleNestedChange('social_links', 'portfolio', e.target.value)} className="w-full bg-[#1c1f26] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors" placeholder="https://mywebsite.com" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 border border-white/5 rounded-2xl bg-[#1c1f26]">
            <div>
              <h4 className="font-bold text-white text-sm">Open to Work</h4>
              <p className="text-xs text-muted-foreground mt-1">Allow recruiters to see that you are actively looking for opportunities.</p>
            </div>
            <div onClick={() => handleChange('is_open_to_work', !formData.is_open_to_work)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${formData.is_open_to_work ? 'bg-emerald-500' : 'bg-white/10'}`}>
              <motion.div layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} className={`w-4 h-4 bg-white rounded-full absolute top-1 ${formData.is_open_to_work ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-5 border border-white/5 rounded-2xl bg-[#1c1f26]">
            <div>
              <h4 className="font-bold text-white text-sm">Available for Mentorship</h4>
              <p className="text-xs text-muted-foreground mt-1">Let students and juniors know they can reach out to you for guidance.</p>
            </div>
            <div onClick={() => handleChange('is_mentor_available', !formData.is_mentor_available)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${formData.is_mentor_available ? 'bg-emerald-500' : 'bg-white/10'}`}>
              <motion.div layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} className={`w-4 h-4 bg-white rounded-full absolute top-1 ${formData.is_mentor_available ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end sticky bottom-8">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary hover:bg-brand-600 text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-[0_0_30px_rgba(255,98,10,0.4)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : <><Save size={20}/> Save Complete Profile</>}
        </button>
      </div>
    </div>
  );
}
