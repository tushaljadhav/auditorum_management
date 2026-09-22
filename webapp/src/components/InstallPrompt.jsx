import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already running in standalone (installed) mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://');

    if (isStandalone) {
      localStorage.setItem('kirti_pwa_installed', 'true');
      return;
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__PWA_DEFERRED_PROMPT__ = e;

      const dismissed = localStorage.getItem('kirti_pwa_dismissed');
      // Always show unless dismissed within the last 24 hours
      if (!dismissed || Date.now() - parseInt(dismissed, 10) > 86400000) {
        setShowBanner(true);
      }
    };

    const handleInstalled = () => {
      setShowBanner(false);
      setInstalledNotice(true);
      localStorage.setItem('kirti_pwa_installed', 'true');
      setTimeout(() => setInstalledNotice(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleInstalled);

    // If on iOS and not standalone, show banner once
    if (isAppleDevice) {
      const dismissed = localStorage.getItem('kirti_pwa_dismissed');
      if (!dismissed || Date.now() - parseInt(dismissed, 10) > 86400000) {
        setShowBanner(true);
      }
    } else {
      // Fallback: If beforeinstallprompt hasn't fired after 2 seconds
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('kirti_pwa_dismissed');
        if (!dismissed || Date.now() - parseInt(dismissed, 10) > 86400000) {
          setShowBanner(true);
        }
      }, 2000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('appinstalled', handleInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.__PWA_DEFERRED_PROMPT__;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        localStorage.setItem('kirti_pwa_installed', 'true');
      }
      setDeferredPrompt(null);
      window.__PWA_DEFERRED_PROMPT__ = null;
    } else {
      // If native prompt is not yet ready, display step-by-step guide
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowManualGuide(false);
    localStorage.setItem('kirti_pwa_dismissed', String(Date.now()));
  };

  if (installedNotice) {
    return (
      <div style={{
        position: 'sticky',
        top: '8px',
        margin: '8px 16px',
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
        zIndex: 9999
      }}>
        <CheckCircle2 size={20} color="#10B981" />
        <span>🎉 Kirti Audit Installed! Launch anytime directly from your Home Screen.</span>
      </div>
    );
  }

  if (!showBanner) return null;

  return (
    <>
      <div style={{
        position: 'sticky',
        top: '0px',
        zIndex: 9990,
        margin: '0',
        padding: '10px 16px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        color: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38BDF8',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <Smartphone size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '-0.01em', color: '#FFFFFF' }}>
              Download Kirti Audit
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '500' }}>
              One-tap access & fast offline booking
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={handleInstallClick}
            style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={14} /> Install
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Manual Step-by-Step Guide Modal (if native prompt is unavailable) */}
      {showManualGuide && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 99999
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '380px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Download size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>
              How to Install Kirti Audit
            </h3>
            
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px' }}>
              {isIOS ? (
                <span>
                  Tap the <strong>Share icon (⎋)</strong> at the bottom of Safari, then select <strong>'Add to Home Screen' (➕)</strong>.
                </span>
              ) : (
                <span>
                  Tap your browser menu <strong>(3 dots ⋮ in top-right)</strong> and select <strong>'Install app'</strong> or <strong>'Add to Home screen'</strong>.
                </span>
              )}
            </p>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '12px',
              color: '#475569',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: '#2563EB', color: '#FFF', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>1</span>
                <span>Open browser menu (⋮ or ⎋)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#2563EB', color: '#FFF', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>2</span>
                <span>Click <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong></span>
              </div>
            </div>

            <button
              onClick={() => setShowManualGuide(false)}
              style={{
                width: '100%',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
