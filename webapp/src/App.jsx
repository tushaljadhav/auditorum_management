import React, { useState, useEffect } from 'react';
import { sessionManager, api, adminApi } from './api/client';
import Splash from './pages/Splash';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AdminHeader from './components/AdminHeader';
import AdminBottomNav from './components/AdminBottomNav';
import InstallPrompt from './components/InstallPrompt';
import NotificationToast from './components/notifications/NotificationToast';
import NotificationPanel from './components/notifications/NotificationPanel';

// Faculty pages
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import FacultyLive from './pages/FacultyLive';
import Booking from './pages/Booking';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Admin pages (as-is copy from admin-app)
import AdminDashboard from './pages/admin/Dashboard';
import AdminVenues from './pages/admin/Venues';
import AdminBookings from './pages/admin/Bookings';
import AdminFaculty from './pages/admin/Faculty';
import AdminSettings from './pages/admin/Settings';

const VALID_TABS = ['home', 'attendance', 'booking', 'faculty', 'activity', 'login', 'admin', 'register', 'profile'];
const ADMIN_TABS = ['dashboard', 'venues', 'bookings', 'faculty', 'settings'];

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('session') || p.get('bookingId') || p.get('checkin') || p.get('tab') === 'checkin' || p.get('tab') === 'attendance') {
        return false;
      }
    }
    return !sessionStorage.getItem('kirti_splash_shown');
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get('session') || params.get('bookingId') || params.get('checkin');
      const tabParam = params.get('tab');
      if (sessionParam || tabParam === 'checkin' || tabParam === 'attendance') {
        return 'attendance';
      }
      const adminTabParam = params.get('adminTab');
      if (adminTabParam && ADMIN_TABS.includes(adminTabParam)) return 'admin';
      if (tabParam && VALID_TABS.includes(tabParam)) return tabParam;
    }
    const user = sessionManager.getUser();
    if (user?.role === 'admin') return 'admin';
    if (user) return 'home';
    return 'login';
  });

  const [adminTab,           setAdminTab]           = useState('dashboard');
  const [preselectedSession, setPreselectedSession] = useState(null);
  const [targetSessionId,    setTargetSessionId]    = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('session') || p.get('bookingId') || p.get('checkin') || null;
    }
    return null;
  });
  const [currentUser,        setCurrentUser]        = useState(() => sessionManager.getUser());

  const isAdmin   = currentUser?.role === 'admin';
  const isFaculty = currentUser?.role === 'faculty';

  useEffect(() => {
    api.warmUp();

    const params        = new URLSearchParams(window.location.search);
    const tabParam      = params.get('tab');
    const adminTabParam = params.get('adminTab');
    const sessionParam  = params.get('session') || params.get('bookingId') || params.get('checkin');

    if (sessionParam) setTargetSessionId(sessionParam);

    // Admin direct link: ?tab=admin or ?adminTab=xxx
    if (adminTabParam && ADMIN_TABS.includes(adminTabParam)) {
      setAdminTab(adminTabParam);
    }

    // Direct student check-in link takes highest priority!
    if (sessionParam || tabParam === 'checkin' || tabParam === 'attendance') {
      setActiveTab('attendance');
      setShowSplash(false);
    } else if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
      setShowSplash(false);
    }
  }, []);

  const handleSplashDone = () => {
    sessionStorage.setItem('kirti_splash_shown', '1');
    setShowSplash(false);
    setActiveTab('login');
  };

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminNavigate = (tabId) => {
    setAdminTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSession = (session) => {
    setPreselectedSession(session);
    setActiveTab('faculty');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserChange = (user) => {
    setCurrentUser(user);
    if (user?.role === 'admin') {
      setActiveTab('admin');
      setAdminTab('dashboard');
    } else if (user) {
      setActiveTab('home');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
    return () => {
      document.body.classList.remove('admin-mode');
    };
  }, [isAdmin]);

  const handleAdminLogout = () => {
    try {
      sessionManager.logout();
    } catch (_) {}
    try {
      adminApi.logout().catch(() => {});
    } catch (_) {}
    document.body.classList.remove('admin-mode');
    setCurrentUser(null);
    setActiveTab('login');
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch (_) {}
  };

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const isStudentCheckIn = Boolean(
    targetSessionId ||
    urlParams.get('session') ||
    urlParams.get('bookingId') ||
    urlParams.get('checkin') ||
    urlParams.get('tab') === 'checkin' ||
    activeTab === 'attendance'
  );

  // ──────────────────────────────────────────────
  // 🛡️ ADMIN SHELL (Only when not in student check-in)
  // ──────────────────────────────────────────────
  if (isAdmin && !isStudentCheckIn) {
    return (
      <div className="admin-shell">
        <InstallPrompt />
        <NotificationToast />
        <NotificationPanel onNavigate={handleAdminNavigate} />
        <AdminHeader
          currentUser={currentUser}
          onLogout={handleAdminLogout}
          onNavigate={handleAdminNavigate}
        />
        <main style={{ flex: 1 }}>
          {adminTab === 'dashboard' && <AdminDashboard onNavigate={handleAdminNavigate} />}
          {adminTab === 'venues'    && <AdminVenues />}
          {adminTab === 'bookings'  && <AdminBookings />}
          {adminTab === 'faculty'   && <AdminFaculty />}
          {adminTab === 'settings'  && (
            <AdminSettings
              currentUser={currentUser}
              onLogout={handleAdminLogout}
              onNavigate={handleAdminNavigate}
            />
          )}
        </main>
        <AdminBottomNav activeTab={adminTab} onTabChange={handleAdminNavigate} />
      </div>
    );
  }


  // ──────────────────────────────────────────────
  // 👨‍🏫 FACULTY + 📲 STUDENT SHELL
  // ──────────────────────────────────────────────
  return (
    <>
      {/* Splash Screen */}
      {showSplash && <Splash onDone={handleSplashDone} />}

      <NotificationToast />
      <NotificationPanel onNavigate={handleNavigate} />

      {/* Student Check-In — Clean Institutional Header (no faculty nav) */}
      {isStudentCheckIn && (
        <header style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/Logo.png" alt="Kirti College" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Kirti M. Doongursee College
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                Student GPS Attendance Gateway
              </div>
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 999,
            background: 'rgba(16, 185, 129, 0.12)', color: '#059669',
            display: 'inline-flex', alignItems: 'center', gap: 5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            LIVE
          </div>
        </header>
      )}

      {/* Faculty App Shell Header */}
      {!isStudentCheckIn && activeTab !== 'login' && activeTab !== 'register' && (
        <Header
          currentUser={currentUser}
          onOpenAuth={() => handleNavigate(currentUser ? 'profile' : 'login')}
          onBrandClick={() => handleNavigate('home')}
        />
      )}

      <InstallPrompt />

      {/* Page Content */}
      <main style={{ flex: 1, overflowX: 'hidden' }}>
        {activeTab === 'home' && (
          <Home
            onNavigate={handleNavigate}
            onSelectSession={handleSelectSession}
            currentUser={currentUser}
            onOpenAuth={() => handleNavigate('login')}
          />
        )}

        {activeTab === 'attendance' && (
          <Attendance
            preselectedSession={preselectedSession}
            preselectedSessionId={targetSessionId || urlParams.get('session') || urlParams.get('bookingId')}
            currentUser={isStudentCheckIn ? null : currentUser}
            defaultTab={isStudentCheckIn ? 'student' : 'faculty'}
            isStudentOnly={isStudentCheckIn}
          />
        )}

        {activeTab === 'faculty' && (
          <FacultyLive
            currentUser={currentUser}
            onOpenAuth={() => handleNavigate('login')}
          />
        )}

        {activeTab === 'booking' && (
          <Booking
            currentUser={currentUser}
            onOpenAuth={() => handleNavigate('login')}
          />
        )}

        {activeTab === 'activity' && (
          <History currentUser={currentUser} />
        )}

        {activeTab === 'login' && (
          <Login
            currentUser={currentUser}
            onUserChange={handleUserChange}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'register' && (
          <Register
            onNavigate={handleNavigate}
            onUserChange={handleUserChange}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            currentUser={currentUser}
            onUserChange={handleUserChange}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Faculty Bottom Navigation */}
      {!isStudentCheckIn && activeTab !== 'login' && activeTab !== 'register' && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={handleNavigate}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
