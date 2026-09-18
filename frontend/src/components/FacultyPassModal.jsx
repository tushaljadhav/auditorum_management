import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, Eye, EyeOff, X, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { verifyFacultyPasscode, setFacultyAuthorized, getActiveFacultyPasscode } from '../utils/facultyAuth';

export default function FacultyPassModal({ isOpen, onClose, onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
      setShake(false);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the faculty access passcode.');
      triggerShake();
      return;
    }

    if (verifyFacultyPasscode(passcode)) {
      setFacultyAuthorized(true);
      setError('');
      if (onSuccess) onSuccess();
    } else {
      setError('Invalid Access Passcode! Please enter the correct code provided by administrator.');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '460px',
          width: '100%',
          padding: '32px 28px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          transform: shake ? 'translateX(-8px)' : 'none',
          transition: shake ? 'transform 0.08s ease' : 'all 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E2E8F0';
            e.currentTarget.style.color = '#0F172A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#F1F5F9';
            e.currentTarget.style.color = '#64748B';
          }}
        >
          <X size={18} />
        </button>

        {/* Icon Crest */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)',
              color: '#FFFFFF'
            }}
          >
            <Lock size={30} />
          </div>
        </div>

        {/* Header Titles */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: '#EEF2FF',
              color: '#4F46E5',
              fontSize: '0.75rem',
              fontWeight: 750,
              marginBottom: '10px'
            }}
          >
            <ShieldCheck size={14} /> Restricted Faculty Gateway
          </div>
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em'
            }}
          >
            Faculty Access Verification
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '0.86rem',
              color: '#64748B',
              lineHeight: 1.5
            }}
          >
            Please enter the <strong>Security Passcode</strong> provided by college administration to access the Faculty Mobile App and booking portal.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px'
              }}
            >
              Faculty Security Passcode
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <KeyRound size={18} />
              </div>
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter access passcode..."
                style={{
                  width: '100%',
                  padding: '13px 44px 13px 44px',
                  borderRadius: '12px',
                  border: error ? '2px solid #EF4444' : '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  letterSpacing: showPassword ? 'normal' : '0.15em',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = '#6366F1';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = '#CBD5E1';
                  e.target.style.background = '#F8FAFC';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  color: '#EF4444',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Passcode hint / badge for user ease */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
              fontSize: '0.78rem',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Provided Passcode:</span>
            <code
              style={{
                background: '#E2E8F0',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                color: '#1E293B',
                fontFamily: 'monospace'
              }}
            >
              {getActiveFacultyPasscode()}
            </code>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontSize: '0.92rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2,
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 750,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 70, 229, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.35)';
              }}
            >
              Unlock Access <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
