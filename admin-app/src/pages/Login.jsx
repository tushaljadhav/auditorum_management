import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { adminApi, sessionManager } from '../api/client';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.login(username.trim(), password.trim());
      if (res && res.success) {
        const user = {
          id: res.user?.id || 'admin_user',
          username: res.user?.username || username,
          name: res.user?.name || 'Administrator',
          role: 'admin',
        };
        sessionManager.setUser(user);
        onLoginSuccess(user);
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to server. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFillAndLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        
        {/* College Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: 20,
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            padding: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
            marginBottom: 14,
          }}>
            <img src="/Logo.png" alt="Kirti College" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <h1 style={{
            fontSize: 22,
            fontWeight: 850,
            letterSpacing: '-0.4px',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}>
            Kirti Auditorium
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
            Administrator Access
          </p>
        </div>

        {/* Clean Login Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '24px 20px',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
        }}>
          {errorMsg && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 12,
              color: '#DC2626',
              fontWeight: 650,
              marginBottom: 16,
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoCapitalize="none"
                  className="form-input"
                  style={{ paddingLeft: 40, height: 46 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: 40, paddingRight: 40, height: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', height: 48, fontSize: 14 }}
            >
              {loading ? 'Verifying...' : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleDemoFillAndLogin}
              style={{
                width: '100%',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: 'var(--text-secondary)',
                borderRadius: 12,
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: 750,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Zap size={13} color="#F59E0B" /> Quick Demo Login (admin / admin123)
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--text-muted)' }}>
          Kirti M. Doongursee College • Dadar (W), Mumbai
        </div>
      </div>
    </div>
  );
}
