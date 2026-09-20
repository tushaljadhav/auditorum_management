import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Smartphone, ShieldCheck, ArrowRight, CheckCircle2,
  Calendar, MapPin, Sparkles, ExternalLink, QrCode
} from 'lucide-react';

export default function BookingPortal() {
  const navigate = useNavigate();

  // URL of the User PWA
  const appUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : 'https://auditorium-faculty.vercel.app';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: "'DM Sans', sans-serif",
      color: '#0F172A',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navbar activePage="Booking" />

      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        position: 'relative'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          filter: 'blur(50px)'
        }} />

        <div style={{
          maxWidth: '680px',
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '28px',
          padding: '48px 40px',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
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
            marginBottom: 20
          }}>
            <Sparkles size={14} /> Official Notice • Mobile Booking Only
          </div>

          {/* Icon Crest */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 12px 28px rgba(79, 70, 229, 0.28)',
            color: '#FFFFFF'
          }}>
            <Smartphone size={42} />
          </div>

          <h1 style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: '0 0 14px',
            lineHeight: 1.2
          }}>
            Auditorium Booking Has Moved to the Official App
          </h1>

          <p style={{
            fontSize: '1.02rem',
            lineHeight: 1.6,
            color: '#475569',
            margin: '0 auto 28px',
            maxWidth: '520px'
          }}>
            To guarantee verified faculty authentication, real-time schedule conflict prevention, and location-verified session management, all hall bookings are now managed exclusively through the <strong>Kirti Auditorium Mobile App</strong>.
          </p>

          {/* Feature Highlights Card */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '18px',
            padding: '20px 24px',
            textAlign: 'left',
            marginBottom: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 600 }}>
                Instant real-time slot checking for Hall A, B, C & AV Rooms
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 600 }}>
                Lifetime seamless mobile login for approved faculty
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 600 }}>
                Dynamic GPS attendance PIN generation inside the venue
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 28px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                color: '#FFFFFF',
                fontSize: '0.98rem',
                fontWeight: 750,
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <Smartphone size={18} /> Open Mobile App <ExternalLink size={16} />
            </a>

            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 24px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back to Home
            </button>
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 28,
            fontSize: '0.8rem',
            color: '#94A3B8'
          }}>
            Original website booking portal has been backed up in <code>backup_archive/</code>.
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
