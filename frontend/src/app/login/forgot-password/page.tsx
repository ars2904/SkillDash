'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OTPInput from '@/components/OTPInput';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'new-password'>('request');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Success Modal State
  const router = useRouter();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setStep('verify');
      else alert("Email not found in network records.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      if (res.ok) {
        setShowSuccess(true); // Trigger Modal
        setTimeout(() => {
          router.push('/login');
        }, 3000); // Redirect after 3 seconds
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* SUCCESS MODAL OVERLAY */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="text-center p-10 border border-blue-500/30 bg-[#050505] rounded-[3rem] shadow-[0_0_50px_rgba(59,130,246,0.2)] animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/50">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Key Re-Deployed</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Redirecting to Login Protocol...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md p-8 bg-[#0a0a0a] border border-gray-900 rounded-[2.5rem] shadow-2xl">
        
        {step === 'request' && (
          <div className="animate-in fade-in duration-500 text-center">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Recover Key</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-8">Enter your network email to reset</p>
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <input 
                type="email" required placeholder="Email Address"
                className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-orange-500 transition-all text-sm"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={loading} className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl uppercase italic text-sm hover:opacity-90 active:scale-95 transition-all">
                {loading ? "SEARCHING..." : "INITIATE RECOVERY"}
              </button>
            </form>
          </div>
        )}

        {step === 'verify' && (
          <OTPInput email={email} onVerified={() => setStep('new-password')} />
        )}

        {step === 'new-password' && (
          <div className="animate-in zoom-in-95 duration-500 text-center">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8">New Encryption Key</h1>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input 
                type="password" required placeholder="Enter New Password"
                className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-blue-500 transition-all text-sm"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl uppercase italic text-sm hover:bg-blue-500 active:scale-95 transition-all">
                {loading ? "UPDATING..." : "RE-DEPLOY KEY"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-gray-600 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}