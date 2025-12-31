'use client';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout } = useUserStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-[#050505] border-b border-gray-900 sticky top-0 z-50 backdrop-blur-md">
      <Link href="/" className="font-black text-2xl text-white tracking-tighter italic hover:text-orange-500 transition-colors">
        SKILLDASH
      </Link>
      
      {user && (
        <div className="flex items-center gap-4 sm:gap-6">
          {/* NAVIGATION LINKS - Removed 'hidden' so it shows on mobile */}
          <div className="flex items-center gap-4 border-r border-gray-800 pr-4 sm:pr-6">
            <Link 
              href="/leaderboard" 
              className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden xs:block">
              <p className="text-white text-[10px] font-black uppercase leading-none">
                {user.username}
              </p>
              <p className="text-orange-500 text-[8px] font-bold uppercase tracking-widest mt-1">
                LVL {user.current_level}
              </p>
            </div>

            {/* IMPROVED AVATAR URL */}
            <img 
              src={`https://api.dicebear.com/9.x/bottts/svg?seed=${user.username}&backgroundColor=000000,111111`} 
              alt="avatar"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#111] border border-gray-800 p-1"
            />
            
            <button 
              onClick={handleLogout}
              className="px-2 py-1.5 bg-red-900/10 text-red-600 border border-red-900/30 rounded-md text-[8px] sm:text-[9px] font-black hover:bg-red-600 hover:text-white transition-all uppercase"
            >
              OUT
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}