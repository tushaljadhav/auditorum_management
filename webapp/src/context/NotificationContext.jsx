import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const NotificationContext = createContext(null);

const STORAGE_KEY = 'kirti_college_notifications_v2';

// ── Realistic initial notifications tailored for Kirti Auditorium Management ──
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Annual Science Seminar in Hall 2.8 has been confirmed for tomorrow at 10:00 AM.',
    timestamp: Date.now() - 25 * 60 * 1000, // 25 mins ago
    read: false,
    targetTab: 'activity',
    actionLabel: 'View Schedule',
    metadata: { venue: 'Hall 2.8', date: 'Tomorrow', time: '10:00 AM' }
  },
  {
    id: 'notif_2',
    type: 'booking_reminder',
    title: 'Booking Reminder',
    message: 'AI & Machine Learning Workshop begins in 1 hour in Hall 4.8.',
    timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    read: false,
    targetTab: 'activity',
    actionLabel: 'View Details',
    metadata: { venue: 'Hall 4.8', time: 'Starts in 1h' }
  },
  {
    id: 'notif_3',
    type: 'announcement',
    title: 'Important Announcement',
    message: "Principal's Office: All departmental event requests for next month must be submitted by Friday.",
    timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
    read: false,
    targetTab: 'booking',
    actionLabel: 'Book Venue',
    metadata: { sender: "Principal's Office" }
  },
  {
    id: 'notif_4',
    type: 'system_update',
    title: 'System Update',
    message: 'Auditorium acoustic calibration and projector servicing completed for Hall 2.8.',
    timestamp: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
    read: true,
    targetTab: 'venues',
    actionLabel: 'Check Hall',
    metadata: { venue: 'Hall 2.8', status: 'Optimal' }
  },
  {
    id: 'notif_5',
    type: 'booking_conflict',
    title: 'Schedule Conflict Resolved',
    message: 'Schedule overlap for Central Hall on Friday 2:00 PM was resolved by Administration.',
    timestamp: Date.now() - 48 * 60 * 60 * 1000, // 2 days ago
    read: true,
    targetTab: 'activity',
    actionLabel: 'Check Calendar',
    metadata: { venue: 'Central Hall' }
  }
];

export function NotificationProvider({ children, onNavigate }) {
  // ── 1. Notifications State ──
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_NOTIFICATIONS;
  });

  // ── 2. Toast State (Queue of active in-app toasts) ──
  const [toasts, setToasts] = useState([]);

  // ── 3. UI Control State ──
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [hasNewArrival, setHasNewArrival] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const arrivalTimerRef = useRef(null);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (_) {}
  }, [notifications]);

  // Compute unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // ── 4. Toast Management ──
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, message = '', type = 'info', duration = 3200, action = null }) => {
    setToasts((prev) => {
      // If an identical toast is already visible, do not spawn another copy
      const isDuplicate = prev.some((t) => t.title === title && t.message === message);
      if (isDuplicate) {
        return prev;
      }
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newToast = { id, title, message, type, duration, action, createdAt: Date.now() };

      // Keep at most 2 toasts visible to avoid blocking form inputs on mobile screens
      return [newToast, ...prev.slice(0, 1)];
    });

    // Play subtle sound / haptic if enabled in user settings
    try {
      if (localStorage.getItem('kirti_setting_haptics') === 'true' && navigator.vibrate) {
        navigator.vibrate([15, 30, 15]);
      }
    } catch (_) {}
  }, []);

  // Listen to global window toast event for seamless backward-compatibility
  useEffect(() => {
    const handleGlobalToast = (e) => {
      if (e?.detail) {
        const { title, message, type, duration, action } = e.detail;
        showToast({ title, message, type: type || 'info', duration: duration || 3800, action });
      }
    };
    window.addEventListener('kirti-toast', handleGlobalToast);
    return () => window.removeEventListener('kirti-toast', handleGlobalToast);
  }, [showToast]);

  // ── 5. Add Notification (In-App + Background Web Push / Native) ──
  const addNotification = useCallback((data) => {
    const id = data.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newNotif = {
      id,
      type: data.type || 'system_update',
      title: data.title || 'Notification',
      message: data.message || '',
      timestamp: data.timestamp || Date.now(),
      read: false,
      targetTab: data.targetTab || null,
      targetSessionId: data.targetSessionId || null,
      actionLabel: data.actionLabel || null,
      metadata: data.metadata || {}
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Trigger subtle bell animation
    setHasNewArrival(true);
    if (arrivalTimerRef.current) clearTimeout(arrivalTimerRef.current);
    arrivalTimerRef.current = setTimeout(() => {
      setHasNewArrival(false);
    }, 3200);

    // If app is currently visible/focused, trigger in-app toast
    const isForeground = typeof document !== 'undefined' && !document.hidden;
    if (isForeground) {
      const toastType =
        newNotif.type === 'booking_confirmed' ? 'success'
        : newNotif.type === 'booking_cancelled' ? 'error'
        : newNotif.type === 'booking_conflict' || newNotif.type === 'booking_reminder' ? 'warning'
        : 'info';

      showToast({
        title: newNotif.title,
        message: newNotif.message,
        type: toastType,
        action: newNotif.targetTab ? {
          label: newNotif.actionLabel || 'View',
          onClick: () => {
            if (onNavigate) onNavigate(newNotif.targetTab);
          }
        } : null
      });
    } else {
      // If app is in background and user granted native permission, trigger system notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const sysNotif = new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/Logo.png',
            badge: '/icon.svg',
            tag: newNotif.type || 'kirti-alert'
          });
          sysNotif.onclick = () => {
            window.focus();
            sysNotif.close();
            if (newNotif.targetTab && onNavigate) {
              onNavigate(newNotif.targetTab);
            }
          };
        } catch (_) {}
      }
    }
  }, [showToast, onNavigate]);

  // ── 6. Notification Actions ──
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    showToast({
      title: 'Marked as Read',
      message: 'All notifications marked as read',
      type: 'info',
      duration: 2500
    });
  }, [showToast]);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    showToast({
      title: 'Cleared',
      message: 'All notifications cleared',
      type: 'info',
      duration: 2500
    });
  }, [showToast]);

  // ── 7. Native Browser Notification Permission Request ──
  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast({
        title: 'Not Supported',
        message: 'Browser notifications are not supported on this device.',
        type: 'warning'
      });
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        showToast({
          title: 'Notifications Enabled',
          message: 'You will receive alerts for bookings and campus updates.',
          type: 'success'
        });
        return true;
      } else if (perm === 'denied') {
        showToast({
          title: 'Notifications Blocked',
          message: 'Notifications are blocked in your browser settings.',
          type: 'warning'
        });
        return false;
      }
      return false;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }, [showToast]);

  const togglePanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
    setHasNewArrival(false);
  }, []);

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const openPanel = useCallback(() => {
    setIsPanelOpen(true);
    setHasNewArrival(false);
  }, []);

  const value = {
    notifications,
    unreadCount,
    toasts,
    isPanelOpen,
    hasNewArrival,
    browserPermission,
    showToast,
    removeToast,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    requestBrowserPermission,
    togglePanel,
    closePanel,
    openPanel
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
