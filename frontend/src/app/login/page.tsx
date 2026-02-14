'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SystemBriefing from '@/components/SystemBriefing';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWakeMessage, setShowWakeMessage] = useState(false);

  const { setUser, setRole } = useUserStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowWakeMessage(false);

    // Show cold-start message if request takes longer than 3s
    const timer = setTimeout(() => {
      setShowWakeMessage(true);
    }, 3000);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

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
      clearTimeout(timer);
      setLoading(false);
      setShowWakeMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      <SystemBriefing />

      {/* LOGIN CARD */}
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
              className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all text-sm"
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
              className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white focus:border-orange-500 outline-none transition-all text-sm"
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

          {/* Cold Start Message */}
          {showWakeMessage && (
            <p className="text-[10px] text-gray-500 text-center mt-3 uppercase tracking-widest">
              Server may be waking up after inactivity.  
              This can take up to 60 seconds on first request.
            </p>
          )}
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
