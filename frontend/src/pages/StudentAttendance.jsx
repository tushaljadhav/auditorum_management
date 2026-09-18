import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { QRCodeSVG } from 'qrcode.react';
import { downloadOfficialAttendancePDF } from '../utils/pdfHeader';
import { showCustomToast } from '../utils/toast';
import { exportToExcel } from '../utils/excelExport';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Navigation, 
  Compass, 
  Check, 
  AlertCircle, 
  Shield, 
  Search, 
  Download, 
  ArrowLeft, 
  Users, 
  Copy, 
  Share2, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2,
  KeyRound,
  FileText,
  HelpCircle,
  X,
  Building2,
  Filter,
  Eye,
  CheckCircle2,
  Layers,
  Flame,
  Radio,
  PlusCircle
} from 'lucide-react';

export default function StudentAttendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlBookingId = searchParams.get('bookingId') || '';
  const urlTab = searchParams.get('tab') || '';

  // Main navigation tab: 'student' | 'faculty' | 'archive'
  const [activeTab, setActiveTab] = useState(urlBookingId ? 'student' : (urlTab || 'student'));

  // ── Tab 1: Student Check-In State ──
  const [selectedBookingId, setSelectedBookingId] = useState(urlBookingId);
  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [markedRecord, setMarkedRecord] = useState(null);

  // Student Profile (auto-saved to localStorage)
  const [studentName, setStudentName] = useState(() => {
    try {
      const saved = localStorage.getItem('kirti_student_profile');
      return saved ? JSON.parse(saved).studentName || '' : '';
    } catch (e) { return ''; }
  });
  const [rollNumber, setRollNumber] = useState(() => {
    try {
      const saved = localStorage.getItem('kirti_student_profile');
      return saved ? JSON.parse(saved).rollNumber || '' : '';
    } catch (e) { return ''; }
  });
  const [classStream, setClassStream] = useState(() => {
    try {
      const saved = localStorage.getItem('kirti_student_profile');
      return saved ? JSON.parse(saved).classStream || '' : '';
    } catch (e) { return ''; }
  });
  const [studentPin, setStudentPin] = useState('');

  // Student GPS state
  const [studentCoords, setStudentCoords] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(0);
  const [calculatedDistance, setCalculatedDistance] = useState(null);
  const [isInRange, setIsInRange] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const [simulateGps, setSimulateGps] = useState(false);
  const [gpsHelpModalOpen, setGpsHelpModalOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState('android');
  const [studentTimeLeftStr, setStudentTimeLeftStr] = useState('');

  // ── Tab 2: Faculty Session Control State ──
  const [todaySessions, setTodaySessions] = useState([]);
  const [loadingTodaySessions, setLoadingTodaySessions] = useState(false);
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [facultyFilterDate, setFacultyFilterDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [activeFacultyBooking, setActiveFacultyBooking] = useState(null);
  const [facultyRoster, setFacultyRoster] = useState([]);
  const [facultyRosterPage, setFacultyRosterPage] = useState(1);
  const [facultyRosterSearch, setFacultyRosterSearch] = useState('');
  const [sessionWindowMins, setSessionWindowMins] = useState(15);
  const [customPinInput, setCustomPinInput] = useState('');
  const [startingSessionId, setStartingSessionId] = useState(null);
  const [facultyCountdownStr, setFacultyCountdownStr] = useState('');
  const [projectorModalOpen, setProjectorModalOpen] = useState(false);

  // ── Create Live Session Modal State ──
  const [createSessionModalOpen, setCreateSessionModalOpen] = useState(false);
  const [csForm, setCsForm] = useState({
    facultyName: (() => { try { const s = localStorage.getItem('kirti_faculty_profile'); return s ? JSON.parse(s).facultyName || '' : ''; } catch(e){ return ''; } })(),
    departmentName: (() => { try { const s = localStorage.getItem('kirti_faculty_profile'); return s ? JSON.parse(s).departmentName || 'Information Technology' : 'Information Technology'; } catch(e){ return 'Information Technology'; } })(),
    eventName: '',
    classYear: '',
    roomName: '',
    radius: 100,
    windowMins: 15,
    attendees: 60,
    pin: ''
  });
  const [csGpsStatus, setCsGpsStatus] = useState('');
  const [csGpsCoords, setCsGpsCoords] = useState(null);
  const [csGpsAccuracy, setCsGpsAccuracy] = useState(null);
  const [csSubmitting, setCsSubmitting] = useState(false);

  // ── Tab 3: Permanent Archive State ──
  const [archiveList, setArchiveList] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archiveDateFrom, setArchiveDateFrom] = useState('');
  const [archiveDateTo, setArchiveDateTo] = useState('');
  const [archivePage, setArchivePage] = useState(1);
  const [archiveRosterModalBooking, setArchiveRosterModalBooking] = useState(null);
  const [archiveRosterList, setArchiveRosterList] = useState([]);
  const [loadingArchiveRoster, setLoadingArchiveRoster] = useState(false);

  // Helper: Haversine distance in meters
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ── Save Student Profile to LocalStorage ──
  const saveStudentProfile = (name, roll, cls) => {
    try {
      localStorage.setItem(
        'kirti_student_profile',
        JSON.stringify({ studentName: name, rollNumber: roll, classStream: cls })
      );
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  // ── Sync URL bookingId ──
  useEffect(() => {
    if (urlBookingId) {
      setSelectedBookingId(urlBookingId);
      setActiveTab('student');
      fetchBookingDetails(urlBookingId);
    }
  }, [urlBookingId]);

  // ── Fetch single booking details for Student Check-In ──
  const fetchBookingDetails = async (id) => {
    if (!id) return;
    setLoadingBooking(true);
    setBooking(null);
    setMarkedRecord(null);
    setStudentCoords(null);
    setCalculatedDistance(null);
    setIsInRange(false);
    setGpsErrorMsg('');
    setGpsStatus('');

    try {
      const res = await fetch(`/api/bookings/${id.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
      } else {
        setBooking(null);
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setBooking(null);
    } finally {
      setLoadingBooking(false);
    }
  };

  // ── Fetch Today's Sessions for Faculty Hub ──
  const fetchTodaySessions = async () => {
    setLoadingTodaySessions(true);
    try {
      let url = `/api/attendance/today-sessions?date=${facultyFilterDate}`;
      if (facultySearchQuery.trim()) {
        url += `&q=${encodeURIComponent(facultySearchQuery.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTodaySessions(data.sessions || []);

        // If currently selected active faculty booking exists, refresh it
        if (activeFacultyBooking) {
          const refreshed = (data.sessions || []).find((s) => s.id === activeFacultyBooking.id);
          if (refreshed) {
            setActiveFacultyBooking(refreshed);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching today sessions:', err);
    } finally {
      setLoadingTodaySessions(false);
    }
  };

  // Auto-fetch sessions when tab or filter changes
  useEffect(() => {
    if (activeTab === 'faculty') {
      fetchTodaySessions();
      const interval = setInterval(fetchTodaySessions, 6000);
      return () => clearInterval(interval);
    }
  }, [activeTab, facultyFilterDate, facultySearchQuery]);

  // ── Fetch Faculty Roster for Active Session ──
  const fetchFacultyRoster = async (bookingId) => {
    if (!bookingId) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setFacultyRoster(data);
      }
    } catch (err) {
      console.error('Error fetching attendance roster:', err);
    }
  };

  // Polling roster for active open session
  useEffect(() => {
    let interval = null;
    if (activeFacultyBooking && activeFacultyBooking.attendanceStatus === 'OPEN') {
      fetchFacultyRoster(activeFacultyBooking.id);
      interval = setInterval(() => {
        fetchFacultyRoster(activeFacultyBooking.id);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeFacultyBooking]);

  // ── Countdown Timer for Student View ──
  useEffect(() => {
    let timer = null;
    const updateCountdown = () => {
      if (!booking || !booking.attendanceWindowEnd || booking.attendanceStatus !== 'OPEN') {
        setStudentTimeLeftStr('');
        return;
      }
      const now = new Date();
      const end = new Date(booking.attendanceWindowEnd);
      const diff = end - now;
      if (diff <= 0) {
        setStudentTimeLeftStr('Session Closed');
        setBooking((prev) => (prev ? { ...prev, attendanceStatus: 'CLOSED' } : null));
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setStudentTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    if (booking && booking.attendanceStatus === 'OPEN') {
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    } else {
      setStudentTimeLeftStr('');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [booking]);

  // ── Countdown Timer for Faculty View ──
  useEffect(() => {
    let timer = null;
    const updateCountdown = () => {
      if (!activeFacultyBooking || !activeFacultyBooking.attendanceWindowEnd || activeFacultyBooking.attendanceStatus !== 'OPEN') {
        setFacultyCountdownStr('');
        return;
      }
      const now = new Date();
      const end = new Date(activeFacultyBooking.attendanceWindowEnd);
      const diff = end - now;
      if (diff <= 0) {
        setFacultyCountdownStr('Session Ended');
        setActiveFacultyBooking((prev) => (prev ? { ...prev, attendanceStatus: 'CLOSED' } : null));
        fetchTodaySessions();
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setFacultyCountdownStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    if (activeFacultyBooking && activeFacultyBooking.attendanceStatus === 'OPEN') {
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    } else {
      setFacultyCountdownStr('');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeFacultyBooking]);

  // ── Detect Live Student GPS Location ──
  const detectStudentLocation = () => {
    setGpsErrorMsg('');
    setGpsStatus('Acquiring high-accuracy GPS signal...');
    setGpsAccuracy(0);

    if (simulateGps) {
      if (booking) {
        const anchorLat = Number(booking.sessionLatitude || booking.venueLatitude || 19.0269);
        const anchorLon = Number(booking.sessionLongitude || booking.venueLongitude || 72.8422);
        setStudentCoords({ latitude: anchorLat, longitude: anchorLon });
        setCalculatedDistance(4.5);
        setIsInRange(true);
        setGpsAccuracy(3);
        setGpsStatus('');
        showCustomToast('Campus GPS Simulated!', 'Matched within 5m of classroom anchor', 'success');
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsErrorMsg('Geolocation is not supported on this browser.');
      setGpsStatus('');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = pos.coords.accuracy || 0;
        setStudentCoords({ latitude: lat, longitude: lon });
        setGpsAccuracy(acc);

        // Determine anchor coordinates (Faculty live GPS > Venue GPS)
        let anchorLat = booking?.sessionLatitude ? Number(booking.sessionLatitude) : null;
        let anchorLon = booking?.sessionLongitude ? Number(booking.sessionLongitude) : null;

        if (!anchorLat || !anchorLon) {
          anchorLat = booking?.venueLatitude ? Number(booking.venueLatitude) : null;
          anchorLon = booking?.venueLongitude ? Number(booking.venueLongitude) : null;
        }

        if (anchorLat && anchorLon) {
          const dist = getDistanceMeters(lat, lon, anchorLat, anchorLon);
          setCalculatedDistance(dist);
          // 100m radius with 25m indoor drift allowance
          const allowedRadius = 100 + Math.min(acc, 25);
          const inBounds = dist <= allowedRadius;
          setIsInRange(inBounds);

          if (inBounds) {
            setGpsErrorMsg('');
            showCustomToast('Location Verified!', `Within ${Math.round(dist)}m of classroom`, 'success');
          } else {
            setGpsErrorMsg(
              `Proxy Alert: You are ${Math.round(dist)}m away. Check-in is restricted to within 100m of the classroom.`
            );
          }
        } else {
          // No anchor set
          setCalculatedDistance(0);
          setIsInRange(true);
        }
        setGpsStatus('');
      },
      (err) => {
        console.error('GPS error:', err);
        setGpsStatus('');
        let msg = 'Could not acquire GPS position.';
        if (err.code === 1) {
          msg = 'GPS Permission Denied. Please enable location permissions in your browser.';
        } else if (err.code === 2) {
          msg = 'Location unavailable. Ensure device GPS / Location is turned ON.';
        } else if (err.code === 3) {
          msg = 'GPS request timed out. Please try again.';
        }
        setGpsErrorMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // ── Student Submit Attendance ──
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!booking) return;

    if (!studentName.trim() || !rollNumber.trim() || !classStream.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Student Details',
        text: 'Please enter your Full Name, Roll Number, and Class/Stream.',
        borderRadius: '16px'
      });
      return;
    }

    if (booking.sessionPin && !studentPin.trim()) {
      Swal.fire({
        icon: 'warning',
        title: '4-Digit PIN Required',
        text: 'Please enter the 4-digit PIN provided by your faculty.',
        borderRadius: '16px'
      });
      return;
    }

    // Auto-save profile for next time
    saveStudentProfile(studentName.trim(), rollNumber.trim(), classStream.trim());

    // Check GPS coords
    let finalLat = studentCoords?.latitude;
    let finalLon = studentCoords?.longitude;

    if (simulateGps && (!finalLat || !finalLon)) {
      finalLat = Number(booking.sessionLatitude || booking.venueLatitude || 19.0269);
      finalLon = Number(booking.sessionLongitude || booking.venueLongitude || 72.8422);
    }

    if (!finalLat || !finalLon) {
      // Prompt GPS first
      detectStudentLocation();
      Swal.fire({
        icon: 'info',
        title: 'Verifying GPS Presence...',
        text: 'Please allow GPS location access to confirm you are in the classroom.',
        borderRadius: '16px'
      });
      return;
    }

    setMarkingLoading(true);
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          rollNumber: rollNumber.trim(),
          studentName: studentName.trim(),
          classStream: classStream.trim(),
          pin: studentPin.trim(),
          latitude: finalLat,
          longitude: finalLon
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMarkedRecord(data.record);
        Swal.fire({
          icon: 'success',
          title: 'Attendance Confirmed! 🎉',
          text: `Verified for ${booking.eventName}. Roll No: ${rollNumber.trim().toUpperCase()}`,
          confirmButtonColor: '#10B981',
          borderRadius: '16px'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Attendance Rejected',
          text: data.error || 'Could not verify attendance.',
          confirmButtonColor: '#EF4444',
          borderRadius: '16px'
        });
      }
    } catch (err) {
      console.error('Error submitting attendance:', err);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Failed to communicate with server.',
        borderRadius: '16px'
      });
    } finally {
      setMarkingLoading(false);
    }
  };

  // ── Faculty Start Session (1-Click with Dynamic Live GPS) ──
  const handleFacultyStartSession = async (session) => {
    setStartingSessionId(session.id);

    // 1. Capture Faculty live GPS
    let facultyLat = null;
    let facultyLon = null;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
          });
        });
        facultyLat = pos.coords.latitude;
        facultyLon = pos.coords.longitude;
      } catch (e) {
        console.warn('Faculty GPS capture skipped/timed out, using venue coordinates:', e.message);
      }
    }

    // 2. Generate or use custom 4-digit PIN
    const sessionPin = customPinInput.trim() || Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const res = await fetch(`/api/bookings/${session.id}/start-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          windowMins: sessionWindowMins,
          latitude: facultyLat,
          longitude: facultyLon,
          pin: sessionPin
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setActiveFacultyBooking(updated);
        fetchTodaySessions();
        fetchFacultyRoster(updated.id);
        setCustomPinInput('');

        Swal.fire({
          icon: 'success',
          title: 'Session Started Live! 🚀',
          html: `
            <div style="font-size: 0.95rem; color: #334155; line-height: 1.6;">
              <div style="margin-bottom: 12px;">Dynamic 100m geofence anchored at your location.</div>
              <div style="background: #EFF6FF; border: 2px dashed #3B82F6; border-radius: 12px; padding: 14px; margin: 10px 0;">
                <div style="font-size: 0.75rem; font-weight: 800; color: #1D4ED8; letter-spacing: 0.05em; text-transform: uppercase;">4-Digit Student Attendance PIN</div>
                <div style="font-size: 2.2rem; font-weight: 900; color: #1E40AF; letter-spacing: 0.15em; font-family: monospace;">${updated.sessionPin || sessionPin}</div>
              </div>
              <div style="font-size: 0.8rem; color: #64748B;">Speak or write this PIN on the blackboard for students.</div>
            </div>
          `,
          confirmButtonColor: '#2563EB',
          confirmButtonText: 'Open Faculty Control Panel',
          borderRadius: '16px'
        });
      } else {
        const err = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Could Not Start Session',
          text: err.error || 'Server rejected start request.',
          borderRadius: '16px'
        });
      }
    } catch (err) {
      console.error('Error starting session:', err);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Failed to start session.',
        borderRadius: '16px'
      });
    } finally {
      setStartingSessionId(null);
    }
  };

  // ── Handle Create Instant Live Session ──
  const handleCreateInstantSession = async (e) => {
    e.preventDefault();
    if (!csForm.facultyName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Faculty Name Required', text: 'Please enter your full name.', borderRadius: '16px' });
      return;
    }
    if (!csForm.eventName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Event Title Required', text: 'Please enter the lecture / event title.', borderRadius: '16px' });
      return;
    }

    // Save faculty profile
    try { localStorage.setItem('kirti_faculty_profile', JSON.stringify({ facultyName: csForm.facultyName, departmentName: csForm.departmentName })); } catch(e){}

    setCsSubmitting(true);
    setCsGpsStatus('Capturing your GPS location for geofence anchor...');

    let facultyLat = null;
    let facultyLon = null;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
        });
        facultyLat = pos.coords.latitude;
        facultyLon = pos.coords.longitude;
        setCsGpsCoords({ latitude: facultyLat, longitude: facultyLon });
        setCsGpsAccuracy(Math.round(pos.coords.accuracy || 0));
        setCsGpsStatus('');
      } catch(e) {
        setCsGpsStatus('');
        console.warn('GPS capture skipped:', e.message);
      }
    } else {
      setCsGpsStatus('');
    }

    try {
      const sessionPin = csForm.pin.trim() || Math.floor(1000 + Math.random() * 9000).toString();
      const res = await fetch('/api/attendance/create-instant-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: csForm.eventName.trim(),
          facultyName: csForm.facultyName.trim(),
          departmentName: csForm.departmentName.trim(),
          classYear: csForm.classYear.trim(),
          roomName: csForm.roomName.trim(),
          radius: Number(csForm.radius || 100),
          windowMins: Number(csForm.windowMins || 15),
          attendees: Number(csForm.attendees || 60),
          pin: sessionPin,
          latitude: facultyLat,
          longitude: facultyLon
        })
      });

      if (res.ok) {
        const newSession = await res.json();
        setCreateSessionModalOpen(false);
        setActiveFacultyBooking(newSession);
        fetchTodaySessions();
        fetchFacultyRoster(newSession.id);
        setCsForm(prev => ({ ...prev, eventName: '', classYear: '', roomName: '', pin: '' }));

        Swal.fire({
          icon: 'success',
          title: 'Live Session Created! 🚀',
          html: `
            <div style="font-size:0.95rem; color:#334155; line-height:1.6;">
              <div style="margin-bottom:8px;">Dynamic <strong>${csForm.radius}m geofence</strong> anchored at your current location.</div>
              <div style="background:#EFF6FF; border:2px dashed #3B82F6; border-radius:12px; padding:14px; margin:10px 0;">
                <div style="font-size:0.75rem; font-weight:800; color:#1D4ED8; letter-spacing:0.05em; text-transform:uppercase;">4-Digit Student Attendance PIN</div>
                <div style="font-size:2.5rem; font-weight:900; color:#1E40AF; letter-spacing:0.2em; font-family:monospace;">${newSession.sessionPin}</div>
              </div>
              <div style="font-size:0.8rem; color:#64748B;">Write this PIN on the blackboard or share with students via WhatsApp.</div>
            </div>
          `,
          confirmButtonColor: '#2563EB',
          confirmButtonText: 'Open Faculty Control Panel',
          borderRadius: '16px'
        });
      } else {
        const err = await res.json();
        Swal.fire({ icon: 'error', title: 'Could Not Create Session', text: err.error || 'Server rejected request.', borderRadius: '16px' });
      }
    } catch (err) {
      console.error('Error creating session:', err);
      Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Failed to create session.', borderRadius: '16px' });
    } finally {
      setCsSubmitting(false);
    }
  };

  // ── Faculty Stop Session ──
  const handleFacultyStopSession = async (sessionId) => {
    const confirm = await Swal.fire({
      title: 'Close Attendance Session?',
      text: 'Students will no longer be able to submit attendance.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Close Session',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      borderRadius: '16px'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/bookings/${sessionId}/stop-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveFacultyBooking(null);
        fetchTodaySessions();
        showCustomToast('Session Closed', 'Attendance window locked successfully', 'info');
      }
    } catch (err) {
      console.error('Error stopping attendance:', err);
    }
  };

  // ── Export PDF & Excel Helpers ──
  const exportPDF = async (list, currentBooking) => {
    if (!list || list.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Student Records',
        text: 'There are no attendance records to export yet.',
        borderRadius: '16px'
      });
      return;
    }
    await downloadOfficialAttendancePDF(list, currentBooking);
    showCustomToast('Official PDF Downloaded!', 'NAAC formatted attendance sheet ready', 'success');
  };

  const exportExcel = (list, eventName) => {
    if (!list || list.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No Student Records',
        text: 'There are no attendance records to export yet.',
        borderRadius: '16px'
      });
      return;
    }
    const headers = ['Roll Number', 'Student Name', 'Class/Stream', 'Distance from Faculty', 'Status', 'Check-In Timestamp'];
    const rows = list.map((r) => [
      r.rollNumber || '—',
      r.studentName || '—',
      r.classStream || '—',
      `${r.distanceFromVenue || 0}m`,
      r.status || 'VERIFIED',
      new Date(r.checkInTime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    ]);

    const filename = `Attendance_${(eventName || 'Event').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`;
    exportToExcel(filename, 'Attendance Roster', headers, rows);
    showCustomToast('Excel Exported!', 'Spreadsheet downloaded with headers', 'success');
  };

  // ── Share on WhatsApp ──
  const shareWhatsApp = (session) => {
    const shareUrl = `${window.location.origin}/attendance?bookingId=${session.id}`;
    const text = `🎓 *KIRTI COLLEGE ATTENDANCE*\n\n📌 *Event:* ${session.eventName}\n📍 *Venue:* ${session.venueName || 'Auditorium / Hall'}\n🔑 *PIN:* ${session.sessionPin || 'None'}\n\n👉 Mark attendance here within 100m:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── Tab 3: Permanent Archive Fetching ──
  const fetchArchive = async () => {
    setLoadingArchive(true);
    try {
      let url = `/api/attendance/archive?`;
      if (archiveSearchQuery.trim()) url += `&q=${encodeURIComponent(archiveSearchQuery.trim())}`;
      if (archiveDateFrom) url += `&from=${archiveDateFrom}`;
      if (archiveDateTo) url += `&to=${archiveDateTo}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setArchiveList(data);
      }
    } catch (err) {
      console.error('Error fetching archive:', err);
    } finally {
      setLoadingArchive(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'archive') {
      fetchArchive();
    }
  }, [activeTab, archiveDateFrom, archiveDateTo]);

  // Open Archive Roster Modal
  const openArchiveRoster = async (session) => {
    setArchiveRosterModalBooking(session);
    setLoadingArchiveRoster(true);
    try {
      const res = await fetch(`/api/bookings/${session.id}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setArchiveRosterList(data);
      }
    } catch (e) {
      console.error('Error loading roster:', e);
    } finally {
      setLoadingArchiveRoster(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', position: 'relative' }}>
      
      {/* College Logo for PDF */}
      <img id="attendance-college-logo" src="/Logo.png" style={{ display: 'none' }} alt="college-logo" crossOrigin="anonymous" />
      
      {/* Decorative ambient gradients */}
      <div style={{ position: 'absolute', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 70%)', top: '-250px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', bottom: '0', right: '0', pointerEvents: 'none', zIndex: 0 }} />

      {/* Main Top Header */}
      <header style={{ zIndex: 10, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/Logo.png" alt="College Logo" style={{ height: '38px', objectFit: 'contain' }} />
          <div style={{ borderLeft: '1px solid #CBD5E1', paddingLeft: 12 }}>
            <span style={{ fontWeight: 800, color: '#1E40AF', fontSize: '1.02rem', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Radio size={16} className="text-blue-600 animate-pulse" /> UNIVERSAL ATTENDANCE HUB
            </span>
            <span style={{ fontSize: '0.73rem', color: '#64748B', display: 'block' }}>Kirti M. Doongursee College • Dynamic GPS & PIN Gate</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/admin/bookings')}
            style={{
              padding: '7px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#F8FAFC',
              color: '#334155', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}
          >
            <Shield size={14} style={{ color: '#2563EB' }} /> Admin Panel
          </button>
        </div>
      </header>

      {/* 3-Tab Segmented Switcher */}
      {!createSessionModalOpen && <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '10px 24px', display: 'flex', justifyContent: 'center', zIndex: 5 }}>
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '5px', borderRadius: 14, gap: 4, maxWidth: 900, width: '100%' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('student'); }}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none',
              background: activeTab === 'student' ? '#2563EB' : 'transparent',
              color: activeTab === 'student' ? '#FFFFFF' : '#475569',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'student' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            <User size={16} /> Student Check-In
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('faculty'); }}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none',
              background: activeTab === 'faculty' ? '#2563EB' : 'transparent',
              color: activeTab === 'faculty' ? '#FFFFFF' : '#475569',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'faculty' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            <Sparkles size={16} /> Faculty Live Session
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('archive'); }}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none',
              background: activeTab === 'archive' ? '#2563EB' : 'transparent',
              color: activeTab === 'archive' ? '#FFFFFF' : '#475569',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s ease',
              boxShadow: activeTab === 'archive' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            <FileText size={16} /> Lifetime Archive
          </button>
        </div>
      </div>}

      {/* Main App Content Area */}
      <main style={{ flex: 1, padding: '28px 24px 80px', maxWidth: activeTab === 'archive' ? 1300 : 1100, width: '100%', margin: '0 auto', zIndex: 1 }}>

        {/* =========================================================================
            TAB 1: STUDENT CHECK-IN
            ========================================================================= */}
        {activeTab === 'student' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {loadingBooking ? (
              <div className="tailux-card" style={{ padding: '60px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0' }}>
                <div className="premium-spinner mb-3" />
                <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>Loading Session Details...</div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 4 }}>Connecting to Dynamic Geofence Anchor</div>
              </div>
            ) : !booking ? (
              /* If no session is locked yet, show Quick Selector of Today's Live Sessions */
              <div className="tailux-card" style={{ padding: '32px 28px', background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 18, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <Navigation size={28} style={{ color: '#2563EB' }} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Student Attendance Gateway</h2>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>Select your ongoing lecture/event or paste your booking reference</p>
                </div>

                {/* Direct ID Input */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); if (selectedBookingId.trim()) fetchBookingDetails(selectedBookingId.trim()); }}
                  style={{ display: 'flex', gap: 8, marginBottom: 24 }}
                >
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                      type="text"
                      placeholder="Paste Session / Booking ID (e.g. booking_178...)"
                      value={selectedBookingId}
                      onChange={(e) => setSelectedBookingId(e.target.value)}
                      style={{
                        width: '100%', padding: '11px 14px 11px 40px', fontSize: '0.88rem', color: '#0F172A',
                        background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, outline: 'none',
                        fontWeight: 600, boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button 
                    type="submit"
                    style={{
                      padding: '11px 20px', borderRadius: 12, border: 'none',
                      background: '#2563EB', color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 700,
                      cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    Load Session
                  </button>
                </form>

                {/* Live Open Sessions Quick Buttons */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Flame size={14} style={{ color: '#EF4444' }} /> Currently Active Live Sessions
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {todaySessions.filter(s => s.attendanceStatus === 'OPEN').length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '0.85rem' }}>
                        No attendance sessions are currently OPEN right now. Ask your Faculty to start the session!
                      </div>
                    ) : (
                      todaySessions.filter(s => s.attendanceStatus === 'OPEN').map(s => (
                        <div 
                          key={s.id}
                          onClick={() => { setSelectedBookingId(s.id); fetchBookingDetails(s.id); }}
                          style={{
                            padding: '14px 18px', borderRadius: 14, border: '1.5px solid #86EFAC',
                            background: '#F0FDF4', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#16A34A'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#86EFAC'}
                        >
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{s.eventName}</div>
                            <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: 2, display: 'flex', gap: 10 }}>
                              <span>📍 {s.venueName}</span>
                              <span>👨‍🏫 {s.facultyName || s.coordinator}</span>
                            </div>
                          </div>
                          <span className="tailux-badge tailux-badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px', whiteSpace: 'nowrap' }}>
                            🟢 Check-In Now
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* Session Locked: Student Check-In Details */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                
                {/* Back Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setBooking(null); setSelectedBookingId(''); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                      borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569',
                      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    <ArrowLeft size={14} /> Choose Another Event
                  </button>
                  <span className={`tailux-badge ${booking.attendanceStatus === 'OPEN' ? 'tailux-badge-success' : 'tailux-badge-danger'}`} style={{ fontSize: '0.78rem', padding: '4px 12px' }}>
                    {booking.attendanceStatus === 'OPEN' ? '🟢 ATTENDANCE OPEN' : '🔴 SESSION CLOSED'}
                  </span>
                </div>

                {/* Event Card */}
                <div className="tailux-card" style={{ padding: '22px 24px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Official Classroom / Auditorium Session
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {booking.eventName}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12, marginTop: 14, fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                      <MapPin size={15} style={{ color: '#2563EB' }} />
                      <span><strong>{booking.venueName || 'Auditorium'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                      <Calendar size={15} style={{ color: '#D97706' }} />
                      <span>{booking.bookingDate} ({booking.startTime} - {booking.endTime})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                      <User size={15} style={{ color: '#16A34A' }} />
                      <span>{booking.facultyName || booking.coordinator || 'Faculty Coordinator'}</span>
                    </div>
                  </div>

                  {booking.attendanceStatus === 'OPEN' && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>
                        ⏳ Window closes at {new Date(booking.attendanceWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#DC2626', fontFamily: 'monospace' }}>
                        {studentTimeLeftStr || 'LIVE'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Session Closed Warning */}
                {booking.attendanceStatus !== 'OPEN' ? (
                  <div className="tailux-card" style={{ padding: '28px 24px', background: '#FEF2F2', borderRadius: 18, border: '1px solid #FECACA', textAlign: 'center' }}>
                    <AlertTriangle size={32} style={{ color: '#DC2626', margin: '0 auto 12px auto' }} />
                    <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#991B1B' }}>Attendance Window Is Closed</h4>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#7F1D1D' }}>
                      The faculty has not opened check-ins yet, or this window has expired. Please ask your Faculty Coordinator to launch the session.
                    </p>
                  </div>
                ) : markedRecord ? (
                  /* Confirmed Green Pass Card */
                  <div className="tailux-card" style={{ padding: '36px 28px', background: '#FFFFFF', borderRadius: 24, border: '2px solid #86EFAC', textAlign: 'center', boxShadow: '0 12px 40px rgba(16, 185, 129, 0.12)' }}>
                    <div style={{ width: 68, height: 68, borderRadius: 22, background: '#DCFCE7', border: '2px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                      <CheckCircle2 size={38} style={{ color: '#16A34A' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#16A34A', letterSpacing: '0.08em' }}>VERIFIED STUDENT PASS</div>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>Attendance Confirmed!</h3>
                    <p style={{ margin: '6px 0 24px 0', fontSize: '0.85rem', color: '#64748B' }}>Your presence in the classroom has been digitally certified.</p>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '18px 20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Student Name:</span>
                        <span style={{ fontWeight: 800, color: '#0F172A' }}>{markedRecord.studentName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Roll Number:</span>
                        <span style={{ fontWeight: 900, color: '#2563EB', fontFamily: 'monospace' }}>{markedRecord.rollNumber}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Class / Stream:</span>
                        <span style={{ fontWeight: 800, color: '#0F172A' }}>{markedRecord.classStream}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Geofence Distance:</span>
                        <span style={{ fontWeight: 800, color: '#16A34A' }}>🟢 {markedRecord.distanceFromVenue}m (Inside 100m Radius)</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}>
                        <span style={{ color: '#64748B', fontWeight: 600 }}>Verification Token:</span>
                        <span style={{ fontWeight: 700, color: '#64748B', fontFamily: 'monospace', fontSize: '0.78rem' }}>{markedRecord.id}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setMarkedRecord(null); setRollNumber(''); }}
                      style={{
                        marginTop: 20, padding: '10px 20px', borderRadius: 10, border: '1px solid #CBD5E1',
                        background: '#FFFFFF', color: '#475569', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      Mark Another Student
                    </button>
                  </div>
                ) : (
                  /* Student Check-In Form */
                  <div className="tailux-card" style={{ padding: '28px 24px', background: '#FFFFFF', borderRadius: 22, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>1-Tap Student Check-In</h4>
                    <p style={{ margin: '0 0 20px 0', fontSize: '0.82rem', color: '#64748B' }}>Your details are auto-remembered for instant check-in</p>

                    <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      
                      {/* 4-Digit Attendance PIN (Highlight) */}
                      {booking.sessionPin && (
                        <div style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 14, padding: '16px 18px' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#1E40AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            🔑 4-Digit Live Attendance PIN *
                          </label>
                          <input 
                            type="text"
                            required
                            maxLength={6}
                            placeholder="Enter 4-Digit PIN from Board"
                            value={studentPin}
                            onChange={(e) => setStudentPin(e.target.value)}
                            disabled={markingLoading}
                            style={{
                              width: '100%', padding: '12px 14px', fontSize: '1.2rem', color: '#1E40AF',
                              background: '#FFFFFF', border: '1px solid #93C5FD', borderRadius: 10, outline: 'none',
                              textAlign: 'center', fontWeight: 900, letterSpacing: '0.25em', fontFamily: 'monospace',
                              boxSizing: 'border-box'
                            }}
                          />
                          <div style={{ fontSize: '0.73rem', color: '#3B82F6', marginTop: 4, fontWeight: 600 }}>
                            Ask your faculty or check the blackboard for the 4-digit code.
                          </div>
                        </div>
                      )}

                      {/* Full Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Full Name *</label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            disabled={markingLoading}
                            style={{
                              width: '100%', padding: '10px 12px 10px 38px', fontSize: '0.88rem', color: '#0F172A',
                              background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 10, outline: 'none',
                              fontWeight: 600, boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* Class / Stream */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Class / Stream *</label>
                        <div style={{ position: 'relative' }}>
                          <Compass size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                          <input 
                            type="text"
                            required
                            placeholder="e.g. TYBSC IT (Sem 6)"
                            value={classStream}
                            onChange={(e) => setClassStream(e.target.value)}
                            disabled={markingLoading}
                            style={{
                              width: '100%', padding: '10px 12px 10px 38px', fontSize: '0.88rem', color: '#0F172A',
                              background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 10, outline: 'none',
                              fontWeight: 600, boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* Roll Number */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Roll Number *</label>
                        <div style={{ position: 'relative' }}>
                          <Award size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                          <input 
                            type="text"
                            required
                            placeholder="e.g. IT-2026-084"
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            disabled={markingLoading}
                            style={{
                              width: '100%', padding: '10px 12px 10px 38px', fontSize: '0.88rem', color: '#0F172A',
                              background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 10, outline: 'none',
                              fontWeight: 700, fontFamily: 'monospace', boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* GPS Geofence Status Indicator */}
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Navigation size={15} style={{ color: '#2563EB' }} /> Anti-Proxy GPS Geofence (100m)
                          </span>
                          <button
                            type="button"
                            onClick={detectStudentLocation}
                            disabled={!!gpsStatus}
                            style={{
                              padding: '4px 10px', borderRadius: 8, border: '1px solid #BFDBFE',
                              background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            {gpsStatus ? 'Calibrating...' : '📍 Calibrate GPS'}
                          </button>
                        </div>

                        {gpsStatus && (
                          <div style={{ fontSize: '0.78rem', color: '#2563EB', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <RefreshCw size={13} className="animate-spin" /> {gpsStatus}
                          </div>
                        )}

                        {calculatedDistance !== null && (
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isInRange ? '#16A34A' : '#DC2626', marginTop: 4 }}>
                            {isInRange ? `🟢 Geofence Verified: ${Math.round(calculatedDistance)}m from Faculty Anchor (Allowed: ≤100m)` : `🔴 Proxy Protection: ${Math.round(calculatedDistance)}m away (Outside 100m)`}
                          </div>
                        )}

                        {gpsErrorMsg && (
                          <div style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: 6, lineHeight: 1.4 }}>
                            {gpsErrorMsg}
                          </div>
                        )}

                        {/* Demo Simulate toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8, marginTop: 10, fontSize: '0.76rem', color: '#64748B' }}>
                          <span>Simulate Classroom Location (Demo / Testing Mode)</span>
                          <input 
                            type="checkbox"
                            checked={simulateGps}
                            onChange={(e) => setSimulateGps(e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={markingLoading}
                        style={{
                          width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF',
                          fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)', transition: 'all 0.15s ease'
                        }}
                      >
                        {markingLoading ? 'Verifying & Submitting...' : '✓ Submit Verified Attendance'}
                      </button>

                    </form>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 2: FACULTY SESSION CONTROL (Zero Admin Tension & No Projector Needed)
            ========================================================================= */}
        {activeTab === 'faculty' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Faculty Active Session Live Dashboard (If a session is currently OPEN) */}
            {activeFacultyBooking && activeFacultyBooking.attendanceStatus === 'OPEN' && (
              <div className="tailux-card" style={{ padding: '24px 28px', background: '#FFFFFF', borderRadius: 24, border: '2px solid #3B82F6', boxShadow: '0 12px 40px rgba(37, 99, 235, 0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }}>
                  <div>
                    <span className="tailux-badge tailux-badge-success" style={{ fontSize: '0.78rem', padding: '5px 14px' }}>
                      🟢 LIVE ATTENDANCE WINDOW OPEN
                    </span>
                    <h3 style={{ margin: '8px 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                      {activeFacultyBooking.eventName}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 2 }}>
                      📍 {activeFacultyBooking.venueName} • 👨‍🏫 {activeFacultyBooking.facultyName || activeFacultyBooking.coordinator}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFacultyStopSession(activeFacultyBooking.id)}
                    style={{
                      padding: '8px 18px', borderRadius: 10, border: '1px solid #FECACA',
                      background: '#FEF2F2', color: '#DC2626', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    ⏹️ Stop Session Early
                  </button>
                </div>

                {/* 4-Digit PIN Showcase Card (Zero Projector Needed) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 14, margin: '20px 0' }}>
                  
                  {/* Big PIN Card */}
                  <div style={{ background: '#EFF6FF', border: '2px solid #BFDBFE', borderRadius: 18, padding: '18px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      📢 4-DIGIT STUDENT PIN
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E40AF', letterSpacing: '0.15em', fontFamily: 'monospace', margin: '4px 0' }}>
                      {activeFacultyBooking.sessionPin || '1234'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>
                      Write on blackboard or speak to students
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div style={{ background: '#FEF2F2', border: '2px solid #FECACA', borderRadius: 18, padding: '18px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      ⏱️ WINDOW CLOSES IN
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#B91C1C', letterSpacing: '0.05em', fontFamily: 'monospace', margin: '4px 0' }}>
                      {facultyCountdownStr || '15:00'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>
                      Closes at {new Date(activeFacultyBooking.attendanceWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Live Student Count */}
                  <div style={{ background: '#F0FDF4', border: '2px solid #BBF7D0', borderRadius: 18, padding: '18px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      👥 STUDENTS CHECKED IN
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#15803D', letterSpacing: '0.05em', margin: '4px 0' }}>
                      {facultyRoster.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                      Updating real-time (every 3s)
                    </div>
                  </div>

                </div>

                {/* Sharing & Display Toolset */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '14px 18px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    
                    {/* Projector View Modal Button */}
                    <button
                      type="button"
                      onClick={() => setProjectorModalOpen(true)}
                      style={{
                        padding: '9px 16px', borderRadius: 10, border: 'none',
                        background: '#2563EB', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 800,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                      }}
                    >
                      <Maximize2 size={14} /> Projector / Screen Mode
                    </button>

                    {/* WhatsApp Share Button */}
                    <button
                      type="button"
                      onClick={() => shareWhatsApp(activeFacultyBooking)}
                      style={{
                        padding: '9px 16px', borderRadius: 10, border: '1px solid #86EFAC',
                        background: '#ECFDF5', color: '#059669', fontSize: '0.82rem', fontWeight: 800,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <Share2 size={14} /> Share on WhatsApp
                    </button>

                    {/* Copy Direct Link */}
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/attendance?bookingId=${activeFacultyBooking.id}`;
                        navigator.clipboard.writeText(url);
                        showCustomToast('URL Copied!', 'Attendance link copied to clipboard', 'success');
                      }}
                      style={{
                        padding: '9px 16px', borderRadius: 10, border: '1px solid #CBD5E1',
                        background: '#FFFFFF', color: '#334155', fontSize: '0.82rem', fontWeight: 800,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <Copy size={14} /> Copy Link
                    </button>

                  </div>

                  {/* Export Buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => exportPDF(facultyRoster, activeFacultyBooking)}
                      style={{
                        padding: '9px 16px', borderRadius: 10, border: '1px solid #CBD5E1',
                        background: '#FFFFFF', color: '#2563EB', fontSize: '0.82rem', fontWeight: 800,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <Download size={14} /> NAAC PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => exportExcel(facultyRoster, activeFacultyBooking.eventName)}
                      style={{
                        padding: '9px 16px', borderRadius: 10, border: '1px solid #CBD5E1',
                        background: '#FFFFFF', color: '#16A34A', fontSize: '0.82rem', fontWeight: 800,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <Download size={14} /> Excel (.xls)
                    </button>
                  </div>
                </div>

                {/* Live Student Check-In Table */}
                <div style={{ marginTop: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                      Live Verified Student Roster ({facultyRoster.length})
                    </div>
                    <input 
                      type="text"
                      placeholder="Search Roll No or Name..."
                      value={facultyRosterSearch}
                      onChange={(e) => setFacultyRosterSearch(e.target.value)}
                      style={{
                        padding: '6px 12px', fontSize: '0.78rem', border: '1px solid #CBD5E1',
                        borderRadius: 8, outline: 'none', width: 200
                      }}
                    />
                  </div>

                  {facultyRoster.length === 0 ? (
                    <div style={{ padding: '36px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: 14, border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '0.85rem' }}>
                      Waiting for students to enter PIN {activeFacultyBooking.sessionPin} and submit attendance...
                    </div>
                  ) : (
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
                      {(() => {
                        const filtered = facultyRoster.filter(r => 
                          (r.rollNumber || '').toLowerCase().includes(facultyRosterSearch.toLowerCase()) ||
                          (r.studentName || '').toLowerCase().includes(facultyRosterSearch.toLowerCase())
                        );
                        const pageSize = 8;
                        const totalPages = Math.ceil(filtered.length / pageSize) || 1;
                        const page = Math.min(facultyRosterPage, totalPages);
                        const current = filtered.slice((page - 1) * pageSize, page * pageSize);

                        return (
                          <>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Roll No</th>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Student Name</th>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Class</th>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Distance</th>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Check-In Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {current.map((r, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>{r.rollNumber}</td>
                                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F172A' }}>{r.studentName}</td>
                                      <td style={{ padding: '10px 14px', color: '#475569' }}>{r.classStream}</td>
                                      <td style={{ padding: '10px 14px' }}>
                                        <span className="tailux-badge tailux-badge-success" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                                          {r.distanceFromVenue}m
                                        </span>
                                      </td>
                                      <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '0.78rem' }}>
                                        {new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Pagination */}
                            <div style={{ padding: '10px 14px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                Showing <strong>{((page - 1) * pageSize) + 1}</strong> to <strong>{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> students
                              </span>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button
                                  type="button"
                                  onClick={() => setFacultyRosterPage(p => Math.max(1, p - 1))}
                                  disabled={page === 1}
                                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.75rem', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                                >
                                  Prev
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFacultyRosterPage(p => Math.min(totalPages, p + 1))}
                                  disabled={page === totalPages}
                                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.75rem', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Smart Event Selector (Scheduled Events Hub) */}
            <div className="tailux-card" style={{ padding: '24px 28px', background: '#FFFFFF', borderRadius: 22, border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563EB', letterSpacing: '0.06em' }}>
                    SMART EVENT SELECTOR (NO BOOKING ID NEEDED!)
                  </div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>
                    Scheduled Sessions Hub
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                    Click your event to start live 100m geofenced attendance instantly
                  </p>
                </div>

                {/* Create Instant Live Session Button */}
                <button
                  type="button"
                  onClick={() => {
                    setCreateSessionModalOpen(true);
                    setCsGpsCoords(null);
                    setCsGpsAccuracy(null);
                    setCsGpsStatus('');
                    setCsForm(prev => ({ ...prev, eventName: '', classYear: '', roomName: '', pin: Math.floor(1000 + Math.random() * 9000).toString() }));
                  }}
                  style={{
                    padding: '10px 18px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 800,
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)', whiteSpace: 'nowrap'
                  }}
                >
                  <PlusCircle size={16} /> Create Live Session
                </button>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (facultyFilterDate === 'all') {
                        const now = new Date();
                        setFacultyFilterDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
                      } else {
                        setFacultyFilterDate('all');
                      }
                    }}
                    style={{
                      padding: '8px 12px', borderRadius: 10,
                      border: facultyFilterDate === 'all' ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                      background: facultyFilterDate === 'all' ? '#EFF6FF' : '#FFFFFF',
                      color: facultyFilterDate === 'all' ? '#1D4ED8' : '#475569',
                      fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    {facultyFilterDate === 'all' ? '📅 Viewing All Dates' : '📅 Show All Dates'}
                  </button>

                  {facultyFilterDate !== 'all' && (
                    <input 
                      type="date"
                      value={facultyFilterDate}
                      onChange={(e) => setFacultyFilterDate(e.target.value)}
                      style={{
                        padding: '8px 12px', fontSize: '0.82rem', color: '#0F172A',
                        background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 10,
                        fontWeight: 600, outline: 'none'
                      }}
                    />
                  )}

                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                      type="text"
                      placeholder="Search faculty, title, hall..."
                      value={facultySearchQuery}
                      onChange={(e) => setFacultySearchQuery(e.target.value)}
                      style={{
                        padding: '8px 12px 8px 30px', fontSize: '0.82rem', color: '#0F172A',
                        background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 10,
                        fontWeight: 600, outline: 'none', width: 200
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchTodaySessions}
                    style={{
                      padding: '8px 12px', borderRadius: 10, border: '1px solid #CBD5E1',
                      background: '#FFFFFF', color: '#334155', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={13} className={loadingTodaySessions ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Sessions List */}
              {loadingTodaySessions ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  <div className="premium-spinner mb-2" />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading scheduled sessions...</div>
                </div>
              ) : todaySessions.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: 16, border: '1px dashed #CBD5E1', color: '#64748B' }}>
                  <Calendar size={32} style={{ color: '#94A3B8', margin: '0 auto 10px auto' }} />
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#334155' }}>No Bookings Scheduled on {facultyFilterDate}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4 }}>
                    Try searching by Faculty Name, Event Title, or choose another date above.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {todaySessions.map((s) => {
                    const isOpen = s.attendanceStatus === 'OPEN';
                    return (
                      <div 
                        key={s.id}
                        style={{
                          background: isOpen ? '#F0FDF4' : '#FFFFFF',
                          border: isOpen ? '2px solid #86EFAC' : '1px solid #E2E8F0',
                          borderRadius: 18, padding: '20px 22px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          flexWrap: 'wrap', gap: 16, transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 260 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span className={`tailux-badge ${isOpen ? 'tailux-badge-success' : 'tailux-badge-primary'}`} style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
                              {isOpen ? '🟢 ATTENDANCE OPEN' : 'SCHEDULED'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                              {s.startTime} - {s.endTime}
                            </span>
                          </div>

                          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                            {s.eventName}
                          </h4>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 8, fontSize: '0.8rem', color: '#475569' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={13} style={{ color: '#2563EB' }} /> <strong>{s.venueName}</strong>
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <User size={13} style={{ color: '#16A34A' }} /> {s.facultyName || s.coordinator}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Users size={13} style={{ color: '#D97706' }} /> Present: <strong>{s.presentCount}</strong> students
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {isOpen ? (
                            <button
                              type="button"
                              onClick={() => { setActiveFacultyBooking(s); fetchFacultyRoster(s.id); }}
                              style={{
                                padding: '10px 18px', borderRadius: 12, border: 'none',
                                background: '#16A34A', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 800,
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                              }}
                            >
                              <Radio size={14} className="animate-pulse" /> Open Active Dashboard
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={startingSessionId === s.id}
                              onClick={() => handleFacultyStartSession(s)}
                              style={{
                                padding: '10px 18px', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF',
                                fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                              }}
                            >
                              <Zap size={14} /> {startingSessionId === s.id ? 'Starting Geofence...' : '▶ Start Attendance'}
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        )}

        {/* =========================================================================
            CREATE INSTANT LIVE SESSION MODAL
            ========================================================================= */}
        {createSessionModalOpen && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setCreateSessionModalOpen(false); }}
          >
            <div style={{
              background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 700,
              boxShadow: '0 24px 60px rgba(0,0,0,0.22)', overflow: 'hidden',
              maxHeight: '96vh', overflowY: 'auto', scrollbarWidth: 'none'
            }}>

              {/* ── Premium Gradient Header ── */}
              <div style={{
                background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #6D28D9 100%)',
                padding: '10px 18px 10px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -50, right: -30, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -20, left: 14, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>⚡ Create Live Session</h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>GPS geofence anchor • Instant PIN check-in</p>
                  </div>
                  <button type="button" onClick={() => setCreateSessionModalOpen(false)}
                    style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  ><X size={15} /></button>
                </div>

              </div>

              {/* ── Form Body ── */}
              <form onSubmit={handleCreateInstantSession} style={{ padding: '0 0 10px 0' }}>
                {/* Two-column grid wrapper for wider modal */}

                {/* ── Two-column layout for the wider modal ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

                  {/* LEFT COLUMN: Identity + Session Details */}
                  <div style={{ borderRight: '1px solid #F1F5F9' }}>

                    {/* ── Section 1: Faculty Identity ── */}
                    <div style={{ padding: '10px 16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={10} color="#fff" /></div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Faculty Identity</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Name *</label>
                          <div style={{ position: 'relative' }}>
                            <User size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#7C3AED' }} />
                            <input type="text" required placeholder="Prof. Rajesh Sharma" value={csForm.facultyName}
                              onChange={e => setCsForm(p => ({ ...p, facultyName: e.target.value }))} disabled={csSubmitting}
                              style={{ width: '100%', padding: '7px 10px 7px 28px', fontSize: '0.82rem', color: '#0F172A', fontWeight: 600, background: '#FAFBFF', border: '1.5px solid #E0E7FF', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
                              onFocus={e => e.target.style.borderColor='#7C3AED'} onBlur={e => e.target.style.borderColor='#E0E7FF'} />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</label>
                          <div style={{ position: 'relative' }}>
                            <Building2 size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#7C3AED' }} />
                            <input type="text" placeholder="e.g. Information Technology" value={csForm.departmentName}
                              onChange={e => setCsForm(p => ({ ...p, departmentName: e.target.value }))} disabled={csSubmitting}
                              style={{ width: '100%', padding: '7px 10px 7px 28px', fontSize: '0.8rem', color: '#0F172A', fontWeight: 600, background: '#FAFBFF', border: '1.5px solid #E0E7FF', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
                              onFocus={e => e.target.style.borderColor='#7C3AED'} onBlur={e => e.target.style.borderColor='#E0E7FF'} />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Class / Year</label>
                          <div style={{ position: 'relative' }}>
                            <Layers size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#7C3AED' }} />
                            <input type="text" placeholder="e.g. TYBSC IT Sem 5" value={csForm.classYear}
                              onChange={e => setCsForm(p => ({ ...p, classYear: e.target.value }))} disabled={csSubmitting}
                              style={{ width: '100%', padding: '7px 10px 7px 28px', fontSize: '0.8rem', color: '#0F172A', fontWeight: 600, background: '#FAFBFF', border: '1.5px solid #E0E7FF', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
                              onFocus={e => e.target.style.borderColor='#7C3AED'} onBlur={e => e.target.style.borderColor='#E0E7FF'} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Section 2: Session Details ── */}
                    <div style={{ margin: '8px 0 0 0', height: 1, background: '#F1F5F9' }} />
                    <div style={{ padding: '8px 16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg, #0EA5E9, #0284C7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={10} color="#fff" /></div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Session Details</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lecture / Event Title *</label>
                          <div style={{ position: 'relative' }}>
                            <Sparkles size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#0284C7' }} />
                            <input type="text" required placeholder="e.g. DBMS — Lecture 12" value={csForm.eventName}
                              onChange={e => setCsForm(p => ({ ...p, eventName: e.target.value }))} disabled={csSubmitting}
                              style={{ width: '100%', padding: '7px 10px 7px 28px', fontSize: '0.82rem', color: '#0F172A', fontWeight: 600, background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
                              onFocus={e => e.target.style.borderColor='#0EA5E9'} onBlur={e => e.target.style.borderColor='#BAE6FD'} />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Room / Hall / Location</label>
                          <div style={{ position: 'relative' }}>
                            <MapPin size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#0284C7' }} />
                            <input type="text" placeholder="e.g. Room 304, Lab 2..." value={csForm.roomName}
                              onChange={e => setCsForm(p => ({ ...p, roomName: e.target.value }))} disabled={csSubmitting}
                              style={{ width: '100%', padding: '7px 10px 7px 28px', fontSize: '0.82rem', color: '#0F172A', fontWeight: 600, background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
                              onFocus={e => e.target.style.borderColor='#0EA5E9'} onBlur={e => e.target.style.borderColor='#BAE6FD'} />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>{/* END LEFT COLUMN */}

                  {/* RIGHT COLUMN: Geofence + PIN */}
                  <div>

                    {/* ── Section 3: Geofence + Window Settings ── */}
                    <div style={{ padding: '10px 16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Navigation size={10} color="#fff" /></div>
                          <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Geofence & Window</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#059669', background: '#ECFDF5', padding: '1px 8px', borderRadius: 20, border: '1px solid #A7F3D0' }}>{csForm.radius}m</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                        {[{r:50,icon:'🏠',label:'Small'},{r:100,icon:'🏛️',label:'Class'},{r:150,icon:'🏟️',label:'Hall'},{r:200,icon:'🌐',label:'Large'}].map(({r,icon,label}) => (
                          <button key={r} type="button" onClick={() => setCsForm(p => ({ ...p, radius: r }))}
                            style={{
                              padding: '5px 2px', borderRadius: 8,
                              border: csForm.radius === r ? '2px solid #059669' : '1.5px solid #E2E8F0',
                              background: csForm.radius === r ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : '#F8FAFC',
                              color: csForm.radius === r ? '#065F46' : '#64748B', fontWeight: 900, fontSize: '0.72rem',
                              cursor: 'pointer', boxShadow: csForm.radius === r ? '0 2px 8px rgba(16,185,129,0.2)' : 'none',
                              transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1
                            }}
                          >
                            <span style={{ fontSize: '0.85rem' }}>{icon}</span>
                            <span>{r}m</span>
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 7 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>⏱ Window</label>
                          <select value={csForm.windowMins} onChange={e => setCsForm(p => ({ ...p, windowMins: Number(e.target.value) }))} disabled={csSubmitting}
                            style={{ width: '100%', padding: '7px 8px', fontSize: '0.8rem', color: '#0F172A', fontWeight: 700, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 8, outline: 'none', cursor: 'pointer' }}>
                            <option value={5}>5 min</option>
                            <option value={10}>10 min</option>
                            <option value={15}>15 min ⭐</option>
                            <option value={20}>20 min</option>
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: '#475569', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>👥 Students</label>
                          <input type="number" min="1" max="500" placeholder="60" value={csForm.attendees}
                            onChange={e => setCsForm(p => ({ ...p, attendees: Number(e.target.value) }))} disabled={csSubmitting}
                            style={{ width: '100%', padding: '7px 8px', fontSize: '0.8rem', color: '#0F172A', fontWeight: 700, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    </div>

                    {/* ── Section 4: PIN Security ── */}
                    <div style={{ margin: '8px 0 0 0', height: 1, background: '#F1F5F9' }} />
                    <div style={{ padding: '8px 16px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                        <div style={{ width: 20, height: 20, borderRadius: 6, background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KeyRound size={10} color="#fff" /></div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Security PIN</span>
                      </div>
                      {/* PIN Row — inline compact */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 100%)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, boxShadow: '0 4px 12px rgba(30,64,175,0.25)' }}>
                          <div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PIN</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.2em', lineHeight: 1 }}>{csForm.pin || '????'}</div>
                          </div>
                          <button type="button"
                            onClick={() => setCsForm(p => ({ ...p, pin: Math.floor(1000 + Math.random() * 9000).toString() }))}
                            style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
                            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                          >🎲 New</button>
                        </div>
                        <input type="text" maxLength={4} placeholder="Custom" value={csForm.pin}
                          onChange={e => setCsForm(p => ({ ...p, pin: e.target.value.replace(/\D/g,'').slice(0,4) }))} disabled={csSubmitting}
                          style={{ width: 90, padding: '7px 8px', fontSize: '1rem', fontFamily: 'monospace', fontWeight: 900, letterSpacing: '0.3em', color: '#1E40AF', textAlign: 'center', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor='#2563EB'} onBlur={e => e.target.style.borderColor='#BFDBFE'} />
                      </div>
                    </div>

                  </div>{/* END RIGHT COLUMN */}

                </div>{/* END TWO-COLUMN GRID */}

                {/* GPS Status + Submit — full width below two columns */}
                <div style={{ padding: '10px 16px 8px', borderTop: '1px solid #F1F5F9', marginTop: 8 }}>
                  {csGpsStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.75rem', color: '#7C3AED', fontWeight: 700, background: '#F5F3FF', padding: '7px 12px', borderRadius: 8, border: '1px solid #DDD6FE', marginBottom: 8 }}>
                      <RefreshCw size={12} className="animate-spin" style={{ flexShrink: 0 }} /> {csGpsStatus}
                    </div>
                  )}
                  {csGpsCoords && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.75rem', color: '#065F46', fontWeight: 700, background: '#ECFDF5', padding: '7px 12px', borderRadius: 8, border: '1px solid #6EE7B7', marginBottom: 8 }}>
                      <MapPin size={12} style={{ flexShrink: 0, color: '#059669' }} /> 📡 GPS Captured ✓ — ±{csGpsAccuracy || '?'}m
                    </div>
                  )}
                  <button type="submit" disabled={csSubmitting}
                    style={{
                      width: '100%', padding: '10px 18px', borderRadius: 12, border: 'none',
                      background: csSubmitting ? 'linear-gradient(135deg, #94A3B8, #64748B)' : 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 50%, #6D28D9 100%)',
                      color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 900,
                      cursor: csSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: csSubmitting ? 'none' : '0 5px 18px rgba(109,40,217,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { if (!csSubmitting) e.currentTarget.style.transform='translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}
                  >
                    {csSubmitting ? <><RefreshCw size={15} className="animate-spin" /> Capturing GPS & Launching...</> : <><Zap size={15} /> Launch Live Session Now</>}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: PERMANENT ARCHIVE (Lifetime NAAC Hub)
            ========================================================================= */}
        {activeTab === 'archive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Header & Controls */}
            <div className="tailux-card" style={{ padding: '24px 28px', background: '#FFFFFF', borderRadius: 22, border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563EB', letterSpacing: '0.06em' }}>
                    LIFETIME AUDIT & NAAC REPORTING
                  </div>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>
                    Permanent Attendance Archive
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                    1-Click download official verified attendance sheets for all historical events
                  </p>
                </div>

                {/* Filter Controls */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                      type="text"
                      placeholder="Search title, faculty, hall..."
                      value={archiveSearchQuery}
                      onChange={(e) => setArchiveSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') fetchArchive(); }}
                      style={{
                        padding: '8px 12px 8px 30px', fontSize: '0.82rem', color: '#0F172A',
                        background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 10,
                        fontWeight: 600, outline: 'none', width: 220
                      }}
                    />
                  </div>
                  
                  <input 
                    type="date"
                    value={archiveDateFrom}
                    onChange={(e) => setArchiveDateFrom(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '0.8rem', border: '1px solid #CBD5E1', borderRadius: 10, background: '#F8FAFC' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>to</span>
                  <input 
                    type="date"
                    value={archiveDateTo}
                    onChange={(e) => setArchiveDateTo(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '0.8rem', border: '1px solid #CBD5E1', borderRadius: 10, background: '#F8FAFC' }}
                  />

                  <button
                    type="button"
                    onClick={fetchArchive}
                    style={{
                      padding: '8px 16px', borderRadius: 10, border: 'none',
                      background: '#2563EB', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    Filter
                  </button>
                </div>
              </div>

              {/* Archive Table */}
              {loadingArchive ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  <div className="premium-spinner mb-2" />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading archive database...</div>
                </div>
              ) : archiveList.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: 16, border: '1px dashed #CBD5E1', color: '#64748B' }}>
                  No past attendance records match your filter.
                </div>
              ) : (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden' }}>
                  {(() => {
                    const pageSize = 10;
                    const totalPages = Math.ceil(archiveList.length / pageSize) || 1;
                    const page = Math.min(archivePage, totalPages);
                    const current = archiveList.slice((page - 1) * pageSize, page * pageSize);

                    return (
                      <>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Date & Time</th>
                                <th style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Event & Dept</th>
                                <th style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Venue Hall</th>
                                <th style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Faculty Coordinator</th>
                                <th style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', textAlign: 'center' }}>Present Count</th>
                                <th style={{ padding: '12px 16px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', textAlign: 'center' }}>Official Exports</th>
                              </tr>
                            </thead>
                            <tbody>
                              {current.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                    <div style={{ fontWeight: 800, color: '#0F172A' }}>{item.bookingDate}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.startTime} - {item.endTime}</div>
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <div style={{ fontWeight: 800, color: '#0F172A' }}>{item.eventName}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>{item.departmentName} {item.classYear ? `• ${item.classYear}` : ''}</div>
                                  </td>
                                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                                    {item.venueName}
                                  </td>
                                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                                    {item.facultyName}
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <span className="tailux-badge tailux-badge-success" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                                      {item.presentCount} Verified
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                      <button
                                        type="button"
                                        onClick={() => openArchiveRoster(item)}
                                        style={{
                                          padding: '5px 10px', borderRadius: 8, border: '1px solid #CBD5E1',
                                          background: '#FFFFFF', color: '#334155', fontSize: '0.75rem', fontWeight: 700,
                                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                                        }}
                                      >
                                        <Eye size={12} /> View
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const res = await fetch(`/api/bookings/${item.id}/attendance`);
                                          if (res.ok) {
                                            const list = await res.json();
                                            await exportPDF(list, item);
                                          }
                                        }}
                                        style={{
                                          padding: '5px 10px', borderRadius: 8, border: '1px solid #BFDBFE',
                                          background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.75rem', fontWeight: 700,
                                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                                        }}
                                      >
                                        <Download size={12} /> PDF
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const res = await fetch(`/api/bookings/${item.id}/attendance`);
                                          if (res.ok) {
                                            const list = await res.json();
                                            exportExcel(list, item.eventName);
                                          }
                                        }}
                                        style={{
                                          padding: '5px 10px', borderRadius: 8, border: '1px solid #BBF7D0',
                                          background: '#F0FDF4', color: '#15803D', fontSize: '0.75rem', fontWeight: 700,
                                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                                        }}
                                      >
                                        <Download size={12} /> Excel
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Footer */}
                        <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                            Showing <strong>{((page - 1) * pageSize) + 1}</strong> to <strong>{Math.min(page * pageSize, archiveList.length)}</strong> of <strong>{archiveList.length}</strong> past events
                          </span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => setArchivePage(p => Math.max(1, p - 1))}
                              disabled={page === 1}
                              style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.75rem', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                            >
                              Prev
                            </button>
                            <button
                              type="button"
                              onClick={() => setArchivePage(p => Math.min(totalPages, p + 1))}
                              disabled={page === totalPages}
                              style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.75rem', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* =========================================================================
          PROJECTOR / AUDITORIUM SCREEN MODE MODAL
          ========================================================================= */}
      {projectorModalOpen && activeFacultyBooking && (
        <div 
          className="custom-modal-overlay"
          onClick={() => setProjectorModalOpen(false)}
          style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
        >
          <div 
            className="custom-modal-content tailux-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 700, width: '90%', padding: '36px 32px', textAlign: 'center', background: '#FFFFFF', borderRadius: 28 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563EB', letterSpacing: '0.08em' }}>
                KIRTI COLLEGE • PROJECTOR / SCREEN VIEW
              </div>
              <button
                type="button"
                onClick={() => setProjectorModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={24} />
              </button>
            </div>

            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {activeFacultyBooking.eventName}
            </h2>
            <div style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 24 }}>
              📍 Venue: <strong>{activeFacultyBooking.venueName}</strong> • {activeFacultyBooking.startTime} - {activeFacultyBooking.endTime}
            </div>

            {/* QR Code & PIN Side-by-Side or Centered */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 28, margin: '20px 0' }}>
              
              {/* High-Resolution QR Code */}
              <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 20, border: '2px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <QRCodeSVG 
                  value={`${window.location.origin}/attendance?bookingId=${activeFacultyBooking.id}`}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 8, fontWeight: 700 }}>
                  Scan QR with Camera / Google Lens
                </div>
              </div>

              {/* Big 4-Digit PIN Card */}
              <div style={{ background: '#EFF6FF', border: '3px solid #3B82F6', borderRadius: 24, padding: '24px 32px', minWidth: 220 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1D4ED8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  🔑 4-DIGIT PIN
                </div>
                <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#1E40AF', letterSpacing: '0.2em', fontFamily: 'monospace', margin: '4px 0' }}>
                  {activeFacultyBooking.sessionPin || '1234'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#3B82F6', fontWeight: 700 }}>
                  Enter PIN on Attendance Page
                </div>
              </div>

            </div>

            {/* Instructions Footer */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '14px 20px', marginTop: 20, fontSize: '0.85rem', color: '#475569' }}>
              1. Open <strong>{window.location.origin}/attendance</strong> on mobile<br />
              2. Enter Roll Number, Full Name & PIN <strong>{activeFacultyBooking.sessionPin}</strong> (Must be within 100m)
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setProjectorModalOpen(false)}
                style={{
                  padding: '10px 24px', borderRadius: 12, border: 'none',
                  background: '#2563EB', color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Close Projector View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ARCHIVE ROSTER MODAL
          ========================================================================= */}
      {archiveRosterModalBooking && (
        <div className="custom-modal-overlay" onClick={() => setArchiveRosterModalBooking(null)}>
          <div 
            className="custom-modal-content tailux-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 750, width: '90%', padding: '28px 24px', background: '#FFFFFF', borderRadius: 24 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  {archiveRosterModalBooking.eventName} — Roster
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                  {archiveRosterModalBooking.bookingDate} • {archiveRosterModalBooking.venueName} • {archiveRosterList.length} Verified Students
                </div>
              </div>
              <button onClick={() => setArchiveRosterModalBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
            </div>

            {loadingArchiveRoster ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                <div className="premium-spinner mb-2" />
                <div style={{ fontSize: '0.85rem' }}>Loading verified student records...</div>
              </div>
            ) : archiveRosterList.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#F8FAFC', borderRadius: 12, color: '#64748B', fontSize: '0.85rem' }}>
                No attendance was logged for this session.
              </div>
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC' }}>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 800 }}>Roll No</th>
                      <th style={{ padding: '8px 12px', fontWeight: 800 }}>Student Name</th>
                      <th style={{ padding: '8px 12px', fontWeight: 800 }}>Class</th>
                      <th style={{ padding: '8px 12px', fontWeight: 800 }}>Distance</th>
                      <th style={{ padding: '8px 12px', fontWeight: 800 }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archiveRosterList.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>{r.rollNumber}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{r.studentName}</td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{r.classStream}</td>
                        <td style={{ padding: '8px 12px' }}>{r.distanceFromVenue}m</td>
                        <td style={{ padding: '8px 12px', color: '#64748B' }}>
                          {new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => exportPDF(archiveRosterList, archiveRosterModalBooking)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  <Download size={13} /> Official NAAC PDF
                </button>
                <button
                  type="button"
                  onClick={() => exportExcel(archiveRosterList, archiveRosterModalBooking.eventName)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #BBF7D0', background: '#F0FDF4', color: '#15803D', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  <Download size={13} /> Export Excel
                </button>
              </div>

              <button
                type="button"
                onClick={() => setArchiveRosterModalBooking(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}



    </div>
  );
}
