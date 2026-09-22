import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { sessionManager, api } from '../api/client';
import { showCustomToast } from '../utils/toast';
import {
  User, Phone, Mail, Building2, Briefcase,
  Shield, LogOut, Calendar, Radio, BookOpen,
  ChevronRight, Home, Settings, Bell, Info,
  HelpCircle, FileText, Star, X, Check,
  Volume2, VolumeX, Smartphone, Edit3,
  ExternalLink, Clock, AlertCircle, Download
} from 'lucide-react';

export default function Profile({ currentUser, onUserChange, onNavigate }) {
  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'rules' | 'help' | 'about' | 'edit' | null

  // Setting toggles (persisted in localStorage)
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('kirti_setting_notifications') !== 'false';
  });
  const [soundEffects, setSoundEffects] = useState(() => {
    return localStorage.getItem('kirti_setting_sound') !== 'false';
  });
  const [haptics, setHaptics] = useState(() => {
    return localStorage.getItem('kirti_setting_haptics') !== 'false';
  });

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    department: currentUser?.departmentName || '',
    mobile: currentUser?.mobile || '',
    email: currentUser?.email || '',
  });

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        name: currentUser.name || '',
        department: currentUser.departmentName || '',
        mobile: currentUser.mobile || '',
        email: currentUser.email || '',
      });
    }
  }, [currentUser]);

  const toggleNotification = () => {
    const val = !notifications;
    setNotifications(val);
    localStorage.setItem('kirti_setting_notifications', String(val));
    showCustomToast(val ? 'Notifications enabled' : 'Notifications muted', 'info');
  };

  const toggleSound = () => {
    const val = !soundEffects;
    setSoundEffects(val);
    localStorage.setItem('kirti_setting_sound', String(val));
    showCustomToast(val ? 'Sound effects enabled' : 'Sound effects muted', 'info');
  };

  const toggleHaptics = () => {
    const val = !haptics;
    setHaptics(val);
    localStorage.setItem('kirti_setting_haptics', String(val));
    showCustomToast(val ? 'Vibration & Haptics on' : 'Vibration & Haptics off', 'info');
  };

  const handleInstallApp = async () => {
    const prompt = window.__PWA_DEFERRED_PROMPT__;
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        showCustomToast('🎉 Kirti Faculty App installed!', 'success');
      }
      window.__PWA_DEFERRED_PROMPT__ = null;
    } else {
      const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIOS) {
        showCustomToast('Tap Safari Share (⎋) -> Add to Home Screen', 'info');
      } else {
        showCustomToast('Tap browser menu (⋮) -> Install app', 'info');
      }
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!editForm.name.trim()) {
      showCustomToast('Full Name is required', 'warning');
      return;
    }

    const cleanMobile = (editForm.mobile || '').replace(/[^0-9]/g, '').slice(0, 10);
    if (cleanMobile && cleanMobile.length < 10) {
      showCustomToast('Please enter a valid 10-digit phone number', 'warning');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: editForm.name.trim(),
      departmentName: editForm.department.trim() || 'General',
      departmentId: editForm.department.trim() || 'General',
      mobile: cleanMobile || currentUser.mobile || '',
      email: editForm.email.trim(),
    };

    sessionManager.setUser(updatedUser);
    onUserChange?.(updatedUser);
    setActiveModal(null);
    showCustomToast('Profile updated successfully!', 'success');
  };

  const handleLogout = () => {
    sessionManager.logout();
    api.authLogout().catch(() => {});
    onUserChange?.(null);
    showCustomToast('Signed out successfully.', 'info');
    onNavigate?.('login');
  };

  const roleGrad = currentUser?.role === 'admin'
    ? 'linear-gradient(135deg,#F59E0B,#D97706)'
    : 'linear-gradient(135deg,#7C3AED,#06B6D4)';

  const roleLabel = currentUser?.role === 'admin' ? 'Administrator' : 'Faculty Coordinator';
  const initial = (currentUser?.name || 'F')[0].toUpperCase();

  const navItems = [
    { icon: Home,     label: 'Home',          tab: 'home',     color: '#7C3AED' },
    { icon: Calendar, label: 'Book a Hall',   tab: 'booking',  color: '#06B6D4' },
    { icon: Radio,    label: 'Faculty Live',  tab: 'faculty',  color: '#10B981' },
    { icon: BookOpen, label: 'My History',    tab: 'activity', color: '#F59E0B' },
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: 40 }}>

      {/* ── Profile Card ── */}
      {currentUser ? (
        <div style={{
          background: 'linear-gradient(145deg,#1E1039,#2D1B69,#312E81)',
          borderRadius: 'var(--r-2xl)', padding: '22px 20px 20px',
          marginBottom: 16, position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(30,16,57,0.35)',
        }}>
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute', top: -60, right: -50,
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(124,58,237,0.45) 0%,transparent 70%)',
            filter: 'blur(28px)', pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            {/* Avatar */}
            <div style={{
              width: 58, height: 58, borderRadius: 18,
              background: roleGrad, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 24, fontWeight: 900,
              color: '#FFF', flexShrink: 0,
              boxShadow: '0 8px 20px rgba(124,58,237,0.4)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {initial}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 18, fontWeight: 900, color: '#FFF',
                letterSpacing: '-0.3px', lineHeight: 1.2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {currentUser.name}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#6EE7B7', padding: '2px 9px', borderRadius: 999,
                fontSize: 10, fontWeight: 800, marginTop: 5,
                textTransform: 'uppercase', letterSpacing: 0.4
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                {roleLabel}
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={() => setActiveModal('edit')}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFF', cursor: 'pointer', flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
              title="Edit Profile"
            >
              <Edit3 size={16} />
            </button>
          </div>

          {/* Info rows */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
            paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={13} color="rgba(196,181,253,0.7)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'rgba(196,181,253,0.9)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.mobile || 'No phone set'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={13} color="rgba(196,181,253,0.7)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'rgba(196,181,253,0.9)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.departmentName || 'General'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, gridColumn: 'span 2' }}>
              <Mail size={13} color="rgba(196,181,253,0.7)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'rgba(196,181,253,0.9)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.email || 'No email set'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Not logged in fallback */
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', padding: '24px 20px',
          marginBottom: 16, textAlign: 'center', boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--primary-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
          }}>
            <User size={26} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Not signed in</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Sign in to access faculty features</div>
          <button className="btn-primary" onClick={() => onNavigate?.('login')} style={{ maxWidth: 220, margin: '0 auto' }}>
            Sign In with Mobile
          </button>
        </div>
      )}

      {/* ── Quick Navigation ── */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-eyebrow" style={{ marginBottom: 10 }}>
          <Home size={11} /> Quick Navigation
        </div>
        <div className="quick-action-grid">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                className="quick-action-btn"
                onClick={() => onNavigate?.(item.tab)}
                style={{ cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: `${item.color}18`, border: `1.5px solid ${item.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}>
                  <Icon size={17} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Jump to tab</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── App Preferences & Settings ── */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-eyebrow" style={{ marginBottom: 10 }}>
          <Settings size={11} /> Preferences &amp; System
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Notifications Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 16px', borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={16} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Push Notifications</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Booking approval &amp; reminder alerts</div>
              </div>
            </div>
            {/* Toggle Switch */}
            <div
              onClick={toggleNotification}
              style={{
                width: 44, height: 24, borderRadius: 999,
                background: notifications ? 'var(--primary)' : '#E2E8F0',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#FFF',
                position: 'absolute', top: 3,
                left: notifications ? 23 : 3,
                transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>

          {/* Sound Feedback */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 16px', borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {soundEffects ? <Volume2 size={16} color="#06B6D4" /> : <VolumeX size={16} color="var(--text-muted)" />}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Audio Effects</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Feedback sounds on actions &amp; booking</div>
              </div>
            </div>
            <div
              onClick={toggleSound}
              style={{
                width: 44, height: 24, borderRadius: 999,
                background: soundEffects ? '#06B6D4' : '#E2E8F0',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#FFF',
                position: 'absolute', top: 3,
                left: soundEffects ? 23 : 3,
                transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>

          {/* Haptic / Vibration */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Smartphone size={16} color="#10B981" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Vibration &amp; Haptics</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gentle tactile feedback on mobile taps</div>
              </div>
            </div>
            <div
              onClick={toggleHaptics}
              style={{
                width: 44, height: 24, borderRadius: 999,
                background: haptics ? '#10B981' : '#E2E8F0',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#FFF',
                position: 'absolute', top: 3,
                left: haptics ? 23 : 3,
                transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>

          {/* Download Faculty App Option */}
          <div
            onClick={handleInstallApp}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 16px', borderTop: '1px solid var(--border-light)',
              cursor: 'pointer', background: 'rgba(37, 99, 235, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Download size={16} color="#2563EB" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 750, color: 'var(--text-primary)' }}>Download Kirti Audit</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Install to Home Screen for fast offline booking</div>
              </div>
            </div>
            <span style={{
              background: '#2563EB', color: '#FFF', padding: '6px 14px',
              borderRadius: 999, fontSize: 11, fontWeight: 750, display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}>
              Install
            </span>
          </div>

        </div>
      </div>

      {/* ── College & Policies ── */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-eyebrow" style={{ marginBottom: 10 }}>
          <FileText size={11} /> Information &amp; Policies
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Booking Rules */}
          <div
            onClick={() => setActiveModal('rules')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 16px', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={16} color="var(--primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Auditorium Booking Rules</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Hall capacity, timings &amp; usage guidelines</div>
            </div>
            <ChevronRight size={15} color="var(--text-muted)" />
          </div>

          {/* Help & Support */}
          <div
            onClick={() => setActiveModal('help')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 16px', borderBottom: '1px solid var(--border)',
              cursor: 'pointer', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <HelpCircle size={16} color="#F59E0B" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Help &amp; Support Desk</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Auditorium in-charge &amp; IT technical support</div>
            </div>
            <ChevronRight size={15} color="var(--text-muted)" />
          </div>

          {/* About App */}
          <div
            onClick={() => setActiveModal('about')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 16px', cursor: 'pointer', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Info size={16} color="#06B6D4" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>About KirtiAudit App</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Version 2.0 • Offline PWA details</div>
            </div>
            <ChevronRight size={15} color="var(--text-muted)" />
          </div>

        </div>
      </div>

      {/* ── App Info Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(124,58,237,0.06),rgba(6,182,212,0.06))',
        border: '1px solid var(--primary-border)', borderRadius: 'var(--r-lg)',
        padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: '#FFF', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <img src="/Logo.png" alt="Kirti" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-dark)' }}>KirtiAudit PWA</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Kirti M. Doongursee College • Dadar (W)</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Star size={11} color="#F59E0B" fill="#F59E0B" />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706' }}>v2.0</span>
        </div>
      </div>

      {/* ── Sign Out / Switch User ── */}
      {currentUser && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '13px', borderRadius: 'var(--r-md)',
              background: 'var(--danger-light)', border: '1.5px solid var(--danger-border)',
              color: 'var(--danger-dark)', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--danger-light)'}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODALS (Rendered via createPortal to document.body) ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {activeModal && typeof document !== 'undefined' && createPortal(
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>

          {/* 1. Edit Profile Modal */}
          {activeModal === 'edit' && (
            <div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 440, padding: 22 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit3 size={18} color="var(--primary)" />
                  <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>Edit Faculty Profile</span>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} color="var(--text-muted)" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    style={{
                      width: '100%', height: 42, padding: '0 12px',
                      borderRadius: 8, border: '1.5px solid var(--border)',
                      fontSize: 14, background: 'var(--surface)', color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                    DEPARTMENT
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Information Technology, Commerce"
                    value={editForm.department}
                    onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                    style={{
                      width: '100%', height: 42, padding: '0 12px',
                      borderRadius: 8, border: '1.5px solid var(--border)',
                      fontSize: 14, background: 'var(--surface)', color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                    PHONE NO
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={editForm.mobile}
                    onChange={e => setEditForm({ ...editForm, mobile: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                    style={{
                      width: '100%', height: 42, padding: '0 12px',
                      borderRadius: 8, border: '1.5px solid var(--border)',
                      fontSize: 14, background: 'var(--surface)', color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                    EMAIL ADDRESS (OPTIONAL)
                  </label>
                  <input
                    type="email"
                    placeholder="faculty@kirticollege.edu.in"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    style={{
                      width: '100%', height: 42, padding: '0 12px',
                      borderRadius: 8, border: '1.5px solid var(--border)',
                      fontSize: 14, background: 'var(--surface)', color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    style={{
                      flex: 1, height: 42, borderRadius: 8,
                      background: 'var(--surface-hover)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1, height: 42, borderRadius: 8,
                      background: 'var(--primary)', border: 'none',
                      color: '#FFF', fontWeight: 800, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. Booking Rules Modal */}
          {activeModal === 'rules' && (
            <div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 460, padding: 22, maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color="var(--primary)" />
                  <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>Auditorium Usage Rules</span>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} color="var(--text-muted)" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <div style={{ padding: '10px 12px', background: 'rgba(124,58,237,0.06)', borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 2 }}>1. Flexible Booking Windows</div>
                  Faculty can reserve slots anytime. In case of conflicting requests, the Principal / Admin team retains approval prerogative.
                </div>

                <div style={{ padding: '10px 12px', background: 'rgba(6,182,212,0.06)', borderRadius: 8, borderLeft: '3px solid #06B6D4' }}>
                  <div style={{ fontWeight: 800, color: '#0E7490', marginBottom: 2 }}>2. Seating &amp; Capacity</div>
                  The Main Kirti Auditorium accommodates up to <strong>350 attendees</strong>. Ensure event guest counts do not exceed safety codes.
                </div>

                <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.06)', borderRadius: 8, borderLeft: '3px solid #10B981' }}>
                  <div style={{ fontWeight: 800, color: '#047857', marginBottom: 2 }}>3. AV &amp; Projector Facilities</div>
                  Sound consoles, podium microphones, and HDMI projection are operated under technical team supervision (Ext. 104).
                </div>

                <div style={{ padding: '10px 12px', background: 'rgba(245,158,11,0.06)', borderRadius: 8, borderLeft: '3px solid #F59E0B' }}>
                  <div style={{ fontWeight: 800, color: '#B45309', marginBottom: 2 }}>4. Cleanliness &amp; Code of Conduct</div>
                  No food or unpackaged beverages are permitted inside the carpeted seating area. Keep aisles and emergency exits clear.
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="btn-primary"
                style={{ marginTop: 18, width: '100%' }}
              >
                Understood
              </button>
            </div>
          )}

          {/* 3. Help & Support Modal */}
          {activeModal === 'help' && (
            <div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 440, padding: 22 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HelpCircle size={18} color="#F59E0B" />
                  <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>Help &amp; Support Desk</span>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X size={18} color="var(--text-muted)" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Auditorium In-Charge</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>Prof. S. Kulkarni</div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginTop: 3 }}>+91 98200 12345 • Ext. 102</div>
                </div>

                <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>AV &amp; Technical Room</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>Sound &amp; Projection Tech Desk</div>
                  <div style={{ fontSize: 12, color: 'var(--secondary-dark)', fontWeight: 700, marginTop: 3 }}>Internal Intercom: Ext. 104</div>
                </div>

                <div style={{ padding: '12px 14px', background: 'var(--surface-subtle)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>IT Support &amp; Portal Inquiries</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>auditorium@kirticollege.edu.in</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Office: Room 14, Ground Floor, Admin Block</div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="btn-primary"
                style={{ marginTop: 18, width: '100%' }}
              >
                Close
              </button>
            </div>
          )}

          {/* 4. About App Modal */}
          {activeModal === 'about' && (
            <div
              className="modal-content"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 440, padding: 22, textAlign: 'center' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: '#FFF', border: '1px solid var(--border)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <img src="/Logo.png" alt="Kirti" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </div>

              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>KirtiAudit PWA</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Teacher Auditorium Management System</div>
              <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 11, fontWeight: 800, marginTop: 6 }}>
                Version 2.0.4 Production
              </div>

              <div style={{ marginTop: 16, textAlign: 'left', background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div>• <strong>Institution:</strong> Kirti M. Doongursee College of Arts, Science &amp; Commerce</div>
                <div>• <strong>Location:</strong> Kashinath Dhuru Road, Dadar (W), Mumbai 400028</div>
                <div>• <strong>PWA Capabilities:</strong> Installable, offline caching, instant slot booking &amp; attendance export</div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="btn-primary"
                style={{ marginTop: 18, width: '100%' }}
              >
                Got it
              </button>
            </div>
          )}

        </div>,
        document.body
      )}

    </div>
  );
}
