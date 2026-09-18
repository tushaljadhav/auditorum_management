import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import InteractiveCalendar from '../components/InteractiveCalendar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar, MapPin, ShieldCheck, Users, Clock, Bell, 
  BarChart3, HelpCircle, ArrowRight, Activity, Copy, Download, Mail, Phone, 
  Globe, Laptop, Award, Lock, ArrowUp
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F8FAFC', 
      fontFamily: "'DM Sans', sans-serif",
      color: '#0F172A',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* ─── ONE CONTINUOUS PREMIUM BACKGROUND CANVAS ─── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(rgba(108, 99, 255, 0.03) 1.5px, transparent 1.5px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Decorative Glows */}
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(108, 99, 255, 0.04) 0%, transparent 65%)',
        top: '-200px',
        left: 'calc(50% - 400px)',
        zIndex: 0,
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)',
        top: '600px',
        right: '-100px',
        zIndex: 0,
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      {/* ─── UNIFIED RESPONSIVE NAVBAR ─── */}
      <Navbar activePage="Home" />

      {/* ─── HERO SECTION ─── */}
      <section style={{ 
        position: 'relative', 
        zIndex: 1, 
        padding: '36px 24px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.05fr 0.95fr', 
          gap: 36,
          alignItems: 'center',
          width: '100%'
        }} className="hero-grid">
          
          {/* Left Hero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="hero-left">
            
            {/* Tag Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#F5F3FF',
              border: '1px solid #DDD6FE',
              width: 'fit-content'
            }}>
              <ShieldCheck size={13} style={{ color: '#6C63FF' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6C63FF', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Smart. Seamless. Secure.
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '3.4rem',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              Auditorium Booking & <br />
              <span style={{
                background: 'linear-gradient(135deg, #6C63FF 0%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                GPS Attendance
              </span> System
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#475569',
              margin: 0,
              maxWidth: '520px'
            }}>
              An all-in-one platform for real-time auditorium booking, hall management, and location-secured GPS attendance tracking.
            </p>

            {/* ─── 4 Stats Cards ─── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              marginTop: 12
            }} className="stats-row">
              {[
                { icon: Clock, count: '24/7', label: 'Booking Access', color: '#4F46E5', bg: '#EEF2FF' },
                { icon: MapPin, count: '100%', label: 'GPS Secured', color: '#4F46E5', bg: '#EEF2FF' },
                { icon: ShieldCheck, count: 'Secure', label: 'Data Protection', color: '#4F46E5', bg: '#EEF2FF' },
                { icon: Users, count: '5000+', label: 'Active Users', color: '#4F46E5', bg: '#EEF2FF' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '16px',
                  padding: '18px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.015)',
                  transition: 'all 0.2s ease',
                }}
                className="stat-card"
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = stat.color;
                  e.currentTarget.style.boxShadow = `0 10px 20px -8px rgba(108, 99, 255, 0.08)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.015)';
                }}
                >
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    background: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <stat.icon size={17} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{stat.count}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 550, marginTop: 4 }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Hero */}
          <div style={{ position: 'relative', padding: '16px' }} className="hero-right">
            
            {/* SVG Decorative Path */}
            <svg style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0
            }} viewBox="0 0 400 300" fill="none">
              <path d="M 40, 150 L 40, 50 A 20,20 0 0,1 60,30 L 260, 30" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="40" cy="150" r="4" fill="#3B82F6" />
              <circle cx="260" cy="30" r="4" fill="#3B82F6" />
            </svg>

            {/* Main Image Container */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 16px 36px -12px rgba(0,0,0,0.06)',
              position: 'relative',
              zIndex: 1,
            }}>
              <img 
                src="/college_building_hero.png" 
                alt="Kirti College Hero" 
                style={{ 
                  width: '100%', 
                  height: '480px', 
                  borderRadius: '14px',
                  display: 'block',
                  objectFit: 'cover'
                }} 
              />
            </div>

            {/* Floating: System Status */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '-16px',
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 20px -4px rgba(0,0,0,0.05)',
              zIndex: 2,
              animation: 'floatSlow 4s ease-in-out infinite'
            }} className="floating-status">
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#E8F5E9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity size={14} style={{ color: '#22C55E' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A' }}>System Status</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>All Systems Operational</div>
              </div>
            </div>

            {/* Floating: Location Secured */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '-12px',
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 20px -4px rgba(0,0,0,0.05)',
              zIndex: 2,
              animation: 'floatSlow2 4.5s ease-in-out infinite'
            }} className="floating-location">
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin size={14} style={{ color: '#4F46E5' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0F172A' }}>Live Location Secured</div>
                <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>Auditorium Zone</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── FEATURED SERVICES GRID (EXACTLY 2 PREMIUM CARDS ALIGNED WITH HERO) ─── */}
      <section id="features" style={{
        padding: '36px 24px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textCenter: 'center', marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            borderRadius: '20px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            fontSize: '0.75rem',
            fontWeight: 750,
            color: '#2563EB',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 8
          }}>
            🏢 Kirti College Services
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Featured Portals & Services
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: 6, margin: '6px auto 0', maxWidth: '580px' }}>
            Seamlessly reserve auditorium halls for college programs or verify student attendance using GPS geofencing.
          </p>
        </div>

        <div className="feature-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 28,
          maxWidth: '1150px',
          margin: '0 auto'
        }}>
          {/* Card 1: Faculty Booking Portal */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/booking')}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#6366F1';
              e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(99, 102, 241, 0.22)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
            }}
          >
            {/* Header Visual Box */}
            <div style={{
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
              padding: '28px',
              color: '#FFFFFF',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px',
              overflow: 'hidden'
            }}>
              {/* Background decorative SVG ring */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  letterSpacing: '0.03em'
                }}>
                  Faculty Access
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#4ADE80', fontWeight: 700 }}>
                  <span className="tailux-pulse-dot" /> Live Booking System
                </div>
              </div>

              <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
                <h3 className="text-white" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', opacity: 1, letterSpacing: '-0.01em' }}>
                  Faculty Booking Portal
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '0.83rem', color: '#C7D2FE', lineHeight: 1.45 }}>
                  Check auditorium availability, select halls, and submit booking requests.
                </p>
              </div>
            </div>

            {/* Body Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'space-between', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 12 }}>
                  Portal Features & Services
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Check Slot Availability', 'Reserve Venue Halls', 'Instant PDF Receipt', 'Track Reservation Status'].map(f => (
                    <span key={f} style={{
                      fontSize: '0.78rem',
                      fontWeight: 650,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#F5F3FF',
                      color: '#4338CA',
                      border: '1px solid #DDD6FE'
                    }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); navigate('/booking'); }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.01)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Access Booking Portal <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Card 2: Student Attendance */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/attendance')}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#6366F1';
              e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(99, 102, 241, 0.22)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.04)';
            }}
          >
            {/* Header Visual Box */}
            <div style={{
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
              padding: '28px',
              color: '#FFFFFF',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '140px',
              overflow: 'hidden'
            }}>
              {/* Background decorative SVG ring */}
              <div style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-20px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  letterSpacing: '0.03em'
                }}>
                  Student Gateway
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#4ADE80', fontWeight: 700 }}>
                  <span className="tailux-pulse-dot" /> GPS Geofence Active
                </div>
              </div>

              <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
                <h3 className="text-white" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', opacity: 1, letterSpacing: '-0.01em' }}>
                  Student Attendance
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '0.83rem', color: '#C7D2FE', lineHeight: 1.45 }}>
                  Verify and mark your attendance securely using your location details.
                </p>
              </div>
            </div>

            {/* Body Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'space-between', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 12 }}>
                  Gateway Features & Security
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['GPS Location Verification', 'Live Distance Radar', 'Instant Check-In', 'Verified Attendance Log'].map(f => (
                    <span key={f} style={{
                      fontSize: '0.78rem',
                      fontWeight: 650,
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#F5F3FF',
                      color: '#4338CA',
                      border: '1px solid #DDD6FE'
                    }}>
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); navigate('/attendance'); }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.01)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Mark Attendance Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── LIVE AUDITORIUM CALENDAR SHOWCASE ─── */}
      <section id="calendar" style={{
        padding: '0px 24px 48px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="calendar-card-container" style={{
          background: '#FFFFFF',
          border: '1px solid #EAEAEA',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)',
        }}>
          <div className="calendar-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: '1 1 auto' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={20} style={{ color: '#6C63FF' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                  Live Auditorium Schedule & Availability
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45 }}>
                  Select any date on the calendar to view scheduled events or book a venue slot.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/booking')}
              className="calendar-header-btn"
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
                color: '#6C63FF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              Open Booking Portal <ArrowRight size={14} />
            </button>
          </div>

          <InteractiveCalendar onSelectDate={(date) => navigate(`/booking?date=${date}`)} />
        </div>
      </section>

      {/* ─── FEATURE HIGHLIGHTS BAR (EXACT REPLICATION) ─── */}
      <section style={{
        padding: '0px 24px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #EAEAEA',
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.015)',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 16,
          alignItems: 'center'
        }} className="bottom-bar-grid">
          {[
            { icon: Clock, title: 'Real-time', desc: 'Hall Availability', color: '#6C63FF', bg: '#F5F3FF' },
            { icon: Lock, title: 'GPS Verified', desc: 'Attendance', color: '#6C63FF', bg: '#F5F3FF' },
            { icon: Bell, title: 'Instant', desc: 'Notifications', color: '#6C63FF', bg: '#F5F3FF' },
            { icon: BarChart3, title: 'Detailed', desc: 'Reports', color: '#3B82F6', bg: '#EFF6FF' },
            { icon: ShieldCheck, title: 'Secure &', desc: 'Reliable', color: '#3B82F6', bg: '#EFF6FF' },
            { icon: HelpCircle, title: 'Need Help?', desc: 'Contact Support', color: '#6C63FF', bg: '#F5F3FF', isLink: true }
          ].map((item, i) => (
            <div 
              key={i} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: item.isLink ? 'pointer' : 'default',
                borderRight: i < 5 ? '1px solid #F1F5F9' : 'none',
                paddingRight: i < 5 ? '16px' : '0',
                boxSizing: 'border-box',
                height: '42px'
              }}
              className="bottom-pill-item"
              onClick={() => {
                if (item.isLink) {
                  Swal.fire({
                    title: 'Student/Faculty Support',
                    text: 'For portal queries, contact college IT desk at support@kirticollege.edu.in',
                    icon: 'info',
                    confirmButtonColor: '#6C63FF'
                  });
                }
              }}
            >
              {/* Icon Container with very light background */}
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              
              {/* Label Stack */}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.25' }}>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  color: '#475569',
                  whiteSpace: 'nowrap'
                }}>
                  {item.title}
                </span>
                <span style={{ 
                  fontSize: '0.78rem', 
                  fontWeight: 650, 
                  color: item.isLink ? '#6C63FF' : '#64748B',
                  whiteSpace: 'nowrap'
                }}>
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ─── FOOTER ─── */}
      <Footer />

      {/* Responsive Inline CSS rules for perfect scaling */}
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes floatSlow2 {
          0% { transform: translateY(0px); }
          50% { transform: translateY(5px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        /* Micro-animations */
        .cta-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(108, 99, 255, 0.3) !important;
        }
        .cta-btn:active {
          transform: scale(0.98);
        }
        .cta-btn svg {
          transition: transform 0.2s ease;
        }
        .cta-btn:hover svg {
          transform: translateX(4px);
        }
        .feature-pill:hover {
          transform: translateY(-8px);
          border-color: #6C63FF !important;
          box-shadow: 0 16px 32px -10px rgba(108, 99, 255, 0.12) !important;
        }
        .feature-pill:hover .pill-icon {
          transform: scale(1.05) rotate(5deg);
        }
        .pill-icon {
          transition: transform 0.25s ease;
        }

        /* Responsive Layout Rules */
        @media (max-width: 991px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-left {
            align-items: center;
            text-align: center;
          }
          .hero-left p {
            margin: 0 auto !important;
          }
          .stats-row {
            grid-template-columns: repeat(2, 1fr) !important;
            width: 100%;
          }
          .nav-links {
            display: none !important;
          }
          .hamburger-btn {
            display: block !important;
          }
          .nav-actions {
            display: none !important;
          }
          .feature-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .portal-card {
            grid-template-columns: 1fr !important;
            text-align: center;
            justify-items: center;
            height: auto !important;
            padding: 30px !important;
            gap: 24px !important;
          }
          .illustration-container {
            width: 100%;
            height: 160px !important;
          }
          .floating-status {
            left: 10px !important;
            top: 10px !important;
          }
          .floating-location {
            right: 10px !important;
            bottom: 10px !important;
          }
          .bottom-bar-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .footer-top {
            flex-direction: column;
            gap: 24px !important;
          }
        }

        @media (max-width: 576px) {
          .hero-left h1 {
            font-size: 2.2rem !important;
          }
          .bottom-bar-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
