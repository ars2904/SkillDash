'use client';
import { useUserStore } from '@/store/useUserStore';
import { useState, useEffect } from 'react';
import { Mail, Edit3, Save, Shield, User, Globe, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion'; // For smooth animations; install if needed

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
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0a] to-[#050505] pt-24 text-[#ededed] font-sans"
    >
      {/* 1. Header Bar - Enhanced with gradient and better button */}
      <nav className="border-b border-white/[0.08] bg-gradient-to-r from-[#050505]/90 to-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User size={20} className="text-blue-400" />
            <span className="text-sm font-semibold tracking-tight text-white">Profile Settings</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`text-xs font-bold px-6 py-2.5 rounded-xl transition-all duration-200 border ${
              isEditing 
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50' 
              : 'bg-white text-black border-white hover:bg-gray-100 hover:shadow-md'
            }`}
          >
            {isEditing ? <div className="flex items-center gap-2"><Save size={14}/> Save Changes</div> : <div className="flex items-center gap-2"><Edit3 size={14}/> Edit Profile</div>}
          </motion.button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-20 space-y-16">
        
        {/* 2. Hero Section - Improved with gradient avatar, better spacing, and animation */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col md:flex-row items-center md:items-start gap-12"
        >
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500/20 to-green-500/20 p-1">
              <img 
                src={`https://api.dicebear.com/9.x/bottts/svg?seed=${formData.username}`} 
                className="w-full h-full rounded-3xl bg-[#0a0a0a] border border-white/[0.1] shadow-2xl"
                alt="Avatar"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 border-2 border-black rounded-full"></div>
          </div>
          
          <div className="space-y-4 pt-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-6xl font-black tracking-tighter text-white uppercase bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{user.username}</h1>
              <CheckCircle2 size={28} className="text-blue-400" />
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 shadow-sm">
                <Shield size={14}/> {user.user_rank || 'Novice'}
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest bg-gray-800/50 px-4 py-2 rounded-lg">
                <Globe size={14}/> {formData.location}
              </span>
            </div>
          </div>
        </motion.section>

        {/* 3. Settings Card - Expanded to full-width and much taller for a bigger/full-page feel */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ scale: 1.01 }}
          className="w-full bg-gradient-to-br from-[#0a0a0a] to-[#050505] border border-white/[0.06] rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300" // Removed max-width, full width
        >
          <div className="px-12 py-16 border-b border-white/[0.08] bg-gradient-to-r from-blue-500/5 to-transparent flex items-center justify-between"> {/* More padding */}
            <div>
              <h3 className="text-2xl font-bold text-white">General Information</h3> {/* Slightly larger title */}
              <p className="text-base text-gray-500 mt-2">Manage your account details and identity.</p> {/* Larger description */}
            </div>
            <Lock size={24} className="text-gray-600" /> {/* Larger icon */}
          </div>
          
          <div className="px-20 py-40 space-y-40"> {/* Massive vertical expansion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-40"> {/* Increased vertical gap */}
              
              {/* Display Name */}
              <div className="space-y-12">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Display Name</label> {/* Slightly larger label */}
                <input 
                  disabled={!isEditing}
                  className="w-full bg-black/50 border border-white/[0.1] rounded-2xl px-6 py-10 text-base text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 disabled:text-gray-500 transition-all duration-200 hover:bg-black/70"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Enter your username"
                />
                <p className="text-sm text-gray-600 italic">Visible to all members of the network.</p> {/* Larger description */}
              </div>

              {/* Email */}
              <div className="space-y-12">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    disabled={!isEditing}
                    aria-label="Email Address"
                    className="w-full bg-black/50 border border-white/[0.1] rounded-2xl pl-14 pr-6 py-10 text-base text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-400/20 disabled:text-gray-500 transition-all duration-200 hover:bg-black/70 hover:border-white/[0.2]"
                    value={formData.email || 'no-email@dash.com'}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your email address"
                  />
                </div>
                <p className="text-sm text-gray-600 italic">Used for verification and security.</p>
              </div>

              {/* Account Role - Read-only with better styling */}
              <div className="space-y-12">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Account Role</label>
                <div className="w-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-white/[0.05] rounded-2xl px-6 py-10 text-base text-gray-400 font-medium italic shadow-inner">
                  {user.user_rank || 'Novice'}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-12">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Location</label>
                <input 
                  disabled={!isEditing}
                  className="w-full bg-black/50 border border-white/[0.1] rounded-2xl px-6 py-10 text-base text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 disabled:text-gray-500 transition-all duration-200 hover:bg-black/70"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Enter your location"
                />
              </div>

            </div>
          </div>
          
          {/* Footer Metadata - More integrated */}
          <div className="px-12 py-16 bg-gradient-to-r from-white/[0.02] to-transparent border-t border-white/[0.08] flex items-center justify-between"> {/* More padding */}
            <div className="flex items-center gap-8">
              <span className="text-sm text-gray-500 font-bold tracking-widest uppercase">ID: #00{user.id}</span>
              <span className="text-sm text-gray-500 font-bold tracking-widest uppercase flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div> System Verified
              </span>
            </div>
            <span className="text-sm text-gray-500 font-medium italic">Last Synced: Just now</span>
          </div>
        </motion.div>

      </div>
    </motion.main>
  );
}