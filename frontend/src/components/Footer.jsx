import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(path);
  };

  return (
    <footer style={{
      padding: '64px 24px 40px',
      background: '#FFFFFF',
      borderTop: '1px solid #EAEAEA',
      position: 'relative',
      zIndex: 2
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 40
      }}>
        {/* Top segment */}
        <div className="footer-top" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 32
        }}>
          {/* Branding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/Logo.png" alt="Logo" style={{ height: '36px', width: 'auto' }} />
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
                Kirti College Portal
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
              Smart booking scheduler and verified GPS student attendance platform for Kirti M. Doongursee College.
            </p>
          </div>

          {/* Links and contacts */}
          <div className="footer-links-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 28, flex: 1, maxWidth: '500px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F172A' }}>Portals</span>
              {[
                { label: 'Home', path: '/' },
                { label: 'Faculty Booking', path: '/booking' },
                { label: 'Student Portal', path: '/attendance' },
                { label: 'Admin Login', path: '/admin/login' }
              ].map(item => (
                <span 
                  key={item.label} 
                  onClick={() => handleNavigate(item.path)}
                  style={{ fontSize: '0.82rem', color: '#64748B', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6C63FF'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F172A' }}>Explore Pages</span>
              {[
                { label: 'About College', path: '/about' },
                { label: 'System Features', path: '/features' },
                { label: 'How It Works', path: '/how-it-works' },
                { label: 'Contact Us', path: '/contact' }
              ].map(item => (
                <span 
                  key={item.label} 
                  onClick={() => handleNavigate(item.path)}
                  style={{ fontSize: '0.82rem', color: '#64748B', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6C63FF'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
                >
                  {item.label}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0F172A' }}>Contact & Info</span>
              <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Dadar West, Mumbai - 400028</span>
              <a href="mailto:support@kirticollege.edu.in" style={{ fontSize: '0.82rem', color: '#64748B', textDecoration: 'none' }}
                 onMouseEnter={e => e.currentTarget.style.color = '#6C63FF'}
                 onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
              >support@kirticollege.edu.in</a>
            </div>
          </div>
        </div>

        {/* Bottom segment */}
        <div className="footer-bottom" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          width: '100%',
          borderTop: '1px solid #F1F5F9',
          paddingTop: 24
        }}>
          
          {/* Centered/Left Credit Block in Two Clean Lines */}
          <div className="footer-credit" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            fontSize: '0.82rem',
            color: '#64748B',
            fontWeight: 500
          }}>
            <span>© {new Date().getFullYear()} Kirti M. Doongursee College. All rights reserved.</span>
            <span>Developed with ❤️ by <a href="https://tushaljadhav-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#6C63FF', textDecoration: 'none', fontWeight: 750 }}>Tushal Jadhav</a></span>
          </div>

          {/* Back to Top */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="back-to-top-btn"
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              color: '#64748B',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6C63FF'; e.currentTarget.style.color = '#6C63FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#64748B'; }}
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
