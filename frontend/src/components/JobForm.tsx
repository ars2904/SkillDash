'use client';
import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Zap, Target, Star } from 'lucide-react';

export default function JobForm() {
  const { user } = useUserStore();
  const [title, setTitle] = useState('');
  const [expReward, setExpReward] = useState('5'); // Default to 5 EXP
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Authentication Error: You must be logged in.");
      return;
    }

    setLoading(true);

    const jobData = {
      client_id: user.id,
      title,
      description,
      exp_reward: parseInt(expReward), // Renamed from budget
      category: 'Development'
    };

    try {
      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });

      if (res.ok) {
        alert("Mission Successfully Deployed to Feed!");
        setTitle('');
        setExpReward('5');
        setDescription('');
      } else {
        alert("Failed to deploy task.");
      }
    } catch (err) {
      console.error("Transmission Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-[#111] border border-gray-800 rounded-3xl space-y-4 animate-in slide-in-from-top-2 duration-500">
      {/* Title Input */}
      <div>
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Project Title</label>
        <input 
          type="text" 
          placeholder="e.g., Integrate Auth Handshake" 
          className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-orange-500 transition-all text-sm"
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* EXP Reward Selection */}
      <div>
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Experience Reward (EXP)</label>
        <div className="relative">
          <select 
            className="w-full p-4 bg-black border border-gray-800 rounded-xl text-orange-500 font-bold outline-none appearance-none focus:border-orange-500 cursor-pointer text-sm"
            value={expReward} 
            onChange={(e) => setExpReward(e.target.value)}
          >
            <option value="5">5 EXP</option>
            <option value="10">10 EXP</option>
            <option value="15">15 EXP</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
            <Target size={14} />
          </div>
        </div>
      </div>

      {/* Description Input */}
      <div>
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Technical Briefing</label>
        <textarea 
          placeholder="Detail the project requirements and expected outcome..." 
          className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-orange-500 h-32 resize-none text-sm leading-relaxed"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Submit Button */}
      <button 
        disabled={loading}
        className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-orange-500 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 tracking-tighter"
      >
        <Zap size={16} fill="currentColor" />
        {loading ? "INITIALIZING..." : "DEPLOY TASK TO FEED"}
      </button>
    </form>
  );
}