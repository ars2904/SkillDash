'use client';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';

export default function ExpertProfile({ expertId, onClose }: { expertId: number, onClose: () => void }) {
  const { user: currentUser } = useUserStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${expertId}/profile?currentUserId=${currentUser?.id}`);
        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error("Profile fetch error", err);
      }
    };
    if (expertId) fetchProfile();
  }, [expertId, currentUser]);

  const handleFriendRequest = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: currentUser?.id, receiver_id: expertId })
    });
    if (res.ok) alert("Friend request sent!");
  };

  if (loading) return <div className="fixed inset-0 bg-black/80 flex items-center justify-center text-white font-black animate-pulse">LOADING PROFILE...</div>;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-gray-800 w-full max-w-md rounded-[40px] overflow-hidden relative shadow-2xl">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-10 text-gray-500 hover:text-white font-black text-2xl transition-colors">×</button>
        
        {/* Banner */}
        <div className="h-28 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-600"></div>
        
        <div className="p-8">
          {/* Avatar */}
          <div className="relative -mt-20 mb-6">
            <div className="w-24 h-24 bg-black border-4 border-[#0f0f0f] rounded-[30px] flex items-center justify-center text-4xl font-black text-white shadow-2xl">
              {data.user.username[0].toUpperCase()}
            </div>
          </div>

          {/* User Info */}
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{data.user.username}</h2>
          <div className="flex gap-2 mt-2 mb-6">
            <span className="bg-blue-600/20 text-blue-400 text-[10px] px-2 py-1 rounded-md font-black tracking-widest uppercase">RANK {data.user.user_rank}</span>
            <span className="bg-green-600/20 text-green-400 text-[10px] px-2 py-1 rounded-md font-black tracking-widest uppercase italic">VERIFIED</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-black p-4 rounded-2xl border border-gray-900">
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Jobs Completed</p>
              <p className="text-xl text-white font-black">{data.stats.reviewCount || 0}</p>
            </div>
            <div className="bg-black p-4 rounded-2xl border border-gray-900">
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Avg Rating</p>
              <p className="text-xl text-yellow-500 font-black">
                {data.stats.avgRating ? Number(data.stats.avgRating).toFixed(1) : '5.0'}
              </p>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mb-8">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mb-4 italic">Recent Feedback</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
              {data.reviews && data.reviews.length > 0 ? (
                data.reviews.map((rev: any) => (
                  <div key={rev.id} className="p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">{rev.reviewer_name}</span>
                      <div className="text-yellow-500 text-[8px]">{'★'.repeat(rev.rating)}</div>
                    </div>
                    <p className="text-gray-400 text-[11px] leading-snug italic">"{rev.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-[10px] uppercase font-bold italic">No feedback history yet.</p>
              )}
            </div>
          </div>

          {/* Friend Request Button */}
          <button 
            onClick={handleFriendRequest}
            className="w-full py-4 bg-white text-black rounded-2xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5"
          >
            {data.connection?.status === 'accepted' ? '✓ ALREADY FRIENDS' : 'SEND FRIEND REQUEST'}
          </button>
        </div>
      </div>
    </div>
  );
}