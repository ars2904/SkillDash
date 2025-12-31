'use client';
import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Search, UserPlus, Check, Shield, SearchX, MousePointer2 } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { user } = useUserStore();
  const [pendingIds, setPendingIds] = useState<number[]>([]);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    const res = await fetch(`http://localhost:5000/api/users/search?q=${val}`);
    const data = await res.json();
    setResults(data.filter((u: any) => u.id !== user?.id));
  };

  const sendRequest = async (targetId: number) => {
    const res = await fetch('http://localhost:5000/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_one_id: user?.id, user_two_id: targetId }),
    });
    if (res.ok) setPendingIds([...pendingIds, targetId]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">
          Find Experts
        </h1>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mt-2 ml-1">
          Build your professional network
        </p>
      </div>

      {/* Search Bar - Brutalist Style */}
      <div className="relative mb-16 group">
        <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-3xl" />
        <div className="relative flex items-center bg-[#050505] border-2 border-gray-900 focus-within:border-orange-500 rounded-3xl p-2 transition-all">
          <div className="p-4 text-gray-600">
            <Search size={24} />
          </div>
          <input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-transparent py-4 text-xl font-bold text-white outline-none placeholder:text-gray-800"
          />
        </div>
      </div>

      <h2 className="text-2xl font-black italic uppercase tracking-tight text-white mb-8">Results</h2>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((expert: any) => (
          <div 
            key={expert.id} 
            className="group relative bg-[#0a0a0a] border border-gray-900 rounded-[2rem] p-6 hover:border-orange-500 transition-all duration-300"
          >
            <div className="flex items-center gap-5">
              {/* Profile Avatar with Gradient */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 p-[2px]">
                <div className="w-full h-full bg-[#0a0a0a] rounded-[14px] flex items-center justify-center">
                  <span className="text-3xl font-black italic text-white group-hover:scale-110 transition-transform">
                    {expert.username[0].toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  {expert.username}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Shield size={12} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Rank {expert.user_rank} Expert
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => sendRequest(expert.id)}
                disabled={pendingIds.includes(expert.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all ${
                  pendingIds.includes(expert.id)
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-white text-black hover:bg-orange-500 hover:text-white'
                }`}
              >
                {pendingIds.includes(expert.id) ? (
                  <>CONNECTED <Check size={14}/></>
                ) : (
                  <>CONNECT <UserPlus size={14}/></>
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Empty State: Start Typing */}
        {query.length < 2 && (
          <div className="col-span-full py-20 border-2 border-dashed border-gray-900 rounded-[3rem] flex flex-col items-center justify-center opacity-40">
            <MousePointer2 size={40} className="text-gray-700 mb-4 animate-bounce" />
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Start typing to find experts</p>
          </div>
        )}

        {/* Empty State: No Results */}
        {query.length >= 2 && results.length === 0 && (
          <div className="col-span-full py-20 bg-red-500/5 border border-red-500/10 rounded-[3rem] flex flex-col items-center justify-center">
            <SearchX size={40} className="text-red-900 mb-4" />
            <p className="text-red-500/50 font-black uppercase tracking-widest text-xs">No experts found matching "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}