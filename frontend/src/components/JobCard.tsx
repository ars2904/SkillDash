'use client';
import { useState } from 'react';
import Workroom from '@/components/Workroom';

export default function JobCard({ job, onRefresh }: { job: any, onRefresh: () => void }) {
  const [applicants, setApplicants] = useState([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [activeChat, setActiveChat] = useState(false);

  const fetchApplicants = async () => {
    if (!showApplicants) {
      const res = await fetch(`http://localhost:5000/api/jobs/${job.id}/applicants`);
      const data = await res.json();
      setApplicants(data);
    }
    setShowApplicants(!showApplicants);
  };

  const handleHire = async (expertId: number) => {
    if (!confirm("Hire this expert?")) return;
    const res = await fetch(`http://localhost:5000/api/jobs/${job.id}/hire`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expert_id: expertId })
    });
    if (res.ok) { onRefresh(); setShowApplicants(false); }
  };

  if (activeChat) return (
    <div>
      <button onClick={() => setActiveChat(false)} className="mb-4 text-orange-500 font-bold text-xs uppercase underline">← Back</button>
      <Workroom jobId={job.id} />
    </div>
  );

  return (
    <div className="p-6 bg-[#0a0a0a] border border-gray-900 rounded-[2rem] mb-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">{job.title}</h3>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">EXP{job.budget} • {job.status}</p>
        </div>
        {job.status === 'open' && (
          <button onClick={fetchApplicants} className="text-[10px] font-black text-orange-500 border border-orange-500/30 px-4 py-2 rounded-xl">
            {showApplicants ? 'HIDE' : `VIEW APPLICANTS (${applicants.length})`}
          </button>
        )}
      </div>
      {showApplicants && (
        <div className="space-y-2 mb-4">
          {applicants.map((app: any) => (
            <div key={app.expert_id} className="flex justify-between items-center bg-black p-4 rounded-2xl border border-gray-900">
              <span className="text-white text-xs font-black uppercase">{app.username}</span>
              <button onClick={() => handleHire(app.expert_id)} className="bg-white text-black text-[9px] px-4 py-2 rounded-lg font-black hover:bg-orange-500 hover:text-white transition">HIRE</button>
            </div>
          ))}
        </div>
      )}
      {(job.status === 'assigned' || job.status === 'completed') && (
        <button onClick={() => setActiveChat(true)} className="w-full py-4 rounded-2xl bg-white text-black font-black text-[10px] tracking-widest uppercase hover:bg-orange-500 transition-all">
          Enter Workroom
        </button>
      )}
    </div>
  );
}