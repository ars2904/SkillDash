'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [distribution, setDistribution] = useState<{ rating: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (ratingFilter) params.set('rating', ratingFilter);
      const data = await apiFetch(`/api/admin/reviews?${params}`);
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setDistribution(data.distribution);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [page, ratingFilter]);

  const totalReviews = distribution.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-[2px] w-10 bg-red-500" />
          <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Reviews Monitor</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          All Reviews <span className="text-gray-700 text-2xl">({total})</span>
        </h1>
      </div>

      {/* Rating Distribution */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const found = distribution.find(d => d.rating === star);
            const count = found?.count || 0;
            const pct = (count / totalReviews) * 100;
            return (
              <button key={star} onClick={() => setRatingFilter(ratingFilter === String(star) ? '' : String(star))}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${ratingFilter === String(star) ? 'bg-yellow-500/10 border border-yellow-500/20' : 'hover:bg-white/[0.02]'}`}>
                <span className="text-xs font-bold text-yellow-500 w-12">{'★'.repeat(star)}</span>
                <div className="flex-1 h-3 bg-black rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-500 w-8 text-right">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-gray-700 text-sm animate-pulse">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-700 text-sm">No reviews found</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className={`bg-[#0a0a0a] border rounded-2xl p-5 transition-all ${r.rating <= 2 ? 'border-red-500/20 bg-red-500/[0.02]' : 'border-white/5'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-sm text-white">
                    {r.reviewer_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{r.reviewer_name} <span className="text-gray-600">→</span> <span className="text-blue-400">{r.expert_name}</span></p>
                    <p className="text-[10px] text-gray-600">{r.job_title || `Job #${r.job_id}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} className={s <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-800'} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-600">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-gray-300 italic pl-14">"{r.comment}"</p>
              {r.rating <= 2 && (
                <div className="mt-3 pl-14">
                  <span className="text-[8px] font-black text-red-400 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">⚠ Low Rating — Review Recommended</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-600">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
