import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  MapPin, Calendar, Users, Radio, ArrowRight,
  Building2, BookOpen, ChevronRight, Zap,
  TrendingUp, Clock, Sparkles, Activity
} from 'lucide-react';

export default function Home({ onNavigate, onSelectSession, currentUser, onOpenAuth }) {
  const [sessions, setSessions] = useState([]);
  const [venues,   setVenues]   = useState([]);
  const [stats,    setStats]    = useState({ bookings: 0, venues: 0, openSessions: 0 });
  const [loading,  setLoading]  = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];
  const dateFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.getTodaySessions(todayStr).catch(() => ({ sessions: [] })),
      api.getVenues().catch(() => []),
      api.getBookings().catch(() => []),
    ]).then(([sessData, venData, bookData]) => {
      if (!mounted) return;
      const allSessions = sessData.sessions || [];
      setSessions(allSessions);
      setVenues(venData || []);
      setStats({
        bookings:     (bookData || []).length,
        venues:       (venData  || []).length,
        openSessions: allSessions.filter(s => s.attendanceStatus === 'OPEN').length,
      });
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [todayStr]);

  const openSessions = sessions.filter(s => s.attendanceStatus === 'OPEN');

  const quickActions = [
    {
      id: 'booking',
      icon: Calendar,
      gradient: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
      glow: 'rgba(124,58,237,0.25)',
      label: 'Book a Hall',
      desc: 'Reserve auditorium',
      tag: 'Faculty',
      tagBg: 'rgba(124,58,237,0.12)',
      tagColor: '#7C3AED',
    },
    {
      id: 'faculty',
      icon: Radio,
      gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
      glow: 'rgba(6,182,212,0.25)',
      label: 'Faculty Live',
      desc: 'GPS attendance',
      tag: openSessions.length > 0 ? `${openSessions.length} Live` : 'Broadcast',
      tagBg: openSessions.length > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.12)',
      tagColor: openSessions.length > 0 ? '#059669' : '#0891B2',
    },
    {
      id: 'activity',
      icon: BookOpen,
      gradient: 'linear-gradient(135deg, #10B981, #059669)',
      glow: 'rgba(16,185,129,0.25)',
      label: 'My History',
      desc: 'Past events',
      tag: 'Records',
      tagBg: 'rgba(16,185,129,0.12)',
      tagColor: '#059669',
    },
    {
      id: 'booking', target: 'booking',
      icon: Building2,
      gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
      glow: 'rgba(245,158,11,0.25)',
      label: 'Venues',
      desc: `${venues.length || 6} campus halls`,
      tag: 'Explore',
      tagBg: 'rgba(245,158,11,0.12)',
      tagColor: '#D97706',
    },
  ];

  return (
    <div className="page-container animate-fade-in">

      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(145deg, #1E1039 0%, #2D1B69 45%, #312E81 100%)',
        borderRadius: 'var(--r-2xl)',
        padding: '24px 20px 22px',
        marginBottom: 20,
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(30,16,57,0.40)',
      }}>
        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: -60, right: -50,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)',
          filter: 'blur(30px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -30,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)',
          filter: 'blur(25px)', pointerEvents: 'none',
        }} />

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(196,181,253,0.9)', letterSpacing: 0.2 }}>
            📅 {dateFormatted}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(16,185,129,0.18)',
            border: '1px solid rgba(16,185,129,0.35)',
            color: '#6EE7B7', padding: '3px 10px',
            borderRadius: 'var(--r-full)',
            fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#10B981', display: 'inline-block',
            }} className="pulse-radar" />
            System Live
          </span>
        </div>

        {/* Greeting */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 13, color: 'rgba(196,181,253,0.85)', fontWeight: 600, marginBottom: 6 }}>
            {getGreeting()}{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''} 👋
          </div>
          <h1 style={{
            fontSize: 24, fontWeight: 900, color: '#FFFFFF',
            letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 8,
          }}>
            Kirti Auditorium
            <br />
            <span style={{
              fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px',
              background: 'linear-gradient(90deg, #A78BFA, #38BDF8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Booking &amp; GPS Attendance
            </span>
          </h1>
          <p style={{ fontSize: 12, color: 'rgba(196,181,253,0.75)', lineHeight: 1.55, maxWidth: 270 }}>
            Reserve halls, track live attendance &amp; manage campus events — all in one place.
          </p>
        </div>

        {/* Stat chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, position: 'relative', zIndex: 1 }}>
          {[
            { v: loading ? '—' : stats.bookings,     l: 'Bookings', icon: '📅' },
            { v: loading ? '—' : stats.venues,       l: 'Venues',   icon: '🏛️' },
            { v: loading ? '—' : stats.openSessions, l: 'Live Now',  icon: '📡', highlight: stats.openSessions > 0 },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '9px 10px',
              background: s.highlight ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.09)',
              border: `1px solid ${s.highlight ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 12,
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: 9, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.highlight ? '#6EE7B7' : '#FFFFFF', lineHeight: 1 }}>
                {s.v}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, color: s.highlight ? '#6EE7B7' : 'rgba(196,181,253,0.7)', marginTop: 2, letterSpacing: 0.2 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Sessions ── */}
      {!loading && openSessions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="section-eyebrow" style={{ margin: 0 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#10B981', display: 'inline-block',
              }} className="pulse-radar" />
              Live Sessions Now
            </div>
            <button
              onClick={() => onNavigate('faculty')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {openSessions.slice(0, 3).map(sess => (
              <div
                key={sess.id}
                onClick={() => onSelectSession(sess)}
                className="card"
                style={{
                  padding: '12px 14px',
                  background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)',
                  border: '1px solid #A7F3D0',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(16,185,129,0.3)',
                  }}>
                    <Radio size={16} color="#FFFFFF" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#065F46' }} className="truncate">
                      {sess.eventName}
                    </div>
                    <div style={{ fontSize: 11, color: '#059669', marginTop: 1 }}>
                      {sess.facultyName} • {sess.venueName || 'Campus Hall'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className="badge badge-emerald" style={{ fontSize: 10 }}>
                      <span className="status-dot status-dot-green pulse-radar" />
                      LIVE
                    </span>
                    <ChevronRight size={14} color="#059669" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-eyebrow" style={{ marginBottom: 10 }}>
          <Sparkles size={11} /> Quick Actions
        </div>
        <div className="quick-action-grid">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                className="quick-action-btn"
                onClick={() => onNavigate(action.target || action.id)}
              >
                {/* Top row: Icon + tag */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: action.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 6px 14px ${action.glow}`,
                  }}>
                    <Icon size={18} color="#FFFFFF" />
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '3px 8px',
                    borderRadius: 'var(--r-full)',
                    background: action.tagBg, color: action.tagColor,
                    letterSpacing: 0.3,
                  }}>
                    {action.tag}
                  </span>
                </div>

                {/* Bottom: Label + desc */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {action.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Available Venues ── */}
      {venues.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="section-eyebrow" style={{ margin: 0 }}>
              <Building2 size={11} /> Venues &amp; Halls
            </div>
            <button
              onClick={() => onNavigate('booking')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              Book <ArrowRight size={12} />
            </button>
          </div>
          <div className="hscroll">
            {venues.slice(0, 6).map(v => (
              <div
                key={v.id}
                onClick={() => onNavigate('booking')}
                style={{
                  width: 156, padding: '14px',
                  background: v.status === 'Maintenance' ? '#FFFBEB' : '#FFFFFF',
                  border: `1.5px solid ${v.status === 'Maintenance' ? '#FDE68A' : 'var(--border)'}`,
                  borderRadius: 'var(--r-lg)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: 11, marginBottom: 10,
                  background: v.status === 'Maintenance'
                    ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                    : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: v.status === 'Maintenance'
                    ? '0 4px 10px rgba(245,158,11,0.3)'
                    : '0 4px 10px rgba(124,58,237,0.3)',
                }}>
                  <span style={{ fontSize: 18 }}>
                    {v.status === 'Maintenance' ? '🔧' : '🏛️'}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 5 }} className="truncate">
                  {v.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <Users size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{v.capacity} seats</span>
                </div>
                <span className={`badge ${v.status === 'Maintenance' ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: 10 }}>
                  {v.status === 'Maintenance' ? '🔧 Maint.' : '● Available'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Not logged in — auth prompt ── */}
      {!currentUser && (
        <div style={{
          marginTop: 20, padding: '16px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.06))',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--r-lg)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 6px 14px rgba(124,58,237,0.28)',
          }}>
            <Zap size={18} color="#FFFFFF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-dark)', marginBottom: 2 }}>
              Sign in for personalized access
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Faculty bookings, live attendance &amp; admin tools
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="btn-ghost"
            style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Sign In <ArrowRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
