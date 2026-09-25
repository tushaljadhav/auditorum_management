import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';

export default function Header({ currentUser, onLogout, onNavigate }) {
  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
    }}>
      <div 
        onClick={() => onNavigate?.('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#FFFFFF',
          border: '1.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
        }}>
          <img src="/Logo.png" alt="Kirti College" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{
            fontSize: 15,
            fontWeight: 850,
            letterSpacing: '-0.3px',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
          }}>
            Kirti<span style={{ color: 'var(--primary)' }}>Admin</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--success)',
            marginTop: 1,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            Live System
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <NotificationBell />
        <div 
          onClick={() => onNavigate?.('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 10px 4px 6px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={11} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 750, color: 'var(--text-primary)' }}>
            {currentUser?.username || 'Admin'}
          </span>
        </div>

        <button
          onClick={onLogout}
          title="Sign Out"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <LogOut size={13} />
        </button>
      </div>
    </header>
  );
}

