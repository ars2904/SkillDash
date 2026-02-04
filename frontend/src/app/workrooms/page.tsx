'use client';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import Workroom from '@/components/Workroom';
import { ArrowLeft, Zap, Box, Loader2 } from 'lucide-react';

export default function ExpertWorkrooms() {
  const { user } = useUserStore();
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveJobs = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setError(null);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/assigned/${user.id}`);
        
        // Check if the response is actually valid JSON/OK
        if (!res.ok) {
          throw new Error(`Server responded with status: ${res.status}`);
        }

        const data = await res.json();

        // Safety: Ensure data is an array before setting it
        if (Array.isArray(data)) {
          setActiveJobs(data);
        } else {
          setActiveJobs([]);
        }
      } catch (err: any) {
        console.error("Critical Sync Error:", err);
        setError("Failed to sync with mission database.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveJobs();
  }, [user]);

  // View: Detailed Workroom
  if (selectedJobId) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8 animate-in fade-in duration-500">
        <button 
          onClick={() => setSelectedJobId(null)} 
          className="mb-8 flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-orange-500 transition-all uppercase tracking-[0.3em] group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Command Center
        </button>
        <Workroom jobId={selectedJobId} />
      </div>
    );
  }

  // View: List of Active Missions
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-blue-600"></div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em]">Active Links</span>
        </div>
        <h1 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-none">
          Workrooms
        </h1>
      </header>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4 text-gray-700">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Establishing Uplink...</span>
        </div>
      ) : error ? (
        <div className="p-12 border border-red-900/30 bg-red-900/5 rounded-[2.5rem] text-center">
            <p className="text-red-500 font-bold text-sm uppercase tracking-widest">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-white underline text-xs">Retry Connection</button>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeJobs.length === 0 ? (
            <div className="p-32 border border-dashed border-gray-900 rounded-[4rem] text-center flex flex-col items-center justify-center">
              <Box className="text-gray-800 mb-6" size={48} />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-xs leading-loose">
                No active mission assignments found. Accept a task from the Expert Feed to begin.
              </p>
            </div>
          ) : (
            activeJobs.map((job) => (
              <div 
                key={job.id} 
                className="group p-10 bg-[#080808] border border-gray-900 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 hover:border-blue-500/40 transition-all duration-700 hover:shadow-[0_0_50px_rgba(37,99,235,0.05)]"
              >
                <div className="space-y-4 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest rounded">Online</span>
                    <span className="text-[9px] text-gray-700 font-mono tracking-widest">JOB_REF: {job.id}</span>
                  </div>
                  
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-2 text-orange-500 justify-center md:justify-start">
                    <Zap size={14} fill="currentColor" />
                    <span className="text-[11px] font-black tracking-[0.2em] uppercase">
                      Reward: {job.exp_reward || 0} EXP
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedJobId(job.id)}
                  className="w-full md:w-auto px-12 py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-[0.98] italic"
                >
                  Enter Environment
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}