import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  useEffect(() => {
    // If already in standalone mode, it's already installed and open!
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://');

    if (isStandalone) {
      localStorage.setItem('kirti_pwa_installed', 'true');
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      const params = new URLSearchParams(window.location.search);
      const isAutoInstall = params.get('install') === '1';

      if (isAutoInstall) {
        setShowBanner(true);
        setTimeout(() => {
          try {
            e.prompt();
          } catch (err) {}
        }, 350);
      } else {
        const dismissed = localStorage.getItem('kirti_pwa_dismissed');
        if (!dismissed) {
          setShowBanner(true);
        }
      }
    };

    const handleInstalled = () => {
      setShowBanner(false);
      setInstalledNotice(true);
      localStorage.setItem('kirti_pwa_installed', 'true');
      setTimeout(() => setInstalledNotice(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
      localStorage.setItem('kirti_pwa_installed', 'true');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('kirti_pwa_dismissed', 'true');
  };

  if (installedNotice) {
    return (
      <div style={{
        margin: '12px 16px 0',
        padding: '12px 16px',
        background: '#ECFDF5',
        border: '1px solid #A7F3D0',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: '#065F46',
        fontSize: '13px',
        fontWeight: '700',
        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
        animation: 'fadeIn 0.25s ease'
      }}>
        <CheckCircle2 size={18} color="#10B981" />
        <span>🎉 App Installed Successfully! You can now launch it anytime from your home screen.</span>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <div style={{
      margin: '12px 16px 0',
      padding: '14px 16px',
      background: '#FFFFFF',
      border: '1px solid #C7D2FE',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.12)',
      animation: 'fadeIn 0.25s ease',
      position: 'relative',
      zIndex: 20
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: '#EEF2FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4F46E5',
          border: '1px solid #C7D2FE'
        }}>
          <Smartphone size={20} />
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
            Install Kirti App
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Faster access, zero lag & offline support
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: '750',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Download size={13} /> Install
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
