'use client';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import ClientConnectionManager from '@/components/ClientJobManager';
import { Users } from 'lucide-react';

export default function ConnectionsPage() {
  const { user } = useUserStore();
  const [hasConnections, setHasConnections] = useState(false);


  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-10 flex items-center gap-6">
        <div className="p-5 bg-orange-500 text-black rounded-[2rem] shadow-xl shadow-orange-500/20">
          <Users size={32} />
        </div>
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">My Network</h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Accept requests to start collaborating</p>
        </div>
      </div>
      <ClientConnectionManager />
      
      {!hasConnections && (
         <div className="mt-10 p-20 border-2 border-dashed border-gray-900 rounded-[3rem] flex flex-col items-center opacity-30">
           <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No active connections found</p>
           <p className="text-gray-700 text-[10px] mt-2 italic font-bold">Connections will appear here once accepted.</p>
         </div>
      )}
    </div>
  );
}