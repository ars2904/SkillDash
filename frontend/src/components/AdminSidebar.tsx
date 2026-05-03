'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { LayoutDashboard, Users, Briefcase, Star, Activity, ArrowLeft, Shield, LogOut } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' },
  { name: 'Users', icon: <Users size={18} />, path: '/admin/users' },
  { name: 'Jobs', icon: <Briefcase size={18} />, path: '/admin/jobs' },
  { name: 'Reviews', icon: <Star size={18} />, path: '/admin/reviews' },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-72 h-screen bg-[#080808] border-r border-red-500/10 flex flex-col fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-500/10 rounded-xl">
            <Shield size={20} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-lg font-black italic tracking-tighter text-red-500 uppercase">Admin Panel</h1>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.3em]">Super Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em] mb-4 px-4">Management</p>
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              pathname === item.path
                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : 'text-gray-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}

        <div className="pt-6">
          <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em] mb-4 px-4">Quick Actions</p>
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-white/5 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
            Back to App
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center text-white font-black text-sm">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-bold truncate">{user?.username}</p>
            <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">Admin</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 font-bold text-sm hover:bg-red-500/10 rounded-xl transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
