import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  ShieldCheck, 
  MessageSquare, 
  CheckCircle2, 
  Heart,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Compass
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Faculty',
    category: 'Auditorium Booking',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Swal.fire({
        icon: 'success',
        title: 'Inquiry Submitted!',
        text: 'Thank you for reaching out. The administration team will get back to you shortly.',
        confirmButtonColor: '#4F46E5'
      });
      setFormData({ name: '', email: '', role: 'Faculty', category: 'Auditorium Booking', message: '' });
    }, 800);
  };

  const faqs = [
    {
      q: 'How far in advance can a faculty member reserve an auditorium hall?',
      a: 'Bookings can be made for any future date up to 6 months in advance. The system automatically excludes past dates and past times on the current day.'
    },
    {
      q: 'What happens if a student is slightly outside the 100-meter GPS radius?',
      a: 'The student will see a notification indicating their distance (e.g. 115m). They simply need to step inside the auditorium building bounds for their GPS to log attendance as verified.'
    },
    {
      q: 'Do auditorium bookings require manual administrative approval?',
      a: 'No! Bookings created by faculty members are confirmed instantly and generated with digital PDF proof, eliminating approval delays.'
    },
    {
      q: 'How can faculty members export student attendance sheets?',
      a: 'Inside the Faculty Portal or Booking View, click the "📊 Export Excel / CSV Report" button to instantly download timestamped student records.'
    }
  ];

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#0F172A' }}>
      
      {/* ─── PUBLIC NAVBAR ─── */}
      <Navbar activePage="Contact" />

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
            💬 Campus Support & Inquiry Center
          </div>
          <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 16px' }}>
            Get in Touch with <br />
            <span style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Administration & Technical Support
            </span>
          </h1>
          <p style={{ fontSize: '1.08rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Have a question about auditorium hall bookings, technical GPS assistance, or campus events? Send us a message or visit our Dadar campus office.
          </p>
        </div>
      </section>

      {/* ─── MAIN CONTACT FORM & DETAILS GRID ─── */}
      <section style={{ padding: '20px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 36, alignItems: 'start' }}>
          
          {/* Left Column: Interactive Contact Form */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>Send an Inquiry</h3>
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>We typically respond within 24 hours</span>
              </div>
            </div>

            {/* Quick Topic Tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {['📅 Booking Availability', '📍 GPS Check-In', '🔐 Admin Access', '🏛️ Hall Facilities'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: tag.slice(2) })}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 750, color: '#475569', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Prof. Rajesh Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 750, color: '#475569', display: 'block', marginBottom: 6 }}>Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. rajesh.sharma@kirticollege.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 750, color: '#475569', display: 'block', marginBottom: 6 }}>Your Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="Faculty">Faculty Coordinator</option>
                    <option value="Student">Student</option>
                    <option value="Visitor">Guest Visitor</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 750, color: '#475569', display: 'block', marginBottom: 6 }}>Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none' }}
                  >
                    <option value="Auditorium Booking">Auditorium Booking</option>
                    <option value="GPS Attendance Issue">GPS Attendance Issue</option>
                    <option value="Venue Facilities">Venue Facilities</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 750, color: '#475569', display: 'block', marginBottom: 6 }}>Message / Inquiry Details</label>
                <textarea 
                  rows="4" 
                  required
                  placeholder="Describe your query or request..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #CBD5E1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)'
                }}
              >
                {submitting ? 'Submitting Inquiry...' : <>Send Inquiry <Send size={16} /></>}
              </button>
            </form>
          </div>

          {/* Right Column: Campus Details & Direct Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Address & Dadar Landmarks Card */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} />
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>Campus Address & Landmarks</h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: '0 0 14px' }}>
                Kirti M. Doongursee College of Arts, Science & Commerce,<br />
                Kashinath Dhuru Road, Off Veer Savarkar Marg,<br />
                Dadar (West), Mumbai - 400028, Maharashtra, India.
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '14px', background: '#F1F5F9', color: '#475569' }}>
                  🚉 Dadar Station (5 mins)
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '14px', background: '#F1F5F9', color: '#475569' }}>
                  🏖️ Near Shivaji Park
                </span>
              </div>
            </div>

            {/* Direct Phone & Email */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 750, color: '#64748B', textTransform: 'uppercase' }}>Phone Numbers</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 750, color: '#0F172A' }}>+91 22 2437 2427 / +91 22 2437 2428</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 750, color: '#64748B', textTransform: 'uppercase' }}>Email Address</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 750, color: '#0F172A' }}>support@kirticollege.edu.in</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 750, color: '#64748B', textTransform: 'uppercase' }}>Office Hours</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 750, color: '#0F172A' }}>Monday - Saturday (09:00 AM - 05:00 PM IST)</div>
                </div>
              </div>
            </div>

            {/* Developer Support Card */}
            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '24px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 800, color: '#4F46E5', marginBottom: 6 }}>
                <Heart size={14} style={{ color: '#F43F5E' }} /> Technical Developer Support
              </div>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: '0 0 12px' }}>
                System engineered & maintained by Tushal Jadhav. For system enhancements or portfolio inquiries, visit the link below.
              </p>
              <a 
                href="https://tushaljadhav-portfolio.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '0.86rem', fontWeight: 800, color: '#4F46E5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                tushaljadhav-portfolio.netlify.app →
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
