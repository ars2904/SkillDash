'use client';
import { useEffect, useState } from 'react';

export default function SystemBriefing() {
  const [ready, setReady] = useState(false);      // wait for browser
  const [seen, setSeen] = useState(false);        // has user seen briefing?

  // Mark that we are on the browser (window + localStorage exist)
  useEffect(() => {
    setReady(true);
  }, []);

  // After we know we're on the browser, read localStorage once
  useEffect(() => {
    if (!ready) return;
    try {
      const stored = localStorage.getItem('briefingSeen');
      if (stored === 'true') {
        setSeen(true);        // already seen → don't show
      }
    } catch (e) {
      console.error('localStorage error', e);
    }
  }, [ready]);

  // If not ready or already seen → render nothing
  if (!ready || seen) return null;

  const closeBriefing = () => {
    try {
      localStorage.setItem('briefingSeen', 'true');
    } catch (e) {
      console.error('localStorage error', e);
    }
    setSeen(true);
  };

  // Simple visible test UI (replace with your fancy UI later)
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        flexDirection: 'column'
      }}
    >
      <h1>System Briefing</h1>
      <p>This should show ONLY the first time on this browser.</p>
      <button
        onClick={closeBriefing}
        style={{ marginTop: 20, padding: '10px 20px' }}
      >
        I Understand
      </button>
    </div>
  );
}
