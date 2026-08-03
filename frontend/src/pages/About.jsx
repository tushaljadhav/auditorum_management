import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Building2, 
  Award, 
  Users, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Heart,
  Target,
  Zap,
  Globe
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();
  const [selectedHallCategory, setSelectedHallCategory] = useState('All');

  const hallVenues = [
    {
      id: 'v1',
      name: 'Main Auditorium Hall',
      category: 'Large',
      capacity: '800 Pax Capacity',
      tag: 'Premier Venue',
      tagBg: '#EEF2FF',
      tagColor: '#4F46E5',
      image: '/college_building_hero.png',
      features: ['Acoustic Soundproofing', '4K Digital Projector', 'Green Room & Backstage', 'VIP Seating Area', 'Dolby Surround Sound']
    },
    {
      id: 'v2',
      name: 'Mini Seminar Hall A',
      category: 'Medium',
      capacity: '250 Pax Capacity',
      tag: 'Academic Seminars',
      tagBg: '#EEF2FF',
      tagColor: '#4F46E5',
      image: '/college_building_hero.png',
      features: ['Central Air Conditioning', 'Interactive Smart Board', 'Podium Mic System', 'High-Speed Wi-Fi', 'Tiered Seating']
    },
    {
      id: 'v3',
      name: 'AV Media Conference Room',
      category: 'Small',
      capacity: '150 Pax Capacity',
      tag: 'Workshops & AV',
      tagBg: '#EEF2FF',
      tagColor: '#4F46E5',
      image: '/college_building_hero.png',
      features: ['Hybrid Video Calling', 'Surround Sound Audio', 'Flexible Seating Layout', 'Executive Board Table', 'Live Streaming Mic']
    }
  ];

  const filteredHalls = selectedHallCategory === 'All' 
    ? hallVenues 
    : hallVenues.filter(h => h.category === selectedHallCategory);

  const milestones = [
    { year: '1954', title: 'Campus Establishment', desc: 'Founded under Deccan Education Society in Dadar (West), Mumbai.' },
    { year: '1980', title: 'Infrastructure Expansion', desc: 'Constructed Main Auditorium & AV Seminar wings.' },
    { year: '2010', title: 'NAAC A Grade Accreditation', desc: 'Re-accredited with A Grade by NAAC, University of Mumbai.' },
    { year: '2026', title: 'Digital Booking & GPS Platform', desc: 'Custom smart booking engine & 100m GPS geofencing attendance launched.' }
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      
      {/* ─── PUBLIC NAVBAR ─── */}
      <Navbar activePage="About" />

      {/* ─── HERO BANNER ─── */}
      <section style={{ padding: '60px 24px 40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
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
            🏛️ Institutional Legacy & Digital Innovation
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px' }}>
            About Kirti College & Our <br />
            <span style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Next-Gen Campus Platform
            </span>
          </h1>
          <p style={{ fontSize: '1.08rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Kirti M. Doongursee College of Arts, Science & Commerce is a landmark educational hub in Mumbai. Our digital platform empowers faculty to instantly reserve auditorium venues and verifies student attendance with location-secured GPS geofencing.
          </p>
        </div>

        {/* ─── 4 FLOATING METRICS ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: 16, marginTop: 40 }}>
          {[
            { count: '800+', label: 'Main Hall Seats', color: '#4F46E5', bg: '#EEF2FF' },
            { count: '100%', label: 'Digital Booking', color: '#4F46E5', bg: '#EEF2FF' },
            { count: '100m', label: 'GPS Geofence', color: '#4F46E5', bg: '#EEF2FF' },
            { count: '5000+', label: 'Active Campus Users', color: '#4F46E5', bg: '#EEF2FF' }
          ].map((m, i) => (
            <div key={i} style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              padding: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.count}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginTop: 6 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MAIN BUILDING SHOWCASE & VISION ─── */}
      <section style={{ padding: '20px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 36,
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '28px',
          padding: '40px',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.04)'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              🌟 Institutional Heritage & Modern Vision
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Pioneering Academic Excellence & Digital Governance
            </h2>
            <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.65, marginBottom: 24 }}>
              Situated in Dadar (West), Mumbai, Kirti College provides world-class infrastructure for academic seminars, cultural festivals, guest lectures, and departmental symposiums.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { title: '800+ Capacity Main Auditorium', desc: 'Acoustic paneling, 4K digital projection, and theatrical stage lighting.' },
                { title: 'Instant Conflict-Free Booking Engine', desc: 'Automatic schedule validation eliminates double bookings and manual paperwork.' },
                { title: 'GPS Geofence Attendance Security', desc: 'Restricts attendance verification strictly within 100 meters of auditorium coordinates.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.94rem', fontWeight: 750, color: '#0F172A', display: 'block' }}>{item.title}</span>
                    <span style={{ fontSize: '0.83rem', color: '#64748B' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              boxShadow: '0 16px 36px -10px rgba(0,0,0,0.08)'
            }}>
              <img 
                src="/college_building_hero.png" 
                alt="Kirti College Campus" 
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }} 
              />
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-18px',
              left: '20px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '18px',
              padding: '14px 20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>A Grade NAAC Re-Accredited</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>University of Mumbai</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE HALL FACILITIES EXPLORER ─── */}
      <section style={{ padding: '0px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>
              🏛️ Campus Venue Explorer
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Available Auditorium Halls & Specs
            </h2>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, background: '#FFFFFF', padding: '4px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
            {['All', 'Large', 'Medium', 'Small'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedHallCategory(cat)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: selectedHallCategory === cat ? '#4F46E5' : 'transparent',
                  color: selectedHallCategory === cat ? '#FFFFFF' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat === 'All' ? 'All Venues' : `${cat} Capacity`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 24 }}>
          {filteredHalls.map((v) => (
            <div key={v.id} style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', background: v.tagBg, color: v.tagColor }}>
                    {v.tag}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B' }}>{v.capacity}</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>{v.name}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {v.features.map((f, i) => (
                    <div key={i} style={{ fontSize: '0.83rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#4F46E5', fontWeight: 800 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate(`/booking?venue=${v.id}`)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.88rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.2)'
                }}
              >
                Check {v.name.split(' ')[0]} Slots <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CAMPUS MILESTONES TIMELINE ─── */}
      <section style={{ padding: '0px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
            📜 Campus Milestones
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            History & Technological Evolution
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 20 }}>
          {milestones.map((m, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: '#4F46E5',
                marginBottom: 8
              }}>
                {m.year}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                {m.title}
              </h4>
              <p style={{ fontSize: '0.83rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DEVELOPER BIO & SYSTEM CREDIT ─── */}
      <section style={{ padding: '0px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          borderRadius: '28px',
          padding: '40px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 24,
          boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.25)'
        }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 750, marginBottom: 12 }}>
              <Heart size={13} style={{ color: '#F43F5E' }} /> Developer Attribution
            </div>
            <h3 
              className="text-white"
              style={{ 
                fontSize: '1.8rem', 
                fontWeight: 800, 
                margin: '0 0 10px', 
                color: '#FFFFFF', 
                WebkitTextFillColor: '#FFFFFF' 
              }}
            >
              Crafted with Precision by Tushal Jadhav
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#C7D2FE', lineHeight: 1.6, margin: 0 }}>
              This state-of-the-art auditorium booking and GPS attendance system was custom architected and developed for Kirti M. Doongursee College to digitize campus event management.
            </p>
          </div>

          <a 
            href="https://tushaljadhav-portfolio.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              padding: '14px 24px',
              borderRadius: '14px',
              background: '#FFFFFF',
              color: '#4338CA',
              fontSize: '0.92rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            Visit Developer Portfolio <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
