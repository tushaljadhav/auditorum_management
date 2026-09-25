import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationBell({ className = '' }) {
  const { unreadCount, hasNewArrival, isPanelOpen, togglePanel } = useNotifications();

  return (
    <button
      type="button"
      onClick={togglePanel}
      aria-label={`Notifications, ${unreadCount} unread`}
      aria-haspopup="dialog"
      aria-expanded={isPanelOpen}
      title="Notifications"
      className={`notification-bell-btn ${className}`}
      style={{
        position: 'relative',
        width: 36,
        height: 36,
        borderRadius: 10,
        border: isPanelOpen ? '1.5px solid var(--primary, #4F46E5)' : '1px solid var(--border, #E2E8F0)',
        background: isPanelOpen ? 'var(--primary-light, #EEF2FF)' : 'var(--surface, #FFFFFF)',
        color: isPanelOpen ? 'var(--primary, #4F46E5)' : 'var(--text-secondary, #475569)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        outline: 'none',
        flexShrink: 0,
        boxShadow: isPanelOpen ? '0 0 0 3px rgba(79, 70, 229, 0.12)' : '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
      onMouseEnter={(e) => {
        if (!isPanelOpen) {
          e.currentTarget.style.borderColor = '#C7D2FE';
          e.currentTarget.style.background = '#F8FAFC';
          e.currentTarget.style.color = '#3730A3';
        }
      }}
      onMouseLeave={(e) => {
        if (!isPanelOpen) {
          e.currentTarget.style.borderColor = 'var(--border, #E2E8F0)';
          e.currentTarget.style.background = 'var(--surface, #FFFFFF)';
          e.currentTarget.style.color = 'var(--text-secondary, #475569)';
        }
      }}
    >
      {/* Bell Icon with conditional subtle arrival wiggle */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: hasNewArrival ? 'bellWiggle 0.6s ease-in-out 2' : 'none',
          transformOrigin: 'top center',
        }}
      >
        <Bell size={18} strokeWidth={isPanelOpen ? 2.2 : 1.9} />
      </span>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            minWidth: 17,
            height: 17,
            padding: '0 4px',
            borderRadius: 9999,
            background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.35), 0 0 0 2px #FFFFFF',
            lineHeight: 1,
            letterSpacing: '-0.3px',
            animation: hasNewArrival ? 'badgePop 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
