import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const TOAST_THEMES = {
  success: {
    icon: CheckCircle2,
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    border: '#A7F3D0',
    accentColor: '#10B981',
    bg: '#FFFFFF',
    titleColor: '#065F46',
  },
  info: {
    icon: Info,
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    border: '#C7D2FE',
    accentColor: '#4F46E5',
    bg: '#FFFFFF',
    titleColor: '#1E1B4B',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    border: '#FDE68A',
    accentColor: '#F59E0B',
    bg: '#FFFFFF',
    titleColor: '#78350F',
  },
  error: {
    icon: AlertCircle,
    iconColor: '#DC2626',
    iconBg: '#FEF2F2',
    border: '#FECACA',
    accentColor: '#EF4444',
    bg: '#FFFFFF',
    titleColor: '#7F1D1D',
  },
};

function ToastItem({ toast, onRemove }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const theme = TOAST_THEMES[toast.type] || TOAST_THEMES.info;
  const IconComponent = theme.icon;
  const duration = toast.duration || 4000;

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 40;
    const step = (intervalTime / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPaused, duration]);

  useEffect(() => {
    if (progress <= 0) {
      onRemove(toast.id);
    }
  }, [progress, toast.id, onRemove]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="kirti-toast-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 380,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
        animation: 'toastSlideIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
      }}
    >
      {/* Icon Pill */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: theme.iconBg,
          color: theme.iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <IconComponent size={16} strokeWidth={2.4} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: theme.titleColor, lineHeight: 1.25 }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: 12, fontWeight: 500, color: '#475569', marginTop: 3, lineHeight: 1.4 }}>
            {toast.message}
          </div>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick();
              onRemove(toast.id);
            }}
            style={{
              marginTop: 6,
              background: theme.iconBg,
              border: `1px solid ${theme.border}`,
              color: theme.iconColor,
              fontSize: 11,
              fontWeight: 750,
              padding: '3px 8px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#94A3B8',
          cursor: 'pointer',
          padding: 2,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
      >
        <X size={14} />
      </button>

      {/* Subtle Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: `${progress}%`,
          height: 2.5,
          background: theme.accentColor,
          opacity: 0.7,
          transition: 'width 0.04s linear',
        }}
      />
    </div>
  );
}

export default function NotificationToast() {
  const { toasts, removeToast } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="kirti-toast-container-stack"
      style={{
        position: 'fixed',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
