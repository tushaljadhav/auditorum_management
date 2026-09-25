import React from 'react';
import { LayoutDashboard, Building2, CalendarDays, Users, Settings } from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'venues',    label: 'Halls',    icon: Building2 },
  { id: 'bookings',  label: 'Bookings', icon: CalendarDays },
  { id: 'faculty',   label: 'Users',    icon: Users },
  { id: 'settings',  label: 'System',   icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 540,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      height: 'calc(var(--nav-height) + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)',
    }}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              flex: 1,
              height: '100%',
              cursor: 'pointer',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <div style={{
              width: isActive ? 48 : 36,
              height: 28,
              borderRadius: isActive ? '12px' : '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.2s ease',
            }}>
              <Icon
                size={18}
                strokeWidth={isActive ? 2.4 : 1.8}
                color={isActive ? 'var(--primary)' : 'var(--text-muted)'}
              />
            </div>

            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 750 : 600,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

