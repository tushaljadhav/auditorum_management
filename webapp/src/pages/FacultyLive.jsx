import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { QRCodeSVG } from 'qrcode.react';
import { showCustomToast } from '../utils/toast';
import {
  Radio, Users, Clock, MapPin,
  CheckCircle2, XCircle, Briefcase,
  RefreshCw, Wifi, WifiOff, Zap,
  Share2, Copy, Download, ExternalLink,
  Lock, KeyRound
} from 'lucide-react';

function sanitizeIndianMobile(val) {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length > 10) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

function isValidEmail(val) {
  if (!val) return false;
  const str = String(val).trim().toLowerCase();
  const regex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,12}$/;
  if (!regex.test(str)) return false;
  if (str.includes('..')) return false;
  const [local, domain] = str.split('@');
  if (!local || !domain) return false;
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-') || domain.endsWith('-')) return false;
  return true;
}

export default function FacultyLive({ currentUser, onOpenAuth }) {
  const [eventName, setEventName] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [departmentName, setDepartmentName] = useState(() => currentUser?.departmentName || currentUser?.departmentId || localStorage.getItem('kirti_faculty_dept') || 'Information Technology');
  const [classYear, setClassYear] = useState(() => localStorage.getItem('kirti_faculty_class') || '');
  const [email, setEmail] = useState(() => currentUser?.email || localStorage.getItem('kirti_faculty_email') || '');
  const [phone, setPhone] = useState(() => sanitizeIndianMobile(currentUser?.mobile || currentUser?.phone || localStorage.getItem('kirti_faculty_phone') || ''));
  const [roomName, setRoomName] = useState('Auditorium Complex');
  const [customRoom, setCustomRoom] = useState('');
  const [venueOptions, setVenueOptions] = useState([]);
  const [windowMins, setWindowMins] = useState(15);
  const [radius, setRadius] = useState(100);
  const [customPin, setCustomPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [attendeeRoster, setAttendeeRoster] = useState([]);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Load venues for dropdown
  useEffect(() => {
    api.getVenues()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVenueOptions(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'faculty') {
      if (currentUser.name) setFacultyName(currentUser.name);
      if (currentUser.departmentName || currentUser.departmentId) setDepartmentName(currentUser.departmentName || currentUser.departmentId);
      if (currentUser.email) setEmail(currentUser.email);
      if (currentUser.mobile || currentUser.phone) setPhone(sanitizeIndianMobile(currentUser.mobile || currentUser.phone));
    } else {
      const savedName = localStorage.getItem('kirti_faculty_name');
      if (savedName) setFacultyName(savedName);
      const savedDept = localStorage.getItem('kirti_faculty_dept');
      if (savedDept) setDepartmentName(savedDept);
      const savedClass = localStorage.getItem('kirti_faculty_class');
      if (savedClass) setClassYear(savedClass);
      const savedEmail = localStorage.getItem('kirti_faculty_email');
      if (savedEmail) setEmail(savedEmail);
      const savedPhone = localStorage.getItem('kirti_faculty_phone');
      if (savedPhone) setPhone(sanitizeIndianMobile(savedPhone));
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

  const handleCopyPin = (pinToCopy) => {
    const p = pinToCopy || customPin;
    if (!p) return;
    if (copiedPin) return; // Prevent spam on repeated clicks
    navigator.clipboard.writeText(p).then(() => {
      setCopiedPin(true);
      showCustomToast('PIN Copied!', `PIN: ${p} copied to clipboard`, 'success');
      setTimeout(() => setCopiedPin(false), 2000);
    }).catch(() => {
      showCustomToast('PIN', `Your PIN is ${p}`, 'info');
    });
  };

  const handleStartSession = async (e) => {
    e.preventDefault();

    if (!eventName.trim()) {
      showCustomToast('Required Field', 'Please enter lecture / event title.', 'warning');
      return;
    }
    if (!facultyName.trim()) {
      showCustomToast('Required Field', 'Please enter faculty coordinator name.', 'warning');
      return;
    }
    if (!departmentName.trim()) {
      showCustomToast('Required Field', 'Please enter department name.', 'warning');
      return;
    }
    if (!classYear.trim()) {
      showCustomToast('Required Field', 'Please enter class and year.', 'warning');
      return;
    }

    // Email validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      showCustomToast('Email Required', 'Please enter your email address.', 'warning');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      showCustomToast('Invalid Email', 'Please enter a valid email address with domain (e.g. name@kirti.edu.in).', 'warning');
      return;
    }

    // Phone validation (Strict 10-digit Indian mobile)
    const cleanPhone = sanitizeIndianMobile(phone);
    if (!cleanPhone) {
      showCustomToast('Phone Required', 'Please enter your mobile phone number.', 'warning');
      return;
    }
    if (cleanPhone.length !== 10) {
      showCustomToast('Invalid Phone', `Mobile number must be exactly 10 digits (currently ${cleanPhone.length} digits).`, 'warning');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      showCustomToast('Invalid Mobile Number', 'Mobile number must start with 6, 7, 8, or 9.', 'warning');
      return;
    }

    localStorage.setItem('kirti_faculty_name', facultyName.trim());
    localStorage.setItem('kirti_faculty_dept', departmentName.trim());
    localStorage.setItem('kirti_faculty_class', classYear.trim());
    localStorage.setItem('kirti_faculty_email', trimmedEmail);
    localStorage.setItem('kirti_faculty_phone', cleanPhone);

    setCreating(true);
    try {
      let finalPin = customPin ? String(customPin).trim() : '';
      if (!finalPin || finalPin.length < 4) {
        finalPin = Math.floor(1000 + Math.random() * 9000).toString();
        setCustomPin(finalPin);
      }

      const finalRoom = roomName === 'Other' ? (customRoom.trim() || 'Custom Room') : (roomName.trim() || 'Auditorium Complex');

      const payload = {
        eventName: eventName.trim(),
        facultyName: facultyName.trim(),
        departmentName: departmentName.trim(),
        classYear: classYear.trim(),
        email: trimmedEmail,
        phone: cleanPhone,
        roomName: finalRoom,
        windowMins: Number(windowMins),
        radius: Number(radius),
        pin: finalPin,
        latitude: coords?.lat || null,
        longitude: coords?.lon || null,
        attendees: 60,
      };
      const result = await api.createInstantSession(payload);
      setActiveSession(result);
      setSecondsRemaining(Number(windowMins) * 60);
      setAttendeeRoster([]);
      showCustomToast('Broadcast Live!', `Session started with PIN: ${result.sessionPin || finalPin}`, 'success');
    } catch (err) {
      showCustomToast('Broadcast Failed', err.message || 'Failed to start live session.', 'error');
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

  const handleCopyLink = (url) => {
    if (copiedLink) return; // Prevent spam on repeated clicks
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      showCustomToast('Link Copied!', 'Student check-in link copied to clipboard.', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch(() => {
      showCustomToast('Copy Failed', 'Please copy manually from the box.', 'warning');
    });
  };

  const handleShareLink = async (url) => {
    const shareData = {
      title: `${activeSession.eventName} Attendance Check-In`,
      text: `Please mark your attendance for "${activeSession.eventName}". PIN: ${activeSession.sessionPin}`,
      url: url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    const waText = encodeURIComponent(
      `🎓 *Kirti College Attendance Check-In*\n` +
      `📌 *Event:* ${activeSession.eventName}\n` +
      `🔑 *PIN:* ${activeSession.sessionPin}\n` +
      `🔗 *Check-In Link:* ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
  };

  const handleShareOrDownloadQR = () => {
    try {
      const svg = document.getElementById('faculty-live-qr-svg');
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 20, 20, 360, 360);
        URL.revokeObjectURL(blobUrl);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `attendance-qr-${activeSession.sessionPin || 'code'}.png`, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: `${activeSession.eventName} Attendance QR`,
                text: `Scan QR code or use PIN ${activeSession.sessionPin} to mark attendance for ${activeSession.eventName}`,
              });
              return;
            } catch (e) {
              if (e.name === 'AbortError') return;
            }
          }

          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = `Attendance_QR_${activeSession.sessionPin || 'code'}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showCustomToast('QR Downloaded!', 'QR image saved to your device.', 'success');
        }, 'image/png');
      };
      img.src = blobUrl;
    } catch (err) {
      showCustomToast('QR Export Error', err.message || 'Could not export QR', 'error');
    }
  };

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
              Student Live PIN (Click to Copy)
            </div>
            <div
              className="pin-display"
              onClick={() => handleCopyPin(activeSession.sessionPin)}
              title="Click to copy PIN"
              style={{ cursor: 'pointer', userSelect: 'none', border: copiedPin ? '2px solid #10B981' : undefined }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: '#92400E', opacity: 0.7, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Share this PIN with students
              </div>
              <div className="pin-digits">{activeSession.sessionPin}</div>
              <div style={{ fontSize: 11, color: copiedPin ? '#059669' : '#78350F', marginTop: 6, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                {copiedPin ? <><CheckCircle2 size={13} color="#059669" /> PIN copied to clipboard!</> : <><Copy size={12} /> Tap to copy PIN</>}
              </div>
            </div>
          </div>

          {/* QR Code & Direct Student Check-in Link Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '18px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: 16,
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center',
          }}>
            {/* QR SVG */}
            <div style={{
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              marginBottom: 10,
            }}>
              <QRCodeSVG id="faculty-live-qr-svg" value={studentCheckInUrl} size={140} level="M" />
            </div>

            <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: 0.2 }}>
              SCAN TO AUTO-OPEN CHECK-IN
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, marginBottom: 12 }}>
              Opens on student device automatically
            </div>

            {/* Share / Save QR button */}
            <button
              type="button"
              onClick={handleShareOrDownloadQR}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--primary-border)',
                background: 'var(--primary-light)',
                color: 'var(--primary-deeper)',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: 16,
              }}
            >
              <Share2 size={13} /> Share / Save QR Image
            </button>

            {/* Divider */}
            <div style={{ width: '100%', height: 1, background: 'var(--border-light)', marginBottom: 14 }} />

            {/* Student Website Link */}
            <div style={{ width: '100%', textAlign: 'left', marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Direct Student Check-In Link
              </span>
            </div>

            {/* Link display & copy box */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              background: 'var(--surface-subtle)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              padding: '6px 8px 6px 12px',
              gap: 8,
              marginBottom: 12,
            }}>
              <span style={{
                fontSize: 11,
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                textAlign: 'left',
              }}>
                {studentCheckInUrl}
              </span>
              <button
                type="button"
                onClick={() => handleCopyLink(studentCheckInUrl)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: copiedLink ? '#DCFCE7' : '#FFFFFF',
                  color: copiedLink ? '#15803D' : 'var(--primary)',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: 'var(--shadow-xs)',
                  flexShrink: 0,
                }}
              >
                {copiedLink ? <><CheckCircle2 size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>

            {/* Share Link Buttons (Native Share & WhatsApp) */}
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => handleShareLink(studentCheckInUrl)}
                className="btn-primary"
                style={{
                  padding: '9px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  justifyContent: 'center',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <Share2 size={13} /> Share Link
              </button>

              <button
                type="button"
                onClick={() => {
                  const waText = encodeURIComponent(
                    `🎓 *Kirti College Attendance Check-In*\n` +
                    `📌 *Event:* ${activeSession.eventName}\n` +
                    `🔑 *PIN:* ${activeSession.sessionPin}\n` +
                    `🔗 *Check-In Link:* ${studentCheckInUrl}`
                  );
                  window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
                }}
                style={{
                  padding: '9px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 'var(--r-md)',
                  border: '1px solid #86EFAC',
                  background: '#ECFDF5',
                  color: '#15803D',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>💬 WhatsApp</span>
              </button>
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
              ? `${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)} • ${radius}m Geofence`
              : `Students must be within ${radius}m to check in`}
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
      <form onSubmit={handleStartSession} noValidate className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

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

        {/* Department & Class/Year */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div>
            <label className="field-label">Department *</label>
            <input
              type="text"
              required
              placeholder="e.g. Information Technology"
              value={departmentName}
              onChange={e => setDepartmentName(e.target.value)}
              className="app-input"
            />
          </div>
          <div>
            <label className="field-label">Class / Year *</label>
            <input
              type="text"
              required
              placeholder="e.g. T.Y. B.Sc. IT - Div A"
              value={classYear}
              onChange={e => setClassYear(e.target.value)}
              className="app-input"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div>
            <label className="field-label">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. faculty@kirti.edu.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="app-input"
            />
            {email && !isValidEmail(email) && (
              <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4, fontWeight: 500 }}>
                Please enter a valid email address (e.g. name@domain.com)
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label className="field-label" style={{ marginBottom: 0 }}>Phone / Mobile Number *</label>
              <span style={{ fontSize: 10, fontWeight: 700, color: phone.length === 10 ? '#059669' : 'var(--text-tertiary)' }}>
                {phone.length}/10 digits
              </span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute',
                left: 12,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                🇮🇳 +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                inputMode="numeric"
                placeholder="9876543210"
                value={phone}
                onChange={e => setPhone(sanitizeIndianMobile(e.target.value))}
                className="app-input"
                style={{ paddingLeft: 64 }}
              />
            </div>
            {phone && phone.length < 10 && (
              <div style={{ fontSize: 11, color: '#D97706', marginTop: 4, fontWeight: 500 }}>
                Enter 10-digit mobile number ({10 - phone.length} digits left)
              </div>
            )}
            {phone && phone.length === 10 && !/^[6-9]/.test(phone) && (
              <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4, fontWeight: 500 }}>
                Must start with 6, 7, 8, or 9
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="field-label">Room / Hall *</label>
          <select
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            className="app-input"
          >
            <optgroup label="Auditoriums & Halls">
              <option value="Auditorium Complex">Auditorium Complex</option>
              <option value="Main Kirti Auditorium">Main Kirti Auditorium</option>
              <option value="Mini Auditorium (AV Room)">Mini Auditorium (AV Room)</option>
              <option value="Seminar Hall A">Seminar Hall A</option>
              <option value="Seminar Hall B">Seminar Hall B</option>
              <option value="Conference Hall">Conference Hall</option>
            </optgroup>
            <optgroup label="Computer & Science Labs">
              <option value="Computer Lab 1">Computer Lab 1</option>
              <option value="IT Lab 2">IT Lab 2</option>
              <option value="Lab 3 (Advanced Computing)">Lab 3 (Advanced Computing)</option>
              <option value="Lab 4 (Systems & IoT)">Lab 4 (Systems & IoT)</option>
              <option value="Electronics Lab">Electronics Lab</option>
            </optgroup>
            <optgroup label="Classrooms">
              <option value="Room 101 (Ground Floor)">Room 101 (Ground Floor)</option>
              <option value="Room 201 (1st Floor)">Room 201 (1st Floor)</option>
              <option value="Room 202 (1st Floor)">Room 202 (1st Floor)</option>
              <option value="Room 301 (2nd Floor)">Room 301 (2nd Floor)</option>
              <option value="Room 302 (2nd Floor)">Room 302 (2nd Floor)</option>
              <option value="Room 401 (3rd Floor)">Room 401 (3rd Floor)</option>
              <option value="Room 402 (3rd Floor)">Room 402 (3rd Floor)</option>
            </optgroup>
            {venueOptions.filter(v => v.name && ![
              'Auditorium Complex', 'Main Kirti Auditorium', 'Mini Auditorium (AV Room)',
              'Seminar Hall A', 'Seminar Hall B', 'Conference Hall',
              'Computer Lab 1', 'IT Lab 2', 'Lab 3 (Advanced Computing)',
              'Lab 4 (Systems & IoT)', 'Electronics Lab',
              'Room 101 (Ground Floor)', 'Room 201 (1st Floor)', 'Room 202 (1st Floor)',
              'Room 301 (2nd Floor)', 'Room 302 (2nd Floor)', 'Room 401 (3rd Floor)', 'Room 402 (3rd Floor)'
            ].includes(v.name)).length > 0 && (
              <optgroup label="Campus Registered Venues">
                {venueOptions
                  .filter(v => v.name && ![
                    'Auditorium Complex', 'Main Kirti Auditorium', 'Mini Auditorium (AV Room)',
                    'Seminar Hall A', 'Seminar Hall B', 'Conference Hall',
                    'Computer Lab 1', 'IT Lab 2', 'Lab 3 (Advanced Computing)',
                    'Lab 4 (Systems & IoT)', 'Electronics Lab',
                    'Room 101 (Ground Floor)', 'Room 201 (1st Floor)', 'Room 202 (1st Floor)',
                    'Room 301 (2nd Floor)', 'Room 302 (2nd Floor)', 'Room 401 (3rd Floor)', 'Room 402 (3rd Floor)'
                  ].includes(v.name))
                  .map(v => (
                    <option key={v.id || v.name} value={v.name}>{v.name}</option>
                  ))}
              </optgroup>
            )}
            <optgroup label="Custom">
              <option value="Other">Other (Enter Custom Room)</option>
            </optgroup>
          </select>

          {roomName === 'Other' && (
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Physics Lab 2 / Chemistry Hall"
              value={customRoom}
              onChange={e => setCustomRoom(e.target.value)}
              className="app-input"
              style={{ marginTop: 8 }}
            />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
          <div>
            <label className="field-label">Geofence Radius (Meters)</label>
            <select
              value={radius}
              onChange={e => setRadius(Number(e.target.value))}
              className="app-input"
            >
              <option value={25}>25 Meters (Classroom / Lab)</option>
              <option value={50}>50 Meters (Small Hall / Wing)</option>
              <option value={100}>100 Meters (Standard / Floor)</option>
              <option value={150}>150 Meters (Auditorium Complex)</option>
              <option value={200}>200 Meters (Entire Block)</option>
              <option value={500}>500 Meters (Campus Wide)</option>
            </select>
          </div>
        </div>

        {/* 4-Digit Broadcast PIN - Locked, Non-Editable, Click-to-Copy */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label className="field-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={12} color="var(--primary)" />
              <span>4-Digit Broadcast PIN</span>
              <span style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 999,
                background: 'rgba(217, 119, 6, 0.12)',
                color: '#92400E',
                fontWeight: 700
              }}>
                Locked
              </span>
            </label>
            <button
              type="button"
              onClick={() => {
                const newPin = Math.floor(1000 + Math.random() * 9000).toString();
                setCustomPin(newPin);
                showCustomToast('PIN Regenerated', `New PIN: ${newPin}`, 'info');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 'var(--r-sm)',
              }}
              title="Generate a different 4-digit code"
            >
              <RefreshCw size={11} /> Regenerate
            </button>
          </div>

          <div
            className="pin-display"
            onClick={() => handleCopyPin(customPin)}
            title="Click to copy PIN"
            style={{
              padding: '16px 20px',
              cursor: 'pointer',
              userSelect: 'none',
              border: copiedPin ? '2px solid #10B981' : '1.5px solid rgba(245, 158, 11, 0.35)',
              background: copiedPin ? 'rgba(16, 185, 129, 0.08)' : 'linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.3) 100%)',
              borderRadius: 'var(--r-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#92400E',
              opacity: 0.8,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 4
            }}>
              Student Attendance PIN
            </div>
            <div style={{
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: '12px',
              color: '#92400E',
              lineHeight: 1.1,
              fontFamily: 'monospace, var(--font-main)',
            }}>
              {customPin}
            </div>
            <div style={{
              fontSize: 11,
              color: copiedPin ? '#059669' : '#78350F',
              marginTop: 6,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              {copiedPin ? (
                <><CheckCircle2 size={13} color="#059669" /> PIN copied to clipboard!</>
              ) : (
                <><Copy size={12} /> Tap PIN to copy</>
              )}
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, textAlign: 'center' }}>
            🔒 Locked 4-digit PIN. Tap anytime to copy. Matches identically when live broadcast starts.
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
