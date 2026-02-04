/*
'use client';
import { useState } from 'react';

export default function BidModal({ job, onClose }: { job: any, onClose: () => void }) {
  const [amount, setAmount] = useState(job.budget);
  const [msg, setMsg] = useState('');

  const submitBid = async () => {
    const response = await fetch('http://localhost:5000/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // expert_id is hardcoded to 1 for now until we add Login
      body: JSON.stringify({ job_id: job.id, expert_id: 1, bid_amount: amount, proposal_msg: msg }),
    });

    if (response.ok) {
      alert("✅ Bid Sent! The client will review it.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Bid for {job.title}</h2>
        <p className="text-gray-400 text-sm mb-6">Set your price and pitch your solution.</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Your Price (XP)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white mt-1 outline-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Short Proposal</label>
            <textarea 
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Why are you the best for this?"
              className="w-full bg-black border border-gray-800 rounded-lg p-3 text-white h-24 mt-1 outline-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 py-3 text-gray-400 font-bold hover:text-white transition">Cancel</button>
            <button onClick={submitBid} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Submit Bid</button>
          </div>
        </div>
      </div>
    </div>
  );
}
*/