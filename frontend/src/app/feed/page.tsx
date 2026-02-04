'use client';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Briefcase, DollarSign, Zap, Clock, ChevronRight } from 'lucide-react';

export default function ExpertFeed() {
  const [jobs, setJobs] = useState([]);
  const { user } = useUserStore();
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const fetchJobs = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`);
    const data = await res.json();
    // Only show "open" jobs
    setJobs(data.filter((j: any) => j.status === 'open'));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId: number) => {
    setApplyingId(jobId);
    const res = await fetch('fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, expert_id: user?.id })
    });
    
    if (res.ok) {
      setTimeout(() => {
        setApplyingId(null);
        alert("Application Sent!");
      }, 600);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
          Available Jobs
        </h1>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mt-2 ml-1">
          High-tier opportunities for Rank {user?.user_rank} Experts
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {jobs.length === 0 ? (
          <div className="col-span-full py-32 border-2 border-dashed border-gray-900 rounded-[3rem] text-center opacity-30">
            <Briefcase size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">The market is currently quiet...</p>
          </div>
        ) : (
          jobs.map((job: any) => (
            <div 
              key={job.id} 
              className="group relative bg-[#0a0a0a] border border-gray-900 rounded-[2.5rem] p-8 hover:border-orange-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,100,0,0.05)]"
            >
              {/* Category Badge */}
              <div className="absolute top-8 right-8 flex items-center gap-1.5 px-3 py-1 bg-gray-900/50 border border-gray-800 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{job.category || 'General'}</span>
              </div>

              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-orange-500 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-green-500">
                      <DollarSign size={14} />
                      <span className="text-sm font-black italic">${job.budget}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold uppercase">Posted Today</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-2 font-medium">
                  {job.description}
                </p>

                <div className="mt-auto pt-6 border-t border-gray-900 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500">
                        ?
                      </div>
                    ))}
                    <span className="ml-4 text-[9px] font-bold text-gray-600 uppercase self-center tracking-widest">Awaiting Applications</span>
                  </div>

                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingId === job.id}
                    className={`group/btn flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all ${
                      applyingId === job.id
                        ? 'bg-orange-500 text-white animate-pulse'
                        : 'bg-white text-black hover:bg-orange-500 hover:text-white'
                    }`}
                  >
                    {applyingId === job.id ? 'SENDING...' : 'APPLY NOW'}
                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}