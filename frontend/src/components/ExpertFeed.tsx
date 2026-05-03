'use client';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import Workroom from '@/components/Workroom';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Filter, SortDesc, Zap, Briefcase, Calendar, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['All', 'Development', 'Design', 'Writing', 'Marketing', 'Data', 'DevOps', 'Mobile', 'AI/ML', 'Other'];

export default function ExpertFeed() {
  const [jobs, setJobs] = useState<any[]>([]);
  const { user } = useUserStore();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest'); // newest, exp, urgency
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('status', 'open'); // Feed usually shows open jobs
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (sort !== 'newest') params.append('sort', sort);

      const data = await apiFetch(`/api/jobs?${params}`);
      setJobs(data);
    } catch (err: any) {
      toast.error("Error fetching feed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, category, sort]);

  const handleApply = async (jobId: number) => {
    try {
      await apiFetch(`/api/applications`, {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId, expert_id: user?.id })
      });
      toast.success("Application sent!", { description: "Wait for the client to hire you." });
    } catch (err: any) {
      toast.error("Application failed", { description: err.message });
    }
  };

  const handleConnect = async (clientId: number) => {
    if (!user?.id) return toast.error("Please log in first");
    
    try {
      await apiFetch(`/api/connections`, {
        method: 'POST',
        body: JSON.stringify({ user_one_id: user.id, user_two_id: clientId })
      });
      toast.success("Connection request sent!");
    } catch (err: any) {
      toast.error("Connection failed", { description: err.message });
    }
  };

  if (activeChatId) {
    return (
      <div className="animate-in fade-in duration-500">
        <button 
          onClick={() => setActiveChatId(null)} 
          className="mb-4 text-blue-500 text-sm font-bold flex items-center gap-2 hover:underline"
        >
          ← BACK TO FEED
        </button>
        <Workroom jobId={activeChatId} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Filters and Search Header */}
      <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search missions..." 
              className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <select 
                className="bg-black border border-white/10 rounded-xl pl-12 pr-8 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer h-full"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="relative">
              <SortDesc className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <select 
                className="bg-black border border-white/10 rounded-xl pl-12 pr-8 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer h-full"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="exp">Highest Reward</option>
                <option value="urgency">Highest Urgency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.slice(1, 6).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${category === cat ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold animate-pulse">Scanning Network...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center">
            <Zap className="mx-auto text-gray-700 mb-4" size={48} />
            <p className="text-gray-500 italic">No missions found matching criteria.</p>
          </div>
        ) : (
          jobs.map((job: any) => (
            <div key={job.id} className="p-6 bg-[#0a0a0a] border border-white/5 rounded-3xl hover:border-blue-500/30 transition-all group hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400 flex items-center gap-1">
                      <Briefcase size={10}/> {job.category || 'Uncategorized'}
                    </span>
                    {job.urgency && (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border flex items-center gap-1 ${
                        job.urgency === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        job.urgency === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        <AlertTriangle size={10}/> {job.urgency} Priority
                      </span>
                    )}
                    {job.deadline && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded-md text-gray-400 flex items-center gap-1">
                        <Calendar size={10}/> Due: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tighter italic mb-2 group-hover:text-blue-400 transition-colors">{job.title}</h3>
                  <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">{job.description}</p>
                  <div className="mt-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Posted by: <span className="text-gray-300">{job.client_name || `Client #${job.client_id}`}</span> • {new Date(job.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="bg-black border border-white/5 p-4 rounded-2xl min-w-[120px] text-center shrink-0">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Reward</p>
                  <p className="text-2xl font-black text-green-400 tracking-tighter">+{job.exp_reward || job.budget}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">EXP</p>
                  {job.budget_amount && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[10px] font-bold text-yellow-400">
                      ${Number(job.budget_amount).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {job.skills_required && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills_required.split(',').map((skill: string) => (
                    <span key={skill} className="text-[10px] font-bold text-gray-400 bg-black border border-white/5 px-2 py-1 rounded">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                {job.status === 'open' ? (
                  <>
                    <button 
                      onClick={() => handleApply(job.id)}
                      className="px-6 py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all transform active:scale-95"
                    >
                      Accept Mission
                    </button>
                    
                    <button 
                      onClick={() => handleConnect(job.client_id)}
                      className="px-6 py-3 bg-black text-gray-400 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all transform active:scale-95 flex items-center gap-2"
                    >
                      Connect with Client
                    </button>
                  </>
                ) : job.expert_id === user?.id ? (
                  <button 
                    onClick={() => setActiveChatId(job.id)}
                    className="px-6 py-3 bg-green-500 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                  >
                    Enter Workroom
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-black border border-white/5 rounded-xl">
                      <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Assigned to another operative</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}