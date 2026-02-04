'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OTPInput from '@/components/OTPInput';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'expert'>('expert');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'verify'>('info'); // Step control
  const router = useRouter();

  // Step 1: Trigger the OTP email
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        // Transition to the OTP input view
        setStep('verify');
      } else {
        const data = await res.json();
        alert(data.error || "Verification failed to send");
      }
    } catch (err) {
      alert("Network transmission failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Final Registration 
  const completeRegistration = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          role,
          user_rank: role === 'expert' ? 'Novice' : 'Bronze Patron',
          exp: 0,
          current_level: 1
        }),
      });

      if (res.ok) {
        alert("Node Initialized Successfully. Proceed to Login.");
        router.push('/login');
      } else {
        const data = await res.json();
        alert(data.error || "Final initialization failed");
      }
    } catch (err) {
      alert("Registration error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-[#0a0a0a] border border-gray-900 rounded-[2.5rem] shadow-2xl">
        
        {/* VIEW 1: REGISTRATION FORM */}
        {step === 'info' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                 <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-500">New Node Deployment</span>
              </div>
              <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Initialize</h1>
              <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-2">Create your SkillDash credentials</p>
            </div>

            <form onSubmit={handleInitiateRegister} className="space-y-4">
              <div className="flex gap-2 p-1 bg-black border border-gray-800 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => setRole('expert')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${role === 'expert' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  EXPERT (Earn EXP)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${role === 'client' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  CLIENT (Post Tasks)
                </button>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 block mb-1">Operator Name</label>
                <input 
                  type="text" required
                  className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 block mb-1">Network Email</label>
                <input 
                  type="email" required
                  className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="email@network.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 block mb-1">Encryption Key</label>
                <input 
                  type="password" required
                  className="w-full p-4 bg-black border border-gray-800 rounded-2xl text-white focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-4 font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 mt-4 tracking-tighter text-sm uppercase italic ${role === 'expert' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-orange-500 hover:bg-orange-400'} text-white`}
              >
                {loading ? 'Requesting Code...' : 'Send Verification Code'}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 2: OTP INPUT COMPONENT */}
        {step === 'verify' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <OTPInput 
              email={email} 
              onVerified={completeRegistration} 
            />
            <button 
              onClick={() => setStep('info')} 
              className="mt-4 text-[9px] font-black text-gray-600 uppercase tracking-widest hover:text-white w-full transition-colors"
            >
              ← Edit Account Details
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-900 text-center">
          <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">
            Already registered?{' '}
            <Link href="/login" className="text-white hover:text-orange-500 transition-colors underline decoration-gray-800 underline-offset-4">
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}