'use client';
import { useEffect, useState } from 'react';
import { Send, X } from 'lucide-react';

export default function PrivateChat({ connection, currentUser, onBack }: { connection: any, currentUser: any, onBack: () => void }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const fetchMsgs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/${connection.connection_id}/messages`);
      setChat(await res.json());
    } catch (e) { console.error("Chat fetch error", e); }
  };

  useEffect(() => {
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 3000);
    return () => clearInterval(interval);
  }, [connection.connection_id]);

  const sendMsg = async () => {
    if (!msg.trim()) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/connections/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connection.connection_id, sender_id: currentUser.id, content: msg })
    });
    setMsg("");
    fetchMsgs();
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#0a0a0a] border border-gray-900 rounded-[2rem] overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-gray-900 flex justify-between items-center bg-black">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black text-black">{connection.username[0].toUpperCase()}</div>
          <div>
            <h3 className="text-white font-black uppercase tracking-tighter">{connection.username}</h3>
            <p className="text-[9px] text-orange-500 font-black tracking-widest uppercase">Private Connection</p>
          </div>
        </div>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest border border-gray-800 px-4 py-2 rounded-xl transition">Close Chat</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#050505]">
        {chat.map((c: any, i) => (
          <div key={i} className={`flex ${c.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl text-xs max-w-[70%] font-medium ${c.sender_id === currentUser.id ? 'bg-orange-500 text-black rounded-tr-none' : 'bg-gray-900 text-white rounded-tl-none'}`}>{c.content}</div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-black border-t border-gray-900 flex gap-3">
        <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder="Write a message..." className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-xl px-5 py-3 text-white text-xs outline-none focus:border-orange-500 transition-all" />
        <button onClick={sendMsg} className="bg-white text-black p-3 rounded-xl hover:bg-orange-500 transition-all"><Send size={18} /></button>
      </div>
    </div>
  );
}