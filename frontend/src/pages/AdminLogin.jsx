import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  User, Lock, Eye, EyeOff, Shield, 
  ShieldCheck, ArrowRight, Building2, MapPin, 
  Calendar, FileText, ShieldAlert, Zap, Headphones, ArrowLeft
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(d => { if (d.loggedIn) navigate('/admin/dashboard'); })
      .catch(() => {});
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Welcome back, Administrator!',
          showConfirmButton: false,
          timer: 1500
        });
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch {
      setError('Unable to connect to server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Demo credentials loaded!',
      showConfirmButton: false,
      timer: 1200
    });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'info',
      title: 'Password Reset',
      text: 'Please contact Kirti College IT Support Cell to reset administrative access keys.',
      confirmButtonColor: '#2563EB',
      borderRadius: '16px'
    });
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      background: '#060C18',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflow: 'hidden',
      color: '#FFFFFF'
    }}>

      {/* Main Container Split View */}
      <div style={{
        flex: 1,
        display: 'flex',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden'
      }}>

        {/* ─── LEFT PANEL (60% Width, Larger Typography, Zero-Scroll Fit) ─── */}
        <div style={{
          flex: 1.35,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 44px 16px',
          position: 'relative',
          backgroundImage: 'linear-gradient(135deg, rgba(6, 12, 24, 0.88) 0%, rgba(8, 14, 30, 0.95) 100%), url("/kirti_campus_bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRight: '1px solid #142240',
        }} className="d-none d-lg-flex">

          {/* Decorative Subtle Blue Dot Grid (Bottom Left) */}
          <div style={{
            position: 'absolute', bottom: 40, left: 30,
            display: 'grid', gridTemplateColumns: 'repeat(5, 5px)', gap: 8,
            opacity: 0.25, pointerEvents: 'none'
          }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#3B82F6' }} />
            ))}
          </div>

          {/* Top Left Logo Header */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                onClick={() => navigate('/')}
                title="Return to Public Portal"
              >
                <img src="/Logo.png" alt="Kirti Logo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
              </div>
              <div>
                <h3 style={{
                  margin: 0, fontSize: '1.25rem', fontWeight: 800,
                  color: '#FFFFFF', letterSpacing: '-0.02em',
                }}>
                  Kirti M. Doongursee College
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#8A9BC2', fontWeight: 500, marginTop: 1 }}>
                  Dadar (W), Mumbai, Maharashtra
                </div>
              </div>

              {/* Floating Return Button */}
              <button
                onClick={() => navigate('/')}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  color: '#60A5FA', fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.color = '#FFFFFF'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.color = '#60A5FA'; }}
              >
                <ArrowLeft size={14} /> Site Home
              </button>
            </div>
          </div>

          {/* Center Content Section */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 580, margin: 'auto 0' }}>
            
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: '30px',
              background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.35) 0%, rgba(99, 102, 241, 0.35) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#93C5FD', fontSize: '0.76rem', fontWeight: 800, marginBottom: 14,
              letterSpacing: '0.05em'
            }}>
              <ShieldCheck size={14} style={{ color: '#60A5FA' }} />
              OFFICIAL CAMPUS MANAGEMENT PORTAL
            </div>

            {/* Main Headline (Larger Text) */}
            <h1 style={{
              fontSize: '2.45rem', fontWeight: 800, color: '#FFFFFF',
              lineHeight: 1.15, letterSpacing: '-0.03em', margin: '0 0 10px',
            }}>
              Auditorium Booking & <br />
              <span style={{
                background: 'linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                GPS Attendance Gateway
              </span>
            </h1>

            {/* Paragraph Sub-description (Larger Text) */}
            <p style={{
              fontSize: '0.94rem', color: '#A0B0D0', lineHeight: 1.55,
              margin: '0 0 20px', fontWeight: 400, maxWidth: 500
            }}>
              Smart, efficient, and secure platform for auditorium reservations and real-time student GPS attendance.
            </p>

            {/* 4 Feature Cards (2x2 Grid, Larger Text) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: Building2, title: 'Main Auditorium', desc: '800+ Seats & AV Halls', color: '#3B82F6', bg: 'rgba(37, 99, 235, 0.2)' },
                { icon: MapPin, title: 'GPS Geofence', desc: '100m Radius Check-In', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.2)' },
                { icon: Calendar, title: 'Slot Calculator', desc: 'Real-Time Availability', color: '#10B981', bg: 'rgba(16, 185, 129, 0.2)' },
                { icon: FileText, title: 'Digital Receipts', desc: 'Instant Confirmation', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' },
              ].map((card, idx) => (
                <div key={idx} style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(14, 25, 46, 0.65)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(59, 130, 246, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.45)'; e.currentTarget.style.background = 'rgba(18, 32, 58, 0.8)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.18)'; e.currentTarget.style.background = 'rgba(14, 25, 46, 0.65)'; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: card.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <card.icon size={18} style={{ color: card.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>{card.title}</div>
                    <div style={{ fontSize: '0.76rem', color: '#7A8CAE', marginTop: 1, fontWeight: 500 }}>{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Left Shield Line */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#7A8CAE', fontWeight: 600 }}>
            <ShieldCheck size={15} style={{ color: '#3B82F6' }} />
            <span>Secure • Reliable • Smart Campus Solution</span>
          </div>
        </div>

        {/* ─── RIGHT PANEL (40% Width, Exact Glass Login Card, Compact Fit) ─── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#060C18',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Decorative Subtle Blue Dot Grid (Top Right of Card Area) */}
          <div style={{
            position: 'absolute', top: 30, right: 40,
            display: 'grid', gridTemplateColumns: 'repeat(5, 5px)', gap: 8,
            opacity: 0.2, pointerEvents: 'none'
          }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', background: '#3B82F6' }} />
            ))}
          </div>

          {/* Glass Login Card */}
          <div style={{
            width: '100%', maxWidth: 380,
            background: 'rgba(10, 18, 36, 0.9)',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            boxShadow: '0 0 35px rgba(37, 99, 235, 0.15), 0 15px 40px rgba(0, 0, 0, 0.6)',
            padding: '24px 26px 20px',
            position: 'relative',
            zIndex: 10
          }}>

            {/* Top Glowing Shield Icon */}
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.6), 0 0 0 6px rgba(37, 99, 235, 0.15)',
                marginBottom: 10
              }}>
                <Lock size={22} style={{ color: '#FFFFFF' }} />
              </div>

              {/* Card Headings */}
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
                Welcome Back!
              </h2>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#60A5FA', marginBottom: 2 }}>
                Kirti College Admin Portal
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7A8CAE', fontWeight: 400 }}>
                Please sign in to continue
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              
              {/* Error Alert */}
              {error && (
                <div style={{
                  padding: '8px 12px', borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#FCA5A5', fontSize: '0.76rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6
                }}>
                  <ShieldAlert size={14} style={{ flexShrink: 0, color: '#EF4444' }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Username Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#D0DCEE', marginBottom: 4 }}>
                  Username or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6478A0', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin@kirticollege.edu"
                    required
                    autoComplete="username"
                    style={{
                      width: '100%', padding: '9px 12px 9px 36px',
                      fontSize: '0.82rem', color: '#FFFFFF',
                      background: '#0F1A30', border: '1px solid #1D3258',
                      borderRadius: '10px', outline: 'none', boxSizing: 'border-box',
                      transition: 'all 0.15s ease', fontFamily: 'inherit',
                      fontWeight: 500
                    }}
                    onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)'; }}
                    onBlur={e => { e.target.style.borderColor = '#1D3258'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#D0DCEE', marginBottom: 4 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6478A0', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%', padding: '9px 38px 9px 36px',
                      fontSize: '0.82rem', color: '#FFFFFF',
                      background: '#0F1A30', border: '1px solid #1D3258',
                      borderRadius: '10px', outline: 'none', boxSizing: 'border-box',
                      transition: 'all 0.15s ease', fontFamily: 'inherit',
                      fontWeight: 500
                    }}
                    onFocus={e => { e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)'; }}
                    onBlur={e => { e.target.style.borderColor = '#1D3258'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#6478A0', display: 'flex', alignItems: 'center',
                      padding: 2, transition: 'color 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6478A0'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Controls Row: Remember me & Forgot Password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8A9BC2', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{
                      width: 14, height: 14, borderRadius: 3,
                      accentColor: '#2563EB', cursor: 'pointer'
                    }}
                  />
                  Remember me
                </label>

                <a
                  href="#forgot"
                  onClick={handleForgotPassword}
                  style={{ color: '#4F80FF', textDecoration: 'none', fontWeight: 600, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#93C5FD'}
                  onMouseLeave={e => e.currentTarget.style.color = '#4F80FF'}
                >
                  Forgot Password?
                </a>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: 4,
                  background: loading ? '#2563EB80' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.55)'; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.45)'; } }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite', display: 'inline-block',
                    }} />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '1px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#1D3258' }} />
                <span style={{ fontSize: '0.68rem', color: '#4A5C80', fontWeight: 750, letterSpacing: '0.08em' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#1D3258' }} />
              </div>

              {/* Outline Auto-Fill Demo Button */}
              <button
                type="button"
                onClick={handleQuickDemoFill}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '9px',
                  background: '#0B1528',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#60A5FA',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37, 99, 235, 0.2)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0B1528'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'; }}
              >
                <Zap size={13} /> Auto-Fill Demo
              </button>
            </form>

            {/* Bottom Card Security Note */}
            <div style={{ marginTop: 14, textAlign: 'center', fontSize: '0.72rem', color: '#6478A0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 500 }}>
              <Lock size={12} style={{ color: '#6478A0' }} />
              <span>Protected Administrator Portal</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── BOTTOM UNIVERSAL FOOTER BAR (Full Width, Compact Height) ─── */}
      <footer style={{
        padding: '10px 44px',
        background: '#091122',
        borderTop: '1px solid #142240',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        position: 'relative',
        zIndex: 20,
        flexShrink: 0
      }}>
        <div style={{ fontSize: '0.78rem', color: '#7A8CAE', fontWeight: 500 }}>
          © {new Date().getFullYear()} Kirti M. Doongursee College • All Rights Reserved
        </div>

        <div 
          style={{ fontSize: '0.78rem', color: '#60A5FA', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          onClick={() => {
            Swal.fire({
              title: 'IT Support Assistance',
              html: 'For administrator credentials or portal technical issues, email <strong>support@kirticollege.edu</strong> or contact Campus IT Cell.',
              icon: 'info',
              confirmButtonColor: '#2563EB',
              borderRadius: '16px'
            });
          }}
        >
          <Headphones size={14} />
          <span>Need help? Contact IT Support</span>
        </div>
      </footer>

    </div>
  );
}
