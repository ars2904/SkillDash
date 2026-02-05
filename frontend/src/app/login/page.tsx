'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  const { setUser, setRole } = useUserStore();
  const router = useRouter();

  // Show briefing once per browser
  useEffect(() => {
    const seen = localStorage.getItem('briefingSeen');
    if (!seen) {
      setShowBriefing(true);
    }
  }, []);

  const closeBriefing = () => {
    localStorage.setItem('briefingSeen', 'true');
    setShowBriefing(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          user_rank: data.user_rank || 'Novice',
          exp: data.exp || 0,
          current_level: data.current_level || 1,
        });

        setRole(data.role);
        router.push('/');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch {
      alert('Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">

      {/* ================= SYSTEM BRIEFING ================= */}
{showBriefing && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
    <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
      
      {/* Subtle Glow Header Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-64 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      <div className="relative z-10">
        {/* Heading Section */}
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.5em] text-orange-500 font-bold uppercase mb-2">Protocol Initialized</p>
          <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            SYSTEM <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">BRIEFING</span>
          </h2>
        </div>

        {/* Intro Section */}
        <div className="space-y-4 mb-10 text-center">
          <p className="text-gray-200 text-lg font-medium leading-relaxed max-w-md mx-auto">
            SkillDash is a platform for posting problems and delivering solutions through structured tasks.
          </p>
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">
            Users participate in one of two roles.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {/* Clients Card */}
          <div className="group p-6 bg-[#111] border border-white/5 rounded-3xl hover:border-orange-500/40 transition-all duration-300">
            <div className="flex gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" />
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500/10" />
            </div>
            <span className="text-orange-400 font-black text-sm uppercase tracking-widest">Clients</span>
            <p className="text-gray-400 mt-3 text-[13px] leading-relaxed">
              Clients describe a problem, post it as a task, review responses from experts, and collaborate with a selected expert to reach a solution. Progression is based on successful task completion and consistent participation.
            </p>
          </div>

          {/* Experts Card */}
          <div className="group p-6 bg-[#111] border border-white/5 rounded-3xl hover:border-cyan-500/40 transition-all duration-300">
            <div className="flex gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/10" />
            </div>
            <span className="text-cyan-400 font-black text-sm uppercase tracking-widest">Experts</span>
            <p className="text-gray-400 mt-3 text-[13px] leading-relaxed">
              Experts solve posted tasks, earn EXP, and increase their level and rank over time, reflecting their experience and reliability within the system.
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-gray-600 text-[10px] leading-relaxed mb-8 text-center px-4 uppercase tracking-[0.1em]">
          Your role determines available actions, visibility, and system access. <br/> You’ll select it during registration.
        </p>

        {/* I Understand Button */}
        <button
          onClick={closeBriefing}
          className="group relative w-full overflow-hidden h-16 bg-gradient-to-r from-orange-600 via-orange-400 to-cyan-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)]"
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          <span className="relative z-10 text-lg uppercase tracking-[0.2em]">I Understand</span>
          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
      </div>
    </div>
  </div>
)}

      {/* ================= LOGIN CARD ================= */}
      <div className="w-full max-w-md p-8 bg-[#0a0a0a] border border-gray-900 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-orange-500">
              Secure Node Access
            </span>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            SkillDash
          </h1>
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-2">
            Protocol Authorization Required
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 block mb-1">
              Link Identifier (Email)
            </label>
            <input
              type="email"
              required
              className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all text-sm placeholder:text-gray-800"
              placeholder="operator@network.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 block mb-1">
              Access Key
            </label>
            <input
              type="password"
              required
              className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all text-sm placeholder:text-gray-800"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end pr-1">
            <Link
              href="/login/forgot-password"
              className="text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-orange-500 transition-colors"
            >
              Forgot Encryption Key?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 mt-4 tracking-tighter text-sm uppercase italic"
          >
            {loading ? 'Decrypting...' : 'Establish Session'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-900 text-center">
          <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">
            Unregistered?{' '}
            <Link
              href="/register"
              className="text-orange-500 hover:text-white transition-colors underline underline-offset-4 decoration-gray-800"
            >
              Initialize New Application
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
