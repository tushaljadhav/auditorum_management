import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { QRCodeSVG } from 'qrcode.react';
import {
  Smartphone, ShieldCheck, ArrowRight, CheckCircle2,
  Calendar, MapPin, Sparkles, ExternalLink, QrCode,
  Download, Copy, Check, Lock, KeyRound, Eye, EyeOff,
  AlertCircle, SmartphoneNfc, Laptop, HelpCircle, LogOut,
  Wifi, FileText, CheckCircle, Globe
} from 'lucide-react';
import { isFacultyAuthorized, setFacultyAuthorized, verifyFacultyPasscode, getActiveFacultyPasscode } from '../utils/facultyAuth';

export default function BookingPortal() {
  const navigate = useNavigate();

  // Security authorization state
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Passcode form state if not authorized
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Network & IP state for PWA access
  const [networkInfo, setNetworkInfo] = useState({
    lanIp: '192.168.1.143',
    localUrl: 'http://localhost:3001',
    lanUrl: 'http://192.168.1.143:3001'
  });
  const [targetMode, setTargetMode] = useState('lan'); // 'lan' (mobile WiFi) or 'local' (this PC)

  // PWA Install prompt capture
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('android');

  // Active PWA Web App URL
  const activeAppUrl = targetMode === 'lan' ? networkInfo.lanUrl : networkInfo.localUrl;

  useEffect(() => {
    // Check if session is authorized
    if (isFacultyAuthorized()) {
      setAuthorized(true);
    }
    setCheckingAuth(false);

    // Fetch dynamic live LAN IP from backend
    fetch('/api/system/network-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.lanUrl) {
          setNetworkInfo(data);
        }
      })
      .catch(() => {
        const host = window.location.hostname || 'localhost';
        if (host !== 'localhost' && host !== '127.0.0.1') {
          setNetworkInfo(prev => ({
            ...prev,
            lanIp: host,
            lanUrl: `http://${host}:3001`
          }));
        }
      });

    // Listen for PWA browser install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the access passcode.');
      triggerShake();
      return;
    }

    if (verifyFacultyPasscode(passcode)) {
      setFacultyAuthorized(true);
      setAuthorized(true);
      setError('');
    } else {
      setError('Invalid Access Passcode! Please enter the correct code provided by administrator.');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLock = () => {
    setFacultyAuthorized(false);
    setAuthorized(false);
    setPasscode('');
    navigate('/');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else {
      window.open(activeAppUrl, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadShortcut = () => {
    const fileContent = `[InternetShortcut]\nURL=${activeAppUrl}\nIconIndex=0\n`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Kirti-Faculty-Auditorium-PWA.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: "'DM Sans', sans-serif",
      color: '#0F172A',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar activePage="Faculty Access" />

      {/* ─── CASE 1: LOCKED (PASSCODE REQUIRED) ─── */}
      {!authorized ? (
        <main style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          position: 'relative'
        }}>
          {/* Background radial glow */}
          <div style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            filter: 'blur(50px)'
          }} />

          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '28px',
            padding: '44px 36px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.1)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            transform: shake ? 'translateX(-8px)' : 'none',
            transition: shake ? 'transform 0.08s ease' : 'all 0.2s ease'
          }}>
            {/* Lock Crest */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '26px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 12px 28px rgba(79, 70, 229, 0.3)',
              color: '#FFFFFF'
            }}>
              <Lock size={38} />
            </div>

            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: '999px',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              color: '#4F46E5',
              fontSize: '0.82rem',
              fontWeight: 750,
              marginBottom: 16
            }}>
              <ShieldCheck size={14} /> Restricted Faculty Access
            </div>

            <h1 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.025em',
              margin: '0 0 10px',
              lineHeight: 1.25
            }}>
              Enter Faculty Passcode
            </h1>

            <p style={{
              fontSize: '0.92rem',
              lineHeight: 1.55,
              color: '#64748B',
              margin: '0 auto 26px',
              maxWidth: '420px'
            }}>
              Auditorium booking and faculty mobile PWA access are reserved for verified college faculty. Enter the security pass provided by administration.
            </p>

            <form onSubmit={handleUnlock}>
              <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px'
                }}>
                  Security Passcode
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <KeyRound size={18} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter faculty passcode..."
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '14px 44px 14px 44px',
                      borderRadius: '14px',
                      border: error ? '2px solid #EF4444' : '1.5px solid #CBD5E1',
                      background: '#F8FAFC',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      outline: 'none',
                      letterSpacing: showPass ? 'normal' : '0.15em',
                      transition: 'all 0.15s ease'
                    }}
                    onFocus={(e) => {
                      if (!error) e.target.style.borderColor = '#6366F1';
                      e.target.style.background = '#FFFFFF';
                    }}
                    onBlur={(e) => {
                      if (!error) e.target.style.borderColor = '#CBD5E1';
                      e.target.style.background = '#F8FAFC';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 8,
                    color: '#EF4444',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}>
                    <AlertCircle size={15} />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Passcode hint / badge for user ease */}
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                marginBottom: '22px',
                fontSize: '0.78rem',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Provided Passcode:</span>
                <code style={{
                  background: '#E2E8F0',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  color: '#1E293B',
                  fontFamily: 'monospace'
                }}>
                  {getActiveFacultyPasscode()}
                </code>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    flex: 1,
                    padding: '13px 18px',
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontSize: '0.94rem',
                    fontWeight: 650,
                    cursor: 'pointer'
                  }}
                >
                  Back to Home
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '13px 20px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  Unlock Access <ArrowRight size={17} />
                </button>
              </div>
            </form>
          </div>
        </main>
      ) : (
        /* ─── CASE 2: UNLOCKED (FACULTY PWA WEB APP GATEWAY) ─── */
        <main style={{
          flex: 1,
          maxWidth: '1180px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 20px 80px'
        }}>
          {/* Top Status Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 28,
            padding: '14px 20px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)'
              }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 750, color: '#0F172A' }}>
                Faculty Access Verified • URL: <code style={{ color: '#4F46E5', fontWeight: 700 }}>/faculty-access</code>
              </span>
            </div>

            <button
              onClick={handleLock}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '10px',
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} /> Lock & Exit Portal
            </button>
          </div>

          {/* Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
            borderRadius: '28px',
            padding: '40px 36px',
            color: '#FFFFFF',
            marginBottom: 36,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -10px rgba(30, 27, 75, 0.3)'
          }}>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 14px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#C7D2FE',
                marginBottom: 16
              }}>
                <Sparkles size={14} color="#FBBF24" /> 100% Progressive Web App (PWA) • No App Store Needed
              </div>
              <h1 style={{
                fontSize: '2.4rem',
                fontWeight: 800,
                margin: '0 0 14px',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.18
              }}>
                Auditorium Faculty PWA Web App
              </h1>
              <p style={{
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: '#E0E7FF',
                margin: 0
              }}>
                Directly add the official Progressive Web App (PWA) to your Android phone, iPhone, or Desktop PC. No APK download or app store installation required — launches full-screen right from your home screen!
              </p>
            </div>
          </div>

          {/* Target Network / Mobile Switcher Bar */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #E2E8F0',
            padding: '16px 22px',
            marginBottom: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Wifi size={20} color="#4F46E5" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                  Target Device Destination:
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Scanning QR on your phone? Keep <strong>Wi-Fi Mobile</strong> active so your phone connects directly.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setTargetMode('lan')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: targetMode === 'lan' ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                  background: targetMode === 'lan' ? '#EEF2FF' : '#FFFFFF',
                  color: targetMode === 'lan' ? '#4F46E5' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                📱 Wi-Fi Mobile ({networkInfo.lanIp}:3001)
              </button>
              <button
                onClick={() => setTargetMode('local')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: targetMode === 'local' ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                  background: targetMode === 'local' ? '#EEF2FF' : '#FFFFFF',
                  color: targetMode === 'local' ? '#4F46E5' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                💻 This PC (localhost:3001)
              </button>
            </div>
          </div>

          {/* 3 Main Action Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 40
          }}>
            {/* CARD 1: Install PWA Web App + Desktop Shortcut */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              padding: '30px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)'
            }}>
              <div>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  marginBottom: 20,
                  boxShadow: '0 8px 18px rgba(16, 185, 129, 0.3)'
                }}>
                  <Smartphone size={26} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Direct PWA Installation
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
                  Install PWA Web App
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px' }}>
                  Install the PWA directly to your device home screen. No APK download, zero storage consumption, and works offline.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
                  {['No APK Needed', 'Standalone Mode', 'Auto-Updates', 'Fast & Secure'].map(b => (
                    <span key={b} style={{
                      fontSize: '0.74rem',
                      fontWeight: 650,
                      background: '#ECFDF5',
                      color: '#065F46',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #A7F3D0'
                    }}>
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleInstallClick}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.96rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 6px 18px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Smartphone size={18} /> {isInstallable ? 'Install PWA to Device' : 'Launch & Install Web App'}
                </button>

                <button
                  onClick={handleDownloadShortcut}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileText size={15} /> Download Windows Desktop Shortcut (.url)
                </button>
              </div>
            </div>

            {/* CARD 2: QR Code Mobile Scanner */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              padding: '30px 26px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#4F46E5',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 6
              }}>
                Scan with Mobile Camera
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                QR Code PWA Access
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.45, margin: '0 0 16px', maxWidth: '300px' }}>
                Scan using Google Lens or your phone camera to open and install the PWA directly on your smartphone.
              </p>

              {/* QR Box */}
              <div style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '20px',
                border: '2px dashed #CBD5E1',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <QRCodeSVG
                  value={activeAppUrl}
                  size={150}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div style={{
                fontSize: '0.76rem',
                color: '#64748B',
                marginBottom: 10,
                fontWeight: 600,
                wordBreak: 'break-all'
              }}>
                Target: <code>{activeAppUrl}</code>
              </div>

              <button
                onClick={handleCopyLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: '12px',
                  background: copiedLink ? '#ECFDF5' : '#F1F5F9',
                  border: copiedLink ? '1px solid #10B981' : '1px solid #E2E8F0',
                  color: copiedLink ? '#059669' : '#475569',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                {copiedLink ? 'PWA Link Copied!' : 'Copy Mobile Link'}
              </button>
            </div>

            {/* CARD 3: Direct Web App Access */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              padding: '30px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.04)'
            }}>
              <div>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  marginBottom: 20,
                  boxShadow: '0 8px 18px rgba(2, 132, 199, 0.3)'
                }}>
                  <Globe size={26} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Browser Launch
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
                  Open PWA in Browser
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px' }}>
                  Open the fully responsive PWA web portal right in your browser tab without any installation required.
                </p>

                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  border: '1px solid #E2E8F0',
                  marginBottom: 20
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginBottom: 4 }}>
                    Live PWA URL:
                  </div>
                  <code style={{ fontSize: '0.84rem', color: '#0284C7', fontWeight: 700, wordBreak: 'break-all' }}>
                    {activeAppUrl}
                  </code>
                </div>
              </div>

              <a
                href={activeAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.96rem',
                  fontWeight: 750,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 18px rgba(79, 70, 229, 0.3)',
                  boxSizing: 'border-box'
                }}
              >
                Open PWA in Browser <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Step-by-Step PWA Installation Instructions */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            padding: '36px 32px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.04)',
            marginBottom: 36
          }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 14px',
                borderRadius: '999px',
                background: '#EEF2FF',
                color: '#4F46E5',
                fontSize: '0.78rem',
                fontWeight: 750,
                marginBottom: 10
              }}>
                <HelpCircle size={14} /> 1-Tap Home Screen Guide
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                How to Add the PWA to Your Phone
              </h2>
            </div>

            {/* OS Selector Tabs */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 28
            }}>
              <button
                onClick={() => setActiveTab('android')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: activeTab === 'android' ? '2px solid #10B981' : '1px solid #CBD5E1',
                  background: activeTab === 'android' ? '#ECFDF5' : '#FFFFFF',
                  color: activeTab === 'android' ? '#065F46' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                🤖 Android (Chrome)
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: activeTab === 'ios' ? '2px solid #6366F1' : '1px solid #CBD5E1',
                  background: activeTab === 'ios' ? '#EEF2FF' : '#FFFFFF',
                  color: activeTab === 'ios' ? '#3730A3' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                🍎 Apple iPhone (Safari)
              </button>
            </div>

            {/* Tab 1: Android PWA Guide */}
            {activeTab === 'android' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20
              }}>
                {[
                  { step: '1', title: 'Open PWA in Chrome', desc: `Scan the QR code or visit ${networkInfo.lanUrl} in Google Chrome.` },
                  { step: '2', title: 'Tap Three Dots (⋮)', desc: 'Tap the 3-dot options menu in the top-right corner of Chrome.' },
                  { step: '3', title: 'Tap "Install App"', desc: 'Select "Install app" or "Add to Home screen" from the menu.' },
                  { step: '4', title: 'Ready on Home Screen', desc: 'The Auditorium PWA icon appears on your home screen and launches in full screen!' }
                ].map((s) => (
                  <div key={s.step} style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      {s.step}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45 }}>
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: iPhone PWA Guide */}
            {activeTab === 'ios' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 20
              }}>
                {[
                  { step: '1', title: 'Open in Safari', desc: `Scan the QR code or visit ${networkInfo.lanUrl} using Safari on iOS.` },
                  { step: '2', title: 'Tap Share Button', desc: 'Tap the Share icon (square with upward arrow) at the bottom toolbar.' },
                  { step: '3', title: 'Add to Home Screen', desc: 'Scroll down the share sheet and tap "Add to Home Screen".' },
                  { step: '4', title: 'Tap "Add"', desc: 'Tap "Add" in top-right. The PWA is ready with full-screen standalone experience!' }
                ].map((s) => (
                  <div key={s.step} style={{
                    padding: '20px',
                    borderRadius: '16px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#6366F1',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      {s.step}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45 }}>
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
