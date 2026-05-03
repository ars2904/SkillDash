'use client';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export default function ExpertProfile({ expertId, onClose }: { expertId: number, onClose: () => void }) {
  const { user: currentUser } = useUserStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const json = await apiFetch(`/api/users/${expertId}/profile?currentUserId=${currentUser?.id}`);
        setData(json);
      } catch (err: any) {
        toast.error("Profile fetch error", { description: err.message });
      } finally {
        setLoading(false);
      }
    };
    if (expertId) fetchProfile();
  }, [expertId, currentUser]);

  const handleFriendRequest = async () => {
    try {
      await apiFetch(`/api/friends/request`, {
        method: 'POST',
        body: JSON.stringify({ sender_id: currentUser?.id, receiver_id: expertId })
      });
      toast.success("Connection request sent!");
    } catch (err: any) {
      toast.error("Failed to send request", { description: err.message });
    }
  };

  if (loading) return <div className="fixed inset-0 bg-black/80 flex items-center justify-center text-white font-black animate-pulse z-[100]">LOADING PROFILE...</div>;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-[40px] overflow-hidden relative shadow-2xl">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-10 text-gray-500 hover:text-white font-black text-2xl transition-colors bg-black/50 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm">×</button>
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600"></div>
        
        <div className="p-8">
          {/* Avatar */}
          <div className="relative -mt-20 mb-6 flex items-end justify-between">
            <div className="w-24 h-24 bg-black border-4 border-[#0a0a0a] rounded-[30px] flex items-center justify-center text-4xl font-black text-white shadow-2xl overflow-hidden">
               <img src={`https://api.dicebear.com/9.x/bottts/svg?seed=${data.user.username}`} className="w-full h-full bg-black" alt="Avatar" />
            </div>
            <div className="flex gap-2 pb-2">
              <span className="bg-blue-600/20 border border-blue-500/20 text-blue-400 text-[10px] px-3 py-1.5 rounded-lg font-black tracking-widest uppercase">RANK {data.user.user_rank}</span>
              <span className="bg-green-600/20 border border-green-500/20 text-green-400 text-[10px] px-3 py-1.5 rounded-lg font-black tracking-widest uppercase italic">VERIFIED</span>
            </div>
          </div>

          {/* User Info */}
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">{data.user.username}</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
            Level {data.user.current_level} • {data.user.location || 'Global'}
          </p>

          {/* Bio & Skills */}
          <div className="mb-6 space-y-4">
            {data.user.bio && (
              <p className="text-sm text-gray-300 italic bg-white/5 p-4 rounded-2xl border border-white/5">{data.user.bio}</p>
            )}
            
            {data.skills && data.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill: string) => (
                  <span key={skill} className="text-[10px] font-bold text-gray-400 bg-black border border-white/10 px-3 py-1.5 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black p-4 rounded-2xl border border-white/5">
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Jobs Completed</p>
              <p className="text-xl text-white font-black">{data.stats.reviewCount || 0}</p>
            </div>
            <div className="bg-black p-4 rounded-2xl border border-white/5">
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Avg Rating</p>
              <p className="text-xl text-yellow-500 font-black">
                {data.stats.avgRating ? Number(data.stats.avgRating).toFixed(1) : '—'}
              </p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mb-8">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mb-3 italic">Recent Feedback</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
              {data.reviews && data.reviews.length > 0 ? (
                data.reviews.slice(0, 3).map((rev: any) => (
                  <div key={rev.id} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">{rev.reviewer_name}</span>
                      <div className="text-yellow-500 text-[8px]">{'★'.repeat(rev.rating)}</div>
                    </div>
                    <p className="text-gray-400 text-[11px] leading-snug italic">"{rev.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-[10px] uppercase font-bold italic text-center py-4 bg-black rounded-xl border border-white/5">No feedback history yet.</p>
              )}
            </div>
          </div>

          {/* Friend Request Button */}
          {currentUser?.id !== expertId && (
            <button 
              onClick={handleFriendRequest}
              className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5"
            >
              {data.connection?.status === 'accepted' ? '✓ ALREADY CONNECTED' : 'SEND CONNECTION REQUEST'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}