import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { QRCodeSVG } from 'qrcode.react';
import {
  Radio, Users, Clock, MapPin,
  CheckCircle2, XCircle, Briefcase,
  RefreshCw, Wifi, WifiOff, Zap
} from 'lucide-react';

export default function FacultyLive({ currentUser, onOpenAuth }) {
  const [eventName, setEventName] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [roomName, setRoomName] = useState('Auditorium Complex');
  const [windowMins, setWindowMins] = useState(15);
  const [customPin, setCustomPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [attendeeRoster, setAttendeeRoster] = useState([]);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (currentUser?.role === 'faculty') {
      setFacultyName(currentUser.name || '');
    } else {
      const saved = localStorage.getItem('kirti_faculty_name');
      if (saved) setFacultyName(saved);
    }
  }, [currentUser]);

  // Capture faculty GPS
  const captureGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => { captureGPS(); }, []);

  // Timer countdown
  useEffect(() => {
    if (!activeSession || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, secondsRemaining]);

  // Poll live attendee roster
  useEffect(() => {
    if (!activeSession) return;
    const poll = async () => {
      try {
        const list = await api.getAttendanceRoster(activeSession.id);
        if (Array.isArray(list)) setAttendeeRoster(list);
      } catch (e) {}
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!eventName.trim() || !facultyName.trim()) {
      alert('Event title and faculty coordinator are required.');
      return;
    }
    localStorage.setItem('kirti_faculty_name', facultyName.trim());
    setCreating(true);
    try {
      const payload = {
        eventName: eventName.trim(),
        facultyName: facultyName.trim(),
        departmentName: currentUser?.departmentId || 'General',
        roomName: roomName.trim(),
        windowMins: Number(windowMins),
        pin: customPin.trim(),
        latitude: coords?.lat || null,
        longitude: coords?.lon || null,
        attendees: 60,
      };
      const result = await api.createInstantSession(payload);
      setActiveSession(result);
      setSecondsRemaining(Number(windowMins) * 60);
      setAttendeeRoster([]);
    } catch (err) {
      alert(err.message || 'Failed to start live session.');
    } finally {
      setCreating(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = secondsRemaining > 0 && secondsRemaining < 120;

  // ── ACTIVE SESSION VIEW ──
  if (activeSession) {
    const studentCheckInUrl = `${window.location.origin}/?tab=attendance&session=${activeSession.id}`;
    return (
      <div className="animate-fade-in" style={{ padding: '16px 16px 36px' }}>

        {/* Hero status banner */}
        <div style={{
          background: 'linear-gradient(145deg, #1E1039 0%, #2D1B69 50%, #1E3A5F 100%)',
          borderRadius: 'var(--r-2xl)',
          padding: '20px',
          marginBottom: 16,
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 36px rgba(30,16,57,0.40)',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)',
              color: '#6EE7B7', padding: '5px 12px', borderRadius: 'var(--r-full)',
              fontSize: 11, fontWeight: 800, letterSpacing: 0.5,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} className="pulse-radar" />
              BROADCASTING LIVE
            </span>
          </div>

          <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px', marginBottom: 4 }}>
            {activeSession.eventName}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(196,181,253,0.85)' }}>
            {activeSession.facultyName} · {activeSession.venueName || roomName}
          </div>
        </div>

        {/* Main content card */}
        <div className="live-card">

          {/* PIN Display */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--amber-text)', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>
              Student Live PIN
            </div>
            <div className="pin-display">
              <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', opacity: 0.7, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Share this PIN with students
              </div>
              <div className="pin-digits">{activeSession.sessionPin}</div>
              <div style={{ fontSize: 11, color: '#78350F', marginTop: 6 }}>
                Enter on student device to verify attendance
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: '16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: 16,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <QRCodeSVG value={studentCheckInUrl} size={130} />
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginTop: 10, letterSpacing: 0.2 }}>
              SCAN TO AUTO-OPEN CHECK-IN
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
              Opens on student device automatically
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--r-lg)', padding: '16px',
            }}>
              <div style={{ fontSize: 10, color: '#065F46', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Checked-In</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#059669', marginTop: 4, lineHeight: 1 }}>
                {attendeeRoster.length}
              </div>
              <div style={{ fontSize: 10, color: '#059669', marginTop: 4 }}>students</div>
            </div>

            <div style={{
              background: isUrgent
                ? 'linear-gradient(135deg, #FEF2F2, #FEE2E2)'
                : 'linear-gradient(135deg, #F8F7FF, #EDE9FE)',
              border: `1px solid ${isUrgent ? '#FECACA' : 'var(--primary-border)'}`,
              borderRadius: 'var(--r-lg)', padding: '16px',
            }}>
              <div style={{ fontSize: 10, color: isUrgent ? '#991B1B' : 'var(--primary-deeper)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Time Left</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: isUrgent ? '#DC2626' : 'var(--primary)', marginTop: 4, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {formatTimer(secondsRemaining)}
              </div>
              <div style={{ fontSize: 10, color: isUrgent ? '#DC2626' : 'var(--primary)', marginTop: 4 }}>
                {isUrgent ? '⚠️ ending soon' : 'remaining'}
              </div>
            </div>
          </div>

          {/* Live roster */}
          {attendeeRoster.length > 0 && (
            <div style={{
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '14px',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={13} /> Recent Check-Ins ({attendeeRoster.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 140, overflowY: 'auto' }}>
                {attendeeRoster.slice(-6).reverse().map((rec, i) => (
                  <div key={i} className="roster-row">
                    <div className="roster-avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                      {(rec.studentName || 'S')[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                        {rec.rollNumber} — {rec.studentName}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>
                      {rec.distanceFromVenue ? `${rec.distanceFromVenue}m` : '✓'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setActiveSession(null)}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 'var(--r-md)',
              background: 'var(--danger-light)',
              border: '1.5px solid var(--danger-border)',
              color: 'var(--danger-dark)',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-light)'; }}
          >
            <XCircle size={16} /> End Live Broadcast
          </button>
        </div>
      </div>
    );
  }

  // ── SETUP FORM ──
  return (
    <div className="animate-fade-in" style={{ padding: '16px 16px 36px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-eyebrow">
          <Radio size={11} /> Faculty Live Hub
        </div>
        <h2 className="section-title">Start Live Broadcast</h2>
        <p className="section-subtitle">Launch GPS-verified attendance with live PIN &amp; QR code</p>
      </div>

      {/* GPS Lock Card */}
      <div style={{
        background: coords
          ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)'
          : 'linear-gradient(135deg, #F8F7FF, #EDE9FE)',
        border: `1.5px solid ${coords ? '#A7F3D0' : 'var(--primary-border)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: coords
            ? 'linear-gradient(135deg, #10B981, #059669)'
            : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: coords
            ? '0 4px 12px rgba(16,185,129,0.3)'
            : '0 4px 12px rgba(124,58,237,0.3)',
        }}>
          {coords ? <Wifi size={18} color="#FFFFFF" /> : <WifiOff size={18} color="#FFFFFF" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: coords ? '#065F46' : 'var(--primary-dark)' }}>
            {coords ? '✓ GPS Location Locked' : 'GPS Not Locked'}
          </div>
          <div style={{ fontSize: 11, color: coords ? '#059669' : 'var(--text-muted)' }}>
            {coords
              ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`
              : 'Students must be within 100m to check in'}
          </div>
        </div>
        {!coords && (
          <button
            onClick={captureGPS}
            disabled={locating}
            style={{
              padding: '8px 12px', borderRadius: 'var(--r-sm)',
              background: 'var(--grad-violet)', color: '#FFFFFF',
              border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              flexShrink: 0, opacity: locating ? 0.6 : 1,
            }}
          >
            {locating ? <><RefreshCw size={12} /> Locating…</> : <><MapPin size={12} /> Lock GPS</>}
          </button>
        )}
      </div>

      {/* Not logged in banner */}
      {!currentUser && (
        <div
          onClick={onOpenAuth}
          style={{
            cursor: 'pointer',
            background: 'var(--indigo-light)',
            border: '1px solid var(--indigo-border)',
            borderRadius: 'var(--r-lg)',
            padding: '12px 14px',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <Briefcase size={18} color="var(--indigo)" />
          <div style={{ fontSize: 12, color: '#3730A3' }}>
            <b>Sign in as Faculty</b> to auto-fill your profile &amp; link lecture rosters.
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleStartSession} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div>
          <label className="field-label">Lecture / Event Title *</label>
          <input
            type="text" required
            placeholder="e.g. Distributed Systems & Cloud Lab"
            value={eventName}
            onChange={e => setEventName(e.target.value)}
            className="app-input"
          />
        </div>

        <div>
          <label className="field-label">Faculty Coordinator *</label>
          <input
            type="text" required
            placeholder="e.g. Prof. Vikram Singh"
            value={facultyName}
            onChange={e => setFacultyName(e.target.value)}
            className="app-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10 }}>
          <div>
            <label className="field-label">Room / Hall</label>
            <input
              type="text"
              placeholder="e.g. Lab 4 / Hall A"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="field-label">Duration</label>
            <select
              value={windowMins}
              onChange={e => setWindowMins(Number(e.target.value))}
              className="app-input"
            >
              <option value={5}>5 mins</option>
              <option value={10}>10 mins</option>
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={60}>60 mins</option>
            </select>
          </div>
        </div>

        {/* PIN Configuration */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label className="field-label" style={{ marginBottom: 0 }}>4-Digit Broadcast PIN</label>
            <button
              type="button"
              onClick={() => setCustomPin(Math.floor(1000 + Math.random() * 9000).toString())}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={11} /> Regenerate
            </button>
          </div>
          <div className="pin-display" style={{ padding: '12px 16px' }}>
            <input
              type="text"
              maxLength={6}
              value={customPin}
              onChange={e => setCustomPin(e.target.value)}
              style={{
                width: '100%', background: 'transparent',
                border: 'none', outline: 'none',
                color: '#92400E', fontSize: 36, fontWeight: 900,
                letterSpacing: '10px', textAlign: 'center',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        <button type="submit" disabled={creating} className="btn-primary" style={{ marginTop: 4 }}>
          {creating ? (
            <><span className="spinner-primary" style={{ width: 18, height: 18, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Initializing…</>
          ) : (
            <><Zap size={16} /> Start Live Broadcast</>
          )}
        </button>
      </form>
    </div>
  );
}
