import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('admin_pwa_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (isIosDevice && !sessionStorage.getItem('admin_pwa_dismissed')) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('admin_pwa_dismissed', '1');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div style={{
      margin: '10px 14px 0',
      background: '#1E1B4B',
      borderRadius: 14,
      padding: '10px 14px',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Smartphone size={16} color="#A5B4FC" />
        <span style={{ fontSize: 12, fontWeight: 700 }}>
          {isIOS ? 'Install app: Tap Share ⎋ → Add to Home Screen' : 'Install Admin App on your Phone'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            style={{
              background: '#FFFFFF',
              color: '#1E1B4B',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: 2 }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
