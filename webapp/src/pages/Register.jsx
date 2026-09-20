import React, { useState } from 'react';
import { api, sessionManager } from '../api/client';
import { showCustomToast } from '../utils/toast';
import {
  ArrowLeft, User, Phone, Mail, Building2,
  Briefcase, GraduationCap, ArrowRight, CheckCircle2,
  Home, MapPin, Clock, LogIn, AlertCircle, Check, Info
} from 'lucide-react';

/* ══════════════════════════════════════════════
   BUILDING ILLUSTRATION — matching Login page SVG
   ══════════════════════════════════════════════ */
function BuildingIllustration() {
  return (
    <svg viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="reg-bld1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.7"/>
        </linearGradient>
        <linearGradient id="reg-bld2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.6"/>
        </linearGradient>
        <linearGradient id="reg-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7D2FE" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.2"/>
        </linearGradient>
      </defs>

      {/* Ground */}
      <rect x="0" y="138" width="360" height="22" fill="url(#reg-ground)" rx="3"/>

      {/* Far background buildings */}
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

      {/* Left palm tree */}
      <rect x="44" y="108" width="5" height="32" fill="#A5B4FC" opacity="0.7" rx="2"/>
      <ellipse cx="38" cy="105" rx="14" ry="9" fill="#818CF8" opacity="0.45" transform="rotate(-20 38 105)"/>
      <ellipse cx="52" cy="102" rx="14" ry="9" fill="#818CF8" opacity="0.45" transform="rotate(15 52 102)"/>
      <ellipse cx="46" cy="98" rx="12" ry="8" fill="#A5B4FC" opacity="0.55" transform="rotate(-5 46 98)"/>

      {/* Right palm tree */}
      <rect x="311" y="108" width="5" height="32" fill="#A5B4FC" opacity="0.7" rx="2"/>
      <ellipse cx="305" cy="105" rx="14" ry="9" fill="#818CF8" opacity="0.45" transform="rotate(20 305 105)"/>
      <ellipse cx="319" cy="102" rx="14" ry="9" fill="#818CF8" opacity="0.45" transform="rotate(-15 319 102)"/>
      <ellipse cx="313" cy="98" rx="12" ry="8" fill="#A5B4FC" opacity="0.55" transform="rotate(5 313 98)"/>

      {/* Small side trees */}
      <ellipse cx="75" cy="120" rx="10" ry="16" fill="#C7D2FE" opacity="0.6"/>
      <rect x="72" y="128" width="5" height="12" fill="#A5B4FC" opacity="0.5" rx="1"/>
      <ellipse cx="285" cy="120" rx="10" ry="16" fill="#C7D2FE" opacity="0.6"/>
      <rect x="282" y="128" width="5" height="12" fill="#A5B4FC" opacity="0.5" rx="1"/>

      {/* Left wing */}
      <rect x="65" y="85" width="56" height="55" fill="url(#reg-bld2)" rx="2"/>
      <rect x="65" y="80" width="56" height="8" fill="#C4B5FD" opacity="0.7" rx="2"/>
      {[72,85,98,108].map((x,i)=>(
        <rect key={`rlwin-${i}`} x={x} y="92" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}
      {[72,85,98,108].map((x,i)=>(
        <rect key={`rlwi2-${i}`} x={x} y="104" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}
      {[72,85,98,108].map((x,i)=>(
        <rect key={`rlwi3-${i}`} x={x} y="116" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}

      {/* Right wing */}
      <rect x="239" y="85" width="56" height="55" fill="url(#reg-bld2)" rx="2"/>
      <rect x="239" y="80" width="56" height="8" fill="#C4B5FD" opacity="0.7" rx="2"/>
      {[244,257,270,281].map((x,i)=>(
        <rect key={`rrwin-${i}`} x={x} y="92" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}
      {[244,257,270,281].map((x,i)=>(
        <rect key={`rrwi2-${i}`} x={x} y="104" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}
      {[244,257,270,281].map((x,i)=>(
        <rect key={`rrwi3-${i}`} x={x} y="116" width="9" height="7" rx="1" fill="#EEF2FF" opacity="0.85"/>
      ))}

      {/* Main central building */}
      <rect x="118" y="60" width="124" height="80" fill="url(#reg-bld1)" rx="2"/>
      <rect x="112" y="55" width="136" height="8" fill="#A5B4FC" opacity="0.75" rx="2"/>
      <rect x="118" y="47" width="124" height="10" fill="#C7D2FE" opacity="0.7" rx="2"/>

      {/* Central tower */}
      <rect x="158" y="18" width="44" height="42" fill="#818CF8" opacity="0.55" rx="3"/>
      <rect x="152" y="12" width="56" height="9" fill="#6366F1" opacity="0.5" rx="2"/>
      <polygon points="160,12 180,0 200,12" fill="#4F46E5" opacity="0.45"/>
      <rect x="179" y="0" width="2" height="10" fill="#4F46E5" opacity="0.6"/>
      <polygon points="181,0 181,7 187,3" fill="#4F46E5" opacity="0.7"/>

      {/* Clock */}
      <circle cx="180" cy="28" r="8" fill="#EEF2FF" opacity="0.8"/>
      <circle cx="180" cy="28" r="6" fill="none" stroke="#A5B4FC" strokeWidth="1.2" opacity="0.8"/>
      <line x1="180" y1="28" x2="180" y2="23" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
      <line x1="180" y1="28" x2="184" y2="30" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>

      {/* Tower windows */}
      <rect x="165" y="36" width="10" height="8" rx="1" fill="#EEF2FF" opacity="0.85"/>
      <rect x="185" y="36" width="10" height="8" rx="1" fill="#EEF2FF" opacity="0.85"/>
      <rect x="165" y="48" width="10" height="8" rx="1" fill="#EEF2FF" opacity="0.85"/>
      <rect x="185" y="48" width="10" height="8" rx="1" fill="#EEF2FF" opacity="0.85"/>

      {/* Main windows */}
      {[124,140,156,184,200,216,232].map((x,i)=>(
        <rect key={`rmw1-${i}`} x={x} y="68" width="12" height="9" rx="1.5" fill="#EEF2FF" opacity="0.9"/>
      ))}
      {[124,140,156,184,200,216,232].map((x,i)=>(
        <rect key={`rmw2-${i}`} x={x} y="83" width="12" height="9" rx="1.5" fill="#EEF2FF" opacity="0.9"/>
      ))}
      {[124,140,156,184,200,216,232].map((x,i)=>(
        <rect key={`rmw3-${i}`} x={x} y="98" width="12" height="9" rx="1.5" fill="#EEF2FF" opacity="0.9"/>
      ))}

      {/* Entrance arch */}
      <rect x="164" y="108" width="32" height="32" rx="4" fill="#C7D2FE" opacity="0.7"/>
      <path d="M 164 120 Q 164 108 180 108 Q 196 108 196 120" fill="#A5B4FC" opacity="0.65"/>
      <rect x="166" y="110" width="13" height="28" rx="2" fill="#EEF2FF" opacity="0.6"/>
      <rect x="181" y="110" width="13" height="28" rx="2" fill="#EEF2FF" opacity="0.6"/>

      {/* Steps & Pillars */}
      <rect x="158" y="136" width="44" height="3" fill="#A5B4FC" opacity="0.5" rx="1"/>
      <rect x="161" y="133" width="38" height="3" fill="#A5B4FC" opacity="0.4" rx="1"/>
      <rect x="154" y="80" width="6" height="60" fill="#C4B5FD" opacity="0.5" rx="1"/>
      <rect x="200" y="80" width="6" height="60" fill="#C4B5FD" opacity="0.5" rx="1"/>

      {/* Fence */}
      {Array.from({length: 30}, (_, i) => (
        <rect key={`rfp-${i}`} x={12 + i * 11.5} y="137" width="2.5" height="7" rx="1" fill="#A5B4FC" opacity="0.45"/>
      ))}
    </svg>
  );
}

/* ══════════════════════════════════════════════
   MAIN REGISTER COMPONENT
   ══════════════════════════════════════════════ */
export default function Register({ onNavigate, onUserChange }) {
  const [step, setStep]             = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    department: '',
    designation: ''
  });
  const [focusedField, setFocusedField] = useState(null);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const digits = form.mobile.replace(/[^0-9]/g, '').slice(0, 10);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(form.email.trim());
  const isMobileValid = /^[6-9]\d{9}$/.test(digits);
  const isValid = form.firstName.trim().length >= 2 &&
                  form.lastName.trim().length >= 2 &&
                  isMobileValid &&
                  isEmailValid;

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showCustomToast('Name Required', 'Please enter both First Name and Last Name.', 'warning');
      return;
    }
    if (!digits) {
      showCustomToast('Mobile Required', 'Please enter your 10-digit mobile number.', 'warning');
      return;
    }
    if (!/^[6-9]/.test(digits)) {
      showCustomToast('Invalid Mobile Number', 'Mobile number must start with 6, 7, 8, or 9.', 'warning');
      return;
    }
    if (digits.length < 10) {
      showCustomToast('Mobile Incomplete', `Mobile number must be exactly 10 digits (currently ${digits.length}/10).`, 'warning');
      return;
    }
    if (!isEmailValid) {
      showCustomToast('Email Invalid', 'Please enter a valid email address (e.g. name@college.edu).', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      await api.registerFaculty({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        name: fullName,
        mobile: digits.slice(-10),
        email: form.email.trim(),
        department: form.department.trim() || 'General',
        designation: form.designation.trim() || 'Faculty'
      });
      // Do NOT set active user session! User must wait for Admin approval.
      setStep(1);
    } catch (err) {
      showCustomToast('Registration failed', err.message || 'Try again.', 'error');
    } finally { setSubmitting(false); }
  };

  /* ── SUCCESS / APPROVAL PENDING STATE ── */
  if (step === 1) return (
    <div style={{
      minHeight: '100vh', width: '100%',
      background: '#FAFBFF',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', boxSizing: 'border-box',
      fontFamily: "'Inter','Plus Jakarta Sans',-apple-system,sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -70, right: -70,
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: -50, left: -50,
        width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, textAlign: 'center' }}>
        {/* Clock/Approval Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 12px 30px rgba(245,158,11,0.35)',
        }}>
          <Clock size={40} color="#FFF" />
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid #FEF3C7',
          borderRadius: 24, padding: '32px 24px',
          boxShadow: '0 4px 6px rgba(245,158,11,0.05), 0 20px 40px rgba(15,23,42,0.08)',
        }}>
          {/* Status Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#FEF3C7', border: '1px solid #FDE68A',
            color: '#B45309', padding: '5px 14px', borderRadius: 999,
            fontSize: 12, fontWeight: 800, marginBottom: 14,
            letterSpacing: '0.02em', textTransform: 'uppercase'
          }}>
            <Clock size={13} /> Status: Pending Admin Approval
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>
            Registration Submitted! 🎉
          </div>
          <div style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 12 }}>
            Thank you, <strong style={{ color: '#0F172A' }}>Prof. {form.firstName} {form.lastName}</strong>. Your faculty account has been registered in the system.
          </div>

          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            padding: '12px 14px',
            fontSize: 12,
            color: '#475569',
            lineHeight: 1.5,
            marginBottom: 20,
            textAlign: 'left'
          }}>
            🔒 <strong>Next Step:</strong> The Administrator will review your department and role. Once approved, you can log in directly using your registered number:
            <div style={{ fontWeight: 800, color: '#4F46E5', marginTop: 4 }}>
              📞 +91 {digits.slice(-10)} &nbsp;•&nbsp; ✉️ {form.email}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={() => onNavigate?.('login')}
              style={{
                height: 50, borderRadius: 14, border: 'none',
                background: 'linear-gradient(100deg, #4F46E5 0%, #6D28D9 100%)',
                color: '#FFF', fontSize: 14, fontWeight: 800,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 6px 20px rgba(79,70,229,0.35)',
              }}
            >
              <LogIn size={16} /> Go to Login <ArrowRight size={15} />
            </button>
            <button
              onClick={() => onNavigate?.('home')}
              style={{
                height: 44, borderRadius: 14, border: '1px solid #E2E8F0',
                background: '#F8FAFC', color: '#334155',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── MAIN REGISTRATION FORM ── */
  return (
    <div style={{
      height: '100dvh', maxHeight: '100dvh', width: '100%',
      background: '#FAFBFF',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: "'Inter','Plus Jakarta Sans',-apple-system,sans-serif",
      position: 'relative', overflow: 'hidden',
      boxSizing: 'border-box',
    }}>

      {/* ══ Background decorations ══ */}
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
      <div style={{
        position: 'absolute', bottom: 100, right: -60,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, #C7D2FE 0%, transparent 70%)',
        opacity: 0.45, pointerEvents: 'none',
      }}/>

      {/* Floating dot pattern */}
      {[[60,30],[120,18],[180,40],[240,22],[300,35]].map(([x,y],i)=>(
        <div key={`dot-${i}`} style={{
          position: 'absolute', left: x, top: y,
          width: 5, height: 5, borderRadius: '50%',
          background: '#C7D2FE', opacity: 0.7,
          pointerEvents: 'none',
        }}/>
      ))}

      {/* ══ Top Bar: Back button ══ */}
      <div style={{
        padding: '10px 18px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 3,
        flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => onNavigate?.('login')}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#334155', cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(15,23,42,0.05)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.background = '#EEF2FF'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; }}
        >
          <ArrowLeft size={16} />
        </button>
      </div>

      {/* ══ Branding Header ══ */}
      <div style={{ textAlign: 'center', padding: '2px 20px 0', position: 'relative', zIndex: 2, flexShrink: 0 }}>
        {/* Logo with glow ring */}
        <div style={{ display: 'inline-block', position: 'relative', marginBottom: 8 }}>
          <div style={{
            position: 'absolute', inset: -6, borderRadius: 20,
            background: 'linear-gradient(135deg, #E0E7FF, #EDE9FE)',
            zIndex: 0,
          }}/>
          <div style={{
            position: 'relative', zIndex: 1,
            width: 50, height: 50, borderRadius: 16,
            background: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(79,70,229,0.16)',
            padding: 6,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="/Logo.png" alt="Kirti" style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
          </div>
        </div>

        {/* App name */}
        <div style={{
          fontSize: 25, fontWeight: 900,
          letterSpacing: '-0.7px', lineHeight: 1,
          marginBottom: 3,
        }}>
          <span style={{ color: '#0F172A' }}>Kirti</span>
          <span style={{
            background: 'linear-gradient(110deg, #4F46E5 20%, #7C3AED 80%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Audit</span>
        </div>

        {/* College subtitle */}
        <div style={{
          fontSize: 9.5, fontWeight: 800, color: '#94A3B8',
          letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 6,
        }}>
          Kirti M. Doongursee College
        </div>

        {/* Tagline pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#EEF2FF', border: '1px solid #C7D2FE',
          borderRadius: 999, padding: '3px 11px',
          fontSize: 10.5, fontWeight: 700, color: '#4F46E5',
        }}>
          <GraduationCap size={12} />
          <span>Faculty Registration</span>
        </div>
      </div>

      {/* ══ Form Card ══ */}
      <div style={{ padding: '6px 22px 0', position: 'relative', zIndex: 2, flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ marginBottom: 10, textAlign: 'center' }}>
          <div style={{
            fontSize: 19, fontWeight: 900, color: '#0F172A',
            letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 2,
          }}>
            Create Account 📝
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 500, lineHeight: 1.35 }}>
            Mobile number will be your direct Login ID (no password required).
          </div>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* First Name and Last Name Fields (Separated) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {/* First Name */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#FFFFFF',
                border: `1.5px solid ${focusedField === 'firstName' ? '#4F46E5' : '#E2E8F0'}`,
                borderRadius: 12, padding: '9px 11px',
                boxShadow: focusedField === 'firstName'
                  ? '0 0 0 3px rgba(79,70,229,0.1)'
                  : '0 1px 3px rgba(15,23,42,0.04)',
                transition: 'all 0.2s ease',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  background: focusedField === 'firstName' ? '#EEF2FF' : '#F8FAFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  <User size={13} color={focusedField === 'firstName' ? '#4F46E5' : '#94A3B8'}/>
                </div>
                <input
                  type="text"
                  placeholder="First Name *"
                  value={form.firstName}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => update('firstName', e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#0F172A', fontSize: 13, fontWeight: 600,
                    width: '100%', fontFamily: 'inherit',
                  }}
                />
                {form.firstName.trim().length >= 2 && (
                  <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0 }}/>
                )}
              </div>
            </div>

            {/* Last Name */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#FFFFFF',
                border: `1.5px solid ${focusedField === 'lastName' ? '#4F46E5' : '#E2E8F0'}`,
                borderRadius: 12, padding: '9px 11px',
                boxShadow: focusedField === 'lastName'
                  ? '0 0 0 3px rgba(79,70,229,0.1)'
                  : '0 1px 3px rgba(15,23,42,0.04)',
                transition: 'all 0.2s ease',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  background: focusedField === 'lastName' ? '#EEF2FF' : '#F8FAFC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  <User size={13} color={focusedField === 'lastName' ? '#4F46E5' : '#94A3B8'}/>
                </div>
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={form.lastName}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => update('lastName', e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#0F172A', fontSize: 13, fontWeight: 600,
                    width: '100%', fontFamily: 'inherit',
                  }}
                />
                {form.lastName.trim().length >= 2 && (
                  <CheckCircle2 size={13} color="#10B981" style={{ flexShrink: 0 }}/>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#FFFFFF',
              border: `1.5px solid ${
                focusedField === 'mobile'
                  ? '#4F46E5'
                  : (digits.length > 0 && !/^[6-9]/.test(digits) ? '#EF4444' : '#E2E8F0')
              }`,
              borderRadius: 12, padding: '9px 13px',
              boxShadow: focusedField === 'mobile'
                ? '0 0 0 3px rgba(79,70,229,0.1)'
                : (digits.length > 0 && !/^[6-9]/.test(digits) ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 1px 3px rgba(15,23,42,0.04)'),
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: focusedField === 'mobile' ? '#EEF2FF' : (digits.length > 0 && !/^[6-9]/.test(digits) ? '#FEE2E2' : '#F8FAFC'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}>
                <Phone size={13} color={focusedField === 'mobile' ? '#4F46E5' : (digits.length > 0 && !/^[6-9]/.test(digits) ? '#EF4444' : '#94A3B8')}/>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit Mobile number"
                value={form.mobile}
                onFocus={() => setFocusedField('mobile')}
                onBlur={() => setFocusedField(null)}
                onChange={e => update('mobile', e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: '#0F172A', fontSize: 13.5, fontWeight: 600,
                  width: '100%', fontFamily: 'inherit',
                }}
              />
              {digits.length > 0 && digits.length < 10 && /^[6-9]/.test(digits) && (
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', flexShrink: 0 }}>
                  {digits.length}/10
                </span>
              )}
              {isMobileValid && (
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#ECFDF5', border: '1px solid #BBF7D0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CheckCircle2 size={12} color="#10B981"/>
                </div>
              )}
            </div>
            {digits.length > 0 && !/^[6-9]/.test(digits) && (
              <div className="app-alert-error">
                <AlertCircle size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                <span>Must start with 6, 7, 8, or 9 (Indian number)</span>
              </div>
            )}
            {digits.length > 0 && digits.length < 10 && /^[6-9]/.test(digits) && (
              <div className="app-alert-info">
                <Info size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span>Enter full 10 digits ({digits.length}/10)</span>
              </div>
            )}
            {isMobileValid && (
              <div className="app-alert-success">
                <Check size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                <span>Valid 10-digit mobile number</span>
              </div>
            )}
          </div>

          {/* Email Address */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#FFFFFF',
              border: `1.5px solid ${
                focusedField === 'email'
                  ? '#4F46E5'
                  : (form.email && !isEmailValid ? '#EF4444' : '#E2E8F0')
              }`,
              borderRadius: 12, padding: '9px 13px',
              boxShadow: focusedField === 'email'
                ? '0 0 0 3px rgba(79,70,229,0.1)'
                : (form.email && !isEmailValid ? '0 0 0 3px rgba(239,68,68,0.1)' : '0 1px 3px rgba(15,23,42,0.04)'),
              transition: 'all 0.2s ease',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: focusedField === 'email' ? '#EEF2FF' : (form.email && !isEmailValid ? '#FEE2E2' : '#F8FAFC'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}>
                <Mail size={13} color={focusedField === 'email' ? '#4F46E5' : (form.email && !isEmailValid ? '#EF4444' : '#94A3B8')}/>
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={e => update('email', e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: '#0F172A', fontSize: 13.5, fontWeight: 600,
                  width: '100%', fontFamily: 'inherit',
                }}
              />
              {isEmailValid && (
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#ECFDF5', border: '1px solid #BBF7D0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CheckCircle2 size={12} color="#10B981"/>
                </div>
              )}
            </div>
            {form.email.length > 0 && !isEmailValid && (
              <div className="app-alert-error">
                <AlertCircle size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                <span>Enter a valid email (e.g. name@college.edu)</span>
              </div>
            )}
            {isEmailValid && (
              <div className="app-alert-success">
                <Check size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                <span>Valid email address</span>
              </div>
            )}
            {form.email.length === 0 && (
              <div className="app-alert-info">
                <Info size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span>Required for account verification</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 3,
              width: '100%', height: 44, borderRadius: 12, border: 'none',
              background: isValid
                ? 'linear-gradient(100deg, #4F46E5 0%, #6D28D9 100%)'
                : 'linear-gradient(100deg, #6366F1 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              fontSize: 14, fontWeight: 800,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: isValid ? 1 : 0.75,
              boxShadow: isValid
                ? '0 3px 12px rgba(79,70,229,0.28)'
                : '0 2px 8px rgba(99,102,241,0.18)',
              transition: 'all 0.25s ease',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {isValid && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                animation: 'regShimmer 2.5s ease infinite',
              }}/>
            )}
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 7 }}>
              {submitting
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFF', borderRadius: '50%', display: 'inline-block', animation: 'regSpin 0.75s linear infinite' }}/> Registering…</>
                : <><GraduationCap size={15}/> Register &amp; Login <ArrowRight size={14} strokeWidth={2.5}/></>
              }
            </span>
          </button>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }}/>
            <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, letterSpacing: 0.8 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#E2E8F0' }}/>
          </div>

          {/* Back to Login button */}
          <button
            type="button"
            onClick={() => onNavigate?.('login')}
            style={{
              width: '100%', height: 40, borderRadius: 12,
              background: '#FFFFFF',
              border: '1.5px solid #C7D2FE',
              color: '#4F46E5', fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              boxShadow: '0 1px 4px rgba(79,70,229,0.06)',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = '#A5B4FC'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#C7D2FE'; }}
          >
            Already registered? Login
          </button>

        </form>

        {/* Location */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          margin: '6px 0 0',
          fontSize: 10.5, color: '#94A3B8', fontWeight: 600,
        }}>
          <MapPin size={11} color="#10B981"/>
          Kirti M. Doongursee College, Dadar (W)
        </div>
      </div>

      {/* ══ Building + Script (matching Login) ══ */}
      <div style={{ position: 'relative', marginTop: 'auto', maxHeight: 82, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'flex-end' }}>
        <BuildingIllustration/>

        {/* "Learn Grow Excel" — elegant cursive */}
        <div style={{
          position: 'absolute', bottom: 12, right: 16,
          textAlign: 'right', lineHeight: 1.25,
          pointerEvents: 'none',
        }}>
          {['Learn','Grow','Excel'].map((word, i) => (
            <div key={word} style={{
              fontFamily: "'Segoe Script','Brush Script MT',cursive",
              fontSize: i === 1 ? 15 : 12.5,
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#4F46E5',
              opacity: 0.55 + i * 0.1,
              textShadow: '0 1px 3px rgba(79,70,229,0.15)',
              marginBottom: 0,
            }}>
              {word}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes regSpin { to { transform: rotate(360deg); } }
        @keyframes regShimmer {
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
