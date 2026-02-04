'use client';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import Workroom from '@/components/Workroom'; 

export default function ExpertFeed() {
  const [jobs, setJobs] = useState([]);
  const { user } = useUserStore();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  // Fetch jobs from the backend
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`)
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error("Error fetching feed:", err));
  }, []);

  // Logic to apply for a job
  const handleApply = async (jobId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, expert_id: user?.id })
      });
      if (res.ok) alert("Application sent! Wait for the client to hire you.");
    } catch (err) {
      console.error("Apply error:", err);
    }
  };

  // Logic to send a connection request to the client
  const handleConnect = async (clientId: number) => {
    if (!user?.id) return alert("Please log in first");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_one_id: user.id, 
          user_two_id: clientId 
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Connection request sent!");
      } else {
        alert(data.error || "Failed to send request");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Server error sending request");
    }
  };

  // If a workroom is active, show the Workroom component instead of the feed
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
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className="text-gray-500 italic">No tasks available at the moment...</p>
      ) : (
        jobs.map((job: any) => (
          <div key={job.id} className="p-6 bg-[#0f0f0f] border border-gray-800 rounded-2xl hover:border-blue-500/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{job.title}</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-xl">{job.description}</p>
                <div className="mt-2 text-[10px] text-gray-500 font-mono uppercase">
                  Client ID: {job.client_id}
                </div>
              </div>
              <div className="text-right">
                <span className="text-green-400 font-black text-xl">XP{job.budget}</span>
                <p className="text-[10px] text-gray-600 uppercase font-bold mt-1">Fixed EXP</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {job.status === 'open' ? (
                <>
                  <button 
                    onClick={() => handleApply(job.id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 transition transform active:scale-95"
                  >
                    I AM INTERESTED
                  </button>
                  
                  {/* The connection button we were looking for */}
                  <button 
                    onClick={() => handleConnect(job.client_id)}
                    className="px-6 py-2 bg-transparent text-orange-500 border border-orange-500/40 rounded-xl font-black text-xs hover:bg-orange-500 hover:text-white transition transform active:scale-95"
                  >
                    CONNECT WITH CLIENT
                  </button>
                </>
              ) : job.expert_id === user?.id ? (
                <button 
                  onClick={() => setActiveChatId(job.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl font-black text-xs hover:bg-green-700 transition"
                >
                  ENTER WORKROOM
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-xl">
                    <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
                    <span className="text-gray-500 text-xs font-bold uppercase italic">Assigned to another expert</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}