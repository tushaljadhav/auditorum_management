import React, { useState, useEffect } from 'react';
import { sessionManager } from './api/client';
import Splash from './pages/Splash';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import InstallPrompt from './components/InstallPrompt';

import Home from './pages/Home';
import Attendance from './pages/Attendance';
import FacultyLive from './pages/FacultyLive';
import Booking from './pages/Booking';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

const VALID_TABS = ['home', 'attendance', 'booking', 'faculty', 'activity', 'login', 'admin', 'register', 'profile'];

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on fresh load, not on every navigation
    return !sessionStorage.getItem('kirti_splash_shown');
  });
  const [activeTab,     setActiveTab]     = useState('login');
  const [preselectedSession, setPreselectedSession] = useState(null);
  const [currentUser,   setCurrentUser]   = useState(() => sessionManager.getUser());

  // Check URL query parameters on mount — Default first page is always 'login'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && VALID_TABS.includes(tabParam)) {
      setActiveTab(tabParam);
      setShowSplash(false);
    } else {
      setActiveTab('login');
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

  const handleSelectSession = (session) => {
    setPreselectedSession(session);
    setActiveTab('faculty');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserChange = (user) => {
    setCurrentUser(user);
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && <Splash onDone={handleSplashDone} />}

      {/* App Shell Header (Hidden on login / register pages) */}
      {activeTab !== 'login' && activeTab !== 'register' && (
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
            currentUser={currentUser}
            defaultTab="faculty"
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

      {/* Bottom Navigation (Hidden on login / register pages) */}
      {activeTab !== 'login' && activeTab !== 'register' && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={handleNavigate}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
