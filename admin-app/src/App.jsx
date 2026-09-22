import React, { useState, useEffect } from 'react';
import { sessionManager, adminApi } from './api/client';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import InstallPrompt from './components/InstallPrompt';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Venues from './pages/Venues';
import Bookings from './pages/Bookings';
import Settings from './pages/Settings';
import Faculty from './pages/Faculty';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => sessionManager.getUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['dashboard', 'venues', 'bookings', 'faculty', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (currentUser) {
      adminApi.checkSession().catch(() => {});
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    sessionManager.logout();
    adminApi.logout().catch(() => {});
    setCurrentUser(null);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return (
      <>
        <InstallPrompt />
        <Login onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <>
      <InstallPrompt />
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={handleTabChange}
      />

      <main key={refreshKey} style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <Dashboard onNavigate={handleTabChange} />}
        {activeTab === 'venues' && <Venues />}
        {activeTab === 'bookings' && <Bookings />}
        {activeTab === 'faculty' && <Faculty />}
        {activeTab === 'settings' && <Settings currentUser={currentUser} onLogout={handleLogout} onNavigate={handleTabChange} />}
      </main>

      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </>
  );
}
