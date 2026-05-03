'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, Briefcase, CheckCircle, Star, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface Stats {
  users: { total: number; experts: number; clients: number; banned: number };
  jobs: { total: number; open: number; assigned: number; completed: number; completionRate: string };
  reviews: { total: number; avgRating: string };
  categoryData: { category: string; count: number }[];
  recentUsers: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Stats>('/api/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-red-500">Failed to load stats</p>;

  const statCards = [
    { label: 'Total Users', value: stats.users.total, icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10', sub: `${stats.users.experts} experts · ${stats.users.clients} clients` },
    { label: 'Total Jobs', value: stats.jobs.total, icon: <Briefcase size={20} />, color: 'text-orange-400', bg: 'bg-orange-500/10', sub: `${stats.jobs.open} open · ${stats.jobs.assigned} active` },
    { label: 'Completed', value: stats.jobs.completed, icon: <CheckCircle size={20} />, color: 'text-green-400', bg: 'bg-green-500/10', sub: `${stats.jobs.completionRate}% completion rate` },
    { label: 'Avg Rating', value: `${stats.reviews.avgRating}★`, icon: <Star size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', sub: `${stats.reviews.total} total reviews` },
    { label: 'Banned', value: stats.users.banned, icon: <Activity size={20} />, color: 'text-red-400', bg: 'bg-red-500/10', sub: 'Suspended accounts' },
  ];

  const maxCategoryCount = Math.max(...stats.categoryData.map(c => c.count), 1);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-[2px] w-10 bg-red-500" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Platform Overview</span>
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter">Admin Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <span className={card.color}>{card.icon}</span>
              </div>
              <TrendingUp size={14} className="text-gray-800 group-hover:text-green-500 transition-colors" />
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">{card.label}</p>
            <p className="text-[8px] text-gray-700 mt-2 font-bold">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs by Category */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-orange-500" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Jobs by Category</h3>
          </div>
          <div className="space-y-3">
            {stats.categoryData.length === 0 ? (
              <p className="text-gray-700 text-xs italic">No data yet</p>
            ) : (
              stats.categoryData.map((cat) => (
                <div key={cat.category} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 w-28 truncate">{cat.category}</span>
                  <div className="flex-1 h-6 bg-black rounded-lg overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-lg transition-all duration-1000 flex items-center justify-end pr-2"
                      style={{ width: `${(cat.count / maxCategoryCount) * 100}%`, minWidth: '2rem' }}
                    >
                      <span className="text-[9px] font-black text-white">{cat.count}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users size={16} className="text-blue-500" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">New Users (Last 7 Days)</h3>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="text-gray-700 text-xs italic">No recent registrations</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {stats.recentUsers.map((day) => {
                const maxCount = Math.max(...stats.recentUsers.map(d => d.count), 1);
                const height = (day.count / maxCount) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[9px] font-black text-white">{day.count}</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-700" style={{ height: `${Math.max(height, 8)}%` }} />
                    <span className="text-[7px] font-bold text-gray-700">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="flex items-center justify-between px-4 opacity-30">
        <span className="text-[7px] font-black uppercase tracking-[0.5em] text-gray-500">SkillDash Admin v2.0</span>
        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-500">Auto-refresh: 30s</span>
      </div>
    </div>
  );
}
