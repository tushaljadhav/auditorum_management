import React, { useEffect, useState } from 'react';

export default function Splash({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=enter, 1=show, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.4s ease',
      opacity: phase === 2 ? 0 : 1,
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: '15%', right: '12%',
        width: 180, height: 180, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)', filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '18%', left: '8%',
        width: 140, height: 140, borderRadius: '50%',
        background: 'rgba(16,185,129,0.08)', filter: 'blur(30px)', pointerEvents: 'none'
      }} />

      {/* Logo */}
      <div style={{
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>
        {/* Main Logo */}
        <div style={{
          width: 96, height: 96, borderRadius: 26,
          background: 'rgba(255,255,255,0.95)',
          border: '2px solid rgba(255,255,255,0.4)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35), 0 0 40px rgba(99,102,241,0.4)',
          padding: 12,
        }}>
          <img
            src="/Logo.png"
            alt="Kirti College Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 6 }}>
            Kirti College
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#A5B4FC', letterSpacing: 0.3 }}>
            Auditorium Management Portal
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'radarPing 2s ease-in-out infinite' }} />
            Dadar (W), Mumbai
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          width: 120, height: 3, borderRadius: 999,
          background: 'rgba(255,255,255,0.12)',
          marginTop: 10, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: 'linear-gradient(90deg, #6366F1, #10B981)',
            borderRadius: 999,
            transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)',
            width: phase >= 1 ? '100%' : '0%',
          }} />
        </div>
      </div>

      {/* Bottom badge */}
      <div style={{
        position: 'absolute', bottom: 40,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(10px)',
      }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textAlign: 'center' }}>
          Kirti M. Doongursee College
        </div>
      </div>
    </div>
  );
}
