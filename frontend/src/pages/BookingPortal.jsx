import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { QRCodeSVG } from 'qrcode.react';
import {
  ExternalLink, Copy, Check, Smartphone, Monitor,
  CheckCircle2, Sparkles, Wifi, Download, Play, RefreshCw,
  Share2, QrCode
} from 'lucide-react';
import { setFacultyAuthorized } from '../utils/facultyAuth';

export default function BookingPortal() {
  const [copied, setCopied] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileQr, setShowMobileQr] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const isLocalEnv = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const defaultFacultyUrl = isLocalEnv 
    ? 'http://localhost:3001' 
    : 'https://auditorium-faculty.vercel.app';

  const [networkInfo, setNetworkInfo] = useState({
    lanIp: isLocalEnv ? 'localhost' : 'auditorium-faculty.vercel.app',
    localUrl: defaultFacultyUrl,
    lanUrl: defaultFacultyUrl
  });

  useEffect(() => {
    // Keep session authorized
    setFacultyAuthorized(true);

    // Responsive screen & device detection
    const checkMobile = () => {
      const isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check standalone mode (PWA already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true ||
                         document.referrer.includes('android-app://');

    const storedInstalled = localStorage.getItem('kirti_faculty_app_installed') === 'true';

    if (isStandalone || storedInstalled) {
      setIsInstalled(true);
    }

    // PWA install prompt handler
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem('kirti_faculty_app_installed', 'true');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (!isLocalEnv) {
      setNetworkInfo({
        lanIp: 'auditorium-faculty.vercel.app',
        localUrl: 'https://auditorium-faculty.vercel.app',
        lanUrl: 'https://auditorium-faculty.vercel.app'
      });
    } else {
      // Fetch dynamic live LAN IP from backend for local dev
      fetch('/api/system/network-info')
        .then(res => res.json())
        .then(data => {
          if (data && data.lanUrl) {
            setNetworkInfo(data);
          }
        })
        .catch(() => {
          const host = window.location.hostname || 'localhost';
          setNetworkInfo({
            lanIp: host,
            localUrl: 'http://localhost:3001',
            lanUrl: `http://${host}:3001`
          });
        });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const targetAppUrl = isMobile ? networkInfo.lanUrl : networkInfo.localUrl;

  const handleActionClick = async () => {
    if (isInstalled) {
      window.open(targetAppUrl, '_blank');
      return;
    }

    const installUrl = `${targetAppUrl}/?install=1`;

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('kirti_faculty_app_installed', 'true');
        }
      } catch (err) {}
      setDeferredPrompt(null);
    } else {
      localStorage.setItem('kirti_faculty_app_installed', 'true');
      setIsInstalled(true);
    }

    window.open(installUrl, '_blank');
  };

  const handleResetInstallState = (e) => {
    e.preventDefault();
    localStorage.removeItem('kirti_faculty_app_installed');
    setIsInstalled(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(networkInfo.lanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Kirti College Auditorium Booking & Attendance Portal: ${networkInfo.lanUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: "'DM Sans', sans-serif",
      color: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      {/* Scoped CSS for Perfect Responsive Behavior */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        .portal-wrapper {
          padding: 48px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }
        .portal-card {
          max-width: 860px;
          width: 100%;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 28px;
          padding: 42px 38px;
          box-shadow: 0 20px 50px -12px rgba(15, 23, 42, 0.08);
          position: relative;
          z-index: 1;
        }
        .portal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: stretch;
          width: 100%;
        }
        .portal-title {
          font-size: 2.1rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.025em;
          margin: 0 0 10px;
          line-height: 1.22;
        }
        .portal-subtitle {
          font-size: 0.96rem;
          color: #64748B;
          margin: 0 auto;
          max-width: 580px;
          line-height: 1.6;
        }
        .action-card {
          background: #F8FAFC;
          border-radius: 22px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease;
          width: 100%;
        }
        .action-card:hover {
          background: #F1F5F9;
        }

        /* Mobile Viewport Optimization (< 768px) */
        @media (max-width: 767px) {
          .portal-wrapper {
            padding: 20px 12px !important;
          }
          .portal-card {
            padding: 22px 14px !important;
            border-radius: 18px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .portal-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .portal-title {
            font-size: 1.45rem !important;
            line-height: 1.25 !important;
          }
          .portal-subtitle {
            font-size: 0.85rem !important;
            line-height: 1.5 !important;
          }
          .action-card {
            padding: 18px 14px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>

      <Navbar activePage="Faculty Access" />

      <main className="portal-wrapper" style={{ flex: 1 }}>
        {/* Ambient background glow */}
        <div style={{
          position: 'absolute',
          maxWidth: '90vw',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          filter: 'blur(70px)'
        }} />

        <div className="portal-card">
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: '999px',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              color: '#4F46E5',
              fontSize: '0.8rem',
              fontWeight: 750,
              marginBottom: '12px'
            }}>
              <Sparkles size={14} color="#6366F1" /> Kirti College • Faculty & Staff Gateway
            </div>

            <h1 className="portal-title">
              Auditorium & Venue Portal
            </h1>

            <p className="portal-subtitle">
              Official portal for faculty and event coordinators to reserve halls, check live venue availability, and conduct verified GPS student attendance sessions.
            </p>
          </div>

          {/* Responsive 2-Column Grid */}
          <div className="portal-grid">
            {/* Primary Action Card: Download / Launch */}
            <div className="action-card" style={{
              border: isInstalled ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
              boxShadow: isInstalled ? '0 4px 16px rgba(34, 197, 94, 0.06)' : 'none'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '13px',
                    background: isInstalled ? '#DCFCE7' : '#EEF2FF',
                    color: isInstalled ? '#16A34A' : '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isMobile ? <Smartphone size={22} /> : <Monitor size={22} />}
                  </div>

                  {/* Status Indicator */}
                  {isInstalled ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#15803D',
                      background: '#DCFCE7',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      border: '1px solid #86EFAC'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#16A34A'
                      }} />
                      Installed
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#4F46E5',
                      background: '#EEF2FF',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      border: '1px solid #C7D2FE'
                    }}>
                      <Download size={12} />
                      Ready to Install
                    </span>
                  )}
                </div>

                <h2 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 6px'
                }}>
                  {isInstalled
                    ? (isMobile ? 'Launch Mobile App' : 'Launch Faculty Portal')
                    : (isMobile ? 'Install App on Phone' : 'Install Faculty App')}
                </h2>

                <p style={{
                  fontSize: '0.86rem',
                  color: '#64748B',
                  lineHeight: 1.5,
                  margin: '0 0 18px'
                }}>
                  {isInstalled
                    ? 'Application is already installed on this device. Click below to launch immediately.'
                    : 'Download and install the official progressive web app for 1-tap fast access and offline support.'}
                </p>

                {/* Key Features */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '9px',
                  marginBottom: '22px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#334155', fontWeight: 650 }}>
                    <CheckCircle2 size={16} color="#10B981" /> Instant Slot Reservation & Receipts
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#334155', fontWeight: 650 }}>
                    <CheckCircle2 size={16} color="#10B981" /> Real-Time Slot Conflict Prevention
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#334155', fontWeight: 650 }}>
                    <CheckCircle2 size={16} color="#10B981" /> Student GPS Attendance Sessions
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleActionClick}
                  style={{
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '13px 20px',
                    borderRadius: '13px',
                    background: isInstalled
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.94rem',
                    fontWeight: 750,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: isInstalled
                      ? '0 6px 18px rgba(16, 185, 129, 0.28)'
                      : '0 6px 18px rgba(79, 70, 229, 0.28)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isInstalled ? (
                    <>
                      <Play size={16} fill="#FFFFFF" /> Launch Portal
                    </>
                  ) : (
                    <>
                      <Download size={16} /> Download & Install App
                    </>
                  )}
                </button>

                <div style={{
                  marginTop: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: '#64748B'
                }}>
                  <a
                    href={targetAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Open in browser tab ↗
                  </a>

                  {isInstalled && (
                    <button
                      onClick={handleResetInstallState}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.74rem',
                        padding: 0
                      }}
                    >
                      <RefreshCw size={11} /> Reset status
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Secondary Card (Desktop: QR Code / Mobile: Quick Connect & Share) */}
            <div className="action-card" style={{
              border: '1px solid #E2E8F0',
              textAlign: isMobile ? 'left' : 'center',
              alignItems: isMobile ? 'stretch' : 'center'
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#4F46E5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px'
                }}>
                  <Smartphone size={14} /> Mobile Quick Connect
                </div>

                <h2 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 6px'
                }}>
                  {isMobile ? 'Share with Colleagues' : 'Scan to Open on Mobile'}
                </h2>

                <p style={{
                  fontSize: '0.84rem',
                  color: '#64748B',
                  lineHeight: 1.45,
                  margin: '0 0 16px'
                }}>
                  {isMobile
                    ? 'Share this booking link with faculty members, or copy the direct portal URL.'
                    : 'Scan with your phone camera on campus Wi-Fi to install or launch the PWA on your smartphone.'}
                </p>

                {/* QR Code Container (Always visible on Desktop, collapsible on Mobile) */}
                {(!isMobile || showMobileQr) && (
                  <div style={{
                    background: '#FFFFFF',
                    padding: '12px',
                    borderRadius: '16px',
                    border: '1.5px dashed #CBD5E1',
                    display: 'inline-block',
                    marginBottom: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}>
                    <QRCodeSVG
                      value={isInstalled ? networkInfo.lanUrl : `${networkInfo.lanUrl}/?install=1`}
                      size={isMobile ? 120 : 136}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'flex-start' : 'center',
                  gap: 6,
                  fontSize: '0.74rem',
                  color: '#64748B',
                  marginBottom: '14px'
                }}>
                  <Wifi size={13} color="#10B981" />
                  <code>{networkInfo.lanUrl}</code>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {isMobile && (
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '12px',
                      background: '#25D366',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.86rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                    }}
                  >
                    <Share2 size={15} /> Share via WhatsApp
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '12px',
                    background: copied ? '#ECFDF5' : '#FFFFFF',
                    border: copied ? '1px solid #10B981' : '1px solid #CBD5E1',
                    color: copied ? '#059669' : '#334155',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Link Copied!' : 'Copy Mobile URL'}
                </button>

                {isMobile && (
                  <button
                    type="button"
                    onClick={() => setShowMobileQr(!showMobileQr)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366F1',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      padding: '4px'
                    }}
                  >
                    <QrCode size={13} /> {showMobileQr ? 'Hide QR Code' : 'Show QR Code for Nearby Phone'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
