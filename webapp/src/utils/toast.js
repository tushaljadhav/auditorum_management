// toast.js — Unified toast notification utility
// Dispatches to the React NotificationContext while maintaining DOM fallback

let lastToastTime = 0;
let lastToastKey = '';

export function showCustomToast(title, message = '', type = 'info', duration = 3800) {
  const now = Date.now();
  const key = `${title}__${message}`;

  // Throttle identical toasts within 1800ms to prevent spam on repeated clicks
  if (key === lastToastKey && (now - lastToastTime) < 1800) {
    return;
  }
  lastToastKey = key;
  lastToastTime = now;

  // Dispatch custom event for the modern React NotificationContext
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('kirti-toast', {
      detail: { title, message, type, duration }
    });
    window.dispatchEvent(event);
  }
}

