import React from 'react';
import { MapPin, User, Shield, Briefcase, GraduationCap } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';

export default function Header({ currentUser, onOpenAuth, onBrandClick }) {
  const roleColor = currentUser?.role === 'admin'
    ? { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', icon: '#D97706' }
    : currentUser?.role === 'faculty'
    ? { bg: 'var(--primary-light)', border: 'var(--primary-border)', text: 'var(--primary-dark)', icon: 'var(--primary)' }
    : { bg: 'var(--secondary-light)', border: 'var(--secondary-border)', text: 'var(--secondary-dark)', icon: 'var(--secondary)' };

  return (
    <header style={{
      height: 'var(--header-height)',
      padding: '0 16px',
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 6px rgba(26,16,56,0.06)',
    }}>

      {/* Brand */}
      <div
        onClick={onBrandClick}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: '#FFFFFF',
          border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(26,16,56,0.08)',
          padding: 3, flexShrink: 0,
          transition: 'transform 0.15s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src="/Logo.png"
            alt="Kirti College"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div>
          <div style={{
            fontSize: 15, fontWeight: 900, color: 'var(--text-primary)',
            letterSpacing: '-0.4px', lineHeight: 1.2
          }}>
            Kirti<span style={{
              background: 'linear-gradient(90deg, #7C3AED, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Audit</span>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 3, marginTop: 1
          }}>
            <MapPin size={9} color="#10B981" />
            Auditorium Portal
          </div>
        </div>
      </div>

      {/* Right Controls: Notification Bell + User Role Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <NotificationBell />

        <button
          onClick={onOpenAuth}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 13px',
          borderRadius: 'var(--r-full)',
          border: currentUser ? `1px solid ${roleColor.border}` : '1px solid var(--border)',
          background: currentUser ? roleColor.bg : 'var(--surface-subtle)',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          boxShadow: 'var(--shadow-xs)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {currentUser ? (
          <>
            {/* Role icon */}
            <div style={{
              width: 20, height: 20, borderRadius: 6,
              background: currentUser.role === 'admin'
                ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                : currentUser.role === 'faculty'
                ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
                : 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {currentUser.role === 'admin' && <Shield size={11} color="#FFFFFF" />}
              {currentUser.role === 'faculty' && <Briefcase size={11} color="#FFFFFF" />}
              {currentUser.role === 'student' && <GraduationCap size={11} color="#FFFFFF" />}
            </div>
            <span style={{
              fontSize: 12, fontWeight: 800,
              maxWidth: 80, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              color: roleColor.text,
            }}>
              {(currentUser.name || 'User').split(' ')[0]}
            </span>
            {/* Online dot */}
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#10B981', flexShrink: 0,
              boxShadow: '0 0 0 2px rgba(16,185,129,0.25)',
            }} />
          </>
        ) : (
          <>
            <User size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Sign In</span>
          </>
        )}
      </button>
    </div>
  </header>
  );
}
