import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { showCustomToast } from '../utils/toast';
import PassTicket from '../components/PassTicket';
import {
  MapPin, Radio, KeyRound, User, CheckCircle2,
  AlertTriangle, Navigation, RefreshCw, Clock, Sparkles,
  Compass, Shield, BookOpen, Layers
} from 'lucide-react';

/* ── Haversine Distance (Metres) ── */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Student Attendance Check-In Portal ── */
export default function Attendance({ preselectedSession, preselectedSessionId, currentUser }) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Resolve target session ID from props or URL
  const targetId = preselectedSessionId || (() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('session') || p.get('bookingId') || p.get('checkin') || null;
    }
    return null;
  })();

  const [sessions,         setSessions]         = useState([]);
  const [selectedSession,  setSelectedSession]  = useState(preselectedSession || null);
  const [loadingSessions,  setLoadingSessions]  = useState(true);

  const [rollNumber,  setRollNumber]  = useState(() => localStorage.getItem('kirti_roll_no')       || (currentUser?.rollNumber || ''));
  const [studentName, setStudentName] = useState(() => localStorage.getItem('kirti_student_name')   || (currentUser?.name       || ''));
  const [classStream, setClassStream] = useState(() => localStorage.getItem('kirti_class_stream')   || (currentUser?.classStream || ''));
  const [pin,         setPin]         = useState('');

  const [coords,        setCoords]        = useState(null);
  const [distance,      setDistance]      = useState(null);
  const [locating,      setLocating]      = useState(false);
  const [locationError, setLocationError] = useState('');
  const [simulateGps,   setSimulateGps]   = useState(false);

  const [submitting,   setSubmitting]   = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);

  // Fetch active sessions or direct session details
  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      let directMatch = null;
      if (targetId) {
        try {
          const direct = await api.getBookingById(targetId);
          if (direct && direct.id) {
            directMatch = direct;
          }
        } catch (_) {}
      }

      const res = await api.getTodaySessions(todayStr);
      const all = res.sessions || [];
      setSessions(all);

      if (directMatch) {
        setSelectedSession(directMatch);
      } else if (targetId) {
        const found = all.find(s => s.id === targetId);
        if (found) setSelectedSession(found);
      } else if (!selectedSession) {
        const open = all.find(s => s.attendanceStatus === 'OPEN');
        if (open) setSelectedSession(open);
      }
    } catch (_) {
    } finally {
      setLoadingSessions(false);
    }
  }, [todayStr, targetId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Capture student device GPS
  const captureGPS = useCallback(() => {
    setLocationError('');
    if (simulateGps) {
      const anchorLat = selectedSession?.sessionLatitude || selectedSession?.venueLatitude || 19.0222;
      const anchorLon = selectedSession?.sessionLongitude || selectedSession?.venueLongitude || 72.8304;
      setCoords({ lat: anchorLat + 0.0001, lon: anchorLon + 0.0001 });
      setDistance(12);
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setCoords({ lat, lon });
        setLocating(false);
        if (selectedSession) {
          const tLat = Number(selectedSession.sessionLatitude || selectedSession.venueLatitude || 19.0222);
          const tLon = Number(selectedSession.sessionLongitude || selectedSession.venueLongitude || 72.8304);
          setDistance(Math.round(haversineDistance(lat, lon, tLat, tLon)));
        }
      },
      err => {
        setLocating(false);
        setLocationError('GPS detection failed. Please enable location permissions.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, [selectedSession, simulateGps]);

  useEffect(() => {
    captureGPS();
  }, [selectedSession, simulateGps]);

  // Attendance Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSession) {
      setErrorMsg('Please select an active session.');
      return;
    }
    if (!rollNumber.trim() || !studentName.trim()) {
      setErrorMsg('Roll Number and Full Name are required.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Please enter the 4-digit PIN announced by faculty.');
      return;
    }

    localStorage.setItem('kirti_roll_no',      rollNumber.trim().toUpperCase());
    localStorage.setItem('kirti_student_name', studentName.trim());
    localStorage.setItem('kirti_class_stream', classStream.trim());

    setSubmitting(true);
    try {
      const res = await api.markAttendance({
        bookingId:   selectedSession.id,
        rollNumber:  rollNumber.trim().toUpperCase(),
        studentName: studentName.trim(),
        classStream: classStream.trim() || 'General',
        pin:         pin.trim(),
        latitude:    coords?.lat || null,
        longitude:   coords?.lon || null,
      });

      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (_) {}

      const pass = {
        id:                res.record?.id || `pass_${Date.now()}`,
        rollNumber:        rollNumber.trim().toUpperCase(),
        studentName:       studentName.trim(),
        classStream:       classStream.trim() || 'General',
        eventName:         selectedSession.eventName,
        venueName:         selectedSession.venueName || selectedSession.roomName || 'Auditorium Complex',
        checkInTime:       new Date().toISOString(),
        distanceFromVenue: res.record?.distanceFromVenue || distance || 0,
      };

      try {
        const existing = JSON.parse(localStorage.getItem('kirti_my_passes') || '[]');
        existing.unshift(pass);
        localStorage.setItem('kirti_my_passes', JSON.stringify(existing.slice(0, 30)));
      } catch (_) {}

      setVerifiedPass(pass);
      showCustomToast('Verified!', 'Your attendance has been recorded successfully.', 'success');
    } catch (err) {
      setErrorMsg(err.message || 'Check-in failed. Please verify the PIN and location.');
    } finally {
      setSubmitting(false);
    }
  };

  // If verified, display Digital Pass ticket
  if (verifiedPass) {
    return (
      <div className="page-container" style={{ maxWidth: 500, margin: '0 auto', padding: '16px 16px 40px' }}>
        <PassTicket record={verifiedPass} onClose={() => { setVerifiedPass(null); setPin(''); }} />
      </div>
    );
  }

  const openSessions  = sessions.filter(s => s.attendanceStatus === 'OPEN');
  const allowedRadius = Number(selectedSession?.sessionRadius || selectedSession?.radius || 100);
  const isInRange     = distance !== null && distance <= (allowedRadius + 25);

  return (
    <div className="page-container" style={{ maxWidth: 500, margin: '0 auto', padding: '16px 16px 40px' }}>
      <div className="animate-fade-in">

        {/* Page Subtitle Header */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-eyebrow">
            <MapPin size={11} /> Student Check-In Portal
          </div>
          <h2 className="section-title">Mark Attendance</h2>
          <p className="section-subtitle">
            Verify your GPS location and enter the session PIN
          </p>
        </div>

        {/* Target Session Banner (or Selector if none preselected) */}
        {selectedSession ? (
          <div style={{
            background: 'linear-gradient(135deg, #1E1039 0%, #2D1B69 100%)',
            borderRadius: 'var(--r-xl)',
            padding: '16px 18px',
            color: '#FFFFFF',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(30,16,57,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#A7F3D0',
                background: 'rgba(16,185,129,0.2)',
                border: '1px solid rgba(16,185,129,0.3)',
                padding: '3px 10px',
                borderRadius: 999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} className="pulse-radar" />
                ACTIVE SESSION
              </span>
            </div>

            <div style={{ fontSize: 18, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
              {selectedSession.eventName}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(196,181,253,0.9)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <span>👤 {selectedSession.facultyName || 'Faculty In-Charge'}</span>
              <span>🏛️ {selectedSession.venueName || selectedSession.roomName || 'Campus Venue'}</span>
            </div>
          </div>
        ) : targetId && loadingSessions ? (
          <div className="card" style={{ padding: 20, textAlign: 'center', marginBottom: 16 }}>
            <div className="spinner-primary" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Loading Session Details...</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Connecting to attendance gateway</div>
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>SELECT ACTIVE SESSION</label>
              <button
                type="button"
                onClick={fetchSessions}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RefreshCw size={11} /> Refresh
              </button>
            </div>

            {loadingSessions ? (
              <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                <div className="spinner-primary" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Checking active sessions...</div>
              </div>
            ) : openSessions.length === 0 ? (
              <div className="card" style={{ borderLeft: '3px solid var(--amber)', padding: 16 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <AlertTriangle size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>No Live Sessions Active</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      Faculty has not broadcasted attendance yet. Please ask your professor to start the session.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {openSessions.map(sess => {
                  const sel = selectedSession?.id === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => setSelectedSession(sess)}
                      style={{
                        padding: '12px 14px',
                        border: sel ? '1.5px solid var(--secondary)' : '1px solid var(--border)',
                        background: sel ? 'var(--secondary-light)' : 'var(--surface)',
                        borderRadius: 'var(--r-md)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 12,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: sel ? 'rgba(16,185,129,0.15)' : 'var(--surface-subtle)',
                        border: `1px solid ${sel ? 'var(--secondary-border)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Radio size={16} color={sel ? 'var(--secondary-dark)' : 'var(--text-muted)'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">
                          {sess.eventName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          {sess.facultyName} • {sess.venueName || 'Auditorium'}
                        </div>
                      </div>
                      <span className="badge badge-emerald" style={{ fontSize: 10 }}>
                        <span className="status-dot status-dot-green pulse-radar" /> LIVE
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* GPS Verification Radar Card */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div
              className="gps-radar"
              style={{ color: isInRange ? 'var(--secondary)' : locating ? 'var(--primary)' : 'var(--border-md)' }}
            >
              <div className="gps-radar-inner" style={{
                background: isInRange ? 'var(--secondary-light)' : locating ? 'var(--primary-light)' : 'var(--surface-subtle)',
                border: `1.5px solid ${isInRange ? 'var(--secondary-border)' : locating ? 'var(--primary-border)' : 'var(--border)'}`,
              }}>
                <Navigation size={22} color={isInRange ? 'var(--secondary-dark)' : locating ? 'var(--primary)' : 'var(--text-muted)'} />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                {locating ? 'Detecting Device GPS…' : isInRange ? '✓ Location Verified' : distance !== null ? '⚠ Outside Campus Range' : 'GPS Verification'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: isInRange ? 'var(--secondary-dark)' : 'var(--text-muted)', marginTop: 2 }}>
                {distance !== null ? `Distance: ~${distance}m (Allowed: ≤${allowedRadius + 25}m)` : 'Tap refresh to detect location'}
              </div>
            </div>
            <button type="button" onClick={captureGPS} disabled={locating} className="btn-icon">
              <RefreshCw size={14} className={locating ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Simulator toggle for testing */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface-subtle)', padding: '8px 12px',
            borderRadius: 'var(--r-sm)', border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Compass size={12} color="var(--primary)" /> Campus Location Simulation (Test Mode)
            </span>
            <input
              type="checkbox"
              checked={simulateGps}
              onChange={e => setSimulateGps(e.target.checked)}
              style={{ accentColor: 'var(--secondary)', width: 16, height: 16, cursor: 'pointer' }}
            />
          </div>

          {locationError && (
            <div className="alert alert-error" style={{ marginTop: 8, fontSize: 11 }}>
              {locationError}
            </div>
          )}
        </div>

        {/* Student Check-In Form */}
        <form onSubmit={handleSubmit} className="card">
          <label className="form-label" style={{ marginBottom: 14 }}>STUDENT CREDENTIALS</label>

          {errorMsg && (
            <div className="alert alert-error" style={{ marginBottom: 14, fontSize: 12 }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Roll Number *</label>
            <input
              className="app-input"
              type="text"
              required
              placeholder="e.g. TYIT-42"
              value={rollNumber}
              onChange={e => setRollNumber(e.target.value.toUpperCase())}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Student Full Name *</label>
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
            <label className="form-label">Class & Stream / Department</label>
            <input
              className="app-input"
              type="text"
              placeholder="e.g. T.Y. B.Sc. IT (Sem 6)"
              value={classStream}
              onChange={e => setClassStream(e.target.value)}
            />
          </div>

          {/* 4-digit PIN */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label" style={{ color: 'var(--amber-text)' }}>
              4-DIGIT LIVE PIN (GIVEN BY FACULTY) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="e.g. 4821"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%', padding: '12px 14px 12px 42px',
                  borderRadius: 'var(--r-md)', border: '1.5px solid var(--amber-border)',
                  background: 'var(--amber-light)', color: 'var(--amber-text)',
                  fontSize: 22, fontWeight: 900, letterSpacing: '6px', outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <KeyRound size={18} color="var(--amber-dark)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--amber-text)', marginTop: 4, opacity: 0.8 }}>
              Ask your faculty for the 4-digit verification PIN.
            </div>
          </div>

          <button
            type="submit"
            className="btn-emerald"
            disabled={submitting || !selectedSession}
            style={{ width: '100%', padding: '14px', fontSize: 14, fontWeight: 800, justifyContent: 'center' }}
          >
            {submitting ? (
              <><span className="spinner" /> Verifying Attendance…</>
            ) : (
              <><CheckCircle2 size={16} /> Submit Attendance</>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
