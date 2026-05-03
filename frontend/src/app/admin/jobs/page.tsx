'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  open: 'text-green-400 bg-green-500/10',
  assigned: 'text-blue-400 bg-blue-500/10',
  completed: 'text-gray-400 bg-gray-500/10',
  cancelled: 'text-red-400 bg-red-500/10',
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);

      const data = await apiFetch(`/api/admin/jobs?${params}`);
      setJobs(data.jobs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [page, statusFilter, categoryFilter]);

  const handleCancel = async (jobId: number) => {
    if (!confirm('Cancel this job?')) return;
    try {
      await apiFetch(`/api/admin/jobs/${jobId}`, { method: 'DELETE' });
      toast.success('Job cancelled');
      fetchJobs();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-[2px] w-10 bg-red-500" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Job Monitoring</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          All Jobs <span className="text-gray-700 text-2xl">({total})</span>
        </h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchJobs(); }} className="flex-1 min-w-[200px]">
          <div className="flex items-center bg-[#0a0a0a] border border-white/5 rounded-xl px-4">
            <Search size={16} className="text-gray-600" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..."
              className="flex-1 bg-transparent py-3 px-3 text-sm text-white outline-none placeholder:text-gray-700" />
          </div>
        </form>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none cursor-pointer">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 outline-none cursor-pointer">
          <option value="">All Categories</option>
          {['Development','Design','Writing','Marketing','Data','DevOps','Mobile','AI/ML','Other'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                {['ID', 'Title', 'Client', 'Expert', 'Category', 'Status', 'EXP', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-4 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16 text-gray-700 text-sm animate-pulse">Loading jobs...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-gray-700 text-sm">No jobs found</td></tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">#{j.id}</td>
                    <td className="px-4 py-3 text-sm font-bold text-white max-w-[200px] truncate">{j.title}</td>
                    <td className="px-4 py-3 text-xs font-bold text-orange-400">{j.client_name || '—'}</td>
                    <td className="px-4 py-3 text-xs font-bold text-blue-400">{j.expert_name || '—'}</td>
                    <td className="px-4 py-3 text-[10px] font-bold text-gray-400">{j.category || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${STATUS_COLORS[j.status] || 'text-gray-400 bg-gray-500/10'}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-green-400">{j.exp_reward}</td>
                    <td className="px-4 py-3 text-[10px] text-gray-600">{new Date(j.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {j.status !== 'completed' && j.status !== 'cancelled' && (
                        <button onClick={() => handleCancel(j.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all" title="Cancel Job">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
    </div>
  );
}
