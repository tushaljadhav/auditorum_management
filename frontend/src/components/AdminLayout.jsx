import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  LayoutDashboard, Building2, Users, MapPin, CalendarDays,
  UserCheck, LogOut, Menu, X, ChevronDown, ChevronRight,
  Bell, Settings, Shield, Download, Upload, Database, RefreshCw
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'CORE MANAGEMENT',
    links: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Venues & Halls', path: '/admin/venues', icon: MapPin },
      { name: 'Bookings Log', path: '/admin/bookings', icon: CalendarDays },
    ]
  },
  {
    title: 'ORGANIZATION & USERS',
    links: [
      { name: 'Departments', path: '/admin/departments', icon: Building2 },
      { name: 'Faculty Profiles', path: '/admin/faculty', icon: Users },
      { name: 'Admin Users', path: '/admin/users', icon: UserCheck },
    ]
  }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedBackup, setParsedBackup] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const handleDownloadBackup = () => {
    window.location.href = '/api/admin/backup';
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Database Backup Downloaded!',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json && json.data) {
          setParsedBackup(json);
        } else {
          Swal.fire({ icon: 'error', title: 'Invalid Backup File', text: 'Uploaded file does not contain valid auditorium database structure.' });
          setSelectedFile(null);
          setParsedBackup(null);
        }
      } catch {
        Swal.fire({ icon: 'error', title: 'Invalid JSON', text: 'Could not parse JSON content from the uploaded file.' });
        setSelectedFile(null);
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!parsedBackup) return;
    const confirm = await Swal.fire({
      title: 'Restore Database?',
      html: `This will restore records from <strong>${parsedBackup.system || 'Backup'}</strong> (Backup Date: ${parsedBackup.backupDate?.split('T')[0] || 'Unknown'}). Proceeding will overwrite existing master data.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Restore System',
      confirmButtonColor: '#6366F1',
      cancelButtonColor: '#64748B',
      borderRadius: '16px'
    });

    if (!confirm.isConfirmed) return;

    setRestoring(true);
    try {
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupData: parsedBackup })
      });

      if (res.ok) {
        const data = await res.json();
        Swal.fire({
          icon: 'success',
          title: 'Database Restored Successfully!',
          text: `Restored ${data.details?.departmentsCount || 0} departments, ${data.details?.facultyCount || 0} faculty, ${data.details?.venuesCount || 0} venues, and ${data.details?.bookingsCount || 0} bookings.`,
          confirmButtonColor: '#2563EB'
        }).then(() => window.location.reload());
      } else {
        const err = await res.json();
        Swal.fire({ icon: 'error', title: 'Restore Failed', text: err.error || 'Server error during restore.' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to connect to server during restore.' });
    } finally {
      setRestoring(false);
      setRestoreModalOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth check
  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        if (!data.loggedIn) navigate('/admin/login');
        else setCurrentUser(data.user);
        setLoading(false);
      })
      .catch(() => { navigate('/admin/login'); setLoading(false); });
  }, [navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Sign out?',
      text: 'You will be returned to the login screen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sign out',
      cancelButtonText: 'Stay',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      borderRadius: '16px'
    }).then(async r => {
      if (r.isConfirmed) {
        await fetch('/api/auth/logout', { method: 'POST' });
        navigate('/admin/login');
      }
    });
  };

  const allLinks = NAV_SECTIONS.flatMap(s => s.links);
  const currentLink = allLinks.find(l => l.path === location.pathname);
  const currentPageName = currentLink?.name || 'Admin Portal';
  const CurrentIcon = currentLink?.icon || LayoutDashboard;

  const avatarInitial = currentUser?.name ? currentUser.name[0].toUpperCase() : 'A';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="premium-spinner" />
          <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ─────────────────── SIDEBAR ─────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 199 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        style={{
          width: isMobile ? '260px' : (sidebarOpen ? '260px' : '0'),
          minWidth: isMobile ? '260px' : (sidebarOpen ? '260px' : '0'),
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: isMobile ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          zIndex: 200,
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: '260px', display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Tailux Header Logo Block */}
          <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img src="/Logo.png" alt="Logo" style={{ height: 24, width: 'auto' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Auditorium Admin
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500, marginTop: 2 }}>
                Kirti College Portal
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {NAV_SECTIONS.map((section, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ 
                  fontSize: '0.68rem', 
                  fontWeight: 750, 
                  letterSpacing: '0.06em', 
                  textTransform: 'uppercase', 
                  color: '#94A3B8', 
                  padding: '4px 10px',
                  whiteSpace: 'nowrap' 
                }}>
                  {section.title}
                </div>

                {section.links.map(link => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => { if (isMobile) setSidebarOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#2563EB' : '#475569',
                        textDecoration: 'none',
                        background: isActive ? '#EFF6FF' : 'transparent',
                        borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0F172A'; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={18} style={{ color: isActive ? '#2563EB' : '#94A3B8', flexShrink: 0 }} />
                        <span>{link.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Tailux Sidebar Footer User Card */}
          <div style={{ padding: '14px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="tailux-avatar" style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)', width: 34, height: 34, fontSize: '0.8rem' }}>
                {avatarInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser?.name || 'Administrator'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }}></span>
                  Super Admin
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#EF4444',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─────────────────── MAIN AREA ─────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Tailux Header Top Bar */}
        <header style={{
          height: 60,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '0 16px' : '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          gap: 16,
          flexShrink: 0,
        }}>
          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36,
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              cursor: 'pointer',
              color: '#475569',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb Trail */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
            <span style={{ color: '#94A3B8', fontWeight: 500 }}>Admin</span>
            <ChevronRight size={13} style={{ color: '#CBD5E1' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0F172A', fontWeight: 700 }}>
              <CurrentIcon size={16} style={{ color: '#2563EB' }} />
              {!isMobile && <span>{currentPageName}</span>}
            </div>
          </div>

          {/* Backup & Restore Control Buttons */}
          <button
            onClick={handleDownloadBackup}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', background: '#FFFFFF', border: '1px solid #CBD5E1',
              borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, color: '#334155',
              cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'all 0.15s ease'
            }}
            title="Download full JSON backup of system database"
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#334155'; }}
          >
            <Download size={14} style={{ color: '#2563EB' }} />
            {!isMobile && <span>Backup</span>}
          </button>

          <button
            onClick={() => setRestoreModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', background: '#FFFFFF', border: '1px solid #CBD5E1',
              borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, color: '#334155',
              cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'all 0.15s ease'
            }}
            title="Restore database from JSON backup file"
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#334155'; }}
          >
            <Upload size={14} style={{ color: '#6366F1' }} />
            {!isMobile && <span>Restore</span>}
          </button>

          {/* System Status Badge */}
          {!isMobile && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#15803D'
            }} className="d-none d-md-inline-flex">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E' }}></span>
              System Online
            </div>
          )}
          {/* User Menu Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 10px 4px 4px',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#CBD5E1'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}
            >
              <div className="tailux-avatar" style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)', width: 28, height: 28, fontSize: '0.75rem' }}>
                {avatarInitial}
              </div>
              {!isMobile && (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                  {currentUser?.name || 'Admin'}
                </span>
              )}
              <ChevronDown size={14} style={{ color: '#64748B', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
            </button>

            {dropdownOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setDropdownOpen(false)} />
                <div className="tailux-card" style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: 230,
                  zIndex: 100,
                  padding: '8px',
                  boxShadow: '0 12px 28px -6px rgba(15, 23, 42, 0.12)',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  {/* User Profile Header */}
                  <div style={{ padding: '10px 12px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: 4 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>
                      {currentUser?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                      @{currentUser?.username}
                    </div>
                    <div className="tailux-badge tailux-badge-primary" style={{ marginTop: 8, fontSize: '0.65rem' }}>
                      <Shield size={11} />
                      SUPER ADMINISTRATOR
                    </div>
                  </div>

                  {/* Actions */}
                  <button onClick={() => { setDropdownOpen(false); navigate('/admin/users'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '8px 12px', borderRadius: '8px', border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      fontSize: '0.85rem', fontWeight: 600, color: '#475569',
                      transition: 'all 0.1s ease', textAlign: 'left',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#0F172A'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                  >
                    <UserCheck size={16} style={{ color: '#2563EB' }} />
                    Manage Accounts
                  </button>

                  <div style={{ margin: '4px 0', borderTop: '1px solid #F1F5F9' }} />

                  <button onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '8px 12px', borderRadius: '8px', border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      fontSize: '0.85rem', fontWeight: 700, color: '#EF4444',
                      transition: 'all 0.10s ease', textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} style={{ color: '#EF4444' }} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: isMobile ? '16px 14px 24px' : '24px 28px 36px', overflow: 'auto' }}>
          <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto' }}>
            <Outlet context={{ currentUser }} />
          </div>
        </main>

        {/* Tailux Footer */}
        <footer style={{
          padding: isMobile ? '20px 16px' : '18px 28px',
          borderTop: '1px solid #E2E8F0',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          fontSize: '0.82rem',
          color: '#64748B',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isMobile ? 16 : 14,
        }}>
          {/* Top Row: Logo + Quick Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 14 : 12,
          }}>
            {/* College Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <img src="/Logo.png" alt="Logo" style={{ height: 18, width: 'auto' }} />
              </div>
              <div>
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>Kirti M. Doongursee College</span>
                <span style={{ margin: '0 6px', color: '#CBD5E1' }}>•</span>
                <span style={{ color: '#64748B', fontSize: '0.78rem' }}>Admin Portal</span>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-end',
            }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'Booking', path: '/booking' },
                { label: 'Attendance', path: '/attendance' },
              ].map((link, i) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    padding: '4px 12px', borderRadius: 6,
                    border: '1px solid #E2E8F0', background: '#FFFFFF',
                    color: '#475569', fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', height: 1, background: '#E2E8F0' }} />

          {/* Bottom Row: Copyright + Developer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 6 : 12,
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              © {new Date().getFullYear()} Kirti College. All rights reserved.
            </span>
            <span style={{ fontSize: '0.75rem' }}>
              Developed with ❤️ by{' '}
              <a href="https://tushaljadhav-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer"
                style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 700 }}>
                Tushal Jadhav
              </a>
            </span>
          </div>
        </footer>
      </div>

      {/* Restore Database Modal */}
      {restoreModalOpen && (
        <div className="custom-modal-overlay" onClick={() => setRestoreModalOpen(false)}>
          <div className="custom-modal-content tailux-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, padding: 0, overflow: 'hidden' }}>
            <div className="tailux-card-header" style={{ padding: '20px 24px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EEF2FF', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={18} style={{ color: '#4F46E5' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Restore Database Backup</h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>Upload a valid `.json` database backup file</div>
                </div>
              </div>
              <button onClick={() => setRestoreModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 4 }}><X size={18} /></button>
            </div>

            <div className="tailux-card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '20px', border: '2px dashed #CBD5E1', borderRadius: 12, textAlign: 'center', background: '#F8FAFC' }}>
                <Upload size={32} style={{ color: '#6366F1', marginBottom: 8 }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                  {selectedFile ? selectedFile.name : 'Select Database Backup File (.json)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>
                  Only valid JSON backup files generated by Kirti College Auditorium System are supported.
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="backupFileInput"
                />
                <label
                  htmlFor="backupFileInput"
                  style={{
                    display: 'inline-block', marginTop: 12, padding: '8px 16px',
                    borderRadius: 8, background: '#2563EB', color: '#FFFFFF',
                    fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Browse Backup File
                </label>
              </div>

              {parsedBackup && (
                <div style={{ padding: '14px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, fontSize: '0.82rem', color: '#166534' }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>✅ Valid Backup Detected</div>
                  <div>System: {parsedBackup.system}</div>
                  <div>Backup Date: {parsedBackup.backupDate}</div>
                  <div style={{ marginTop: 6, fontWeight: 700, color: '#15803D' }}>
                    Contains: {parsedBackup.data?.departments?.length || 0} Departments, {parsedBackup.data?.faculty?.length || 0} Faculty, {parsedBackup.data?.venues?.length || 0} Venues, {parsedBackup.data?.bookings?.length || 0} Bookings.
                  </div>
                </div>
              )}
            </div>

            <div className="tailux-card-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRestoreModalOpen(false)}
                style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!parsedBackup || restoring}
                onClick={handleExecuteRestore}
                style={{
                  padding: '9px 22px', borderRadius: 10, border: 'none',
                  background: (!parsedBackup || restoring) ? '#94A3B8' : '#4F46E5',
                  color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700,
                  cursor: (!parsedBackup || restoring) ? 'not-allowed' : 'pointer'
                }}
              >
                {restoring ? 'Restoring System...' : 'Restore System Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

