import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  CalendarCheck, 
  PlayCircle, 
  MapPin, 
  FileSpreadsheet, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Sliders,
  Smartphone,
  User,
  GraduationCap
} from 'lucide-react';

export default function HowItWorks() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Faculty'); // 'Faculty' or 'Student'
  const [selectedStep, setSelectedStep] = useState(1);
  const [simulatedDistance, setSimulatedDistance] = useState(18); // meters

  const facultySteps = [
    {
      step: 1,
      emoji: '🎈',
      title: 'Step 1: Pick Your Hall & Date!',
      shortTitle: '1. Reserve Hall',
      tag: 'Faculty Step 1',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      simpleText: 'Faculty chooses a hall (Main Auditorium, Seminar Hall, or AV Room) and picks an open time slot. The system checks availability instantly and gives you an official PDF receipt proof right away!',
      bullets: [
        'Select Date & Choose Hall (Main Auditorium / Seminar Hall A / AV Room)',
        'Click an Open Time Slot (8 AM to 11 PM)',
        'Fill Event Title & Faculty Name',
        'Download your Instant PDF Receipt Proof!'
      ],
      previewTitle: '📄 Step 1 Live Output: PDF Receipt Generated',
      previewCode: 'CONFIRMED: Main Auditorium Reserved for "Cyber Security Seminar" on 2026-07-18 (10:00 AM - 11:00 AM). Receipt #e6934f8b downloaded.'
    },
    {
      step: 2,
      emoji: '⏱️',
      title: 'Step 2: Start the Attendance Timer!',
      shortTitle: '2. Start Timer',
      tag: 'Faculty Step 2',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      simpleText: 'When event time arrives, the faculty coordinator clicks ONE big button to open the live GPS attendance window (e.g. 15 minutes). A live countdown timer starts ticking on screen!',
      bullets: [
        'Faculty opens Booking Status or Faculty Portal',
        'Pick Session Duration (15 minutes recommended)',
        'Click "🚀 Start Attendance Session"',
        'Live countdown timer shows remaining time to students'
      ],
      previewTitle: '⏱️ Step 2 Live Output: GPS Window Open',
      previewCode: 'LIVE SESSION: Attendance is OPEN for 15 minutes. GPS Geofence Armed (100m Radius). Live Timer: 14:59 remaining.'
    },
    {
      step: 3,
      emoji: '📍',
      title: 'Step 3: Students Tap & Check In!',
      shortTitle: '3. GPS Verification',
      tag: 'Faculty Step 3',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      simpleText: 'Students open the Attendance page on their phones, type the Booking ID, and tap Check-In. The smart GPS checks if they are inside the hall (within 100m) and marks them PRESENT!',
      bullets: [
        'Open Student Attendance Page on Mobile (/attendance)',
        'Enter Booking ID provided by Faculty',
        'Device GPS measures exact distance from Auditorium',
        'Checked-In! Distance < 100m = Verified Attendance Logged!'
      ],
      previewTitle: '📍 Step 3 Live Output: Student GPS Check-In',
      previewCode: 'STUDENT CHECK-IN: Roll #CS2024 (Rahul Varma) | Distance: 14 meters from Auditorium | Status: VERIFIED PRESENT 🟢'
    },
    {
      step: 4,
      emoji: '📊',
      title: 'Step 4: Download Excel Roster!',
      shortTitle: '4. Download Excel',
      tag: 'Faculty Step 4',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      simpleText: 'After the event, the faculty clicks ONE button to download the full attendance sheet in Excel format. It includes student names, roll numbers, streams, and exact check-in times!',
      bullets: [
        'View real-time list of all checked-in students',
        'Click "📊 Download Excel / CSV Report"',
        'Excel file downloads instantly with complete student logs',
        'Saved permanently in college digital archives!'
      ],
      previewTitle: '📊 Step 4 Live Output: Excel Roster Download',
      previewCode: 'EXCEL DOWNLOADED: Attendance_CyberSecurity_2026-07-18.csv (84 Verified Students Logged with Timestamps).'
    }
  ];

  const studentSteps = [
    {
      step: 1,
      emoji: '📱',
      title: 'Step 1: Open Attendance & Enter ID',
      shortTitle: '1. Enter Event ID',
      tag: 'Student Step 1',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      simpleText: 'Go to the Student Attendance page (/attendance) on your mobile or laptop. Enter the Booking Reference ID announced by your professor in the hall.',
      bullets: [
        'Open Student Attendance Portal on phone',
        'Type event Booking ID (e.g., booking_1782654643059)',
        'Click "Find Event Session"',
        'Verify Event Title & Faculty Name on screen'
      ],
      previewTitle: '📱 Student Step 1 Live Output: Event Found',
      previewCode: 'EVENT SEARCH: Found "Cyber Security Seminar" | Faculty: Prof. Sharma | Status: GPS Window Open 🟢'
    },
    {
      step: 2,
      emoji: '📍',
      title: 'Step 2: Allow Location & Mark Present!',
      shortTitle: '2. GPS Check-In',
      tag: 'Student Step 2',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
      simpleText: 'Fill your Roll Number, Name, Class/Stream, and click "🟢 Submit Attendance". Your device GPS calculates your distance from the auditorium. If inside 100m, attendance is confirmed instantly!',
      bullets: [
        'Enter Roll Number, Full Name & Class',
        'Click "🟢 Submit GPS Attendance"',
        'Allow Location access on mobile popup',
        'Receive instant Verified Attendance Pass Ticket!'
      ],
      previewTitle: '📍 Student Step 2 Live Output: Verified Attendance Pass',
      previewCode: 'VERIFIED PRESENT: Student CS2024 Checked In | Location: 18m from Venue | Pass Generated #TICKET-992'
    }
  ];

  const activeSteps = selectedRole === 'Faculty' ? facultySteps : studentSteps;
  const currentStepData = activeSteps.find(s => s.step === selectedStep) || activeSteps[0];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      
      {/* ─── PUBLIC NAVBAR ─── */}
      <Navbar activePage="How It Works" />

      {/* ─── HERO HEADER (ROLE SWITCHER) ─── */}
      <section style={{ padding: '60px 24px 30px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            ✨ Interactive Role-Based Process Guide
          </div>
          <h1 style={{ fontSize: '3.1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px' }}>
            How It Works for <br />
            <span style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Faculty Members & Students
            </span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, margin: '0 0 28px' }}>
            Select your role below to explore the simple step-by-step workflow for booking auditorium halls or verifying GPS attendance.
          </p>

          {/* Role Switcher Pills */}
          <div style={{ display: 'inline-flex', background: '#FFFFFF', padding: '6px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
            <button
              onClick={() => { setSelectedRole('Faculty'); setSelectedStep(1); }}
              style={{
                padding: '10px 24px',
                borderRadius: '18px',
                border: 'none',
                background: selectedRole === 'Faculty' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'transparent',
                color: selectedRole === 'Faculty' ? '#FFFFFF' : '#475569',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
            >
              👩‍🏫 Faculty Booking View (4 Steps)
            </button>
            <button
              onClick={() => { setSelectedRole('Student'); setSelectedStep(1); }}
              style={{
                padding: '10px 24px',
                borderRadius: '18px',
                border: 'none',
                background: selectedRole === 'Student' ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' : 'transparent',
                color: selectedRole === 'Student' ? '#FFFFFF' : '#475569',
                fontSize: '0.9rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease'
              }}
            >
              🎓 Student Check-In View (2 Steps)
            </button>
          </div>
        </div>
      </section>

      {/* ─── COLORFUL STEP CARDS GRID ─── */}
      <section style={{ padding: '20px 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 18 }}>
          {activeSteps.map((stg) => {
            const isSelected = selectedStep === stg.step;
            return (
              <div
                key={stg.step}
                onClick={() => setSelectedStep(stg.step)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? `2px solid ${stg.color}` : '1px solid #E2E8F0',
                  borderRadius: '24px',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? `0 12px 30px -5px ${stg.color}25` : '0 4px 16px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '14px', background: stg.bg, border: `1px solid ${stg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                      {stg.emoji}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: stg.bg, color: stg.color }}>
                      {stg.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', lineHeight: 1.3 }}>
                    {stg.shortTitle}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                    {stg.simpleText.slice(0, 85)}...
                  </p>
                </div>

                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 750, color: stg.color }}>
                  <span>Step {stg.step} Breakdown</span>
                  <span>{isSelected ? '● Active' : 'Tap →'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── DETAILED FEATURED STEP CARD & LIVE PREVIEW ─── */}
      <section style={{ padding: '0px 24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.04)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 36,
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: '20px', background: currentStepData.bg, border: `1px solid ${currentStepData.border}`, fontSize: '0.78rem', fontWeight: 800, color: currentStepData.color, marginBottom: 14 }}>
              <span style={{ fontSize: '1.1rem' }}>{currentStepData.emoji}</span> {currentStepData.tag} • Process Guide
            </div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
              {currentStepData.title}
            </h2>
            <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
              {currentStepData.simpleText}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {currentStepData.bullets.map((bText, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: currentStepData.bg, color: currentStepData.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', flexShrink: 0 }}>
                    ✓
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 650 }}>
                    {bText}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate(selectedRole === 'Student' ? '/attendance' : '/booking')}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: currentStepData.gradient,
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 750,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: `0 6px 20px ${currentStepData.color}30`
              }}
            >
              {selectedRole === 'Student' ? 'Open Student Attendance Gateway' : 'Open Faculty Booking Portal'} <ArrowRight size={16} />
            </button>
          </div>

          {/* Live Simulated Display Box */}
          <div style={{
            background: '#0F172A',
            borderRadius: '24px',
            padding: '28px',
            color: '#FFFFFF',
            boxShadow: '0 16px 36px -10px rgba(15, 23, 42, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                Kirti System Console
              </span>
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: 750, color: '#38BDF8', letterSpacing: '0.03em' }}>
              {currentStepData.previewTitle}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '16px',
              fontSize: '0.83rem',
              fontFamily: 'monospace',
              color: '#A7F3D0',
              lineHeight: 1.6
            }}>
              {currentStepData.previewCode}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              ✨ Automatic, instant, & 100% verified for Kirti College
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE GPS DISTANCE RANGE SIMULATOR ─── */}
      <section style={{ padding: '0px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
                Interactive GPS Geofence Distance Simulator
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                Drag the slider below to simulate student distance from Kirti Auditorium (100-meter radius boundary rule).
              </p>
            </div>
          </div>

          <div className="gps-simulator-box" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', 
            gap: 24, 
            alignItems: 'center', 
            background: '#F8FAFC', 
            padding: '20px', 
            borderRadius: '20px', 
            border: '1px solid #E2E8F0' 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 750, color: '#475569' }}>Simulated Student Distance:</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: simulatedDistance <= 100 ? '#10B981' : '#EF4444' }}>{simulatedDistance} Meters</span>
              </div>
              
              <input 
                type="range" 
                min="5" 
                max="250" 
                value={simulatedDistance}
                onChange={(e) => setSimulatedDistance(Number(e.target.value))}
                style={{ width: '100%', accentColor: simulatedDistance <= 100 ? '#10B981' : '#EF4444', cursor: 'pointer' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, fontSize: '0.72rem', color: '#94A3B8', marginTop: 8 }}>
                <span>0m (Stage)</span>
                <span style={{ color: '#4F46E5', fontWeight: 750 }}>100m Radius Boundary</span>
                <span>250m (Off-Campus)</span>
              </div>
            </div>

            <div style={{
              background: simulatedDistance <= 100 ? '#ECFDF5' : '#FEF2F2',
              border: `1.5px solid ${simulatedDistance <= 100 ? '#A7F3D0' : '#FECACA'}`,
              borderRadius: '16px',
              padding: '18px 16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>
                {simulatedDistance <= 100 ? '🟢' : '🔴'}
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: simulatedDistance <= 100 ? '#047857' : '#DC2626', marginBottom: 4 }}>
                {simulatedDistance <= 100 ? 'INSIDE 100m GEOFENCE' : 'OUTSIDE ALLOWED RADIUS'}
              </div>
              <div style={{ fontSize: '0.8rem', color: simulatedDistance <= 100 ? '#065F46' : '#991B1B', fontWeight: 600, lineHeight: 1.45 }}>
                {simulatedDistance <= 100 
                  ? `Verified Present! Student is ${simulatedDistance}m from auditorium coordinates.` 
                  : `Access Denied! Student is ${simulatedDistance}m away (max limit 100m).`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
