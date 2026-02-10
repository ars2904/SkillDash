'use client';
import { useEffect, useState } from 'react';

export default function SystemBriefing() {
  const [showBriefing, setShowBriefing] = useState(true);  // Start SHOWING
  const [isReady, setIsReady] = useState(false);          // Wait for browser

  // Step 1: Wait for browser to fully load
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Step 2: Check if they've seen it before
  useEffect(() => {
    if (!isReady) return;  // Don't run until browser ready
    const seen = localStorage.getItem('briefingSeen');
    if (seen) {
      setShowBriefing(false);  // Hide if seen before
    }
  }, [isReady]);

  const closeBriefing = () => {
    localStorage.setItem('briefingSeen', 'true');
    setShowBriefing(false);
  };

  // Don't show until browser is ready
  if (!isReady || !showBriefing) return null;

  return (
    <>
      {/* ================= SYSTEM BRIEFING ================= */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 transition-opacity duration-500">
        <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_60px_-15px_rgba(249,115,22,0.4)] relative overflow-hidden transition-all duration-500 ease-out">

          {/* Top Glow Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <p className="text-[10px] tracking-[0.5em] text-orange-500 font-bold uppercase mb-2">
                Protocol Initialized
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                SYSTEM{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                  BRIEFING
                </span>
              </h2>
            </div>

            <div className="space-y-4 mb-10 text-center">
              <p className="text-gray-200 text-lg font-medium leading-relaxed max-w-md mx-auto">
                SkillDash is a platform for posting problems and delivering solutions through structured tasks.
              </p>
              <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">
                Users participate in one of two roles.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {/* Clients */}
              <div className="group p-6 bg-[#111] border border-white/5 rounded-3xl hover:border-orange-500/40 transition-all">
                <div className="flex gap-1.5 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]" />
                </div>
                <span className="text-orange-400 font-black text-sm uppercase tracking-widest">
                  Clients
                </span>
                <p className="text-gray-400 mt-3 text-[13px] leading-relaxed">
                  Clients describe a problem, post it as a task, review responses from experts, and collaborate with a selected expert.
                </p>
              </div>

              {/* Experts */}
              <div className="group p-6 bg-[#111] border border-white/5 rounded-3xl hover:border-cyan-500/40 transition-all">
                <div className="flex gap-1.5 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                </div>
                <span className="text-cyan-400 font-black text-sm uppercase tracking-widest">
                  Experts
                </span>
                <p className="text-gray-400 mt-3 text-[13px] leading-relaxed">
                  Experts solve posted tasks, earn EXP, and increase their level and rank over time.
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-[10px] mb-8 text-center uppercase tracking-[0.1em]">
              Your role determines available actions and system access.
            </p>

            <button
              onClick={closeBriefing}
              className="group relative w-full h-16 overflow-hidden bg-gradient-to-r from-orange-600 via-orange-400 to-cyan-500 text-white font-black rounded-2xl shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)] active:scale-95"
            >
              <span className="relative z-10 text-lg uppercase tracking-[0.2em]">
                I Understand
              </span>
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
