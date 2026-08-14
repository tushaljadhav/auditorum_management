import Swal from 'sweetalert2';

/**
 * Standardized Premium Custom Toast Alert for Auditorum Management System
 * @param {string} title - Main toast title text
 * @param {string} subtitle - Optional subtext or detail
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 */
export const showCustomToast = (title, subtitle = '', type = 'success') => {
  const isError = type === 'error' || type === 'danger';
  const isWarning = type === 'warning';
  
  const iconColor = isError ? '#DC2626' : (isWarning ? '#D97706' : '#059669');
  const bgColor = isError ? '#FEF2F2' : (isWarning ? '#FFFBEB' : '#ECFDF5');
  const borderColor = isError ? '#FECACA' : (isWarning ? '#FDE68A' : '#A7F3D0');
  const shadowColor = isError ? 'rgba(239, 68, 68, 0.15)' : (isWarning ? 'rgba(217, 119, 6, 0.15)' : 'rgba(5, 150, 105, 0.15)');
  const symbol = isError ? '✕' : (isWarning ? '!' : '✓');

  Swal.fire({
    toast: true,
    position: 'top-end',
    html: `
      <div style="display: flex; align-items: center; gap: 12px; text-align: left;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bgColor}; border: 1px solid ${borderColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px ${shadowColor};">
          <span style="color: ${iconColor}; font-size: 16px; font-weight: 900; line-height: 1;">${symbol}</span>
        </div>
        <div>
          <div style="font-size: 0.88rem; font-weight: 800; color: #0F172A;">
            ${title}
          </div>
          ${subtitle ? `<div style="font-size: 0.75rem; color: #64748B; font-weight: 600; margin-top: 1px;">${subtitle}</div>` : ''}
        </div>
      </div>
    `,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    background: '#FFFFFF',
    customClass: {
      popup: 'tailux-toast-popup'
    }
  });
};
