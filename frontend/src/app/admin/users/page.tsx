'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Search, Ban, UserCheck, ChevronLeft, ChevronRight, Eye, X, Shield, Briefcase, Star } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: number; username: string; email: string; role: string; user_rank: string;
  current_level: number; exp: number; is_banned: number; bio: string | null;
  location: string | null; created_at: string; last_active: string;
  jobs_completed: number; avg_rating: number | null;
}

interface UserDetail {
  user: UserData;
  jobs: any[];
  reviews: any[];
  skills: string[];
  stats: { completed: number; posted: number; avgRating: number | null };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [banFilter, setBanFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (banFilter !== '') params.set('banned', banFilter);

      const data = await apiFetch(`/api/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, banFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBan = async (userId: number, ban: boolean) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({ banned: ban }),
      });
      toast.success(ban ? 'User banned' : 'User unbanned');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleViewDetail = async (userId: number) => {
    setDetailLoading(true);
    try {
      const data = await apiFetch<UserDetail>(`/api/admin/users/${userId}`);
      setSelectedUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-[2px] w-10 bg-red-500" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">User Management</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          All Users <span className="text-gray-700 text-2xl">({total})</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="flex items-center bg-[#0a0a0a] border border-white/5 rounded-xl px-4">
            <Search size={16} className="text-gray-600" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 bg-transparent py-3 px-3 text-sm text-white outline-none placeholder:text-gray-700"
            />
          </div>
        </form>
        <select
          value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="expert">Expert</option>
          <option value="client">Client</option>
        </select>
        <select
          value={banFilter} onChange={(e) => { setBanFilter(e.target.value); setPage(1); }}
          className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="0">Active</option>
          <option value="1">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Role', 'Rank', 'Level', 'Jobs Done', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-700 text-sm animate-pulse">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-700 text-sm">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center font-black text-sm text-white">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{u.username}</p>
                          <p className="text-[10px] text-gray-600">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${u.role === 'expert' ? 'text-blue-400 bg-blue-500/10' : 'text-orange-400 bg-orange-500/10'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-gray-400">{u.user_rank}</td>
                    <td className="px-5 py-4 text-xs font-bold text-white">{u.current_level}</td>
                    <td className="px-5 py-4 text-xs font-bold text-green-400">{u.jobs_completed}</td>
                    <td className="px-5 py-4 text-xs font-bold text-yellow-400">{u.avg_rating ? Number(u.avg_rating).toFixed(1) + '★' : '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${u.is_banned ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
                        {u.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleViewDetail(u.id)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-all" title="View Details">
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleBan(u.id, !u.is_banned)}
                          className={`p-2 rounded-lg transition-all ${u.is_banned ? 'hover:bg-green-500/10 text-green-500' : 'hover:bg-red-500/10 text-red-500'}`}
                          title={u.is_banned ? 'Unban' : 'Ban'}
                        >
                          {u.is_banned ? <UserCheck size={14} /> : <Ban size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <span className="text-[10px] font-bold text-gray-600">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Side Panel */}
      {(selectedUser || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-lg bg-[#0a0a0a] border-l border-white/5 h-full overflow-y-auto p-8 animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            {detailLoading ? (
              <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : selectedUser ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">{selectedUser.user.username}</h2>
                  <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/5 rounded-lg transition-all"><X size={18} /></button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${selectedUser.user.role === 'expert' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20' : 'text-orange-400 bg-orange-500/10 border border-orange-500/20'}`}>{selectedUser.user.role}</span>
                  <span className="text-[9px] font-black text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">{selectedUser.user.user_rank}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${selectedUser.user.is_banned ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-green-400 bg-green-500/10 border border-green-500/20'}`}>{selectedUser.user.is_banned ? 'Banned' : 'Active'}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Level', value: selectedUser.user.current_level, icon: <Shield size={14} /> },
                    { label: 'Jobs Done', value: selectedUser.stats.completed, icon: <Briefcase size={14} /> },
                    { label: 'Avg Rating', value: selectedUser.stats.avgRating ? Number(selectedUser.stats.avgRating).toFixed(1) + '★' : '—', icon: <Star size={14} /> },
                  ].map(s => (
                    <div key={s.label} className="bg-black rounded-xl p-4 border border-white/5 text-center">
                      <div className="flex justify-center text-gray-600 mb-2">{s.icon}</div>
                      <p className="text-xl font-black text-white">{s.value}</p>
                      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Info</p>
                  <div className="bg-black rounded-xl p-4 border border-white/5 space-y-2 text-xs">
                    <p><span className="text-gray-600">Email:</span> <span className="text-white">{selectedUser.user.email}</span></p>
                    <p><span className="text-gray-600">Location:</span> <span className="text-white">{selectedUser.user.location || 'Not set'}</span></p>
                    <p><span className="text-gray-600">Bio:</span> <span className="text-white">{selectedUser.user.bio || 'Not set'}</span></p>
                    <p><span className="text-gray-600">Joined:</span> <span className="text-white">{new Date(selectedUser.user.created_at).toLocaleDateString()}</span></p>
                  </div>
                </div>

                {selectedUser.skills.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map(s => (
                        <span key={s} className="text-[10px] font-bold text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.reviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Recent Reviews</p>
                    <div className="space-y-2">
                      {selectedUser.reviews.slice(0, 5).map((r: any) => (
                        <div key={r.id} className="bg-black rounded-xl p-3 border border-white/5">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="font-bold text-blue-400">{r.reviewer_name}</span>
                            <span className="text-yellow-500">{'★'.repeat(r.rating)}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 italic">"{r.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
