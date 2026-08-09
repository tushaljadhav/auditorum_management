import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { drawCollegeHeader, downloadOfficialAttendancePDF } from '../utils/pdfHeader';
import Footer from '../components/Footer';
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
  Globe
} from 'lucide-react';

export default function StudentAttendance() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlBookingId = searchParams.get('bookingId') || '';

  const [bookingId, setBookingId] = useState(urlBookingId);
  const [trackIdInput, setTrackIdInput] = useState('');
  const [isStudent, setIsStudent] = useState(!!urlBookingId);
  
  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [markedRecord, setMarkedRecord] = useState(null);

  const [rollNumber, setRollNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [classStream, setClassStream] = useState('');

  const [locationCalibrated, setLocationCalibrated] = useState(false);
  const [studentCoords, setStudentCoords] = useState(null);
  const [calculatedDistance, setCalculatedDistance] = useState(null);
  const [isInRange, setIsInRange] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [gpsErrorMsg, setGpsErrorMsg] = useState('');
  const [gpsHelpModalOpen, setGpsHelpModalOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState('android');
  const [simulateGps, setSimulateGps] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [gpsAccuracy, setGpsAccuracy] = useState(0);

  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceWindowMins, setAttendanceWindowMins] = useState(15);

  const getClientDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  const fetchBookingDetails = async (id) => {
    if (!id) return;
    setLoadingBooking(true);
    setBooking(null);
    setMarkedRecord(null);
    setAttendanceList([]);
    setLocationCalibrated(false);
    setStudentCoords(null);
    setCalculatedDistance(null);
    setIsInRange(false);
    setGpsErrorMsg('');
    setGpsStatus('');
    try {
      const response = await fetch(`/api/bookings/${id.trim()}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
        if (data && data.id) {
          fetchAttendanceList(data.id);
        }
      } else {
        setBooking(null);
      }
    } catch (err) {
      console.error("Error loading booking details:", err);
      setBooking(null);
    } finally {
      setLoadingBooking(false);
    }
  };

  useEffect(() => {
    if (urlBookingId) {
      setIsStudent(true);
      setBookingId(urlBookingId);
      fetchBookingDetails(urlBookingId);
    } else {
      setBookingId('');
      setBooking(null);
    }
  }, [urlBookingId]);

  const fetchAttendanceList = async (id) => {
    try {
      const res = await fetch(`/api/bookings/${id}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceList(data);
      }
    } catch (err) {
      console.error("Failed to load attendance list:", err);
    }
  };

  const startAttendanceSession = async (id, mins) => {
    try {
      const res = await fetch(`/api/bookings/${id}/start-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowMins: mins })
      });
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
        fetchAttendanceList(id);
        Swal.fire({
          icon: 'success',
          title: 'Attendance Session Started!',
          text: `GPS Attendance window is now OPEN for ${mins} minutes.`,
          timer: 2000,
          showConfirmButton: false,
          borderRadius: '16px'
        });
      } else {
        const err = await res.json();
        Swal.fire({ icon: 'error', title: 'Start Failed', text: err.error || 'Could not start attendance.' });
      }
    } catch (err) {
      console.error("Error starting attendance:", err);
      Swal.fire({ icon: 'error', title: 'Server Error', text: 'Connection failed.' });
    }
  };

  const stopAttendanceSession = async (id) => {
    const confirm = await Swal.fire({
      title: 'Close Attendance Session?',
      text: 'Students will no longer be able to submit GPS attendance for this session.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Close Session',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      borderRadius: '16px'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`/api/bookings/${id}/stop-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
        fetchAttendanceList(id);
        Swal.fire({
          icon: 'success',
          title: 'Session Closed',
          text: 'Attendance window has been manually closed.',
          timer: 2000,
          showConfirmButton: false,
          borderRadius: '16px'
        });
      }
    } catch (err) {
      console.error("Error stopping attendance:", err);
    }
  };

  const downloadAttendanceCSV = (list, eventName) => {
    if (!list || list.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Roster Data', text: 'There are no attendance records to export yet.' });
      return;
    }
    const headers = ["Roll Number", "Student Name", "Class/Stream", "Distance (Meters)", "Status", "Check-in Timestamp"];
    const csvRows = [
      headers.join(','),
      ...list.map(r => [
        `"${r.rollNumber || ''}"`,
        `"${r.studentName || ''}"`,
        `"${r.classStream || ''}"`,
        `"${r.distanceFromVenue || 0}m"`,
        `"${r.status || 'VERIFIED'}"`,
        `"${new Date(r.checkInTime).toLocaleString()}"`
      ].join(','))
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── PDF Attendance Report Download ──────────────────────────
  const downloadAttendancePDF = async (list, currentBooking = booking) => {
    if (!list || list.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Roster Data', text: 'There are no attendance records to export yet.' });
      return;
    }
    if (!currentBooking) return;

    await downloadOfficialAttendancePDF(list, currentBooking);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/attendance?bookingId=${booking.id}`;
    const shareText = `Please mark your GPS-based attendance for the event: ${booking.eventName}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Attendance: ${booking.eventName}`,
        text: shareText,
        url: shareUrl
      }).catch(err => console.error("Error sharing:", err));
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' - ' + shareUrl)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  useEffect(() => {
    let interval = null;
    if (booking && booking.status === 'Approved' && booking.attendanceStatus === 'OPEN') {
      fetchAttendanceList(booking.id);
      interval = setInterval(() => {
        fetchAttendanceList(booking.id);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [booking]);

  useEffect(() => {
    let timer = null;
    const updateCountdown = () => {
      if (!booking || !booking.attendanceWindowEnd || booking.attendanceStatus !== 'OPEN') {
        setTimeLeftStr('');
        return;
      }
      const now = new Date();
      const end = new Date(booking.attendanceWindowEnd);
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeftStr('Expired');
        
        if (!isStudent && attendanceList && attendanceList.length > 0) {
          downloadAttendancePDF(attendanceList, booking);
          Swal.fire({
            icon: 'info',
            title: 'Attendance Session Ended',
            text: 'The session has closed. Your attendance PDF report has been downloaded automatically.',
            confirmButtonColor: '#2563EB',
            borderRadius: '16px'
          });
        }

        setBooking(prev => prev ? { ...prev, attendanceStatus: 'CLOSED' } : null);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    if (booking && booking.attendanceStatus === 'OPEN') {
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    } else {
      setTimeLeftStr('');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [booking, attendanceList, isStudent]);

  const detectLiveLocation = () => {
    setStudentCoords(null);
    setCalculatedDistance(null);
    setIsInRange(false);
    setGpsErrorMsg('');
    setGpsStatus('Calibrating satellite GPS signal...');
    setGpsAccuracy(0);

    if (simulateGps) {
      if (booking) {
        const lat = Number(booking.venueLatitude || 0);
        const lon = Number(booking.venueLongitude || 0);
        setStudentCoords({ latitude: lat, longitude: lon });
        setCalculatedDistance(0);
        setIsInRange(true);
        setLocationCalibrated(true);
        setGpsErrorMsg('');
        setGpsStatus('');
        setGpsAccuracy(3);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Campus GPS Verified!',
          text: 'Location matched inside Kirti Auditorium',
          showConfirmButton: false,
          timer: 2000
        });
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsErrorMsg('Geolocation is not supported by your browser.');
      setGpsStatus('');
      return;
    }

    setGpsStatus('Acquiring high-accuracy GPS coordinates...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const acc = position.coords.accuracy || 0;
        setStudentCoords({ latitude: lat, longitude: lon });
        setGpsAccuracy(acc);
        
        if (booking && booking.venueLatitude && booking.venueLongitude) {
          const dist = getClientDistance(lat, lon, Number(booking.venueLatitude), Number(booking.venueLongitude));
          setCalculatedDistance(dist);
          const allowed = Number(booking.venueRadius || 50);
          const maxBuffer = 25; 
          const effectiveAllowed = allowed + Math.min(acc, maxBuffer);
          const inBounds = dist <= effectiveAllowed;
          setIsInRange(inBounds);
          
          if (inBounds) {
            setLocationCalibrated(true);
            setGpsErrorMsg('');
            Swal.fire({
              icon: 'success',
              title: 'Auditorium Location Verified!',
              text: 'GPS presence confirmed. Please enter your student details to submit.',
              confirmButtonColor: '#2563EB',
              borderRadius: '16px',
              timer: 3000
            });
          } else {
            setLocationCalibrated(false);
            setGpsErrorMsg(`Outside Auditorium Geofence: Measured Distance is ${Math.round(dist)} meters away. Allowed check-in radius is within ${allowed} meters.`);
          }
        }
        setGpsStatus('');
      },
      (err) => {
        console.error("GPS error:", err);
        setGpsStatus('');
        setLocationCalibrated(false);
        let msg = 'Could not acquire GPS position.';
        if (err.code === 1) {
          msg = 'GPS Permission Denied. Please enable location permissions in browser settings.';
        } else if (err.code === 2) {
          msg = 'Location unavailable. Ensure device GPS/Location settings are turned ON.';
        } else if (err.code === 3) {
          msg = 'GPS tracking timed out. Click Re-Calibrate in an open campus area.';
        }
        setGpsErrorMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const submitAttendance = async (lat, lon) => {
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rollNumber: rollNumber.trim(),
          studentName: studentName.trim(),
          classStream: classStream.trim(),
          latitude: lat,
          longitude: lon,
          accuracy: gpsAccuracy
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMarkedRecord(data.record);
        fetchAttendanceList(bookingId);
        Swal.fire({
          icon: 'success',
          title: 'Attendance Confirmed!',
          text: 'Your attendance has been verified and recorded.',
          confirmButtonColor: '#10B981',
          borderRadius: '16px'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: data.error || 'Could not record attendance.',
          confirmButtonColor: '#EF4444',
          borderRadius: '16px'
        });
      }
    } catch (err) {
      console.error("Error submitting attendance:", err);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Failed to submit attendance.',
        confirmButtonColor: '#EF4444',
        borderRadius: '16px'
      });
    } finally {
      setMarkingLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!bookingId || !booking) return;

    if (!rollNumber.trim() || !studentName.trim() || !classStream.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Fields Missing', text: 'Please fill in Roll Number, Full Name, and Class/Stream.' });
      return;
    }

    if (!studentCoords) {
      Swal.fire({ 
        icon: 'error', 
        title: 'GPS Location Required', 
        text: 'We could not detect your coordinates. Please enable GPS location.',
        confirmButtonColor: '#2563EB'
      });
      return;
    }

    const allowed = Number(booking.venueRadius || 50);
    const maxBuffer = 25;
    const effectiveAllowed = allowed + Math.min(gpsAccuracy, maxBuffer);

    if (calculatedDistance > effectiveAllowed) {
      Swal.fire({
        icon: 'error',
        title: 'Outside Geofence Radius',
        text: `You are currently ${Math.round(calculatedDistance)}m away. You must be within ${Math.round(effectiveAllowed)}m of Kirti Auditorium.`,
        confirmButtonColor: '#2563EB'
      });
      return;
    }

    setMarkingLoading(true);
    await submitAttendance(studentCoords.latitude, studentCoords.longitude);
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackIdInput.trim()) {
      setIsStudent(false);
      setBookingId(trackIdInput.trim());
      fetchBookingDetails(trackIdInput.trim());
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', position: 'relative' }}>
      
      {/* Hidden logo image for PDF generation */}
      <img id="attendance-college-logo" src="/Logo.png" style={{ display: 'none' }} alt="college-logo" crossOrigin="anonymous" />
      {/* Decorative Gradient Background Elements */}
      <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.07) 0%, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', bottom: '0', right: '0', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header Bar */}
      <header style={{ zIndex: 10, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/Logo.png" alt="College Logo" style={{ height: '38px', objectFit: 'contain' }} />
            <div style={{ borderLeft: '1px solid #CBD5E1', paddingLeft: 12 }}>
              <span style={{ fontWeight: 800, color: '#2563EB', fontSize: '1rem', letterSpacing: '-0.01em', display: 'block' }}>GPS ATTENDANCE GATEWAY</span>
              <span style={{ fontSize: '0.73rem', color: '#64748B', display: 'block' }}>Kirti M. Doongursee College • Dadar (West)</span>
            </div>
          </div>
        </div>

        {booking && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="tailux-badge tailux-badge-primary" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>
              <Zap size={13} /> REF: {booking.id}
            </span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '36px 20px 80px', maxWidth: 640, width: '100%', margin: '0 auto', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {loadingBooking ? (
          /* Loading View */
          <div className="tailux-card" style={{ padding: '60px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div className="premium-spinner mb-3" />
            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>Loading Event Session...</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 4 }}>Connecting to GPS Geofence Verification API</div>
          </div>
        ) : !bookingId ? (
          /* SEARCH/TRACK ENTRY VIEW */
          <div className="tailux-card" style={{ padding: '40px 32px', background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 12px 36px -8px rgba(15, 23, 42, 0.08)', textAlign: 'center' }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <Navigation size={32} style={{ color: '#2563EB' }} />
            </div>
            
            <h3 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>GPS Attendance Gateway</h3>
            <p style={{ margin: '8px 0 28px 0', fontSize: '0.88rem', color: '#64748B' }}>Enter your Auditorium Event Booking ID to verify location and submit attendance</p>
            
            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Booking Reference ID *
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="text" 
                    placeholder="e.g. booking_1782654643059"
                    value={trackIdInput}
                    onChange={(e) => setTrackIdInput(e.target.value)}
                    required
                    style={{
                      width: '100%', padding: '12px 14px 12px 42px', fontSize: '0.92rem', color: '#0F172A',
                      background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 12, outline: 'none',
                      boxSizing: 'border-box', fontWeight: 600
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF',
                  fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)', transition: 'all 0.15s ease',
                  marginTop: 6
                }}
              >
                Find Event & Open Gateway
              </button>
            </form>
          </div>
        ) : !booking ? (
          /* NOT FOUND ERROR VIEW */
          <div className="tailux-card" style={{ padding: '40px 28px', background: '#FFFFFF', borderRadius: 24, border: '1px solid #FECACA', textAlign: 'center', boxShadow: '0 12px 36px -8px rgba(239, 68, 68, 0.08)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#FEF2F2', border: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <AlertTriangle size={32} style={{ color: '#EF4444' }} />
            </div>
            <h4 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0F172A' }}>Booking Reference Not Found</h4>
            <p style={{ margin: '10px auto 24px auto', fontSize: '0.88rem', color: '#64748B', maxWidth: 440, lineHeight: 1.5 }}>
              No auditorium reservation matches ID: <code style={{ padding: '2px 8px', background: '#F1F5F9', borderRadius: 6, color: '#2563EB', fontWeight: 700 }}>{bookingId}</code>. Please double-check with your event coordinator.
            </p>
            <button 
              onClick={() => { setBookingId(''); setTrackIdInput(''); }}
              style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Back to Gateway Search
            </button>
          </div>
        ) : (
          /* BOOKING DETAILS & CONTROLS VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Navigation top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsStudent(!isStudent)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#2563EB', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Switch to {isStudent ? 'Faculty Coordinator View' : 'Student Check-in View'}
              </button>
            </div>

            {/* Event Ticket Header Card */}
            <div className="tailux-card" style={{ padding: '24px 28px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563EB' }}>
                  Auditorium Event Session
                </span>
                <span className={`tailux-badge ${booking.status === 'Approved' ? 'tailux-badge-success' : 'tailux-badge-danger'}`} style={{ fontSize: '0.72rem', padding: '4px 12px' }}>
                  {booking.status === 'Approved' ? 'Confirmed & Active' : booking.status}
                </span>
              </div>

              <h2 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                {booking.eventName}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, marginTop: 18, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={16} style={{ color: '#2563EB' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Venue Hall</div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{booking.venueName}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={16} style={{ color: '#D97706' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{booking.bookingDate}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={16} style={{ color: '#0284C7' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Time Slot</div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{booking.startTime} - {booking.endTime}</div>
                  </div>
                </div>

                {(booking.facultyName || booking.coordinator) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={16} style={{ color: '#16A34A' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Coordinator</div>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{booking.facultyName || booking.coordinator}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Approved Booking Journey */}
            {booking.status === 'Approved' && (
              <div>
                
                {isStudent ? (
                  /* =============================================
                     STUDENT VIEW JOURNEY
                     ============================================= */
                  <div>
                    {booking.attendanceStatus !== 'OPEN' ? (
                      /* Session Closed Banner */
                      <div className="tailux-card" style={{ padding: '24px 28px', background: '#FEF2F2', borderRadius: 16, border: '1px solid #FECACA', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <AlertCircle size={22} style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <div style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.95rem' }}>Attendance Session Locked</div>
                          <div style={{ fontSize: '0.82rem', color: '#7F1D1D', marginTop: 4, lineHeight: 1.5 }}>
                            The faculty coordinator has not opened the GPS check-in window yet. Please wait for the live session to be announced in the auditorium.
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Session OPEN Panel */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        
                        {/* Countdown Live Card */}
                        <div className="tailux-card" style={{ padding: '20px 24px', background: '#ECFDF5', borderRadius: 16, border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <span className="tailux-badge tailux-badge-success" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                              🟢 LIVE ATTENDANCE WINDOW OPEN
                            </span>
                            <div style={{ fontSize: '0.8rem', color: '#065F46', marginTop: 6, fontWeight: 600 }}>
                              Closes at: <strong>{new Date(booking.attendanceWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#047857', letterSpacing: '0.05em' }}>TIME REMAINING</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#DC2626', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                              {timeLeftStr || 'Checking...'}
                            </div>
                          </div>
                        </div>

                        {markedRecord ? (
                          /* Success check-in box */
                          <div className="tailux-card" style={{ padding: '32px 28px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #A7F3D0', textAlign: 'center', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.08)' }}>
                            <div style={{ width: 60, height: 60, borderRadius: 20, background: '#DCFCE7', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                              <CheckCircle size={32} style={{ color: '#16A34A' }} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0F172A' }}>GPS Attendance Verified!</h4>
                            <p style={{ margin: '6px 0 20px 0', fontSize: '0.85rem', color: '#64748B' }}>Your presence in the auditorium has been logged with location proof.</p>
                            
                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748B', fontWeight: 600 }}>Student Name:</span><span style={{ fontWeight: 800, color: '#0F172A' }}>{markedRecord.studentName}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}><span style={{ color: '#64748B', fontWeight: 600 }}>Class / Stream:</span><span style={{ fontWeight: 800, color: '#0F172A' }}>{markedRecord.classStream}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}><span style={{ color: '#64748B', fontWeight: 600 }}>Roll Number:</span><span style={{ fontWeight: 800, color: '#2563EB' }}>{markedRecord.rollNumber}</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: 8 }}><span style={{ color: '#64748B', fontWeight: 600 }}>Geofence Distance:</span><span style={{ fontWeight: 800, color: '#16A34A' }}>{markedRecord.distanceFromVenue}m inside venue radius</span></div>
                            </div>
                          </div>
                        ) : !locationCalibrated ? (
                          /* GPS Calibration Card */
                          <div className="tailux-card" style={{ padding: '32px 28px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 18, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                              <Compass size={28} style={{ color: '#2563EB' }} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>Geofence Verification</h4>
                            <p style={{ margin: '6px 0 20px 0', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
                              We need to verify your physical GPS location to ensure you are inside Kirti Auditorium (100m radius).
                            </p>

                            {gpsStatus && (
                              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '0.82rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <RefreshCw size={14} className="animate-spin" />
                                {gpsStatus}
                              </div>
                            )}

                            {gpsErrorMsg && (
                              <div style={{ padding: '14px 16px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: '0.82rem', textAlign: 'left', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                  <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }} />
                                  <div>
                                    <div style={{ fontWeight: 800 }}>Boundary Check Blocked</div>
                                    <div style={{ marginTop: 2, lineHeight: 1.4 }}>{gpsErrorMsg}</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setGpsHelpModalOpen(true)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', background: '#FFFFFF', border: '1px solid #FCA5A5',
                                    borderRadius: 8, color: '#DC2626', fontSize: '0.78rem', fontWeight: 700,
                                    cursor: 'pointer', alignSelf: 'flex-start'
                                  }}
                                >
                                  <HelpCircle size={14} /> ⚡ Open GPS Precision & Troubleshooting Guide
                                </button>
                              </div>
                            )}

                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, fontSize: '0.82rem' }}>
                              <span style={{ fontWeight: 600, color: '#475569' }}>Simulate GPS Location (Demo Mode)</span>
                              <input 
                                type="checkbox" 
                                checked={simulateGps}
                                onChange={(e) => setSimulateGps(e.target.checked)}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={detectLiveLocation}
                              disabled={!!gpsStatus}
                              style={{
                                width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', color: '#FFFFFF',
                                fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)', transition: 'all 0.15s ease'
                              }}
                            >
                              Verify My GPS Location
                            </button>
                          </div>
                        ) : (
                          /* Student Details Form */
                          <div className="tailux-card" style={{ padding: '32px 28px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                              <h4 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>Mark Student Attendance</h4>
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748B' }}>GPS verified within venue bounds. Enter details to submit.</p>
                            </div>

                            <form onSubmit={handleMarkAttendance} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                                      width: '100%', padding: '10px 12px 10px 36px', fontSize: '0.875rem', color: '#0F172A',
                                      background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Class / Stream *</label>
                                <div style={{ position: 'relative' }}>
                                  <Compass size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                  <input 
                                    type="text"
                                    required
                                    placeholder="e.g. TYBSC IT"
                                    value={classStream}
                                    onChange={(e) => setClassStream(e.target.value)}
                                    disabled={markingLoading}
                                    style={{
                                      width: '100%', padding: '10px 12px 10px 36px', fontSize: '0.875rem', color: '#0F172A',
                                      background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              </div>

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
                                      width: '100%', padding: '10px 12px 10px 36px', fontSize: '0.875rem', color: '#0F172A',
                                      background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                </div>
                              </div>

                              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                <span style={{ fontWeight: 600, color: '#475569' }}>Simulate GPS Location (Demo Mode)</span>
                                <input 
                                  type="checkbox" 
                                  checked={simulateGps}
                                  onChange={(e) => setSimulateGps(e.target.checked)}
                                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                                />
                              </div>

                              <button 
                                type="submit"
                                disabled={markingLoading}
                                style={{
                                  width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none',
                                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF',
                                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', transition: 'all 0.15s ease',
                                  marginTop: 4
                                }}
                              >
                                {markingLoading ? 'Submitting Attendance...' : 'Submit Verified Attendance'}
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* =============================================
                     COORDINATOR / FACULTY VIEW
                     ============================================= */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {booking.attendanceStatus !== 'OPEN' ? (
                      /* Session CLOSED Panel */
                      <div className="tailux-card" style={{ padding: '24px 28px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                          <span className="tailux-badge tailux-badge-danger" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                            🔴 SESSION CLOSED
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>Faculty Control Panel</span>
                        </div>

                        <p style={{ margin: '0 0 18px 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                          Start a live GPS check-in window for this auditorium event. Students within 100m will be allowed to log their presence.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Session Window Duration</label>
                            <select 
                              value={attendanceWindowMins}
                              onChange={(e) => setAttendanceWindowMins(Number(e.target.value))}
                              style={{
                                width: '100%', padding: '10px 12px', fontSize: '0.875rem', color: '#0F172A',
                                background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 10, outline: 'none',
                                fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              <option value={5}>5 minutes</option>
                              <option value={10}>10 minutes</option>
                              <option value={15}>15 minutes (Recommended)</option>
                              <option value={30}>30 minutes</option>
                              <option value={60}>1 hour</option>
                            </select>
                          </div>

                          <button 
                            type="button" 
                            onClick={() => startAttendanceSession(booking.id, attendanceWindowMins)}
                            style={{
                              padding: '11px 22px', borderRadius: 10, border: 'none',
                              background: '#2563EB', color: '#FFFFFF', fontSize: '0.875rem', fontWeight: 700,
                              cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                              display: 'inline-flex', alignItems: 'center', gap: 8
                            }}
                          >
                            <Zap size={16} /> Start Live Attendance Session
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Session OPEN Panel */
                      <div className="tailux-card" style={{ padding: '24px 28px', background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <span className="tailux-badge tailux-badge-success" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                            🟢 LIVE SESSION OPEN ({attendanceList.length} Checked In)
                          </span>

                          <button 
                            type="button" 
                            onClick={() => stopAttendanceSession(booking.id)}
                            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Stop Session Early
                          </button>
                        </div>

                        {/* Share Gateway Link Box */}
                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            Share Gateway URL with Students:
                          </label>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input 
                              type="text" 
                              readOnly 
                              value={`${window.location.origin}/attendance?bookingId=${booking.id}`}
                              style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem', color: '#0F172A', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, outline: 'none', fontFamily: 'monospace' }}
                            />
                            <button 
                              type="button" 
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/attendance?bookingId=${booking.id}`);
                                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Link Copied!', showConfirmButton: false, timer: 1500 });
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              <Copy size={14} /> Copy Link
                            </button>
                            <button 
                              type="button" 
                              onClick={handleShare}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              <Share2 size={14} /> Share
                            </button>
                          </div>
                        </div>

                        {/* Live Checked In Roster Table */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                              Live Verified Attendance Roster ({attendanceList.length})
                            </div>
                            {attendanceList.length > 0 && (
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button 
                                  type="button"
                                  onClick={() => downloadAttendancePDF(attendanceList, booking)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                                >
                                  <Download size={13} /> Download PDF
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => downloadAttendanceCSV(attendanceList, booking.eventName)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1.5px solid #10B981', background: '#ECFDF5', color: '#059669', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  <Download size={13} /> Export CSV
                                </button>
                              </div>
                            )}
                          </div>

                          {attendanceList.length === 0 ? (
                            <div style={{ padding: '32px 20px', textAlign: 'center', background: '#F8FAFC', borderRadius: 12, border: '1px border-dashed #CBD5E1', color: '#64748B', fontSize: '0.85rem' }}>
                              Waiting for students inside auditorium to verify GPS location...
                            </div>
                          ) : (
                            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 12 }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                <thead>
                                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Roll No</th>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Student Name</th>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Class</th>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Distance</th>
                                    <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {attendanceList.map((a, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                      <td style={{ padding: '10px 14px', fontWeight: 800, color: '#2563EB' }}>{a.rollNumber}</td>
                                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0F172A' }}>{a.studentName}</td>
                                      <td style={{ padding: '10px 14px', color: '#475569' }}>{a.classStream}</td>
                                      <td style={{ padding: '10px 14px' }}>
                                        <span className="tailux-badge tailux-badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                          {a.distanceFromVenue}m
                                        </span>
                                      </td>
                                      <td style={{ padding: '10px 14px', color: '#64748B', fontSize: '0.78rem' }}>
                                        {new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      {/* GPS Troubleshooting Helper Modal */}
      {gpsHelpModalOpen && (
        <div className="custom-modal-overlay" onClick={() => setGpsHelpModalOpen(false)}>
          <div className="custom-modal-content tailux-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, padding: 0, overflow: 'hidden' }}>
            <div className="tailux-card-header" style={{ padding: '20px 24px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Navigation size={18} style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>GPS & Location Helper Guide</h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>Troubleshoot mobile GPS permission & accuracy issues</div>
                </div>
              </div>
              <button onClick={() => setGpsHelpModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 4 }}><X size={18} /></button>
            </div>

            <div className="tailux-card-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Device OS Selector Tabs */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('android')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8,
                    border: activeGuideTab === 'android' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    background: activeGuideTab === 'android' ? '#EFF6FF' : '#FFFFFF',
                    color: activeGuideTab === 'android' ? '#2563EB' : '#64748B',
                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  📱 Android (Chrome)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('ios')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8,
                    border: activeGuideTab === 'ios' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    background: activeGuideTab === 'ios' ? '#EFF6FF' : '#FFFFFF',
                    color: activeGuideTab === 'ios' ? '#2563EB' : '#64748B',
                    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  🍎 iPhone (Safari)
                </button>
              </div>

              {activeGuideTab === 'android' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem', color: '#334155' }}>
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <strong>Step 1: Turn ON High Precision Location</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                      Go to Phone Settings ➔ Location ➔ Enable "Use Location" & turn ON "Improve Location Accuracy".
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <strong>Step 2: Reset Chrome Permissions</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                      Tap lock icon 🔒 next to URL bar ➔ Site Settings ➔ Location ➔ Select <strong>"Allow"</strong>.
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <strong>Step 3: Turn OFF Battery Saver</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                      Battery saver mode throttles GPS satellite frequency. Turn off battery saver for high accuracy.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.85rem', color: '#334155' }}>
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <strong>Step 1: Enable Safari Location Access</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                      Open iOS Settings ➔ Safari ➔ Location ➔ Select <strong>"Ask" or "Allow"</strong>.
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <strong>Step 2: Turn ON Precise Location</strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                      iOS Settings ➔ Privacy & Security ➔ Location Services ➔ Safari ➔ Turn ON <strong>"Precise Location"</strong> toggle.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="tailux-card-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setGpsHelpModalOpen(false); detectLiveLocation(); }}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                🔄 Re-Detect My Location Now
              </button>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Dedicated Student Attendance Portal Footer (No Navigation Links) */}
      <footer style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '20px 28px', textAlign: 'center', fontSize: '0.82rem', color: '#64748B', zIndex: 10 }}>
        <div style={{ fontWeight: 600, color: '#334155' }}>© 2026 Kirti M. Doongursee College • Official Student GPS Attendance Gateway</div>
        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4 }}>Location-Verified Zero-Proxy Attendance Submission</div>
      </footer>
    </div>
  );
}
