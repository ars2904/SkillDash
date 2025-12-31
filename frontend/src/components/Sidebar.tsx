'use client';
import { useUserStore } from '@/store/useUserStore';
import { useRouter, usePathname } from 'next/navigation';
import { User, Briefcase, Users, LogOut, Search, LayoutDashboard, MessageSquare, Zap } from 'lucide-react';

export default function Sidebar() {
  const { user, role, logout } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  const clientLinks = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/' },
    { name: 'Search Experts', icon: <Search size={20}/>, path: '/search' },
    { name: 'Connections', icon: <Users size={20}/>, path: '/connections' },
    { name: 'My Profile', icon: <User size={20}/>, path: '/profile' },
  ];

  const expertLinks = [
    { name: 'Feed', icon: <Briefcase size={20}/>, path: '/' },
    { name: 'My Workrooms', icon: <MessageSquare size={20}/>, path: '/workrooms' },
    { name: 'Network', icon: <Users size={20}/>, path: '/connections' },
    { name: 'Expert Profile', icon: <User size={20}/>, path: '/profile' },
  ];

  const menuItems = role === 'client' ? clientLinks : expertLinks;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  // --- PROGRESS LOGIC ---
  const currentLvl = user.current_level || 1;
  const currentExp = user.exp || 0;
  const nextGoal = currentLvl * 100; // Progressive: 100, 200, 300...
  const progressPercent = Math.min((currentExp / nextGoal) * 100, 100);

  return (
    <aside className="w-64 h-screen bg-[#0a0a0a] border-r border-gray-800 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-black italic tracking-tighter text-orange-500">
          {role === 'client' ? 'SKILLDASH' : 'EXPERT.PRO'}
        </h1>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
          {role} Portal
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              pathname === item.path 
              ? 'bg-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
              : 'text-gray-400 hover:bg-gray-900 hover:text-white'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>

      {/* --- DYNAMIC EXP PROGRESS BAR (Expert Only) --- */}
      {role === 'expert' && (
        <div className="px-6 mb-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                <Zap size={10} fill="currentColor"/> Lvl {currentLvl}
              </span>
              <span className="text-[9px] font-bold text-gray-500">{currentExp}/{nextGoal} EXP</span>
            </div>
            
            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-800 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-black flex-shrink-0 ${role === 'client' ? 'bg-orange-500' : 'bg-blue-500'}`}>
            {user.username[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-bold truncate">{user.username}</p>
            <p className="text-[10px] text-gray-500 uppercase font-black italic">
              {user.user_rank || 'Novice'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-500/10 rounded-xl transition"
        >
          <LogOut size={20}/>
          Logout
        </button>
      </div>
    </aside>
  );
}