'use client';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import JobForm from '@/components/JobForm';
import ExpertFeed from '@/components/ExpertFeed';
import ClientJobManager from '@/components/ClientJobManager';
import InfoCenter from '@/components/InfoCenter';
import { Trophy, Zap, Star, Shield, LayoutGrid, Activity, Globe, ArrowUpRight, Briefcase, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function Home() {
  const { user, role } = useUserStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [stats, setStats] = useState({ completedJobs: 0, activeJobs: 0, recentActivity: [] as any[] });

  useEffect(() => {
    setMounted(true);
    if (!user) router.push('/login');
    else fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const data = await apiFetch(`/api/users/${user?.id}/profile`);
      const completed = data.jobHistory?.filter((j: any) => j.status === 'completed').length || 0;
      const active = data.jobHistory?.filter((j: any) => j.status !== 'completed' && j.status !== 'cancelled').length || 0;
      setStats({
        completedJobs: completed,
        activeJobs: active,
        recentActivity: data.jobHistory?.slice(0, 3) || []
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted || !user) return null;

  const expProgress = (user.exp % 100); 

  return (
    <main className="min-h-screen bg-[#020202] text-white p-4 lg:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- 1. STATUS RIBBON (Top Navigation) --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0a0a] border border-white/5 p-2 rounded-2xl">
          <div className="flex items-center gap-4 px-4">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Network: Online</span>
             </div>
             <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
             <div className="hidden sm:flex items-center gap-2">
               <Activity size={12} className="text-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System v2.0 Active</span>
             </div>
          </div>

          <nav className="flex items-center gap-1 bg-black p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-lg text-[9px] font-black transition-all ${activeTab === 'dashboard' ? 'bg-[#111] text-orange-500 shadow-sm' : 'text-gray-500 hover:text-white'}`}
            >
              DASHBOARD
            </button>
            <button 
              onClick={() => setActiveTab('info')}
              className={`px-6 py-2 rounded-lg text-[9px] font-black transition-all ${activeTab === 'info' ? 'bg-[#111] text-orange-500 shadow-sm' : 'text-gray-500 hover:text-white'}`}
            >
              PROTOCOLS
            </button>
          </nav>
        </div>

        {/* --- 2. THE BENTO HUD --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: IDENTITY & QUICK STATS */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Shield size={60} />
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img 
                    src={`https://api.dicebear.com/9.x/bottts/svg?seed=${user.username}&backgroundColor=000000`} 
                    className="w-24 h-24 rounded-3xl bg-black border border-white/10 p-2 shadow-2xl relative z-10"
                    alt="avatar"
                  />
                  <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-1">{user.username}</h2>
                <span className="text-[9px] font-black text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full bg-orange-500/5 mb-4 uppercase tracking-widest">
                  {user.user_rank}
                </span>
                
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase">
                    <span>Progress to Lvl {user.current_level + 1}</span>
                    <span>{expProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-1000" style={{ width: `${expProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATS CARDS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[2rem] text-center">
                <p className="text-2xl font-black text-white">{stats.activeJobs}</p>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Active Jobs</p>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-[2rem] text-center">
                <p className="text-2xl font-black text-green-400">{stats.completedJobs}</p>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Completed</p>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2.5rem]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <p className="text-xs text-gray-600 italic">No recent activity.</p>
                ) : (
                  stats.recentActivity.map(act => (
                    <div key={act.id} className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${act.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <Briefcase size={12} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{act.title}</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">{act.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* MAIN INTERFACE RENDERING */}
          <div className="md:col-span-8 lg:col-span-9 bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Live Feed</h3>
                <p className="text-2xl font-black italic uppercase tracking-tighter">Current Network Operations</p>
              </div>
              <Link href="/leaderboard" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black transition-all group">
                 <Globe size={14} className="text-blue-500" />
                 VIEW GLOBAL RANKINGS
                 <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'info' ? <InfoCenter /> : (
                role === 'client' ? (
                  <div className="space-y-8">
                    <div className="bg-black/40 rounded-3xl border border-white/5 focus-within:border-orange-500/50 transition-colors">
                       <JobForm />
                    </div>
                    <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                       <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 text-white">Your Managed Jobs</h3>
                       <ClientJobManager />
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/20 rounded-3xl p-2 focus-within:glow-orange transition-all">
                    <ExpertFeed />
                  </div>
                )
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .glow-orange {
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.05);
        }
        input:focus, textarea:focus, select:focus {
          border-color: rgba(249, 115, 22, 0.5) !important;
          box-shadow: 0 0 15px rgba(249, 115, 22, 0.1);
        }
      `}</style>
    </main>
  );
}