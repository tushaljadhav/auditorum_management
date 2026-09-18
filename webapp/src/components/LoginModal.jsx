import React, { useState, useEffect } from 'react';
import { api, sessionManager } from '../api/client';
import {
  X, User, Lock, Eye, EyeOff, CheckCircle2,
  Shield, GraduationCap, Briefcase, ArrowRight, LogOut, ChevronDown
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onUserChange }) {
  const [currentUser, setCurrentUser] = useState(() => sessionManager.getUser());
  const [activeTab, setActiveTab]     = useState('faculty'); // 'faculty' | 'student' | 'admin'

  // Faculty
  const [facultyList,       setFacultyList]       = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  // Student
  const [studentRoll,   setStudentRoll]   = useState(() => localStorage.getItem('kirti_roll_no')       || '');
  const [studentName,   setStudentName]   = useState(() => localStorage.getItem('kirti_student_name')   || '');
  const [studentStream, setStudentStream] = useState(() => localStorage.getItem('kirti_class_stream')   || '');

  // Admin
  const [adminUser,    setAdminUser]    = useState('admin');
  const [adminPass,    setAdminPass]    = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  useEffect(() => {
    setCurrentUser(sessionManager.getUser());
    setErrorMsg('');
    if (isOpen) {
      api.getFaculty()
        .then(list => {
          setFacultyList(list || []);
          if (list?.length > 0 && !selectedFacultyId) setSelectedFacultyId(list[0].id);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFacultyLogin = (e) => {
    e.preventDefault();
    const fac = facultyList.find(f => f.id === selectedFacultyId) || facultyList[0];
    if (!fac) return;
    const user = { role: 'faculty', id: fac.id, name: fac.name, email: fac.email, departmentId: fac.departmentId };
    sessionManager.setUser(user);
    setCurrentUser(user);
    onUserChange?.(user);
    onClose();
  };

  const handleStudentLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!studentRoll.trim() || !studentName.trim()) {
      setErrorMsg('Roll number and full name are required.');
      return;
    }
    localStorage.setItem('kirti_roll_no',      studentRoll.trim().toUpperCase());
    localStorage.setItem('kirti_student_name', studentName.trim());
    localStorage.setItem('kirti_class_stream', studentStream.trim());
    const user = { role: 'student', rollNumber: studentRoll.trim().toUpperCase(), name: studentName.trim(), classStream: studentStream.trim() || 'General' };
    sessionManager.setUser(user);
    setCurrentUser(user);
    onUserChange?.(user);
    onClose();
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!adminUser || !adminPass) { setErrorMsg('Enter both username and password.'); return; }
    setAdminLoading(true);
    try {
      const res = await api.authLogin(adminUser, adminPass);
      if (res.success) {
        const user = { role: 'admin', name: res.user?.username || 'Administrator', username: res.user?.username };
        sessionManager.setUser(user);
        setCurrentUser(user);
        onUserChange?.(user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Check credentials.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleLogout = () => {
    sessionManager.logout();
    api.authLogout().catch(() => {});
    setCurrentUser(null);
    onUserChange?.(null);
    onClose();
  };

  const TABS = [
    { id: 'faculty', label: 'Faculty',   icon: Briefcase,    color: 'var(--primary)',       bg: 'var(--primary-light)',   border: 'var(--primary-border)' },
    { id: 'student', label: 'Student',   icon: GraduationCap, color: 'var(--secondary-dark)', bg: 'var(--secondary-light)', border: 'var(--secondary-border)' },
    { id: 'admin',   label: 'Admin',     icon: Shield,        color: '#D97706',              bg: '#FFFBEB',               border: '#FDE68A' },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* Handle */}
        <div className="modal-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)' }}>
              {currentUser ? 'Account' : 'Sign In'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {currentUser ? `Logged in as ${currentUser.role}` : 'Kirti Auditorium Portal'}
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Currently logged in */}
        {currentUser && (
          <div style={{
            background: 'var(--surface-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '14px 16px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: currentUser.role === 'admin' ? '#FEF3C7' : currentUser.role === 'faculty' ? 'var(--primary-light)' : 'var(--secondary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1.5px solid ${currentUser.role === 'admin' ? '#FDE68A' : currentUser.role === 'faculty' ? 'var(--primary-border)' : 'var(--secondary-border)'}`,
                flexShrink: 0,
              }}>
                {currentUser.role === 'admin'   && <Shield size={18} color="#D97706" />}
                {currentUser.role === 'faculty' && <Briefcase size={18} color="var(--primary-dark)" />}
                {currentUser.role === 'student' && <GraduationCap size={18} color="var(--secondary-dark)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 1 }}>
                  {currentUser.role} • Signed In
                </div>
              </div>
              <span className="badge badge-emerald">
                <CheckCircle2 size={11} /> Active
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                marginTop: 12,
                padding: '10px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--danger-border)',
                background: 'var(--danger-light)',
                color: 'var(--danger-dark)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="tab-bar" style={{ marginBottom: 18 }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(t.id); setErrorMsg(''); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
              >
                <Icon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: 14, fontSize: 12 }}>
            {errorMsg}
          </div>
        )}

        {/* ── Faculty Tab ── */}
        {activeTab === 'faculty' && (
          <form onSubmit={handleFacultyLogin}>
            <div className="form-group">
              <label className="form-label">Select Faculty</label>
              {facultyList.length === 0 ? (
                <div className="alert alert-info" style={{ fontSize: 12 }}>Loading faculty list...</div>
              ) : (
                <select
                  className="app-select"
                  value={selectedFacultyId}
                  onChange={e => setSelectedFacultyId(e.target.value)}
                >
                  {facultyList.map(f => (
                    <option key={f.id} value={f.id}>{f.name} — {f.departmentId || 'Faculty'}</option>
                  ))}
                </select>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Select your name from the college faculty directory. This enables booking and live attendance control.
            </p>
            <button type="submit" className="btn-primary" disabled={facultyList.length === 0}>
              <Briefcase size={14} /> Continue as Faculty <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* ── Student Tab ── */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentLogin}>
            <div className="form-group">
              <label className="form-label">Roll Number *</label>
              <input
                className="app-input"
                type="text"
                required
                placeholder="e.g. TYIT-42"
                value={studentRoll}
                onChange={e => setStudentRoll(e.target.value.toUpperCase())}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="app-input"
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Class & Stream</label>
              <input
                className="app-input"
                type="text"
                placeholder="e.g. T.Y. B.Sc. IT (Sem 6)"
                value={studentStream}
                onChange={e => setStudentStream(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-emerald">
              <GraduationCap size={14} /> Continue as Student <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* ── Admin Tab ── */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="app-input"
                type="text"
                required
                placeholder="admin"
                value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="app-input"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={adminLoading}
              style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)' }}>
              {adminLoading ? <span className="spinner" /> : <Shield size={14} />}
              {adminLoading ? 'Verifying...' : 'Admin Sign In'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
              Admin access is restricted to authorized personnel only.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
