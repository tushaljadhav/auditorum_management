import React from 'react';
import { Home, Calendar, Radio, History, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, currentUser }) {
  const tabs = [
    { id: 'home',     label: 'Home',      icon: Home },
    { id: 'booking',  label: 'Book Hall', icon: Calendar, accent: true },
    { id: 'faculty',  label: 'Faculty',   icon: Radio },
    { id: 'activity', label: 'History',   icon: History },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav style={{
      position: 'sticky',
      bottom: 0,
      width: '100%',
      background: 'rgba(255, 255, 255, 0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(124,58,237,0.08)',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-around',
      padding: '6px 4px 18px',
      zIndex: 50,
      boxShadow: '0 -4px 20px rgba(26,16,56,0.06)',
      height: 'var(--nav-height)',
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '4px 8px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              flex: 1,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Booking accent dot */}
            {tab.accent && !isActive && (
              <span style={{
                position: 'absolute',
                top: 4,
                right: '50%',
                transform: 'translateX(14px)',
                width: 6, height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--cyan)',
                boxShadow: '0 0 6px var(--cyan)',
              }} />
            )}

            {/* Icon pill */}
            <div style={{
              width: isActive ? 46 : 38,
              height: 28,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive
                ? tab.accent
                  ? 'linear-gradient(135deg, #7C3AED, #06B6D4)'
                  : 'var(--primary-light)'
                : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isActive && tab.accent
                ? '0 4px 12px rgba(124,58,237,0.28)'
                : 'none',
            }}>
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive
                  ? tab.accent ? '#FFFFFF' : 'var(--primary)'
                  : 'var(--text-muted)'}
              />
            </div>

            <span style={{
              fontSize: 9,
              fontWeight: isActive ? 800 : 600,
              letterSpacing: '-0.1px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              lineHeight: 1,
              maxWidth: 52,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
