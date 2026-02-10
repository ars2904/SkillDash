'use client';
import { useEffect, useState } from 'react';

export default function SystemBriefing() {
  const [ready, setReady] = useState(false);
  const [seen, setSeen] = useState(false);

  // 1) Just to prove this component is running
  console.log('SystemBriefing MOUNT');

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      const stored = localStorage.getItem('briefingSeen');
      console.log('briefingSeen in localStorage =', stored);
      if (stored === 'true') {
        setSeen(true);
      }
    } catch (e) {
      console.error('localStorage error', e);
    }
  }, [ready]);

  if (!ready || seen) {
    console.log('SystemBriefing HIDDEN: ready=', ready, 'seen=', seen);
    return null;
  }

  const close = () => {
    try {
      localStorage.setItem('briefingSeen', 'true');
    } catch (e) {
      console.error('localStorage set error', e);
    }
    setSeen(true);
  };

  // 2) Super obvious UI – full screen red block
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255,0,0,0.9)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        flexDirection: 'column',
        fontSize: 24
      }}
    >
      <div>TEST SYSTEM BRIEFING</div>
      <div style={{ fontSize: 14, marginTop: 10 }}>
        If you see this, the component is mounted.
      </div>
      <button
        onClick={close}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        I Understand (Hide forever)
      </button>
    </div>
  );
}
