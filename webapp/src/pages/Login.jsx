import React, { useState } from 'react';
import { api, adminApi, sessionManager } from '../api/client';
import { showCustomToast } from '../utils/toast';
import {
  Phone, ArrowRight, Shield, Briefcase,
  LogOut, Calendar, AlertTriangle, UserPlus,
  CheckCircle2, Home, MapPin, Clock,
  AlertCircle, Check, Info, Lock, User
} from 'lucide-react';

/* ══════════════════════════════════════════════
   BUILDING ILLUSTRATION — detailed SVG
   ══════════════════════════════════════════════ */
function BuildingIllustration() {
  return (
    <svg viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="bld1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="bld2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EEF2FF" stopOpacity="0"/>
          <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.2"/>
        </linearGradient>
      </defs>

      {/* Ground */}
      <rect x="0" y="138" width="360" height="22" fill="url(#ground)" rx="3"/>

      {/* ── Far background buildings (depth) ── */}
      <rect x="10" y="95" width="28" height="45" fill="#DDD6FE" opacity="0.35" rx="2"/>
      <rect x="15" y="102" width="5" height="4" fill="#EEF2FF" opacity="0.7" rx="1"/>
      <rect x="23" y="102" width="5" height="4" fill="#EEF2FF" opacity="0.7" rx="1"/>
      <rect x="15" y="110" width="5" height="4" fill="#EEF2FF" opacity="0.7" rx="1"/>
      <rect x="23" y="110" width="5" height="4" fill="#EEF2FF" opacity="0.7" rx="1"/>

      <rect x="322" y="90" width="30" height="50" fill="#DDD6FE" opacity="0.35" rx="2"/>
      <rect x="327" y="97" width="5" height="4" fill="#EEF2FF" opacity="0.7" rx="1"/>
      <rect x="336" y="97" width="5" height="4" fill="#EEF2FF" opacity="0.7" rx="1"/>
      <rect x="327" y="105" width="5" height="4" fill="#EEF2FF" opacity="0.7" rx="1"/>
      <rect x="336" y="105" width="5" height="4" fill="#EEF2FF" opacity="0.7" rx="1"/>

      {/* ── Left palm tree ── */}
      <rect x="44" y="108" width="5" height="32" fill="#A5B4FC" opacity="0.7" rx="2"/>
      <ellipse cx="38" cy="105" rx="14" ry="9" fill="#818CF8" opacity="0.45" transform="rotate(-20 38 105)"/>
      <ellipse cx="52" cy="102" rx="14" ry="9" fill="#818CF8" opacity="0.45" transform="rotate(15 52 102)"/>
      <ellipse cx="46" cy="98" rx="12" ry="8" fill="#A5B4FC" opacity="0.55" transform="rotate(-5 46 98)"/>

      {/* ── Right palm tree ── */}
      <rect x="311" y="108" width="5" height="32" fill="#A5B4FC" opacity="0.7" rx="2"/>
      <ellipse cx="305" cy="105" rx="14" ry="9" fill="#818CF8" opacity="0.45" transform="rotate(20 305 105)"/>
      <ellipse cx="319" cy="102" rx="14" ry="9" fill="#818CF8" opacity="0.45" transform="rotate(-15 319 102)"/>
      <ellipse cx="313" cy="98" rx="12" ry="8" fill="#A5B4FC" opacity="0.55" transform="rotate(5 313 98)"/>

      {/* ── Small side trees ── */}
      <ellipse cx="75" cy="120" rx="10" ry="16" fill="#C7D2FE" opacity="0.6"/>
      <rect x="72" y="128" width="5" height="12" fill="#A5B4FC" opacity="0.5" rx="1"/>
      <ellipse cx="285" cy="120" rx="10" ry="16" fill="#C7D2FE" opacity="0.6"/>
      <rect x="282" y="128" width="5" height="12" fill="#A5B4FC" opacity="0.5" rx="1"/>

      {/* ── Side wings of college ── */}
      {/* Left wing */}
      <rect x="65" y="85" width="56" height="55" fill="url(#bld2)" rx="2"/>
      <rect x="65" y="80" width="56" height="8" fill="#C4B5FD" opacity="0.7" rx="2"/>
      {[72,85,98,108].map((x,i)=>(
        <rect key={`lwin-${i}`} x={x} y="92" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}
      {[72,85,98,108].map((x,i)=>(
        <rect key={`lwi2-${i}`} x={x} y="104" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}
      {[72,85,98,108].map((x,i)=>(
        <rect key={`lwi3-${i}`} x={x} y="116" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}

      {/* Right wing */}
      <rect x="239" y="85" width="56" height="55" fill="url(#bld2)" rx="2"/>
      <rect x="239" y="80" width="56" height="8" fill="#C4B5FD" opacity="0.7" rx="2"/>
      {[244,257,270,281].map((x,i)=>(
        <rect key={`rwin-${i}`} x={x} y="92" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}
      {[244,257,270,281].map((x,i)=>(
        <rect key={`rwi2-${i}`} x={x} y="104" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}
      {[244,257,270,281].map((x,i)=>(
        <rect key={`rwi3-${i}`} x={x} y="116" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}

      {/* ── Main central building ── */}
      <rect x="118" y="60" width="124" height="80" fill="url(#bld1)" rx="2"/>
      {/* Cornice */}
      <rect x="112" y="55" width="136" height="8" fill="#A5B4FC" opacity="0.75" rx="2"/>
      <rect x="118" y="47" width="124" height="10" fill="#C7D2FE" opacity="0.7" rx="2"/>

      {/* ── Central tower ── */}
      <rect x="158" y="18" width="44" height="42" fill="#818CF8" opacity="0.55" rx="3"/>
      <rect x="152" y="12" width="56" height="9" fill="#6366F1" opacity="0.5" rx="2"/>
      {/* Tower roof / triangle */}
      <polygon points="160,12 180,0 200,12" fill="#4F46E5" opacity="0.45"/>
      {/* Tower flag pole */}
      <rect x="179" y="0" width="2" height="10" fill="#4F46E5" opacity="0.6"/>
      <polygon points="181,0 181,7 187,3" fill="#4F46E5" opacity="0.7"/>

      {/* Tower clock/detail circle */}
      <circle cx="180" cy="28" r="8" fill="#EEF2FF" opacity="0.8"/>
      <circle cx="180" cy="28" r="6" fill="none" stroke="#A5B4FC" strokeWidth="1.2" opacity="0.8"/>
      <line x1="180" y1="28" x2="180" y2="23" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
      <line x1="180" y1="28" x2="184" y2="30" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>

      {/* Tower windows */}
      <rect x="165" y="36" width="10" height="8" rx="1" fill="#EEF2FF" opacity="0.85"/>
      <rect x="185" y="36" width="10" height="8" rx="1" fill="#EEF2FF" opacity="0.85"/>
      <rect x="165" y="48" width="10" height="8" rx="1" fill="#EEF2FF" opacity="0.85"/>
      <rect x="185" y="48" width="10" height="8" rx="1" fill="#EEF2FF" opacity="0.85"/>

      {/* Main building windows — row 1 */}
      {[124,140,156,184,200,216,232].map((x,i)=>(
        <rect key={`mw1-${i}`} x={x} y="68" width="12" height="9" rx="1.5" fill="#EEF2FF" opacity="0.9"/>
      ))}
      {/* row 2 */}
      {[124,140,156,184,200,216,232].map((x,i)=>(
        <rect key={`mw2-${i}`} x={x} y="83" width="12" height="9" rx="1.5" fill="#EEF2FF" opacity="0.9"/>
      ))}
      {/* row 3 */}
      {[124,140,156,184,200,216,232].map((x,i)=>(
        <rect key={`mw3-${i}`} x={x} y="98" width="12" height="9" rx="1.5" fill="#EEF2FF" opacity="0.9"/>
      ))}

      {/* ── Main entrance arch ── */}
      <rect x="164" y="108" width="32" height="32" rx="4" fill="#C7D2FE" opacity="0.7"/>
      <path d="M 164 120 Q 164 108 180 108 Q 196 108 196 120" fill="#A5B4FC" opacity="0.65"/>
      <rect x="166" y="110" width="13" height="28" rx="2" fill="#EEF2FF" opacity="0.6"/>
      <rect x="181" y="110" width="13" height="28" rx="2" fill="#EEF2FF" opacity="0.6"/>

      {/* Entrance steps */}
      <rect x="158" y="136" width="44" height="3" fill="#A5B4FC" opacity="0.5" rx="1"/>
      <rect x="161" y="133" width="38" height="3" fill="#A5B4FC" opacity="0.4" rx="1"/>

      {/* Pillars at entrance */}
      <rect x="154" y="80" width="6" height="60" fill="#C4B5FD" opacity="0.5" rx="1"/>
      <rect x="200" y="80" width="6" height="60" fill="#C4B5FD" opacity="0.5" rx="1"/>

      {/* Decorative fence posts */}
      {Array.from({length: 30}, (_, i) => (
        <rect key={`fp-${i}`} x={12 + i * 11.5} y="137" width="2.5" height="7" rx="1" fill="#A5B4FC" opacity="0.45"/>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════ */
export default function Login({ currentUser, onUserChange, onNavigate }) {
  const [loginMode,  setLoginMode]  = useState('faculty'); // 'faculty' | 'admin'
  const [mobile,     setMobile]     = useState('');
  const [adminUser,  setAdminUser]  = useState('');
  const [adminPass,  setAdminPass]  = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [mobileFocused,   setMobileFocused]   = useState(false);
  const [adminUserFocused,setAdminUserFocused] = useState(false);
  const [adminPassFocused,setAdminPassFocused] = useState(false);

  const cleanMobile   = mobile.trim();
  const digitsOnly    = cleanMobile.replace(/[^0-9]/g, '').slice(0, 10);
  const isValidMobile = /^[6-9]\d{9}$/.test(digitsOnly);
  const isValidAdmin  = adminUser.trim().length >= 3 && adminPass.length >= 4;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorState(null);

    // ── Admin Login ──
    if (loginMode === 'admin') {
      if (!adminUser.trim() || !adminPass) {
        setErrorState({ type: 'general', message: 'Please enter username and password.' });
        return;
      }
      setLoading(true);
      try {
        const res = await adminApi.login(adminUser.trim(), adminPass);
        if (res.success) {
          const u = { role: 'admin', id: res.user?.id || 'admin-1', name: res.user?.name || 'Administrator', username: adminUser.trim() };
          sessionManager.setUser(u);
          onUserChange?.(u);
          showCustomToast('Admin access granted! 🛡️', 'success');
        }
      } catch (err) {
        setErrorState({ type: 'general', title: 'Login Failed', message: err.message || 'Invalid username or password.' });
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Faculty Login ──
    if (!mobile.trim()) {
      setErrorState({ type: 'general', message: 'Please enter your mobile number.' });
      return;
    }
    if (digitsOnly.length < 10) {
      setErrorState({ type: 'general', message: `Mobile number must be exactly 10 digits (currently ${digitsOnly.length}).` });
      return;
    }
    if (!/^[6-9]/.test(digitsOnly)) {
      setErrorState({ type: 'general', message: 'Mobile number must start with 6, 7, 8, or 9.' });
      return;
    }
    if (!isValidMobile) {
      setErrorState({ type: 'general', message: 'Enter a valid 10-digit Indian mobile number.' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.facultyLogin(digitsOnly);
      if (res.success && res.user) {
        sessionManager.setUser(res.user);
        onUserChange?.(res.user);
        showCustomToast(`Welcome, ${res.user.name}!`, 'success');
        onNavigate?.('home');
      }
    } catch (err) {
      if (err.status === 'Pending') {
        setErrorState({
          type: 'pending',
          title: 'Approval Pending',
          message: 'Your registration request has been submitted to the Admin and is awaiting verification. Once approved, you will be able to log in anytime.'
        });
      } else if (err.status === 'Rejected') {
        setErrorState({
          type: 'rejected',
          title: 'Registration Rejected',
          message: 'Your registration was rejected by the administrator. Please contact the college administration.'
        });
      } else if (err.notFound || err.status === 404) {
        setErrorState({
          type: 'not_found',
          title: 'Number Not Registered',
          message: 'This mobile number is not registered. Please register your faculty details first.'
        });
      } else {
        setErrorState({
          type: 'general',
          title: 'Login Error',
          message: err.message || 'Login failed. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionManager.logout();
    api.authLogout().catch(() => {});
    onUserChange?.(null);
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#FAFBFF',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter','Plus Jakarta Sans',-apple-system,sans-serif",
      position: 'relative', overflow: 'hidden',
      boxSizing: 'border-box',
    }}>

      {/* ══ Background decorations ══ */}
      {/* Top-left gradient blob */}
      <div style={{
        position: 'absolute', top: -90, left: -90,
        width: 260, height: 260, borderRadius: '50%',
        background: 'radial-gradient(circle at 40% 40%, #818CF8 0%, #60A5FA 50%, transparent 75%)',
        opacity: 0.6, pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', top: -50, left: -50,
        width: 170, height: 170, borderRadius: '50%',
        background: 'radial-gradient(circle, #A78BFA 0%, transparent 70%)',
        opacity: 0.35, pointerEvents: 'none',
      }}/>
      {/* Bottom-right accent */}
      <div style={{
        position: 'absolute', bottom: 100, right: -60,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, #C7D2FE 0%, transparent 70%)',
        opacity: 0.45, pointerEvents: 'none',
      }}/>
      {/* Floating dot pattern (top area) */}
      {[[60,30],[120,18],[180,40],[240,22],[300,35]].map(([x,y],i)=>(
        <div key={`dot-${i}`} style={{
          position:'absolute', left: x, top: y,
          width: 5, height: 5, borderRadius:'50%',
          background: '#C7D2FE', opacity: 0.7,
          pointerEvents:'none',
        }}/>
      ))}

      {/* ══ LOGGED IN STATE ══ */}
      {currentUser ? (
        <div style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'24px', position:'relative', zIndex:2,
        }}>
          <div style={{
            width:'100%', maxWidth:340,
            background:'#FFFFFF',
            border:'1px solid #E0E7FF',
            borderRadius:24, padding:'32px 24px',
            textAlign:'center',
            boxShadow:'0 4px 6px rgba(79,70,229,0.05), 0 20px 40px rgba(79,70,229,0.1)',
          }}>
            <div style={{
              width:70, height:70, margin:'0 auto 10px',
              borderRadius:20,
              background:'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 8px 24px rgba(79,70,229,0.35)',
            }}>
              {currentUser.role === 'admin' ? <Shield size={30} color="#FFF"/> : <Briefcase size={30} color="#FFF"/>}
            </div>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:5,
              background:'#ECFDF5', border:'1px solid #BBF7D0',
              color:'#059669', padding:'3px 12px', borderRadius:999,
              fontSize:10, fontWeight:800, letterSpacing:0.6,
              marginBottom:10, textTransform:'uppercase',
            }}>
              <span style={{width:5,height:5,borderRadius:'50%',background:'#10B981',display:'inline-block'}}/> Active
            </span>
            <div style={{fontSize:21,fontWeight:900,color:'#0F172A',marginBottom:3}}>{currentUser.name}</div>
            <div style={{fontSize:12,color:'#64748B',marginBottom:26}}>{currentUser.mobile||currentUser.email||currentUser.departmentId}</div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <button onClick={()=>onNavigate?.('home')} style={{height:48,borderRadius:14,background:'linear-gradient(90deg,#4F46E5,#7C3AED)',border:'none',color:'#FFF',fontSize:14,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 6px 20px rgba(79,70,229,0.35)'}}>
                <Home size={15}/> Go to Home
              </button>
              <button onClick={()=>onNavigate?.('booking')} style={{height:44,borderRadius:14,background:'#F8FAFC',border:'1px solid #E2E8F0',color:'#334155',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                <Calendar size={14}/> Book a Hall
              </button>
              <button onClick={handleLogout} style={{height:42,borderRadius:14,background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
                <LogOut size={14}/> Sign Out
              </button>
            </div>
          </div>
        </div>

      ) : (
        <div style={{flex:1, display:'flex', flexDirection:'column', position:'relative', zIndex:2}}>

          {/* ══ Branding Header ══ */}
          <div style={{textAlign:'center', padding:'48px 28px 0', position:'relative'}}>

            {/* Logo with glow ring */}
            <div style={{display:'inline-block', position:'relative', marginBottom:18}}>
              <div style={{
                position:'absolute', inset:-8, borderRadius:28,
                background:'linear-gradient(135deg, #E0E7FF, #EDE9FE)',
                zIndex:0,
              }}/>
              <div style={{
                position:'relative', zIndex:1,
                width:76, height:76, borderRadius:22,
                background:'#FFFFFF',
                boxShadow:'0 4px 16px rgba(79,70,229,0.18), 0 1px 4px rgba(79,70,229,0.1)',
                padding:9,
                display:'inline-flex', alignItems:'center', justifyContent:'center',
              }}>
                <img src="/Logo.png" alt="Kirti" style={{width:'100%',height:'100%',objectFit:'contain'}}/>
              </div>
            </div>

            {/* App name */}
            <div style={{
              fontSize:34, fontWeight:900,
              letterSpacing:'-1px', lineHeight:1,
              marginBottom:8,
            }}>
              <span style={{color:'#0F172A'}}>Kirti</span>
              <span style={{
                background:'linear-gradient(110deg, #4F46E5 20%, #7C3AED 80%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>Audit</span>
            </div>

            {/* College subtitle */}
            <div style={{
              fontSize:10, fontWeight:800, color:'#94A3B8',
              letterSpacing:1.8, textTransform:'uppercase', marginBottom:8,
            }}>
              Kirti M. Doongursee College
            </div>

            {/* Tagline pill */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'#EEF2FF', border:'1px solid #C7D2FE',
              borderRadius:999, padding:'5px 14px',
              fontSize:11, fontWeight:700, color:'#4F46E5',
            }}>
              <span>Manage</span>
              <span style={{width:3,height:3,borderRadius:'50%',background:'#A5B4FC',display:'inline-block'}}/>
              <span>Book</span>
              <span style={{width:3,height:3,borderRadius:'50%',background:'#A5B4FC',display:'inline-block'}}/>
              <span>Track</span>
            </div>
          </div>

          {/* ══ Form Card ══ */}
          <div style={{padding:'28px 24px 0'}}>

            {/* Role Toggle */}
            <div style={{
              display:'flex', background:'#F1F5F9', borderRadius:12,
              padding:4, marginBottom:24, gap:4,
            }}>
              {[{id:'faculty',label:'👨‍🏫 Faculty'},{id:'admin',label:'🛡️ Admin'}].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setLoginMode(tab.id); setErrorState(null); }}
                  style={{
                    flex:1, height:38, borderRadius:9, border:'none',
                    background: loginMode === tab.id ? '#FFFFFF' : 'transparent',
                    color: loginMode === tab.id ? '#4F46E5' : '#64748B',
                    fontWeight: loginMode === tab.id ? 800 : 600,
                    fontSize:13, cursor:'pointer',
                    boxShadow: loginMode === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition:'all 0.18s ease',
                    fontFamily:'inherit',
                  }}
                >{tab.label}</button>
              ))}
            </div>

            {/* Welcome heading */}
            <div style={{marginBottom:24}}>
              <div style={{
                fontSize:26, fontWeight:900, color:'#0F172A',
                letterSpacing:'-0.6px', lineHeight:1.25, marginBottom:6,
              }}>
                {loginMode === 'admin' ? 'Admin Login 🛡️' : 'Welcome Back 👋'}
              </div>
              <div style={{fontSize:13, color:'#64748B', fontWeight:500, lineHeight:1.6}}>
                {loginMode === 'admin'
                  ? 'Sign in with your admin credentials to manage the system.'
                  : 'Log in to your Kirti Audit account to continue.'
                }
              </div>
            </div>

            {/* Status & Error Feedback Banners */}
            {errorState && (
              <div style={{
                borderRadius: 14,
                padding: '14px 16px',
                marginBottom: 18,
                background: errorState.type === 'pending'
                  ? '#FFFBEB'
                  : errorState.type === 'not_found'
                  ? '#EFF6FF'
                  : '#FEF2F2',
                border: `1.5px solid ${
                  errorState.type === 'pending'
                    ? '#FDE68A'
                    : errorState.type === 'not_found'
                    ? '#BFDBFE'
                    : '#FECACA'
                }`,
                color: errorState.type === 'pending'
                  ? '#92400E'
                  : errorState.type === 'not_found'
                  ? '#1E40AF'
                  : '#991B1B',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                  {errorState.type === 'pending' ? (
                    <Clock size={16} color="#D97706" />
                  ) : errorState.type === 'not_found' ? (
                    <UserPlus size={16} color="#2563EB" />
                  ) : (
                    <AlertTriangle size={16} color="#DC2626" />
                  )}
                  <span>{errorState.title || 'Notice'}</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.95 }}>
                  {errorState.message}
                </div>
                {errorState.type === 'not_found' && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.('register')}
                    style={{
                      marginTop: 10,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#2563EB',
                      color: '#FFF',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <UserPlus size={13} /> Register New Account Now <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:14}}>

              {/* ── ADMIN FORM ── */}
              {loginMode === 'admin' && (
                <>
                  {/* Username */}
                  <div style={{
                    display:'flex', alignItems:'center', gap:12,
                    background:'#FFFFFF',
                    border:`1.5px solid ${adminUserFocused ? '#4F46E5' : '#E2E8F0'}`,
                    borderRadius:14, padding:'15px 16px',
                    boxShadow: adminUserFocused ? '0 0 0 4px rgba(79,70,229,0.1)' : '0 2px 6px rgba(15,23,42,0.05)',
                    transition:'all 0.2s ease',
                  }}>
                    <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background: adminUserFocused ? '#EEF2FF' : '#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}>
                      <User size={15} color={adminUserFocused ? '#4F46E5' : '#94A3B8'}/>
                    </div>
                    <input
                      type="text" autoFocus autoComplete="username"
                      placeholder="Admin username"
                      value={adminUser}
                      onFocus={() => setAdminUserFocused(true)}
                      onBlur={() => setAdminUserFocused(false)}
                      onChange={e => setAdminUser(e.target.value)}
                      style={{ background:'transparent', border:'none', outline:'none', color:'#0F172A', fontSize:15, fontWeight:600, width:'100%', fontFamily:'inherit' }}
                    />
                  </div>

                  {/* Password */}
                  <div style={{
                    display:'flex', alignItems:'center', gap:12,
                    background:'#FFFFFF',
                    border:`1.5px solid ${adminPassFocused ? '#4F46E5' : '#E2E8F0'}`,
                    borderRadius:14, padding:'15px 16px',
                    boxShadow: adminPassFocused ? '0 0 0 4px rgba(79,70,229,0.1)' : '0 2px 6px rgba(15,23,42,0.05)',
                    transition:'all 0.2s ease',
                  }}>
                    <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background: adminPassFocused ? '#EEF2FF' : '#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}>
                      <Lock size={15} color={adminPassFocused ? '#4F46E5' : '#94A3B8'}/>
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'} autoComplete="current-password"
                      placeholder="Password"
                      value={adminPass}
                      onFocus={() => setAdminPassFocused(true)}
                      onBlur={() => setAdminPassFocused(false)}
                      onChange={e => setAdminPass(e.target.value)}
                      style={{ background:'transparent', border:'none', outline:'none', color:'#0F172A', fontSize:15, fontWeight:600, width:'100%', fontFamily:'inherit' }}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#94A3B8', flexShrink:0 }}>
                      <span style={{ fontSize:11, fontWeight:700 }}>{showPass ? 'HIDE' : 'SHOW'}</span>
                    </button>
                  </div>

                  {/* Admin Login button */}
                  <button
                    type="submit"
                    disabled={loading || !isValidAdmin}
                    style={{
                      width:'100%', height:54, borderRadius:14, border:'none',
                      background: isValidAdmin ? 'linear-gradient(100deg, #4F46E5 0%, #6D28D9 100%)' : '#F1F5F9',
                      color: isValidAdmin ? '#FFFFFF' : '#CBD5E1',
                      fontSize:16, fontWeight:800,
                      cursor: isValidAdmin ? 'pointer' : 'not-allowed',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                      boxShadow: isValidAdmin ? '0 4px 6px rgba(79,70,229,0.2), 0 12px 28px rgba(79,70,229,0.3)' : 'none',
                      transition:'all 0.25s ease',
                      position:'relative', overflow:'hidden',
                    }}
                  >
                    {isValidAdmin && <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)', animation:'shimmer 2.5s ease infinite' }}/>}
                    <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:10 }}>
                      {loading ? <><span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#FFF', borderRadius:'50%', display:'inline-block', animation:'spin 0.75s linear infinite' }}/> Signing in…</> : <><Shield size={17}/> Sign In as Admin</>}
                    </span>
                  </button>
                </>
              )}

              {/* ── FACULTY FORM ── */}
              {loginMode === 'faculty' && (
                <>
                  {/* Mobile input */}
                  <div>
                    <div style={{
                      display:'flex', alignItems:'center', gap:12,
                      background:'#FFFFFF',
                      border:`1.5px solid ${mobileFocused ? '#4F46E5' : '#E2E8F0'}`,
                      borderRadius:14, padding:'15px 16px',
                      boxShadow: mobileFocused ? '0 0 0 4px rgba(79,70,229,0.1), 0 2px 8px rgba(79,70,229,0.08)' : '0 2px 6px rgba(15,23,42,0.05)',
                      transition:'all 0.2s ease',
                    }}>
                      <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background: mobileFocused ? '#EEF2FF' : '#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}>
                        <Phone size={15} color={mobileFocused ? '#4F46E5' : '#94A3B8'}/>
                      </div>
                      <input
                        type="tel" inputMode="numeric" autoFocus autoComplete="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={mobile}
                        onFocus={() => setMobileFocused(true)}
                        onBlur={() => setMobileFocused(false)}
                        onChange={e => setMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                        style={{ background:'transparent', border:'none', outline:'none', color:'#0F172A', fontSize:15, fontWeight:600, width:'100%', fontFamily:'inherit' }}
                      />
                      {digitsOnly.length > 0 && digitsOnly.length < 10 && (
                        <span style={{ fontSize:11, fontWeight:700, color:'#94A3B8', flexShrink:0 }}>{digitsOnly.length}/10</span>
                      )}
                      {isValidMobile && (
                        <div style={{ width:22, height:22, borderRadius:'50%', background:'#ECFDF5', border:'1px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <CheckCircle2 size={13} color="#10B981"/>
                        </div>
                      )}
                    </div>
                    {digitsOnly.length > 0 && !/^[6-9]/.test(digitsOnly) && (
                      <div className="app-alert-error"><AlertCircle size={12} strokeWidth={2.5} style={{ flexShrink:0 }}/><span>Must start with 6, 7, 8, or 9 (Indian number)</span></div>
                    )}
                    {digitsOnly.length > 0 && digitsOnly.length < 10 && /^[6-9]/.test(digitsOnly) && (
                      <div className="app-alert-info"><Info size={12} strokeWidth={2} style={{ flexShrink:0 }}/><span>Enter full 10 digits ({digitsOnly.length}/10)</span></div>
                    )}
                    {isValidMobile && (
                      <div className="app-alert-success"><Check size={12} strokeWidth={2.5} style={{ flexShrink:0 }}/><span>Valid 10-digit mobile number</span></div>
                    )}
                  </div>

                  {/* Faculty Login button */}
                  <button
                    type="submit"
                    disabled={loading || !isValidMobile}
                    style={{
                      width:'100%', height:54, borderRadius:14, border:'none',
                      background: isValidMobile ? 'linear-gradient(100deg, #4F46E5 0%, #6D28D9 100%)' : '#F1F5F9',
                      color: isValidMobile ? '#FFFFFF' : '#CBD5E1',
                      fontSize:16, fontWeight:800,
                      cursor: isValidMobile ? 'pointer' : 'not-allowed',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                      boxShadow: isValidMobile ? '0 4px 6px rgba(79,70,229,0.2), 0 12px 28px rgba(79,70,229,0.3)' : 'none',
                      transition:'all 0.25s ease',
                      letterSpacing:'0.2px',
                      position:'relative', overflow:'hidden',
                    }}
                  >
                    {isValidMobile && <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)', animation:'shimmer 2.5s ease infinite' }}/>}
                    <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:10 }}>
                      {loading ? <><span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'#FFF', borderRadius:'50%', display:'inline-block', animation:'spin 0.75s linear infinite' }}/> Verifying…</> : <>Login <ArrowRight size={18} strokeWidth={2.5}/></>}
                    </span>
                  </button>

                  {/* OR divider */}
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{flex:1,height:1,background:'#E2E8F0'}}/>
                    <span style={{fontSize:11,color:'#94A3B8',fontWeight:700,letterSpacing:1}}>OR</span>
                    <div style={{flex:1,height:1,background:'#E2E8F0'}}/>
                  </div>

                  {/* Register button */}
                  <button
                    type="button"
                    onClick={() => onNavigate?.('register')}
                    style={{
                      width:'100%', height:52, borderRadius:14,
                      background:'#FFFFFF', border:'1.5px solid #C7D2FE',
                      color:'#4F46E5', fontSize:14, fontWeight:700,
                      cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:9,
                      fontFamily:'inherit',
                      boxShadow:'0 2px 8px rgba(79,70,229,0.08)',
                      transition:'all 0.18s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='#EEF2FF'; e.currentTarget.style.borderColor='#A5B4FC'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#FFFFFF'; e.currentTarget.style.borderColor='#C7D2FE'; }}
                  >
                    <UserPlus size={16} color="#4F46E5"/> Register as New Faculty
                  </button>
                </>
              )}

            </form>

            {/* Location */}
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              margin:'20px 0 0',
              fontSize:11, color:'#94A3B8', fontWeight:600,
            }}>
              <MapPin size={11} color="#10B981"/>
              Kirti M. Doongursee College, Dadar (W)
            </div>
          </div>

          {/* ══ Building + Script ══ */}
          <div style={{position:'relative', marginTop:'auto', paddingTop:8}}>
            <BuildingIllustration/>

            {/* "Learn Grow Excel" — elegant cursive */}
            <div style={{
              position:'absolute', bottom:22, right:20,
              textAlign:'right', lineHeight:1.35,
              pointerEvents:'none',
            }}>
              {['Learn','Grow','Excel'].map((word, i) => (
                <div key={word} style={{
                  fontFamily:"'Segoe Script','Brush Script MT',cursive",
                  fontSize: i === 1 ? 17 : 14,
                  fontWeight:700,
                  fontStyle:'italic',
                  color:'#4F46E5',
                  opacity: 0.55 + i * 0.1,
                  textShadow:'0 1px 3px rgba(79,70,229,0.15)',
                  marginBottom:1,
                }}>
                  {word}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
          box-shadow: 0 0 0 1000px #FFFFFF inset !important;
          -webkit-text-fill-color: #0F172A !important;
          caret-color: #0F172A !important;
          transition: background-color 5000000s ease-in-out 0s !important;
        }
      `}</style>
    </div>
  );
}
