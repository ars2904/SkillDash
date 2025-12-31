'use client';
import { useUserStore } from '@/store/useUserStore';
import { useState, useEffect } from 'react';
import { Mail, Edit3, Save, Shield, User, Globe, Lock, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    location: 'Remote / Global'
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSave = () => {
    if (setUser && user) {
      setUser({ ...user, username: formData.username, email: formData.email });
    }
    setIsEditing(false);
  };

  if (!mounted || !user) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-[#ededed] font-sans">
      
      {/* 1. Header Bar */}
      <nav className="border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User size={18} className="text-gray-400" />
            <span className="text-sm font-medium tracking-tight">Profile Settings</span>
          </div>
          <button 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`text-xs font-bold px-5 py-2.5 rounded-lg transition-all border ${
              isEditing 
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-white text-black border-white hover:bg-gray-200'
            }`}
          >
            {isEditing ? <div className="flex items-center gap-2"><Save size={14}/> Save Changes</div> : 'Edit Profile'}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-16 space-y-12">
        
        {/* 2. Hero Section  */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative shrink-0">
            <img 
              src={`https://api.dicebear.com/9.x/bottts/svg?seed=${formData.username}`} 
              className="w-32 h-32 rounded-3xl bg-[#0a0a0a] border border-white/[0.1] shadow-2xl"
              alt="Avatar"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 border-4 border-[#050505] rounded-full"></div>
          </div>
          
          <div className="space-y-3 pt-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-5xl font-black tracking-tighter text-white uppercase">{user.username}</h1>
              <CheckCircle2 size={24} className="text-blue-500" />
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-md">
                <Shield size={12}/> {user.user_rank || 'Novice'}
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-widest">
                <Globe size={14}/> {formData.location}
              </span>
            </div>
          </div>
        </section>

        {/* 3. Settings Card (Improved Padding & Alignment) */}
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="px-10 py-8 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.01]">
            <div>
              <h3 className="text-lg font-bold text-white">General Information</h3>
              <p className="text-xs text-gray-500 mt-1">Manage your account details and identity.</p>
            </div>
            <Lock size={18} className="text-gray-700" />
          </div>
          
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              
              {/* Display Name */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Display Name</label>
                <input 
                  disabled={!isEditing}
                  className="w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:text-gray-600 transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <p className="text-[10px] text-gray-700 italic">Visible to all members of the network.</p>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    disabled={!isEditing}
                    className="w-full bg-black border border-white/[0.1] rounded-2xl pl-14 pr-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:text-gray-600 transition-all"
                    value={formData.email || 'no-email@dash.com'}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-gray-700 italic">Used for verification and security.</p>
              </div>

              {/* Account Role */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Account Role</label>
                <div className="w-full bg-[#050505] border border-white/[0.05] rounded-2xl px-5 py-4 text-sm text-gray-600 font-medium italic">
                  {user.user_rank || 'Novice'}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Location</label>
                <input 
                  disabled={!isEditing}
                  className="w-full bg-black border border-white/[0.1] rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:text-gray-600 transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

            </div>
          </div>
          
          {/* Footer Metadata */}
          <div className="px-10 py-6 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">ID: #00{user.id}</span>
              <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div> System Verified
              </span>
            </div>
            <span className="text-[10px] text-gray-600 font-medium italic">Last Synced: Just now</span>
          </div>
        </div>

      </div>
    </main>
  );
}