'use client';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import ExpertProfile from './ExpertProfile'; 
import { CheckCircle, Lock, Send, Star, X } from 'lucide-react';

export default function Workroom({ jobId }: { jobId: number }) {
  const { user, role } = useUserStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('assigned');
  const [expertId, setExpertId] = useState<number | null>(null); 
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // --- FINALIZATION STATES ---
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [reviewText, setReviewText] = useState(''); 
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const msgRes = await fetch(`http://localhost:5000/api/jobs/${jobId}/messages`);
      const msgData = await msgRes.json();
      setMessages(msgData);

      const jobRes = await fetch(`http://localhost:5000/api/jobs/${jobId}`); 
      const jobData = await jobRes.json();
      
      const currentJob = Array.isArray(jobData) ? jobData[0] : jobData; 
      
      if (currentJob) {
        setStatus(currentJob.status);
        setExpertId(currentJob.expert_id);
      }
      setLoading(false);
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  const handleComplete = async () => {
    if (!reviewText.trim()) {
      alert("Please provide a mission summary.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          review: reviewText,
          rating: rating
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Updated Alert to reflect progressive difficulty
        alert(`MISSION SUCCESS!\n\nYou are now Level ${data.newLevel} (${data.newRank}).\nNext Milestone: ${data.newLevel * 100} EXP needed.`);
        window.location.reload(); 
      } else {
        alert(data.error || "Failed to finalize mission");
      }
    } catch (err) {
      console.error("Finalization error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || status === 'completed') return;
    const res = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, sender_id: user.id, content: text })
    });
    if (res.ok) { setText(''); fetchData(); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="text-blue-500 text-xs animate-pulse uppercase font-black tracking-widest text-center">
        Establishing Secure Connection...<br/>
        <span className="text-gray-700 text-[8px] mt-2 block">Syncing Job ID: {jobId}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[600px] bg-[#0a0a0a] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* --- COMPLETION MODAL --- */}
      {showCompletionModal && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="max-w-sm w-full bg-[#111] border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl relative">
            <button onClick={() => setShowCompletionModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X size={20} />
            </button>

            <h3 className="text-white font-black text-xl mb-1 uppercase italic">Finalize Mission</h3>
            <p className="text-gray-500 text-[9px] mb-6 uppercase tracking-[3px]">Provide feedback to claim rewards</p>
            
            <textarea 
               value={reviewText}
               onChange={(e) => setReviewText(e.target.value)}
               placeholder="Briefly summarize the work completed..."
               className="w-full h-32 bg-black border border-gray-800 rounded-2xl p-4 text-xs text-white focus:border-orange-500 outline-none transition-all mb-4 font-bold"
            />

            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-all ${rating >= star ? 'text-orange-500 scale-110' : 'text-gray-800'}`}
                >
                  ★
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleComplete}
              disabled={isSubmitting}
              className="w-full py-4 bg-orange-600 text-white font-black text-[10px] tracking-widest uppercase rounded-2xl hover:bg-orange-500 transition-all shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? 'UPLOADING PROTOCOLS...' : 'SUBMIT & CLAIM EXP'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-5 bg-[#111] border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${status === 'completed' ? 'bg-gray-800' : 'bg-blue-500/10'}`}>
            {status === 'completed' ? <Lock size={16} className="text-gray-500"/> : <CheckCircle size={16} className="text-blue-500"/>}
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-black tracking-widest uppercase italic ${status === 'completed' ? 'text-gray-500' : 'text-blue-400'}`}>
              {status === 'completed' ? 'Archived Workspace' : 'Active Workroom'}
            </span>
            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Encrypted Channel • ID: {jobId}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {status !== 'completed' && (
            <button 
              onClick={() => setShowCompletionModal(true)} 
              className="px-4 py-2 bg-green-600 text-white text-[9px] font-black rounded-xl hover:bg-green-500 transition-all uppercase tracking-widest shadow-lg shadow-green-600/20"
            >
              {role === 'expert' ? 'SUBMIT WORK' : 'COMPLETE JOB'}
            </button>
          )}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-gray-800">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'completed' ? 'bg-gray-600' : 'bg-green-500 animate-pulse'}`}></div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{status}</span>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent">
        {messages.map((m: any) => {
          const isMe = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className="flex items-center gap-2 mb-1.5 px-1">
                {!isMe && (
                  <button 
                    onClick={() => setSelectedProfileId(m.sender_id)}
                    className="text-[10px] font-black text-blue-400 hover:text-white transition-colors uppercase tracking-tighter"
                  >
                    {m.username}
                  </button>
                )}
                <span className="text-[8px] text-gray-700 font-bold">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-500/10 px-1.5 rounded">You</span>}
              </div>
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                isMe 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20' 
                : 'bg-[#161616] text-gray-200 border border-gray-800 rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input or Closed Notice */}
      {status !== 'completed' ? (
        <form onSubmit={sendMessage} className="p-4 bg-[#0d0d0d] border-t border-gray-800 flex gap-3">
          <input 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Secure message..."
            className="flex-1 bg-black border border-gray-800 rounded-2xl px-5 py-4 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 font-bold"
          />
          <button type="submit" className="bg-white text-black w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-xl group">
            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
          </button>
        </form>
      ) : (
        <div className="p-6 bg-gray-950/50 border-t border-gray-800 text-center backdrop-blur-sm">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[5px]">Project Archived • No Further Edits</p>
        </div>
      )}

      {selectedProfileId && (
        <ExpertProfile expertId={selectedProfileId} onClose={() => setSelectedProfileId(null)} />
      )}
    </div>
  );
}