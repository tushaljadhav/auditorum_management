import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Zap, 
  MapPin, 
  Calendar, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  XCircle,
  Sliders,
  Sparkles,
  Bell,
  BarChart3,
  Search,
  Lock
} from 'lucide-react';

export default function Features() {
  const navigate = useNavigate();
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const featureList = [
    {
      icon: Zap,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: 'Instant Conflict-Free Booking',
      subtitle: 'Zero Approval Delays',
      desc: 'Bookings are verified instantly against real-time venue schedules. Conflict checks run automatically, blocking double bookings and past dates with zero manual intervention.',
      demoTitle: 'Real-Time Availability Engine',
      demoContent: 'Selected Slot: 10:00 AM - 11:00 AM | Status: Available | Conflict Check: Passed (0 Overlaps)'
    },
    {
      icon: MapPin,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: 'GPS Geofence Attendance',
      subtitle: 'Location-Secured Verification',
      desc: 'Students verify attendance strictly within a 100-meter radius of auditorium coordinates. Includes live distance radar, coordinates calculation, and instant check-in confirmation.',
      demoTitle: 'GPS Geofence Radar Live Status',
      demoContent: 'Student Distance: 18 meters from Venue | Geofence Boundary: 100m | Status: Inside Allowed Zone (Verified)'
    },
    {
      icon: Lock,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: 'Interactive Day Calendar',
      subtitle: 'Live Visual Schedule',
      desc: 'Browse hall availability day-by-day with an interactive calendar drawer. Filter core operational hours or click any open time slot to auto-fill event booking forms.',
      demoTitle: 'Live Day Schedule Drawer',
      demoContent: 'Date: 2026-07-18 | Occupied Slots: 2 | Available Slots: 11 | Extended Bounds: 08:00 AM to 11:00 PM'
    },
    {
      icon: FileSpreadsheet,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: 'Excel CSV Attendance Reports',
      subtitle: 'Single-Click Export',
      desc: 'Faculty members can download structured CSV and Excel reports containing student roll numbers, full names, class streams, exact distances, and timestamped check-ins.',
      demoTitle: 'Export Report Generator',
      demoContent: 'Report Generated: Attendance_CyberSecurity_2026-07-18.csv | Total Records: 84 Students | Verified: 100%'
    },
    {
      icon: FileText,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: 'Instant PDF Receipt Generator',
      subtitle: 'Official Booking Proof',
      desc: 'Generates an official PDF receipt immediately upon reservation with digital reference ID, department info, faculty details, and auditorium hall assignments.',
      demoTitle: 'Digital Proof Receipt',
      demoContent: 'PDF Receipt ID: e6934f8b-4cff-4875-a5d2 | Status: Confirmed & Approved | Download Ready'
    },
    {
      icon: ShieldCheck,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: 'Role-Based Admin Control',
      subtitle: 'Complete Control Panel',
      desc: 'Admin portal equipped with department management, faculty directory, auditorium venue customization, booking overrides, and system audit logs.',
      demoTitle: 'Admin Oversight Panel',
      demoContent: 'Active Venues: 3 | Total Departments: 8 | Registered Faculty: 154 | System Status: Operational'
    },
    {
      icon: Bell,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: 'Instant Session Alerts',
      subtitle: 'Broadcast Notifications',
      desc: 'Broadcast live session notifications to students with remaining time countdowns and direct check-in buttons.',
      demoTitle: 'Live Session Broadcast',
      demoContent: 'Alert: Cyber Security Seminar Session Started! Duration: 15 Minutes. Check-in active on campus.'
    },
    {
      icon: BarChart3,
      color: '#4F46E5',
      bg: '#EEF2FF',
      title: 'Department Analytics Hub',
      subtitle: 'Real-Time Stats',
      desc: 'Visual graphs tracking monthly hall utilization, department booking metrics, and student attendance percentages.',
      demoTitle: 'Analytics Digest',
      demoContent: 'Monthly Utilization: 86% Hall Efficiency | Top Department: Computer Science (42 Events)'
    }
  ];

  const comparisonRows = [
    { feature: 'Reservation Speed', paper: '2-3 Days Manual Paper Approval', digital: 'Instant (10 Seconds Digital Approval)' },
    { feature: 'Double Booking Conflict Check', paper: 'High Error Risk / Manual Register', digital: '100% Conflict-Free Automated Engine' },
    { feature: 'Student Attendance Verification', paper: 'Paper Sign-in Sheet (Proxy Abuse)', digital: 'GPS Geofence Secured (100m Radius Guard)' },
    { feature: 'Report Generation', paper: 'Hours of Manual Data Entry', digital: '1-Click Excel CSV Export' },
    { feature: 'Booking Proof Receipt', paper: 'Handwritten Paper Slip', digital: 'Instant PDF Digital Receipt Generator' }
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      
      {/* ─── PUBLIC NAVBAR ─── */}
      <Navbar activePage="Features" />

      {/* ─── HERO HEADER ─── */}
      <section style={{ padding: '60px 24px 40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            borderRadius: '20px',
            background: '#EEF2FF',
            border: '1px solid #C7D2FE',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#4F46E5',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 14
          }}>
            ⚡ Next-Gen Platform Capabilities
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px' }}>
            System Features & <br />
            <span style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Advanced Architecture
            </span>
          </h1>
          <p style={{ fontSize: '1.08rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Discover the complete suite of tools engineered to make hall reservations instant, attendance transparent, and campus scheduling conflict-free.
          </p>
        </div>
      </section>

      {/* ─── 8 FEATURE CARDS GRID ─── */}
      <section style={{ padding: '20px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 20 }}>
          {featureList.map((f, idx) => {
            const Icon = f.icon || Zap;
            const isSelected = activeFeatureIndex === idx;
            return (
              <div 
                key={idx}
                onClick={() => setActiveFeatureIndex(idx)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? `2px solid ${f.color}` : '1px solid #E2E8F0',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: isSelected ? `0 12px 30px -5px ${f.color}25` : '0 4px 16px rgba(15, 23, 42, 0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '12px', background: f.bg, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0' }}>
                      {f.subtitle}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', lineHeight: 1.3 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>

                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 750, color: f.color }}>
                  <span>Interactive Test</span>
                  <span>{isSelected ? '● Active' : 'Tap →'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── FEATURE COMPARISON MATRIX ─── */}
      <section style={{ padding: '0px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
            📊 Platform Comparison
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Traditional Paper vs Kirti Smart Platform
          </h2>
        </div>

        {/* Desktop Table View */}
        <div className="desktop-comparison-table" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Feature Capability</th>
                <th style={{ padding: '16px 24px', fontSize: '0.88rem', fontWeight: 800, color: '#EF4444' }}>Traditional Paper Method</th>
                <th style={{ padding: '16px 24px', fontSize: '0.88rem', fontWeight: 800, color: '#10B981' }}>Kirti Smart Platform</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx < comparisonRows.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                  <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 750, color: '#0F172A' }}>{row.feature}</td>
                  <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <XCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} /> {row.paper}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.88rem', fontWeight: 750, color: '#059669', background: '#F0FDF4' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} /> {row.digital}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="mobile-comparison-cards">
          {comparisonRows.map((row, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
                📌 {row.feature}
              </div>

              {/* Traditional Paper Box */}
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <XCircle size={18} style={{ color: '#EF4444', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#DC2626', letterSpacing: '0.04em' }}>
                    Traditional Paper Method
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: 2, fontWeight: 500 }}>
                    {row.paper}
                  </div>
                </div>
              </div>

              {/* Kirti Smart Platform Box */}
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <CheckCircle2 size={18} style={{ color: '#10B981', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.04em' }}>
                    Kirti Smart Platform
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#065F46', marginTop: 2, fontWeight: 750 }}>
                    {row.digital}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
