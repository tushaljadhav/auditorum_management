import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock,
  Sparkles, Megaphone, CheckCheck, X, ChevronRight,
  Bell, ExternalLink, BellRing, Info
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

// Helper to format timestamps gracefully
function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// Icon and color configuration for each notification category
const CATEGORY_CONFIG = {
  booking_confirmed: {
    icon: CheckCircle2,
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#D1FAE5',
    badgeLabel: 'Confirmed'
  },
  booking_cancelled: {
    icon: XCircle,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    badgeLabel: 'Cancelled'
  },
  booking_reminder: {
    icon: Clock,
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    badgeLabel: 'Reminder'
  },
  booking_conflict: {
    icon: AlertTriangle,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FFEDD5',
    badgeLabel: 'Conflict'
  },
  system_update: {
    icon: Sparkles,
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#E0E7FF',
    badgeLabel: 'System'
  },
  announcement: {
    icon: Megaphone,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#EDE9FE',
    badgeLabel: 'Notice'
  }
};

export default function NotificationPanel({ onNavigate }) {
  const {
    notifications,
    unreadCount,
    isPanelOpen,
    closePanel,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    browserPermission,
    requestBrowserPermission
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const panelRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPanelOpen) {
        closePanel();
      }
    };
    if (isPanelOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen, closePanel]);

  // Close when clicking outside panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!isPanelOpen) return;
      if (e.target.closest('.notification-bell-btn')) return; // ignore clicks on the bell itself
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        closePanel();
      }
    };
    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  // Filter notifications
  const displayedNotifications = activeFilter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleItemClick = (item) => {
    markAsRead(item.id);
    if (item.targetTab && onNavigate) {
      closePanel();
      onNavigate(item.targetTab, item.targetSessionId || null);
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        className="notification-backdrop"
        onClick={closePanel}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.32)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 90,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Main Notification Panel Container */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Campus Notifications"
        className="notification-panel-container"
        style={{
          position: 'fixed',
          zIndex: 95,
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 14px 40px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          animation: 'panelSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Mobile Drag Handle */}
        <div className="mobile-drag-handle" style={{ display: 'none', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#CBD5E1' }} />
        </div>

        {/* ── Panel Header ── */}
        <div
          style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid var(--border, #E2E8F0)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                color: '#4F46E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(79, 70, 229, 0.12)'
              }}>
                <Bell size={14} strokeWidth={2.4} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary, #0F172A)', letterSpacing: '-0.3px', margin: 0 }}>
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  color: '#4F46E5',
                  fontSize: 11,
                  fontWeight: 800,
                  lineHeight: 1.2
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4F46E5',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    borderRadius: 6,
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#EEF2FF'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <CheckCheck size={14} />
                  <span>Read all</span>
                </button>
              )}

              <button
                type="button"
                onClick={closePanel}
                title="Close"
                aria-label="Close notifications panel"
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  border: '1px solid var(--border, #E2E8F0)',
                  background: 'var(--surface, #FFFFFF)',
                  color: 'var(--text-muted, #94A3B8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#0F172A'; e.currentTarget.style.background = '#F1F5F9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#FFFFFF'; }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: activeFilter === 'all' ? 750 : 600,
                border: activeFilter === 'all' ? '1px solid #4F46E5' : '1px solid var(--border, #E2E8F0)',
                background: activeFilter === 'all' ? '#4F46E5' : '#FFFFFF',
                color: activeFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary, #475569)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('unread')}
              style={{
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: activeFilter === 'unread' ? 750 : 600,
                border: activeFilter === 'unread' ? '1px solid #4F46E5' : '1px solid var(--border, #E2E8F0)',
                background: activeFilter === 'unread' ? '#EEF2FF' : '#FFFFFF',
                color: activeFilter === 'unread' ? '#4F46E5' : 'var(--text-secondary, #475569)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#4F46E5', display: 'inline-block'
                }} />
              )}
            </button>
          </div>
        </div>

        {/* ── Notifications Scrollable List ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: 390,
            WebkitOverflowScrolling: 'touch',
            padding: '6px 8px',
          }}
        >
          {displayedNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted, #94A3B8)' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#94A3B8', marginBottom: 10
              }}>
                <Bell size={20} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 750, color: 'var(--text-primary, #0F172A)' }}>
                {activeFilter === 'unread' ? 'No unread notifications' : 'All caught up!'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted, #94A3B8)', marginTop: 4, maxWidth: 220, marginInline: 'auto' }}>
                {activeFilter === 'unread'
                  ? 'You have read all booking updates and notices.'
                  : 'New booking alerts and campus notices will appear here.'}
              </div>
            </div>
          ) : (
            displayedNotifications.map((item) => {
              const cfg = CATEGORY_CONFIG[item.type] || CATEGORY_CONFIG.system_update;
              const IconComp = cfg.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    position: 'relative',
                    padding: '11px 12px',
                    margin: '3px 0',
                    borderRadius: 12,
                    background: item.read ? '#FFFFFF' : '#F8FAFC',
                    border: item.read ? '1px solid transparent' : '1px solid #E0E7FF',
                    cursor: item.targetTab ? 'pointer' : 'default',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 11,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = item.read ? '#F8FAFC' : '#F1F5F9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = item.read ? '#FFFFFF' : '#F8FAFC';
                  }}
                >
                  {/* Category Icon Badge */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: cfg.bgColor,
                      border: `1px solid ${cfg.borderColor}`,
                      color: cfg.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <IconComp size={15} strokeWidth={2.3} />
                  </div>

                  {/* Notification Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 13,
                          fontWeight: item.read ? 700 : 850,
                          color: item.read ? 'var(--text-secondary, #334155)' : '#0F172A',
                          lineHeight: 1.3
                        }}>
                          {item.title}
                        </span>
                        {!item.read && (
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#4F46E5', display: 'inline-block', flexShrink: 0
                          }} />
                        )}
                      </div>

                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-muted, #94A3B8)', whiteSpace: 'nowrap' }}>
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>

                    <p style={{
                      fontSize: 12,
                      color: item.read ? 'var(--text-muted, #64748B)' : '#334155',
                      fontWeight: item.read ? 450 : 550,
                      lineHeight: 1.45,
                      margin: '3px 0 0 0',
                    }}>
                      {item.message}
                    </p>

                    {/* Action Button & Metadata */}
                    {item.targetTab && (
                      <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 750,
                            color: '#4F46E5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          {item.actionLabel || 'View Details'} <ChevronRight size={12} />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dismiss Single Item */}
                  <button
                    type="button"
                    title="Dismiss notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#CBD5E1',
                      cursor: 'pointer',
                      padding: 2,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#CBD5E1'}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ── Panel Footer: Native Web Push Banner & Clear All ── */}
        <div
          style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--border, #E2E8F0)',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11.5,
          }}
        >
          {browserPermission === 'default' ? (
            <button
              type="button"
              onClick={requestBrowserPermission}
              style={{
                background: 'none',
                border: 'none',
                color: '#4F46E5',
                fontWeight: 750,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 6px',
                borderRadius: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              <BellRing size={12} />
              <span>Enable Device Alerts</span>
            </button>
          ) : browserPermission === 'granted' ? (
            <span style={{ color: '#059669', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
              Push Alerts Active
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted, #94A3B8)', fontWeight: 600 }}>
              Browser alerts muted
            </span>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #94A3B8)',
                fontWeight: 650,
                cursor: 'pointer',
                fontSize: 11,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </>
  );
}
