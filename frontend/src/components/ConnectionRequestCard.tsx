'use client';
import { UserCheck, UserX } from 'lucide-react';

export default function ConnectionRequestCard({ req, onRefresh }: { req: any, onRefresh: () => void }) {
  const handleAction = async (status: 'accepted' | 'rejected') => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        connection_id: req.connection_id, 
        status: status 
      })
    });
    onRefresh();
  };

  return (
    <div className="bg-[#0a0a0a] border border-orange-500/30 p-5 rounded-2xl flex items-center justify-between mb-4 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-black text-black">
          {req.sender_name?.[0].toUpperCase()}
        </div>
        <div>
          <p className="text-white font-bold text-sm uppercase tracking-tighter">{req.sender_name}</p>
          <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest">Wants to Connect</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleAction('accepted')} className="p-2 bg-white text-black rounded-lg hover:bg-green-500 hover:text-white transition-all">
          <UserCheck size={18} />
        </button>
        <button onClick={() => handleAction('rejected')} className="p-2 bg-gray-900 text-gray-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
          <UserX size={18} />
        </button>
      </div>
    </div>
  );
}