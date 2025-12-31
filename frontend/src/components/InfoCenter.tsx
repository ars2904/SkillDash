'use client';
import { 
  Briefcase, Users, Zap, Monitor, Key, 
  MessageSquare, AlertTriangle, Share2, 
  Trophy, Activity, ChevronRight, HardDrive
} from 'lucide-react';

export default function InfoCenter() {
  const levels = [
    { lvl: "01", title: "Novice", exp: "100", color: "border-gray-800" },
    { lvl: "02", title: "Initiate", exp: "200", color: "border-gray-800" },
    { lvl: "03", title: "Veteran", exp: "300", color: "border-orange-500/20" },
    { lvl: "04", title: "Elite", exp: "400", color: "border-orange-500/40" },
    { lvl: "05", title: "Legend", exp: "500", color: "border-orange-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="relative p-12 bg-[#050505] border border-gray-900 rounded-[3rem] overflow-hidden group">
        {/* Background Decorative Icon - Moved to extreme right to avoid overlapping text */}
        <Share2 className="absolute -right-16 -bottom-16 w-80 h-80 text-white/[0.02] -rotate-12 transition-transform group-hover:rotate-0 duration-1000" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap gap-3 mb-8">
             <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center gap-2">
                <Activity size={10} className="text-orange-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500">System v1.0.4 Online</span>
             </div>
             <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                <Monitor size={10} className="text-gray-400" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Hardware: Laptop Only</span>
             </div>
          </div>
          
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
            PLATFORM <br /> <span className="text-orange-500 italic">PROTOCOLS</span>
          </h1>
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest max-w-sm leading-relaxed border-l-2 border-orange-500 pl-6">
            SkillDash operates on an Experience (EXP) exchange economy. Reputation is the only currency.
          </p>
        </div>
      </div>

      {/* 2. HARDWARE NOTICE - High Detailing */}
      <div className="p-8 bg-[#0a0a0a] border border-orange-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
        <div className="p-5 bg-orange-500 text-black rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.1)] flex-shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-orange-500 font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
             Critical Hardware Notice <ChevronRight size={10} />
          </h4>
          <p className="text-gray-400 text-xs font-medium leading-relaxed">
            This terminal is strictly optimized for <span className="text-white font-black underline decoration-orange-500/30">Laptop and Desktop</span> displays. Mobile/Tablet viewports are unsupported to protect UI integrity and complex dashboard routing.
          </p>
        </div>
      </div>

      {/* 3. EXP PROGRESSION TRACK */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {levels.map((l, i) => (
          <div key={i} className={`p-6 bg-[#080808] border ${l.color} rounded-[2rem] relative group hover:bg-black transition-all`}>
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">LVL {l.lvl}</p>
            <h3 className="text-white font-black text-xs uppercase mb-4 italic tracking-tight">{l.title}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-bold uppercase">
                <span className="text-gray-600">Goal</span>
                <span className="text-orange-500">{l.exp} EXP</span>
              </div>
              <div className="h-[2px] w-full bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 opacity-40" style={{ width: `${(i+1)*20}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. TECHNICAL INFRASTRUCTURE */}
      <div className="bg-[#050505] border border-gray-900 rounded-[3rem] overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="p-10 border-b md:border-b-0 md:border-r border-gray-900 space-y-6">
            <div className="flex items-center gap-4 text-orange-500">
              <div className="p-3 bg-orange-500/10 rounded-xl"><HardDrive size={18} /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">State Cache</span>
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Sessions are managed via <span className="text-white font-bold">Zustand</span>. This ensures your Level and EXP data remain synced across all dashboard modules without page refreshes.
            </p>
          </div>

          <div className="p-10 space-y-6">
            <div className="flex items-center gap-4 text-blue-500">
              <div className="p-3 bg-blue-500/10 rounded-xl"><MessageSquare size={18} /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Data Handshake</span>
            </div>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Every connection creates a <span className="text-white font-bold">Unique Tunnel</span> in our database. This ID prevents cross-user data leaks and ensures messages land in the correct workroom.
            </p>
          </div>
      </div>

      {/* 5. MINIMAL FOOTER */}
      <div className="flex items-center justify-between px-4 opacity-30">
         <span className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-500">SkillDash Terminal v1.02</span>
         <div className="flex gap-2">
            <div className="w-1 h-1 bg-orange-500 rounded-full" />
            <div className="w-1 h-1 bg-orange-500 rounded-full" />
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-ping" />
         </div>
      </div>
    </div>
  );
}