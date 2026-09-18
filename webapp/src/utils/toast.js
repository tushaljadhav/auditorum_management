// toast.js — Self-contained toast notification utility
// Webapp copy — no imports from other folders

let toastEl = null;
let toastTimeout = null;

function getOrCreateContainer() {
  if (toastEl) return toastEl;

  toastEl = document.createElement('div');
  toastEl.id = 'kirti-toast-container';
  toastEl.style.cssText = `
    position: fixed;
    top: 72px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    pointer-events: none;
    width: 100%;
    max-width: 440px;
    padding: 0 16px;
  `;
  document.body.appendChild(toastEl);
  return toastEl;
}

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const COLORS = {
  success: { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', icon: '#059669' },
  error:   { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '#DC2626' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', icon: '#D97706' },
  info:    { bg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3', icon: '#4F46E5' },
};

export function showCustomToast(title, message = '', type = 'info', duration = 3200) {
  const container = getOrCreateContainer();
  const c = COLORS[type] || COLORS.info;
  const icon = ICONS[type] || ICONS.info;

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: ${c.bg};
    border: 1px solid ${c.border};
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(15,23,42,0.10);
    pointer-events: auto;
    animation: toastIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards;
    width: 100%;
    transition: opacity 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  `;

  toast.innerHTML = `
    <div style="
      width: 22px; height: 22px; border-radius: 50%;
      background: ${c.icon}20; display: flex; align-items: center;
      justify-content: center; font-size: 12px; font-weight: 900;
      color: ${c.icon}; flex-shrink: 0; margin-top: 1px;
    ">${icon}</div>
    <div style="flex: 1; min-width: 0;">
      <div style="font-size: 13px; font-weight: 800; color: ${c.text}; line-height: 1.3;">${title}</div>
      ${message ? `<div style="font-size: 12px; font-weight: 500; color: ${c.text}; opacity: 0.8; margin-top: 2px; line-height: 1.4;">${message}</div>` : ''}
    </div>
  `;

  // Inject keyframe if not already done
  if (!document.getElementById('kirti-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'kirti-toast-styles';
    style.textContent = `
      @keyframes toastIn {
        from { opacity: 0; transform: translateY(-8px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0)    scale(1); }
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  if (toastTimeout) clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (container.contains(toast)) container.removeChild(toast);
    }, 220);
  }, duration);
}
