import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api, sessionManager, buildAttendanceUrl } from '../api/client';
import { showCustomToast } from '../utils/toast';
import { exportAttendanceCSV } from '../utils/excelExport';
import PassTicket from '../components/PassTicket';
import {
  MapPin, Radio, KeyRound, User, CheckCircle2,
  AlertTriangle, Navigation, RefreshCw, Clock, Sparkles,
  Compass, Copy, Share2, QrCode, Users, Search,
  ChevronRight, Zap, X, Eye, Download, Calendar,
  Maximize2, Minimize2, StopCircle, Play, Shield
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/* ── Haversine Distance ── */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Format countdown ── */
function formatCountdown(seconds) {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ── Tab 1: Student Check-In ── */
function StudentTab({ preselectedSession, currentUser }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [sessions,         setSessions]         = useState([]);
  const [selectedSession,  setSelectedSession]  = useState(preselectedSession || null);
  const [loadingSessions,  setLoadingSessions]  = useState(true);

  const [rollNumber,  setRollNumber]  = useState(() => localStorage.getItem('kirti_roll_no')       || (currentUser?.rollNumber || ''));
  const [studentName, setStudentName] = useState(() => localStorage.getItem('kirti_student_name')   || (currentUser?.name       || ''));
  const [classStream, setClassStream] = useState(() => localStorage.getItem('kirti_class_stream')   || (currentUser?.classStream || ''));
  const [pin,         setPin]         = useState('');

  const [coords,       setCoords]       = useState(null);
  const [distance,     setDistance]     = useState(null);
  const [locating,     setLocating]     = useState(false);
  const [locationError, setLocationError] = useState('');
  const [simulateGps,  setSimulateGps]  = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [verifiedPass, setVerifiedPass] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await api.getTodaySessions(todayStr);
      const all = res.sessions || [];
      setSessions(all);
      if (!selectedSession) {
        const open = all.find(s => s.attendanceStatus === 'OPEN');
        if (open) setSelectedSession(open);
      }
    } catch {} finally { setLoadingSessions(false); }
  }, [todayStr]);

  useEffect(() => { fetchSessions(); }, []);

  const captureGPS = useCallback(() => {
    setLocationError('');
    if (simulateGps) {
      const anchorLat = selectedSession?.sessionLatitude || selectedSession?.venueLatitude || 19.0222;
      const anchorLon = selectedSession?.sessionLongitude || selectedSession?.venueLongitude || 72.8304;
      setCoords({ lat: anchorLat + 0.0001, lon: anchorLon + 0.0001 });
      setDistance(12);
      return;
    }
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return; }
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
      err => { setLocating(false); setLocationError('GPS failed. Enable device location and try again.'); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, [selectedSession, simulateGps]);

  useEffect(() => { captureGPS(); }, [selectedSession, simulateGps]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!selectedSession) { setErrorMsg('Please select an active session.'); return; }
    if (!rollNumber.trim() || !studentName.trim()) { setErrorMsg('Roll number and name are required.'); return; }

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

      try { confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } }); } catch {}

      const pass = {
        id:                res.record?.id || `pass_${Date.now()}`,
        rollNumber:        rollNumber.trim().toUpperCase(),
        studentName:       studentName.trim(),
        classStream:       classStream.trim() || 'General',
        eventName:         selectedSession.eventName,
        venueName:         selectedSession.venueName,
        checkInTime:       new Date().toISOString(),
        distanceFromVenue: res.record?.distanceFromVenue || distance || 0,
      };

      try {
        const existing = JSON.parse(localStorage.getItem('kirti_my_passes') || '[]');
        existing.unshift(pass);
        localStorage.setItem('kirti_my_passes', JSON.stringify(existing.slice(0, 30)));
      } catch {}

      setVerifiedPass(pass);
    } catch (err) {
      setErrorMsg(err.message || 'Check-in failed. Verify PIN and GPS location.');
    } finally { setSubmitting(false); }
  };

  if (verifiedPass) return (
    <div className="animate-fade-in">
      <PassTicket record={verifiedPass} onClose={() => { setVerifiedPass(null); setPin(''); }} />
    </div>
  );

  const openSessions  = sessions.filter(s => s.attendanceStatus === 'OPEN');
  const isInRange     = distance !== null && distance <= 125;

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-eyebrow"><MapPin size={11} /> GPS Check-In</div>
        <h2 className="section-title">Student Attendance</h2>
        <p className="section-subtitle">Select your session, verify location & submit attendance</p>
      </div>

      {/* Step 1: Select Session */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label className="form-label" style={{ margin: 0 }}>1 — SELECT ACTIVE SESSION</label>
          <button onClick={fetchSessions} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RefreshCw size={11} /> Refresh
          </button>
        </div>

        {loadingSessions ? (
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div className="spinner-primary" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Checking active sessions...</div>
          </div>
        ) : openSessions.length === 0 ? (
          <div className="card" style={{ borderLeft: '3px solid var(--amber)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <AlertTriangle size={18} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>No Live Sessions</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  Faculty has not started attendance yet. Ask your coordinator to broadcast.
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
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">{sess.eventName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {sess.facultyName} • {sess.venueName || 'Campus'}
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

      {/* Step 2: GPS Radar */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          {/* Radar visual */}
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
              {locating ? 'Capturing GPS…' : isInRange ? '✓ Within Campus Perimeter' : distance !== null ? '⚠ Outside Allowed Zone' : 'Location Check'}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: isInRange ? 'var(--secondary-dark)' : 'var(--text-muted)', marginTop: 2 }}>
              {distance !== null ? `Distance: ~${distance}m  (Allowed: ≤125m)` : 'Tap refresh to detect location'}
            </div>
          </div>
          <button onClick={captureGPS} disabled={locating} className="btn-icon">
            <RefreshCw size={14} className={locating ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Simulator toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface-subtle)', padding: '8px 12px',
          borderRadius: 'var(--r-sm)', border: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Compass size={12} color="var(--primary)" /> Test Mode (Dadar West)
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

      {/* Step 3: Student Details */}
      <form onSubmit={handleSubmit} className="card">
        <label className="form-label" style={{ marginBottom: 14 }}>2 — STUDENT CREDENTIALS</label>

        {errorMsg && <div className="alert alert-error" style={{ marginBottom: 14, fontSize: 12 }}>{errorMsg}</div>}

        <div className="form-group">
          <label className="form-label">Roll Number *</label>
          <input className="app-input" type="text" required placeholder="e.g. TYIT-42"
            value={rollNumber} onChange={e => setRollNumber(e.target.value.toUpperCase())} />
        </div>
        <div className="form-group">
          <label className="form-label">Student Full Name *</label>
          <input className="app-input" type="text" required placeholder="e.g. Rahul Sharma"
            value={studentName} onChange={e => setStudentName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Class & Stream</label>
          <input className="app-input" type="text" placeholder="e.g. T.Y. B.Sc. IT (Sem 6)"
            value={classStream} onChange={e => setClassStream(e.target.value)} />
        </div>

        {/* PIN input */}
        <div className="form-group" style={{ marginBottom: 18 }}>
          <label className="form-label" style={{ color: 'var(--amber-text)' }}>4-DIGIT LIVE PIN (FROM BOARD)</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              maxLength={6}
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
            Ask your faculty to display the PIN on the board or projector.
          </div>
        </div>

        <button type="submit" className="btn-emerald" disabled={submitting || !selectedSession}>
          {submitting ? <><span className="spinner" /> Verifying…</> : <><CheckCircle2 size={15} /> Submit GPS Attendance</>}
        </button>
      </form>
    </div>
  );
}

/* ── Tab 2: Faculty Live Control ── */
function FacultyTab({ currentUser }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [myBookings,      setMyBookings]      = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeSession,   setActiveSession]   = useState(null);
  const [roster,          setRoster]          = useState([]);
  const [rosterSearch,    setRosterSearch]    = useState('');
  const [secondsLeft,     setSecondsLeft]     = useState(0);
  const [projectorMode,   setProjectorMode]   = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [starting,        setStarting]        = useState(null);
  const [coords,          setCoords]          = useState(null);
  const [locating,        setLocating]        = useState(false);

  // For creating instant session
  const [showCreateModal, setShowCreateModal]   = useState(false);
  const [csEventName,     setCsEventName]       = useState('');
  const [csFacultyName,   setCsFacultyName]     = useState(() => currentUser?.name || localStorage.getItem('kirti_faculty_name') || '');
  const [csDeptName,      setCsDeptName]        = useState('Information Technology');
  const [csRoomName,      setCsRoomName]        = useState('Auditorium');
  const [csWindowMins,    setCsWindowMins]      = useState(15);
  const [csPin,           setCsPin]             = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [csSubmitting,    setCsSubmitting]       = useState(false);

  // Capture faculty GPS
  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => { captureGPS(); }, []);

  // Load today's bookings
  useEffect(() => {
    api.getTodaySessions(todayStr)
      .then(res => {
        const all = (res.sessions || []);
        setMyBookings(all);
        const open = all.find(s => s.attendanceStatus === 'OPEN');
        if (open && !activeSession) {
          setActiveSession(open);
          const end = new Date(open.attendanceWindowEnd);
          const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
          setSecondsLeft(diff);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBookings(false));
  }, [todayStr]);

  // Countdown timer
  useEffect(() => {
    if (!activeSession || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [activeSession, secondsLeft]);

  // Poll roster
  useEffect(() => {
    if (!activeSession) return;
    const poll = async () => {
      try {
        const list = await api.getAttendanceRoster(activeSession.id);
        if (Array.isArray(list)) setRoster(list);
      } catch {}
    };
    poll();
    const t = setInterval(poll, 4000);
    return () => clearInterval(t);
  }, [activeSession]);

  const handleStartSession = async (booking, windowMins = 15, pinVal = '') => {
    setStarting(booking.id);
    try {
      const payload = {
        windowMins,
        latitude:  coords?.lat || null,
        longitude: coords?.lon || null,
        pin:       pinVal || null,
      };
      const res = await api.startAttendance(booking.id, payload);
      const updated = res.booking || res;
      setActiveSession({ ...booking, ...updated, attendanceStatus: 'OPEN' });
      const end = new Date(updated.attendanceWindowEnd || Date.now() + windowMins * 60000);
      setSecondsLeft(Math.max(0, Math.floor((end - Date.now()) / 1000)));
      showCustomToast('Session Started!', `Attendance open for ${windowMins} minutes`, 'success');
    } catch (err) {
      showCustomToast('Error', err.message, 'error');
    } finally { setStarting(null); }
  };

  const handleCreateInstantSession = async (e) => {
    e.preventDefault();
    if (!csEventName.trim() || !csFacultyName.trim()) {
      showCustomToast('Required fields missing', 'Event name and faculty name needed', 'warning');
      return;
    }
    setCsSubmitting(true);
    try {
      const res = await api.createInstantSession({
        eventName:      csEventName.trim(),
        facultyName:    csFacultyName.trim(),
        departmentName: csDeptName.trim(),
        roomName:       csRoomName.trim(),
        windowMins:     csWindowMins,
        pin:            csPin,
        latitude:       coords?.lat || null,
        longitude:      coords?.lon || null,
        attendees:      60,
        radius:         100,
      });
      setShowCreateModal(false);
      const sess = res.booking || res;
      setActiveSession(sess);
      setSecondsLeft(csWindowMins * 60);
      showCustomToast('Instant Session Created!', `PIN: ${csPin} • Share URL with students`, 'success');
    } catch (err) {
      showCustomToast('Failed', err.message, 'error');
    } finally { setCsSubmitting(false); }
  };

  const handleStopSession = async () => {
    if (!activeSession) return;
    try {
      await api.stopAttendance(activeSession.id);
      setActiveSession(null);
      setRoster([]);
      setSecondsLeft(0);
      showCustomToast('Session Closed', 'Attendance window has been closed', 'info');
    } catch (err) {
      showCustomToast('Error', err.message, 'error');
    }
  };

  const shareUrl = activeSession ? buildAttendanceUrl(activeSession.id) : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      showCustomToast('URL Copied!', 'Share with students to mark attendance', 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredRoster = roster.filter(r =>
    !rosterSearch || r.studentName?.toLowerCase().includes(rosterSearch.toLowerCase()) || r.rollNumber?.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  const PIN = activeSession?.sessionPin || csPin;

  return (
    <div className="animate-fade-in">
      {/* Projector / Fullscreen QR Mode */}
      {projectorMode && activeSession && (
        <div style={{
          position: 'fixed', inset: 0, background: '#0F172A',
          zIndex: 200, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <button onClick={() => setProjectorMode(false)} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8, padding: '6px 10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
          }}>
            <Minimize2 size={14} /> Exit
          </button>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', letterSpacing: 1, marginBottom: 10 }}>SCAN TO MARK ATTENDANCE</div>
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 20, marginBottom: 20 }}>
            <QRCodeSVG value={shareUrl} size={220} level="M" />
          </div>
          <div style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 900, letterSpacing: 2, marginBottom: 8 }}>
            {activeSession.eventName}
          </div>
          <div style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>{activeSession.facultyName}</div>
          {PIN && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', alignSelf: 'center' }}>PIN:</div>
              {PIN.split('').map((d, i) => (
                <div key={i} className="pin-digit-box">{d}</div>
              ))}
            </div>
          )}
          <div className="countdown-badge" style={{ fontSize: 20 }}>
            <Clock size={18} /> {formatCountdown(secondsLeft)}
          </div>
          <div style={{ marginTop: 20, color: '#475569', fontSize: 12, textAlign: 'center', maxWidth: 280 }}>{shareUrl}</div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} color="#10B981" />
            <span style={{ color: '#10B981', fontWeight: 800, fontSize: 16 }}>{roster.length}</span>
            <span style={{ color: '#64748B', fontSize: 13 }}>checked in</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-eyebrow"><Radio size={11} /> Faculty Control</div>
        <h2 className="section-title">Live Attendance</h2>
        <p className="section-subtitle">Start a session, share the URL/QR with students</p>
      </div>

      {/* GPS Status */}
      <div className="card" style={{ marginBottom: 14, padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: coords ? 'var(--secondary-light)' : 'var(--surface-subtle)',
            border: `1px solid ${coords ? 'var(--secondary-border)' : 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Navigation size={16} color={coords ? 'var(--secondary-dark)' : 'var(--text-muted)'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
              {locating ? 'Capturing location…' : coords ? 'Location captured' : 'Location not set'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {coords ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}` : 'Used for student geofence anchor'}
            </div>
          </div>
          <button onClick={captureGPS} className="btn-icon" disabled={locating}>
            <RefreshCw size={13} className={locating ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Active Session Panel */}
      {activeSession ? (
        <div>
          {/* Session info card */}
          <div style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
            borderRadius: 'var(--r-xl)', padding: '18px', marginBottom: 14,
            color: '#FFFFFF', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5, marginBottom: 4 }}>LIVE SESSION</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1.3 }}>{activeSession.eventName}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{activeSession.facultyName}</div>
              </div>
              <div className="countdown-badge" style={{ flexShrink: 0 }}>
                <Clock size={12} /> {formatCountdown(secondsLeft)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', fontSize: 10 }}>
                <Users size={10} /> {roster.length} Present
              </span>
              {PIN && <span className="badge badge-amber" style={{ fontSize: 10 }}>PIN: {PIN}</span>}
            </div>
          </div>

          {/* Share URL Section */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Share2 size={13} color="var(--primary)" /> Student Attendance URL
            </div>
            <div className="copy-box" style={{ marginBottom: 10 }}>
              <span className="copy-box-text">{shareUrl}</span>
              <button onClick={handleCopyUrl} className="btn-icon" style={{ width: 30, height: 30 }}>
                {copied ? <CheckCircle2 size={14} color="var(--secondary-dark)" /> : <Copy size={14} />}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setProjectorMode(true)} className="btn-secondary" style={{ flex: 1, padding: '10px 12px', fontSize: 12 }}>
                <Maximize2 size={13} /> Projector QR
              </button>
              <button onClick={handleCopyUrl} className={copied ? 'btn-secondary' : 'btn-primary'} style={{ flex: 1, padding: '10px 12px', fontSize: 12 }}>
                {copied ? <><CheckCircle2 size={13} /> Copied!</> : <><Copy size={13} /> Copy URL</>}
              </button>
            </div>
            {/* QR Preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14, padding: '14px', background: 'var(--surface-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div style={{ background: '#fff', padding: 8, borderRadius: 8 }}>
                <QRCodeSVG value={shareUrl} size={100} level="M" />
              </div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Students scan this QR or open the URL to mark attendance on the website
            </div>
          </div>

          {/* PIN Display */}
          {PIN && (
            <div className="card" style={{ marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber-text)', letterSpacing: 0.5, marginBottom: 12 }}>
                🔑 LIVE SESSION PIN — DISPLAY ON BOARD
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                {PIN.split('').map((d, i) => (
                  <div key={i} className="pin-digit-box">{d}</div>
                ))}
              </div>
            </div>
          )}

          {/* Live Roster */}
          <div className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={14} color="var(--primary)" />
                Live Roster
                <span className="badge badge-emerald" style={{ fontSize: 10 }}>{roster.length} present</span>
              </div>
              <button onClick={() => exportAttendanceCSV(roster, activeSession.eventName)} className="btn-icon" title="Export CSV">
                <Download size={14} />
              </button>
            </div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input className="app-input" type="text" placeholder="Search students…" value={rosterSearch}
                onChange={e => setRosterSearch(e.target.value)} style={{ paddingLeft: 36, fontSize: 13 }} />
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            {filteredRoster.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px 16px' }}>
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title" style={{ fontSize: 13 }}>No attendees yet</div>
                <div className="empty-state-desc" style={{ fontSize: 11 }}>Waiting for students to check in…</div>
              </div>
            ) : (
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {filteredRoster.map((r, i) => (
                  <div key={r.id || i} className="roster-row">
                    <div className="roster-avatar">{(r.studentName || 'S')[0].toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">{r.studentName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        {r.rollNumber} • {r.classStream || '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <span className="badge badge-emerald" style={{ fontSize: 10 }}>✓ Present</span>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.distanceFromVenue}m</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stop Session */}
          <button
            onClick={handleStopSession}
            style={{
              width: '100%', padding: '12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--danger-border)', background: 'var(--danger-light)',
              color: 'var(--danger-dark)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <StopCircle size={15} /> End Attendance Session
          </button>
        </div>
      ) : (
        /* No active session — show today's bookings to start */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label className="form-label" style={{ margin: 0 }}>TODAY'S BOOKINGS</label>
            <button
              onClick={() => { setCsPin(Math.floor(1000 + Math.random() * 9000).toString()); setShowCreateModal(true); }}
              className="btn-ghost"
            >
              <Zap size={11} /> Create Instant Session
            </button>
          </div>

          {loadingBookings ? (
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div className="spinner-primary" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading sessions…</div>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="empty-state" style={{ padding: '20px 0' }}>
                <div className="empty-state-icon">📅</div>
                <div className="empty-state-title">No sessions today</div>
                <div className="empty-state-desc">Create an instant session for your class.</div>
              </div>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Zap size={14} /> Create Instant Session
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myBookings.map(b => (
                <div key={b.id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: b.attendanceStatus === 'OPEN' ? 'var(--secondary-light)' : 'var(--primary-light)',
                      border: `1px solid ${b.attendanceStatus === 'OPEN' ? 'var(--secondary-border)' : 'var(--primary-border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {b.attendanceStatus === 'OPEN' ? <Radio size={16} color="var(--secondary-dark)" /> : <Calendar size={16} color="var(--primary)" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">{b.eventName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        {b.facultyName} • {b.venueName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        {b.bookingDate} • {b.startTime} – {b.endTime}
                      </div>
                    </div>
                    <span className={`badge ${b.attendanceStatus === 'OPEN' ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: 10 }}>
                      {b.attendanceStatus === 'OPEN' ? '● LIVE' : b.status || 'Confirmed'}
                    </span>
                  </div>

                  {b.attendanceStatus !== 'OPEN' && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        className="app-select"
                        style={{ flex: 1, fontSize: 12, padding: '7px 12px' }}
                        defaultValue={15}
                        onChange={e => b._windowMins = parseInt(e.target.value)}
                      >
                        <option value={10}>10 min</option>
                        <option value={15}>15 min</option>
                        <option value={20}>20 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                      </select>
                      <button
                        onClick={() => handleStartSession(b, b._windowMins || 15, '')}
                        disabled={starting === b.id}
                        className="btn-emerald"
                        style={{ flex: 1, padding: '9px 12px', fontSize: 12 }}
                      >
                        {starting === b.id ? <span className="spinner" /> : <Play size={13} />}
                        {starting === b.id ? 'Starting…' : 'Start Session'}
                      </button>
                    </div>
                  )}

                  {b.attendanceStatus === 'OPEN' && (
                    <button onClick={() => { setActiveSession(b); const end = new Date(b.attendanceWindowEnd); setSecondsLeft(Math.max(0, Math.floor((end - Date.now()) / 1000))); }} className="btn-emerald" style={{ padding: '9px', fontSize: 12 }}>
                      <Eye size={13} /> View Active Session
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Instant Session Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal-content">
            <div className="modal-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)' }}>Create Instant Session</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>For classes without a pre-booked event</div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateInstantSession}>
              <div className="form-group">
                <label className="form-label">Event / Lecture Name *</label>
                <input className="app-input" type="text" required placeholder="e.g. Applied Mathematics Lecture"
                  value={csEventName} onChange={e => setCsEventName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Faculty Name *</label>
                <input className="app-input" type="text" required value={csFacultyName} onChange={e => setCsFacultyName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="app-input" type="text" value={csDeptName} onChange={e => setCsDeptName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Room / Hall</label>
                <input className="app-input" type="text" value={csRoomName} onChange={e => setCsRoomName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label className="form-label">Window (min)</label>
                  <select className="app-select" value={csWindowMins} onChange={e => setCsWindowMins(Number(e.target.value))}>
                    {[10,15,20,30,45,60].map(m => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ color: 'var(--amber-text)' }}>Live PIN</label>
                  <div style={{ position: 'relative' }}>
                    <input className="app-input" type="text" value={csPin} maxLength={6}
                      onChange={e => setCsPin(e.target.value.replace(/\D/g, ''))}
                      style={{ letterSpacing: 4, fontWeight: 900, paddingRight: 36 }} />
                    <button type="button" onClick={() => setCsPin(Math.floor(1000 + Math.random() * 9000).toString())}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 16, fontWeight: 900 }}>
                      ⟳
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-emerald" disabled={csSubmitting}>
                {csSubmitting ? <><span className="spinner" /> Creating…</> : <><Zap size={14} /> Launch Session</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tab 3: Archive ── */
function ArchiveTab() {
  const [archiveList,  setArchiveList]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchQ,      setSearchQ]      = useState('');
  const [expandedId,   setExpandedId]   = useState(null);
  const [roster,       setRoster]       = useState({});
  const [loadingRoster, setLoadingRoster] = useState({});

  useEffect(() => {
    api.getArchive({ q: searchQ })
      .then(data => setArchiveList(data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchQ]);

  const loadRoster = async (bookingId) => {
    if (roster[bookingId]) { setExpandedId(expandedId === bookingId ? null : bookingId); return; }
    setLoadingRoster(p => ({ ...p, [bookingId]: true }));
    try {
      const list = await api.getArchiveRoster(bookingId);
      setRoster(p => ({ ...p, [bookingId]: Array.isArray(list) ? list : [] }));
      setExpandedId(bookingId);
    } catch {} finally { setLoadingRoster(p => ({ ...p, [bookingId]: false })); }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 16 }}>
        <div className="section-eyebrow"><Calendar size={11} /> Attendance Archive</div>
        <h2 className="section-title">Past Sessions</h2>
        <p className="section-subtitle">Browse attendance records from all events</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <input className="app-input" type="text" placeholder="Search events, faculty…"
          value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 36 }} />
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton card" style={{ height: 80 }} />)}
        </div>
      ) : archiveList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No records found</div>
          <div className="empty-state-desc">Past attendance records will appear here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {archiveList.map(item => {
            const isExpanded = expandedId === item.id;
            const itemRoster = roster[item.id] || [];
            return (
              <div key={item.id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: item.hasRecords ? 'var(--secondary-light)' : 'var(--surface-subtle)',
                    border: `1px solid ${item.hasRecords ? 'var(--secondary-border)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.hasRecords ? <CheckCircle2 size={18} color="var(--secondary-dark)" /> : <Calendar size={18} color="var(--text-muted)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">{item.eventName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {item.facultyName} • {item.venueName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {item.bookingDate}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                    <span className={`badge ${item.presentCount > 0 ? 'badge-emerald' : 'badge-slate'}`} style={{ fontSize: 10 }}>
                      {item.presentCount} Present
                    </span>
                    <button
                      onClick={() => loadRoster(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                    >
                      {loadingRoster[item.id] ? <span className="spinner-primary" style={{ width: 12, height: 12 }} /> : (isExpanded ? '▲' : <Eye size={12} />)}
                      {loadingRoster[item.id] ? '' : isExpanded ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)' }}>
                        ATTENDANCE ROSTER ({itemRoster.length})
                      </div>
                      <button onClick={() => exportAttendanceCSV(itemRoster, item.eventName)} className="btn-icon" style={{ width: 26, height: 26 }}>
                        <Download size={12} />
                      </button>
                    </div>
                    {itemRoster.length === 0 ? (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No attendance records</div>
                    ) : (
                      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                        {itemRoster.map((r, i) => (
                          <div key={r.id || i} className="roster-row" style={{ paddingTop: 8, paddingBottom: 8 }}>
                            <div className="roster-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{(r.studentName||'S')[0]}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">{r.studentName}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.rollNumber} • {r.classStream}</div>
                            </div>
                            <span className="badge badge-emerald" style={{ fontSize: 10 }}>Present</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main Attendance Page ── */
export default function Attendance({ preselectedSession, currentUser, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'faculty');

  const TABS = [
    { id: 'faculty', label: 'Faculty Live' },
    { id: 'archive', label: 'Archive' },
  ];

  return (
    <div className="page-container">
      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'faculty' && <FacultyTab currentUser={currentUser} />}
      {activeTab === 'archive' && <ArchiveTab />}
    </div>
  );
}
