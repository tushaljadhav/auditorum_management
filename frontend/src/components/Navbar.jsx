import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Menu, X } from 'lucide-react';

export default function Navbar({ activePage = 'Home' }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Features', path: '/features' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0',
      padding: '12px 20px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo Section */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <img 
            src="/Logo.png" 
            alt="College Logo" 
            style={{ height: '38px', width: 'auto', objectFit: 'contain' }} 
          />
          <div>
            <span style={{ 
              fontSize: '1rem', 
              fontWeight: 800, 
              color: '#0F172A', 
              letterSpacing: '-0.02em',
              display: 'block',
              lineHeight: 1.15
            }}>
              Kirti M. Doongursee College
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Dadar (West), Mumbai</span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {navItems.map((item) => {
            const isActive = activePage === item.label;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '7px 15px',
                  borderRadius: '20px',
                  border: 'none',
                  background: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#4F46E5' : '#475569',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#4F46E5';
                    e.currentTarget.style.background = '#EEF2FF';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Admin Login Action */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin/login')}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#4F46E5',
              fontSize: '0.82rem',
              fontWeight: 750,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#4F46E5';
              e.currentTarget.style.background = '#F5F3FF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            <ShieldCheck size={15} /> Admin Login
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#0F172A',
            padding: '6px'
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
          zIndex: 999
        }}>
          {navItems.map((item) => {
            const isActive = activePage === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(item.path);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#EEF2FF' : '#F8FAFC',
                  color: isActive ? '#4F46E5' : '#0F172A',
                  fontWeight: isActive ? 800 : 650,
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{item.label}</span>
                {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F46E5' }} />}
              </button>
            );
          })}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/admin/login');
            }}
            style={{
              marginTop: 6,
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 750,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <ShieldCheck size={16} /> Admin Login
          </button>
        </div>
      )}
    </nav>
  );
}
