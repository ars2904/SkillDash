'use client';
import { useState, useEffect } from 'react';

interface OTPInputProps {
  email: string;
  onVerified: () => void;
}

export default function OTPInput({ email, onVerified }: OTPInputProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60); // 60-second cooldown
  const [canResend, setCanResend] = useState(false);

  // Handle the countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (data.success) {
        onVerified(); 
      } else {
        setError(data.error || "Invalid Code");
      }
    } catch (err) {
      setError("Connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(60); // Reset timer
    setError('');

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      setError("Failed to resend code.");
    }
  };

  return (
    <div className="p-6 bg-[#111] border border-gray-800 rounded-3xl text-center">
      <h2 className="text-xl font-black text-white italic mb-2 tracking-tighter">VERIFY PROTOCOL</h2>
      <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest font-bold">
        Secure code sent to <span className="text-blue-400">{email}</span>
      </p>
      
      <input 
        type="text" 
        maxLength={6}
        placeholder="000000"
        className="w-full bg-black border border-gray-800 p-4 rounded-xl text-center text-3xl font-bold tracking-[10px] text-orange-500 outline-none focus:border-blue-500 mb-4 placeholder:opacity-20"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
      />

      {error && (
        <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
           <p className="text-red-500 text-[10px] font-black uppercase tracking-tighter">{error}</p>
        </div>
      )}

      <button 
        onClick={handleVerify}
        disabled={loading || otp.length < 6}
        className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-orange-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed uppercase italic text-sm mb-4"
      >
        {loading ? "AUTHENTICATING..." : "AUTHORIZE DEPLOYMENT"}
      </button>

      <div className="text-center">
        {canResend ? (
          <button 
            onClick={handleResend}
            className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
          >
            Resend New Code
          </button>
        ) : (
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
            Resend available in {timer}s
          </p>
        )}
      </div>
    </div>
  );
}