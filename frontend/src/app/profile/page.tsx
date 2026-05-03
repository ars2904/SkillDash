'use client';
import { useUserStore } from '@/store/useUserStore';
import { useState, useEffect } from 'react';
import { Mail, Edit3, Save, Shield, User, Globe, Lock, CheckCircle2, Star, Briefcase, Calendar, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

interface ProfileData {
  user: any;
  reviews: any[];
  stats: any;
  skills: string[];
  jobHistory: any[];
}

export default function ProfilePage() {
  const { user, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    location: '',
    bio: '',
    skills: [] as string[]
  });

  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/users/${user?.id}/profile`);
      setProfileData(data);
      setFormData({
        username: data.user.username || '',
        email: data.user.email || '',
        location: data.user.location || 'Remote',
        bio: data.user.bio || '',
        skills: data.skills || []
      });
    } catch (err: any) {
      toast.error('Failed to load profile', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiFetch(`/api/users/${user?.id}/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          username: formData.username,
          location: formData.location,
          bio: formData.bio,
          skills: formData.skills
        })
      });
      updateProfile({
        username: formData.username,
        location: formData.location,
        bio: formData.bio
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      toast.error('Failed to update profile', { description: err.message });
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim()) && formData.skills.length < 15) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  if (!mounted || !user || loading || !profileData) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.main 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] pt-24 pb-20 text-[#ededed] font-sans"
    >
      <nav className="border-b border-white/[0.08] bg-gradient-to-r from-[#050505]/90 to-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User size={20} className="text-blue-400" />
            <span className="text-sm font-semibold tracking-tight text-white">Profile Control</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`text-xs font-bold px-6 py-2.5 rounded-xl transition-all duration-200 border ${
              isEditing ? 'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-black border-white hover:bg-gray-100 hover:shadow-md'
            }`}
          >
            {isEditing ? <div className="flex items-center gap-2"><Save size={14}/> Save Changes</div> : <div className="flex items-center gap-2"><Edit3 size={14}/> Edit Profile</div>}
          </motion.button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-10">
        
        {/* Header Section */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Shield size={120} />
          </div>
          <div className="relative shrink-0 z-10">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500/20 to-orange-500/20 p-1">
              <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${formData.username}`} className="w-full h-full rounded-[22px] bg-black shadow-2xl" alt="Avatar" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 border-2 border-black rounded-full" />
          </div>
          
          <div className="space-y-4 text-center md:text-left z-10 flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {isEditing ? (
                 <input 
                   className="text-4xl font-black bg-black border border-white/10 rounded-xl px-4 py-2 text-white w-full max-w-sm"
                   value={formData.username}
                   onChange={e => setFormData({...formData, username: e.target.value})}
                 />
              ) : (
                <h1 className="text-5xl font-black tracking-tighter text-white uppercase">{formData.username}</h1>
              )}
              {!isEditing && <CheckCircle2 size={24} className="text-blue-400" />}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                <Shield size={12}/> {user.user_rank || 'Novice'}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Globe size={12}/> {isEditing ? (
                  <input className="bg-transparent border-b border-gray-600 outline-none text-white w-24" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Location" />
                ) : formData.location}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Calendar size={12}/> Joined {new Date(profileData.user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-4 z-10 w-full md:w-auto mt-6 md:mt-0">
             <div className="bg-black/50 border border-white/5 p-4 rounded-2xl text-center flex-1 md:flex-none md:w-28">
               <p className="text-2xl font-black text-white">{profileData.stats.reviewCount || 0}</p>
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Reviews</p>
             </div>
             <div className="bg-black/50 border border-white/5 p-4 rounded-2xl text-center flex-1 md:flex-none md:w-28">
               <p className="text-2xl font-black text-yellow-400 flex items-center justify-center gap-1">
                 {profileData.stats.avgRating ? Number(profileData.stats.avgRating).toFixed(1) : '-'} <Star size={16} className="fill-yellow-400"/>
               </p>
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Avg Rating</p>
             </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
             {/* Bio Section */}
             <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                <h3 className="text-lg font-black italic uppercase tracking-tighter mb-4 text-white">About Operator</h3>
                {isEditing ? (
                  <textarea 
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-gray-300 min-h-[120px] outline-none focus:border-blue-500"
                    placeholder="Describe your expertise, background, and what you're looking for..."
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                ) : (
                  <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {formData.bio || "This operator hasn't provided a bio yet."}
                  </p>
                )}
             </div>

             {/* Skills Section */}
             <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                <h3 className="text-lg font-black italic uppercase tracking-tighter mb-4 text-white">Technical Arsenal</h3>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl text-xs font-bold">
                      {skill}
                      {isEditing && <X size={12} className="cursor-pointer hover:text-red-400" onClick={() => removeSkill(skill)}/>}
                    </span>
                  ))}
                  {formData.skills.length === 0 && !isEditing && <span className="text-sm text-gray-600 italic">No skills listed.</span>}
                </div>
                {isEditing && formData.skills.length < 15 && (
                  <div className="flex items-center gap-2 mt-4">
                    <input 
                      type="text" 
                      placeholder="Add a skill..." 
                      className="bg-black border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()}
                    />
                    <button onClick={addSkill} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><Plus size={16}/></button>
                  </div>
                )}
             </div>

             {/* Job History */}
             <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                <h3 className="text-lg font-black italic uppercase tracking-tighter mb-4 text-white">Mission History</h3>
                <div className="space-y-4">
                  {profileData.jobHistory.length === 0 ? (
                    <p className="text-sm text-gray-600 italic">No missions recorded.</p>
                  ) : (
                    profileData.jobHistory.map(job => (
                      <div key={job.id} className="flex items-center justify-between p-4 bg-black border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${job.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            <Briefcase size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white max-w-[250px] truncate">{job.title}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{job.category} • {new Date(job.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-green-400">+{job.exp_reward} EXP</p>
                          <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${job.status === 'completed' ? 'text-gray-500' : 'text-blue-500'}`}>{job.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
             {/* Account Details */}
             <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={16} className="text-gray-500" />
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Secure Data</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Email (Private)</label>
                    <p className="text-sm text-gray-300 bg-black p-3 rounded-xl border border-white/5">{formData.email}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Role</label>
                    <p className="text-sm text-blue-400 font-black uppercase bg-blue-500/10 p-3 rounded-xl border border-blue-500/10">{user.role}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block mb-1">Current Level</label>
                    <div className="bg-black p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-sm font-black text-white">Level {user.current_level}</span>
                      <span className="text-xs font-bold text-orange-500">{user.exp} EXP</span>
                    </div>
                  </div>
                </div>
             </div>

             {/* Recent Reviews */}
             <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-yellow-500" />
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Recent Feedback</h3>
                </div>
                <div className="space-y-3">
                  {profileData.reviews.length === 0 ? (
                    <p className="text-xs text-gray-600 italic">No feedback received yet.</p>
                  ) : (
                    profileData.reviews.map(review => (
                      <div key={review.id} className="bg-black border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-blue-400">{review.reviewer_name}</span>
                          <span className="text-yellow-500 text-[10px]">{'★'.repeat(review.rating)}</span>
                        </div>
                        <p className="text-xs text-gray-400 italic">"{review.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </motion.main>
  );
}