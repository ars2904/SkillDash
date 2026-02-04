'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LeaderboardUser {
  id: number;
  username: string;
  user_rank: string;
  current_level: number;
  exp: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setLeaders(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-10 text-center">
        <div className="inline-block px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Global Network Rankings</span>
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">Leaderboard</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 animate-pulse uppercase text-xs font-bold tracking-widest">Scanning Network...</p>
        ) : (
          leaders.map((user, index) => (
            <div 
              key={user.id}
              className={`flex items-center p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
                index === 0 ? 'bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/20' : 'bg-[#0a0a0a] border-gray-900'
              }`}
            >
              {/* Rank Number */}
              <div className="w-8 text-xl font-black italic text-gray-800">
                {index + 1}
              </div>

              {/* AVATAR SYSTEM */}
              <div className="relative w-12 h-12 mr-4">
                <img 
  src={`https://api.dicebear.com/9.x/bottts/svg?seed=${user.username}&backgroundColor=000000`} 
  alt="avatar"
  className="w-12 h-12 rounded-xl bg-[#111] border border-gray-800 p-1"
/>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border-2 border-black">
                    <span className="text-[8px]">👑</span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-none uppercase tracking-tight flex items-center">
                  {user.username}
                </h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                   <span className={index === 0 ? "text-orange-500" : "text-blue-500"}>{user.user_rank}</span> 
                   <span className="text-gray-800 mx-1">|</span> LVL {user.current_level}
                </p>
              </div>

              {/* EXP Stat */}
              <div className="text-right">
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest leading-none">Total EXP</p>
                <p className="font-mono text-white font-bold text-lg">{user.exp}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <Link href="/" className="px-10 py-4 bg-white text-black font-black rounded-2xl uppercase italic text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-orange-500/10">
          Return to Hub
        </Link>
      </div>
    </div>
  );
}