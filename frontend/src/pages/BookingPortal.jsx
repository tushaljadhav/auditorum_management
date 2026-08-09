import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import CustomSelect from '../components/CustomSelect';
import Footer from '../components/Footer';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { drawCollegeHeader, downloadOfficialReceiptPDF } from '../utils/pdfHeader';
import { Calendar, Clock, MapPin, Users, BookOpen, ChevronLeft, ArrowRight, CheckCircle, Search, HelpCircle, PlusCircle, Download, Home, Building2, User } from 'lucide-react';

export default function BookingPortal() {
  const navigate = useNavigate();

  const getDeptBadgeStyle = (deptName) => {
    if (!deptName) return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    
    // Hash function to map name to a distinct hue
    let hash = 0;
    for (let i = 0; i < deptName.length; i++) {
      hash = deptName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    
    return {
      backgroundColor: `hsl(${hue}, 85%, 96%)`,
      color: `hsl(${hue}, 85%, 35%)`,
      border: `1px solid hsl(${hue}, 80%, 90%)`,
      fontWeight: '700',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '0.72rem',
      display: 'inline-block',
      letterSpacing: '0.5px'
    };
  };
  
  // Step tracker: 1 = Check Availability, 2 = Fill Booking Form, 3 = Confirmation / QR
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Status tracking states
  const [activeSubTab, setActiveSubTab] = useState('check'); // 'check' or 'track'
  const [trackId, setTrackId] = useState('');
  const [trackedBooking, setTrackedBooking] = useState(null);
  const [trackedResults, setTrackedResults] = useState([]);
  const [selectedTrackedBooking, setSelectedTrackedBooking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Database lists
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [venues, setVenues] = useState([]);

  // Form states
  const [availForm, setAvailForm] = useState({
    venueId: '',
    bookingDate: '',
    startTime: '',
    endTime: ''
  });

  const [bookingForm, setBookingForm] = useState({
    eventName: '',
    departmentId: '',
    facultyId: '',
    eventDescription: '',
    attendees: ''
  });

  // Submitted booking result for thank-you screen
  const [bookingResult, setBookingResult] = useState(null);

  // Day schedule states
  const [dayBookings, setDayBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [hasCheckedSchedule, setHasCheckedSchedule] = useState(false);
  const [showAllTimes, setShowAllTimes] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceWindowMins, setAttendanceWindowMins] = useState(15);
  const [timeLeftStr, setTimeLeftStr] = useState('');

  // Load lists on mount
  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error("Error loading departments:", err));

    fetch('/api/faculty')
      .then(res => res.json())
      .then(data => setFaculties(data))
      .catch(err => console.error("Error loading faculty:", err));

    fetch('/api/venues')
      .then(res => res.json())
      .then(data => setVenues(data))
      .catch(err => console.error("Error loading venues:", err));
  }, []);

  // Filter faculties when department is selected
  useEffect(() => {
    if (bookingForm.departmentId) {
      const filtered = faculties.filter(f => f.departmentId === bookingForm.departmentId);
      setFilteredFaculties(filtered);
      setBookingForm(prev => ({ ...prev, facultyId: '' }));
    } else {
      setFilteredFaculties([]);
    }
  }, [bookingForm.departmentId, faculties]);

  // Selected faculty contact info
  const selectedFaculty = faculties.find(f => f.id === bookingForm.facultyId);

  const fetchAttendanceList = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceList(data);
      }
    } catch (err) {
      console.error("Failed to load attendance list:", err);
    }
  };

  const startAttendanceSession = async (bookingId, windowMins) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/start-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowMins })
      });
      if (res.ok) {
        const data = await res.json();
        setTrackedBooking(data);
        fetchAttendanceList(bookingId);
        Swal.fire({
          icon: 'success',
          title: 'Attendance Started!',
          text: `Attendance is now OPEN for ${windowMins} minutes.`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const err = await res.json();
        Swal.fire({ icon: 'error', title: 'Failed', text: err.error || 'Failed to start attendance.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Server communication error.' });
    }
  };

  const stopAttendanceSession = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/stop-attendance`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setTrackedBooking(data);
        Swal.fire({
          icon: 'info',
          title: 'Attendance Closed',
          text: 'Attendance session has been closed manually.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error("Failed to stop attendance session:", err);
    }
  };

  const downloadAttendanceCSV = (list, eventName) => {
    if (!list || list.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Data', text: 'No student has marked attendance yet.' });
      return;
    }

    const headers = ["Roll Number", "Student Name", "Class/Stream", "Latitude", "Longitude", "Distance from Venue (m)", "Check-in Time"];
    const csvRows = [
      headers.join(','),
      ...list.map(a => [
        `"${a.rollNumber}"`,
        `"${a.studentName}"`,
        `"${a.classStream || ''}"`,
        a.latitude,
        a.longitude,
        a.distanceFromVenue,
        `"${new Date(a.checkInTime).toLocaleString()}"`
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

  // Poll attendance list when session is OPEN
  useEffect(() => {
    let interval = null;
    if (trackedBooking && trackedBooking.status === 'Approved' && trackedBooking.attendanceStatus === 'OPEN') {
      fetchAttendanceList(trackedBooking.id);
      interval = setInterval(() => {
        fetchAttendanceList(trackedBooking.id);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trackedBooking]);

  // Countdown timer for open session
  useEffect(() => {
    let timer = null;
    const updateCountdown = () => {
      if (!trackedBooking || !trackedBooking.attendanceWindowEnd || trackedBooking.attendanceStatus !== 'OPEN') {
        setTimeLeftStr('');
        return;
      }
      const now = new Date();
      const end = new Date(trackedBooking.attendanceWindowEnd);
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeftStr('Expired');
        
        // Auto-download report for faculty/coordinator when session timer hits zero
        if (attendanceList && attendanceList.length > 0) {
          downloadAttendanceCSV(attendanceList, trackedBooking.eventName);
          Swal.fire({
            icon: 'info',
            title: 'Attendance Session Ended',
            text: 'The session has closed. Your report has been downloaded automatically.',
            confirmButtonColor: '#4f46e5'
          });
        }

        setTrackedBooking(prev => prev ? { ...prev, attendanceStatus: 'CLOSED' } : null);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    };

    if (trackedBooking && trackedBooking.attendanceStatus === 'OPEN') {
      updateCountdown();
      timer = setInterval(updateCountdown, 1000);
    } else {
      setTimeLeftStr('');
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [trackedBooking, attendanceList]);

  const fetchBookingDetails = async (query) => {
    if (!query || !query.trim()) return;
    setTrackingLoading(true);
    setTrackedResults([]);
    setSelectedTrackedBooking(null);
    try {
      const [bRes, vRes, dRes, fRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/venues'),
        fetch('/api/departments'),
        fetch('/api/faculty')
      ]);

      if (bRes.ok) {
        const bookingsList = await bRes.json();
        const vList = vRes.ok ? await vRes.json() : [];
        const dList = dRes.ok ? await dRes.json() : [];
        const fList = fRes.ok ? await fRes.json() : [];

        const enrichedList = bookingsList.map(b => {
          const fac = fList.find(f => f.id === b.facultyId);
          const dept = dList.find(d => d.id === b.departmentId);
          const venue = vList.find(v => v.id === b.venueId);
          return {
            ...b,
            venueName: venue?.name || b.venueName || 'Unknown Venue',
            deptName: dept?.name || b.deptName || 'Unknown Department',
            facultyName: fac?.name || b.facultyName || 'Unknown Faculty',
            facultyEmail: fac?.email || '',
            facultyMobile: fac?.mobile || ''
          };
        });

        const q = query.trim().toLowerCase();
        
        // Strong & strict matching: match strictly by Faculty Name, Event Title, or Booking ID
        const matches = enrichedList.filter(b => {
          if (!q) return true;
          const idMatch = b.id && b.id.toLowerCase().includes(q);
          const facultyMatch = b.facultyName && b.facultyName.toLowerCase().includes(q);
          const eventMatch = b.eventName && b.eventName.toLowerCase().includes(q);

          return idMatch || facultyMatch || eventMatch;
        });

        // Filter: Keep only bookings from the last 1 month onwards
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const year = oneMonthAgo.getFullYear();
        const month = String(oneMonthAgo.getMonth() + 1).padStart(2, '0');
        const day = String(oneMonthAgo.getDate()).padStart(2, '0');
        const oneMonthAgoStr = `${year}-${month}-${day}`;

        const recentMatches = matches.filter(b => b.bookingDate >= oneMonthAgoStr);

        // Sort results: Current & Upcoming bookings on TOP, Past bookings BELOW
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const sortedMatches = [...recentMatches].sort((a, b) => {
          const isAUpcoming = a.bookingDate >= todayStr;
          const isBUpcoming = b.bookingDate >= todayStr;

          if (isAUpcoming && !isBUpcoming) return -1;
          if (!isAUpcoming && isBUpcoming) return 1;

          if (isAUpcoming && isBUpcoming) {
            return a.bookingDate.localeCompare(b.bookingDate);
          }

          return b.bookingDate.localeCompare(a.bookingDate);
        });

        if (sortedMatches.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No Recent Bookings',
            text: `No reservation records from the last 1 month match "${query}".`,
            confirmButtonColor: '#4f46e5',
            borderRadius: '16px'
          });
        } else if (sortedMatches.length === 1) {
          setTrackedResults(sortedMatches);
          setSelectedTrackedBooking(sortedMatches[0]);
        } else {
          setTrackedResults(sortedMatches);
          setSelectedTrackedBooking(null);
        }
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to communicate with server. Please try again.',
        confirmButtonColor: '#4f46e5',
        borderRadius: '16px'
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  // Track specific booking status by ID, Name, or Event
  const handleTrackBooking = async (e) => {
    if (e) e.preventDefault();
    if (!trackId.trim()) return;
    fetchBookingDetails(trackId);
  };

  // Check URL search params for tracking link, pre-selected date, and venue
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get('track');
    const dateParam = params.get('date');

    if (trackParam) {
      setTrackId(trackParam);
      setActiveSubTab('track');
      fetchBookingDetails(trackParam);
    }

    if (dateParam) {
      setAvailForm(prev => ({
        ...prev,
        bookingDate: dateParam
      }));
    }
  }, []);

  const calculateFreeSlots = (bookedSlots, dayStart = "08:00", dayEnd = "23:00", selectedDate = availForm.bookingDate) => {
    const toMins = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const toStr = (m) => {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      return `${h}:${min}`;
    };

    let effectiveDayStartMins = toMins(dayStart);
    
    // If selectedDate is today, ensure start time is at least 10 minutes after current local time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    let minAllowedMins = 0;
    if (selectedDate === todayStr) {
      const currentMins = now.getHours() * 60 + now.getMinutes();
      minAllowedMins = currentMins + 10; // Require 10 minutes advance window
      
      // Round up to nearest 5 minutes for clean time slots
      const rem = minAllowedMins % 5;
      if (rem !== 0) minAllowedMins += (5 - rem);

      if (minAllowedMins > effectiveDayStartMins) {
        effectiveDayStartMins = minAllowedMins;
      }
    }

    let slots = [{ start: effectiveDayStartMins, end: toMins(dayEnd) }];

    const sortedBooked = [...bookedSlots]
      .map(b => ({ start: toMins(b.startTime), end: toMins(b.endTime) }))
      .sort((a, b) => a.start - b.start);

    for (const busy of sortedBooked) {
      let nextSlots = [];
      for (const free of slots) {
        if (busy.start >= free.end || busy.end <= free.start) {
          nextSlots.push(free);
        } else {
          if (busy.start > free.start) {
            nextSlots.push({ start: free.start, end: busy.start });
          }
          if (busy.end < free.end) {
            nextSlots.push({ start: busy.end, end: free.end });
          }
        }
      }
      slots = nextSlots;
    }

    // Split continuous free time slots into standard segments
    let segmentedSlots = [];
    for (const free of slots) {
      if (free.end <= free.start) continue;

      let current = free.start;
      while (current < free.end) {
        let end = Math.min(current + 60, free.end);
        
        if (free.end - end > 0 && free.end - end < 30) {
          end = free.end;
        }
        
        if (end - current >= 30) {
          segmentedSlots.push({ start: current, end: end });
        }
        current = end;
      }
    }

    return segmentedSlots
      .filter(s => {
        if (selectedDate === todayStr) {
          return s.start >= minAllowedMins;
        }
        return true;
      })
      .map(s => ({
        start: toStr(s.start),
        end: toStr(s.end),
        label: `${toStr(s.start)} - ${toStr(s.end)}`
      }));
  };

  const fetchDaySchedule = async (venueId, date) => {
    if (!venueId || !date) return;
    setScheduleLoading(true);
    setHasCheckedSchedule(true);
    setAlternatives([]); // Clear previous alternatives
    try {
      const res = await fetch(`/api/venues/${venueId}/bookings?date=${date}`);
      if (res.ok) {
        const bookingsData = await res.json();
        setDayBookings(bookingsData);
        const freeSlots = calculateFreeSlots(bookingsData, "08:00", "23:00", date);
        setAvailableSlots(freeSlots);
      }
    } catch (err) {
      console.error("Error fetching day schedule:", err);
    } finally {
      setScheduleLoading(false);
    }
  };

  useEffect(() => {
    if (availForm.venueId && availForm.bookingDate) {
      fetchDaySchedule(availForm.venueId, availForm.bookingDate);
    } else {
      setDayBookings([]);
      setAvailableSlots([]);
      setHasCheckedSchedule(false);
      setAlternatives([]); // Clear alternatives when resetting
    }
  }, [availForm.venueId, availForm.bookingDate]);

  // Step 1: Check slot availability
  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    
    if (!availForm.venueId || !availForm.bookingDate || !availForm.startTime || !availForm.endTime) {
      Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Please fill in all availability details.' });
      return;
    }

    if (availForm.endTime <= availForm.startTime) {
      Swal.fire({ icon: 'error', title: 'Invalid Time Range', text: 'End time must be after the start time.' });
      return;
    }

    // Past Date & 10-Minute Advance Time Validation
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const minAllowedMins = now.getHours() * 60 + now.getMinutes() + 10;
    const minAllowedHours = String(Math.floor(minAllowedMins / 60)).padStart(2, '0');
    const minAllowedMinutes = String(minAllowedMins % 60).padStart(2, '0');
    const minAllowedTimeStr = `${minAllowedHours}:${minAllowedMinutes}`;

    if (availForm.bookingDate < todayStr) {
      Swal.fire({
        icon: 'error',
        title: 'Past Date Selected',
        text: 'You cannot book a venue for a past date. Please choose today or a future date.'
      });
      return;
    }

    const startMins = Number(availForm.startTime.split(':')[0]) * 60 + Number(availForm.startTime.split(':')[1]);

    if (availForm.bookingDate === todayStr && startMins < minAllowedMins) {
      Swal.fire({
        icon: 'error',
        title: 'Advance Booking Required',
        text: `Bookings for today must be scheduled at least 10 minutes in advance. The earliest allowed start time for today is ${minAllowedTimeStr}.`
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availForm)
      });
      const data = await response.json();
      setLoading(false);

      if (data.isAvailable) {
        setAlternatives([]);
        Swal.fire({
          title: 'Slot Available!',
          text: 'The selected venue and time slot is available for booking. Would you like to proceed?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Yes, Proceed',
          cancelButtonText: 'No',
          confirmButtonColor: '#4f46e5',
          cancelButtonColor: '#aaa'
        }).then((result) => {
          if (result.isConfirmed) {
            setStep(2);
          }
        });
      } else {
        setAlternatives(data.alternatives || []);
        const slotsHtml = availableSlots.length === 0 
          ? '<div class="text-danger font-weight-bold">No available slots on this day (08:00 AM - 08:00 PM).</div>'
          : `
            <div class="text-start mt-2">
              <p class="mb-2 text-muted" style="font-size: 0.9rem;">Here are the remaining free slots for this day:</p>
              <div class="d-flex flex-wrap gap-2">
                ${availableSlots.map(s => `
                  <span class="badge px-2.5 py-1.5 rounded-pill font-weight-medium border" style="background-color: #f5f3ff; color: #6d28d9; border-color: #ddd6fe; font-size: 0.8rem; display: inline-block; margin: 2px;">
                    ${s.label}
                  </span>
                `).join('')}
              </div>
            </div>
          `;

        Swal.fire({
          title: 'Slot Unavailable',
          html: `
            <div class="text-start mb-3">The selected time slot is already booked for this venue. Please choose another slot or date.</div>
            ${data.alternatives && data.alternatives.length > 0 ? `
              <div class="text-start mb-3">
                <p class="mb-2 font-weight-bold text-dark" style="font-size: 0.88rem;">💡 Recommended Alternatives (Click to auto-select):</p>
                <div class="d-flex flex-column gap-2">
                  ${data.alternatives.map((alt, idx) => `
                    <button type="button" class="btn btn-outline-primary text-start px-3 py-2 w-100 alt-btn" data-idx="${idx}" style="font-size: 0.85rem; border-color: #c7d2fe; color: #4f46e5; background-color: #f5f7ff; border: 1.5px solid;">
                      ${alt.type === 'alt-venue' || alt.type === 'venue' ? '🏢' : '🕒'} ${alt.label}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            ${slotsHtml}
          `,
          icon: 'info',
          confirmButtonColor: '#4f46e5',
          didOpen: (modal) => {
            const buttons = modal.querySelectorAll('.alt-btn');
            buttons.forEach(btn => {
              btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                const selectedAlt = data.alternatives[idx];
                
                // Set the form inputs
                setAvailForm(prev => ({
                  ...prev,
                  venueId: selectedAlt.venueId,
                  startTime: selectedAlt.startTime,
                  endTime: selectedAlt.endTime
                }));
                
                Swal.close();
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'success',
                  title: 'Alternative slot selected!',
                  showConfirmButton: false,
                  timer: 1500
                });
              });
            });
          }
        });
      }
    } catch (err) {
      setLoading(false);
      Swal.fire({ icon: 'error', title: 'Server Error', text: 'Failed to verify slot availability. Please try again.' });
    }
  };

  // Step 2: Confirm and Submit Booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!bookingForm.eventName || !bookingForm.departmentId || !bookingForm.facultyId || !bookingForm.attendees) {
      Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'Please fill in all event details.' });
      return;
    }

    const payload = {
      ...availForm,
      ...bookingForm,
      attendees: Number(bookingForm.attendees)
    };

    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setLoading(false);

      if (response.ok) {
        const result = await response.json();
        setBookingResult(result);
        setStep(3);
        Swal.fire({ icon: 'success', title: 'Booking Submitted!', text: 'Your request has been successfully queued for approval.', timer: 2500, showConfirmButton: false });
      } else {
        const errData = await response.json();
        Swal.fire({ icon: 'error', title: 'Booking Conflict', text: errData.error || 'Failed to save booking.' });
      }
    } catch (err) {
      setLoading(false);
      Swal.fire({ icon: 'error', title: 'Submission Error', text: 'Failed to submit the request. Please try again.' });
    }
  };

  const selectedVenue = venues.find(v => v.id === availForm.venueId);
  const selectedDept = departments.find(d => d.id === bookingForm.departmentId);

  // QR Code Content - Generates a web tracking link that opens on mobile when scanned
  const qrString = bookingResult 
    ? `${window.location.origin}/booking?track=${bookingResult.id}` 
    : "";

  const downloadPDFReceipt = async (booking = bookingResult) => {
    if (!booking) return;
    await downloadOfficialReceiptPDF(booking, faculties, venues, departments);
  };

  useEffect(() => {
    if (step === 3 && bookingResult) {
      const timer = setTimeout(() => {
        downloadPDFReceipt(bookingResult);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, bookingResult]);

  return (
    <div className="min-vh-100 py-5" style={{ background: '#f3f5f8' }}>
      {/* Hidden logo image for PDF receipt generation */}
      <img id="college-logo-img" src="/Logo.png" style={{ display: 'none' }} alt="college-logo" />
      <div className="container" style={{ paddingBottom: '72px' }}>
        
        {/* Navigation Back */}
        {step < 3 && (
          <button 
            className="btn btn-link text-decoration-none text-secondary d-flex align-items-center mb-4 px-0 animate-fade-in"
            onClick={() => step === 2 ? setStep(1) : navigate('/')}
          >
            <ChevronLeft size={20} className="me-1" />
            Back to {step === 2 ? 'Availability Checker' : 'Home'}
          </button>
        )}

        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="premium-card bg-white shadow-sm border-0 animate-fade-in">
              
              {/* Header */}
              <div className="text-center border-bottom pb-4 mb-4">
                <img src="/Logo.png" alt="Logo" className="mb-2" style={{ height: '60px' }} />
                <h2 className="font-weight-bold mb-1">Faculty Booking Portal</h2>
                <p className="text-muted mb-0">Reserve an auditorium for college programs and guest lectures</p>
                
                {/* Modern Tailux 3-Step Progress Timeline Indicator */}
                <div style={{ maxWidth: '580px', margin: '24px auto 0', padding: '0 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Background connecting line */}
                    <div style={{ position: 'absolute', top: '20px', left: '16%', right: '16%', height: '3px', background: '#E2E8F0', zIndex: 0 }}>
                      <div style={{
                        height: '100%',
                        width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                        background: 'linear-gradient(to right, #6366F1, #10B981)',
                        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }} />
                    </div>

                    {[
                      { num: 1, title: '1. Check Slot', desc: 'Venue & Availability' },
                      { num: 2, title: '2. Event Details', desc: 'Faculty & Event Info' },
                      { num: 3, title: '3. Confirmed', desc: 'Instant PDF Receipt' }
                    ].map((sObj) => {
                      const isActive = step >= sObj.num;
                      const isCurrent = step === sObj.num;
                      return (
                        <div key={sObj.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: isActive ? (sObj.num === 3 ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)') : '#FFFFFF',
                            border: isActive ? 'none' : '2px solid #CBD5E1',
                            color: isActive ? '#FFFFFF' : '#64748B',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isCurrent ? '0 0 16px rgba(37, 99, 235, 0.35)' : '0 2px 6px rgba(0,0,0,0.04)',
                            transition: 'all 0.3s ease'
                          }}>
                            {step > sObj.num ? '✓' : sObj.num}
                          </div>
                          <div style={{ marginTop: '8px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 800 : 600, color: isActive ? '#0F172A' : '#64748B', display: 'block' }}>
                              {sObj.title}
                            </span>
                            <span className="d-none d-sm-block" style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                              {sObj.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 1: Availability Check OR Booking Status Tracking */}
              {step === 1 && (
                <div>
                  {/* Selector Tabs */}
                  <div className="d-flex justify-content-center border-bottom pb-3 mb-4 gap-2">
                    <button
                      type="button"
                      className="btn px-4 py-2.5 rounded-pill font-weight-bold transition-all"
                      onClick={() => {
                        setActiveSubTab('check');
                        setTrackedBooking(null);
                      }}
                      style={{ 
                        fontSize: '0.9rem',
                        background: activeSubTab === 'check' ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : '#FFFFFF',
                        color: activeSubTab === 'check' ? '#FFFFFF' : '#475569',
                        border: activeSubTab === 'check' ? 'none' : '1px solid #CBD5E1',
                        boxShadow: activeSubTab === 'check' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <Calendar size={16} className="me-1.5" /> Book Auditorium
                    </button>
                    <button
                      type="button"
                      className="btn px-4 py-2.5 rounded-pill font-weight-bold transition-all"
                      onClick={() => setActiveSubTab('track')}
                      style={{ 
                        fontSize: '0.9rem',
                        background: activeSubTab === 'track' ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' : '#FFFFFF',
                        color: activeSubTab === 'track' ? '#FFFFFF' : '#475569',
                        border: activeSubTab === 'track' ? 'none' : '1px solid #CBD5E1',
                        boxShadow: activeSubTab === 'track' ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <Search size={16} className="me-1.5" /> Track Booking Status
                    </button>
                  </div>

                  {activeSubTab === 'check' && (
                    <form onSubmit={handleCheckAvailability} className="animate-fade-in">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label font-weight-bold text-secondary">Select Venue (Hall)</label>
                          <CustomSelect 
                            value={availForm.venueId}
                            onChange={(val) => setAvailForm({ ...availForm, venueId: val })}
                            options={venues.map(v => ({ value: v.id, label: `${v.name} (Capacity: ${v.capacity} pax)` }))}
                            placeholder="Choose a Hall..."
                          />
                        </div>

                        <div className="col-12 col-md-4">
                          <label className="form-label font-weight-bold text-secondary">Date</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><Calendar size={18} className="text-muted" /></span>
                            <input 
                              type="date" 
                              className="form-control form-control-lg bg-light border-start-0" 
                              required
                              min={new Date().toISOString().split('T')[0]}
                              value={availForm.bookingDate}
                              onChange={(e) => setAvailForm({ ...availForm, bookingDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="col-6 col-md-4">
                          <label className="form-label font-weight-bold text-secondary">Start Time</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><Clock size={18} className="text-muted" /></span>
                            <input 
                              type="time" 
                              className="form-control form-control-lg bg-light border-start-0" 
                              required
                              value={availForm.startTime}
                              onChange={(e) => setAvailForm({ ...availForm, startTime: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="col-6 col-md-4">
                          <label className="form-label font-weight-bold text-secondary">End Time</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><Clock size={18} className="text-muted" /></span>
                            <input 
                              type="time" 
                              className="form-control form-control-lg bg-light border-start-0" 
                              required
                              value={availForm.endTime}
                              onChange={(e) => setAvailForm({ ...availForm, endTime: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Venue Schedule / Slots Timeline */}
                      {hasCheckedSchedule && (
                        <div className="premium-card p-4 mt-4 animate-fade-in border-0 shadow-sm" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #eef2ff' }}>
                          <div className="d-flex align-items-center gap-2.5 pb-3 border-bottom mb-3.5">
                            <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-3" style={{ width: '38px', height: '38px' }}>
                              <Calendar size={20} className="text-primary" />
                            </div>
                            <div>
                              <h6 className="font-weight-bold text-dark mb-0.5" style={{ fontSize: '0.96rem' }}>
                                Venue Schedule Overview
                              </h6>
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Occupied and free hours for {availForm.bookingDate}</span>
                            </div>
                          </div>

                          {scheduleLoading ? (
                            <div className="d-flex align-items-center gap-2 text-muted py-2" style={{ fontSize: '0.85rem' }}>
                              <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                              <span>Checking venue schedule...</span>
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-3">
                              {/* Booked Slots (Busy) */}
                              <div>
                                {dayBookings.length === 0 ? (
                                  <div className="p-3 rounded-3 d-flex align-items-center gap-2.5" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
                                    <span style={{ fontSize: '1.25rem' }}>✨</span>
                                    <div>
                                      <div className="font-weight-bold" style={{ fontSize: '0.88rem' }}>No Booked Slots (Busy)</div>
                                      <div className="text-secondary" style={{ fontSize: '0.78rem', color: '#16a34a' }}>No bookings scheduled on this date. You have full availability!</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-3 bg-light border border-opacity-50">
                                    <span className="text-secondary font-weight-semibold d-block mb-2 text-uppercase" style={{ fontSize: '0.74rem', letterSpacing: '0.5px' }}>Already Booked Slots (Busy):</span>
                                    <div className="d-flex flex-wrap gap-2">
                                      {dayBookings.map((b, idx) => (
                                        <div 
                                          key={idx} 
                                          className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 border"
                                          style={{ 
                                            fontSize: '0.82rem', 
                                            fontWeight: '500',
                                            backgroundColor: '#fef2f2',
                                            color: '#ef4444',
                                            borderColor: '#fca5a5'
                                          }}
                                        >
                                          <span className="rounded-circle" style={{ width: '6px', height: '6px', backgroundColor: '#ef4444' }}></span>
                                          <strong style={{ color: '#b91c1c' }}>{b.startTime} - {b.endTime}</strong>
                                          <span style={{ color: '#ef4444' }}>({b.eventName})</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Available Slots (Free) */}
                              <div className="p-3 rounded-3 border" style={{ borderColor: '#e8d5ff', backgroundColor: '#f5f7ff' }}>
                                <span className="text-secondary font-weight-semibold d-block mb-2 text-uppercase" style={{ fontSize: '0.74rem', letterSpacing: '0.5px', color: '#4f46e5' }}>
                                  Available Slots for Booking (Click to auto-fill time):
                                </span>
                                {availableSlots.length === 0 ? (
                                  <div className="d-flex flex-column gap-2 mb-2">
                                    <div className="text-danger font-weight-semibold" style={{ fontSize: '0.85rem' }}>
                                      ⚠️ No remaining free slots available for booking today (08:00 AM to 11:00 PM).
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary fw-bold px-3 py-1.5 rounded-pill"
                                        onClick={() => {
                                          const tom = new Date();
                                          tom.setDate(tom.getDate() + 1);
                                          const tomStr = tom.toISOString().split('T')[0];
                                          setAvailForm(prev => ({ ...prev, bookingDate: tomStr }));
                                          Swal.fire({
                                            toast: true,
                                            position: 'top-end',
                                            icon: 'info',
                                            title: `Switched to Tomorrow's Date (${tomStr})`,
                                            showConfirmButton: false,
                                            timer: 1500
                                          });
                                        }}
                                      >
                                        📅 View Tomorrow's Available Slots
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div 
                                      style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 130px), 1fr))', 
                                        gap: '8px' 
                                      }}
                                    >
                                      {(() => {
                                        const hasCoreSlots = availableSlots.some(s => {
                                          const h = parseInt(s.start.split(':')[0]);
                                          return h >= 10 && h < 18;
                                        });
                                        const slotsToDisplay = (showAllTimes || !hasCoreSlots)
                                          ? availableSlots 
                                          : availableSlots.filter(s => {
                                              const h = parseInt(s.start.split(':')[0]);
                                              return h >= 10 && h < 18;
                                            });

                                        return slotsToDisplay.map((slot, idx) => (
                                          <button
                                            key={idx}
                                            type="button"
                                            className="btn btn-sm btn-outline-primary px-2 py-2 rounded font-weight-semibold d-flex align-items-center justify-content-center gap-1 transition-all shadow-sm border"
                                            style={{ 
                                              fontSize: '0.82rem', 
                                              background: '#ffffff', 
                                              borderColor: '#c7d2fe', 
                                              color: '#4f46e5',
                                              borderRadius: '8px',
                                              transition: 'all 0.2s ease'
                                            }}
                                            onClick={() => {
                                              setAvailForm(prev => ({
                                                ...prev,
                                                startTime: slot.start,
                                                endTime: slot.end
                                              }));
                                              Swal.fire({
                                                toast: true,
                                                position: 'top-end',
                                                icon: 'success',
                                                title: `Time set: ${slot.label}`,
                                                showConfirmButton: false,
                                                timer: 1500
                                              });
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = '#4f46e5';
                                              e.currentTarget.style.color = '#ffffff';
                                              e.currentTarget.style.transform = 'translateY(-1.5px)';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = '#ffffff';
                                              e.currentTarget.style.color = '#4f46e5';
                                              e.currentTarget.style.transform = 'translateY(0px)';
                                            }}
                                          >
                                            ➕ {slot.label}
                                          </button>
                                        ));
                                      })()}
                                    </div>
                                    
                                    {availableSlots.some(s => {
                                      const h = parseInt(s.start.split(':')[0]);
                                      return h < 10 || h >= 18;
                                    }) && (
                                      <div className="text-center mt-3 pt-2 border-top" style={{ borderColor: '#f3e8ff' }}>
                                        <button
                                          type="button"
                                          className="btn btn-link text-decoration-none p-0 font-weight-bold"
                                          style={{ fontSize: '0.82rem', color: '#4f46e5' }}
                                          onClick={() => setShowAllTimes(!showAllTimes)}
                                        >
                                          {showAllTimes ? "👁️ Show Core Hours Only (10 AM - 6 PM)" : `👁️ Show All Slots (${availableSlots.length} available)`}
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Auto-Alternative Recommendations shown right here on the page */}
                                {alternatives && alternatives.length > 0 && (
                                  <div className="mt-3 pt-3 border-top" style={{ borderColor: '#e8d5ff' }}>
                                    <span className="text-secondary font-weight-semibold d-block mb-2 text-uppercase" style={{ fontSize: '0.74rem', letterSpacing: '0.5px', color: '#4f46e5' }}>
                                      💡 Recommended Alternatives (Click to select):
                                    </span>
                                    <div className="d-flex flex-column gap-2">
                                      {alternatives.map((alt, idx) => (
                                        <button
                                          key={idx}
                                          type="button"
                                          className="btn btn-sm btn-outline-primary text-start px-3 py-2.5 rounded transition-all shadow-sm border"
                                          style={{ 
                                            fontSize: '0.82rem', 
                                            background: '#ffffff', 
                                            borderColor: '#c7d2fe', 
                                            color: '#4f46e5',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s ease',
                                            lineHeight: '1.4'
                                          }}
                                          onClick={() => {
                                            if (alt.type === 'alt-venue' || alt.type === 'venue') {
                                              setAvailForm(prev => ({ ...prev, venueId: alt.venueId }));
                                            } else {
                                              setAvailForm(prev => ({ ...prev, startTime: alt.start, endTime: alt.end }));
                                            }
                                            Swal.fire({
                                              toast: true,
                                              position: 'top-end',
                                              icon: 'success',
                                              title: `Selected: ${alt.label}`,
                                              showConfirmButton: false,
                                              timer: 1500
                                            });
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#4f46e5';
                                            e.currentTarget.style.color = '#ffffff';
                                            e.currentTarget.style.transform = 'translateY(-1.5px)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                            e.currentTarget.style.color = '#4f46e5';
                                            e.currentTarget.style.transform = 'translateY(0px)';
                                          }}
                                        >
                                          {alt.type === 'alt-venue' || alt.type === 'venue' ? '🏢' : '🕒'} {alt.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4">
                        <button 
                          type="submit" 
                          className="btn btn-gradient-primary btn-lg w-100 py-3 text-white font-weight-bold shadow-sm"
                          disabled={loading}
                          style={{
                            background: 'linear-gradient(to right, #818cf8, #4f46e5)',
                            border: 'none',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1.5px)';
                            e.currentTarget.style.boxShadow = '0 6px 15px rgba(79, 70, 229, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Checking Slot Availability...
                            </>
                          ) : 'Check Availability'}
                        </button>
                      </div>
                    </form>
                  )}

                  {activeSubTab === 'track' && (
                    <div className="animate-fade-in mt-4 pt-2">
                      <form onSubmit={handleTrackBooking} className="mb-5">
                        <label className="form-label font-weight-bold text-dark d-flex align-items-center gap-2 mb-2.5" style={{ fontSize: '0.96rem' }}>
                          <Search size={18} style={{ color: '#2563EB' }} />
                          Track & Inspect Reservations
                        </label>
                        <div className="d-flex flex-column flex-sm-row gap-3">
                          <div className="position-relative flex-grow-1">
                            <input 
                              type="text" 
                              className="form-control form-control-lg bg-white border shadow-sm px-4 py-3"
                              required
                              placeholder="Type Faculty Name (e.g. Dr. Sharma), Event Title, or Booking ID..."
                              value={trackId}
                              onChange={(e) => setTrackId(e.target.value)}
                              style={{
                                borderRadius: '14px',
                                borderColor: '#CBD5E1',
                                fontSize: '0.92rem',
                                color: '#0F172A'
                              }}
                            />
                          </div>
                          <button 
                            type="submit" 
                            className="btn btn-primary btn-lg px-4 py-3 text-white font-weight-bold shadow-sm d-flex align-items-center justify-content-center gap-2 flex-shrink-0"
                            disabled={trackingLoading}
                            style={{
                              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                              border: 'none',
                              borderRadius: '14px',
                              fontSize: '0.92rem',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
                            }}
                          >
                            {trackingLoading ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Searching...
                              </>
                            ) : (
                              <>
                                <Search size={18} />
                                Track Reservations
                              </>
                            )}
                          </button>
                        </div>
                        <div className="d-flex align-items-center gap-1.5 text-secondary mt-2.5" style={{ fontSize: '0.78rem' }}>
                          <HelpCircle size={13} style={{ color: '#64748B' }} />
                          <span>Forgot your Booking ID? Simply type your Faculty Name or Event Title to view all your recent bookings.</span>
                        </div>
                      </form>

                      {/* Multiple Bookings Selection (Search by Name / Event) */}
                      {trackedResults.length > 1 && !selectedTrackedBooking && (
                        <div className="animate-fade-in mb-5">
                          {/* Search Header Banner */}
                          <div 
                            className="p-4 mb-4 rounded-4 bg-white border shadow-sm" 
                            style={{ borderColor: '#E2E8F0' }}
                          >
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 pb-3 border-bottom" style={{ borderColor: '#F1F5F9' }}>
                              <div className="d-flex align-items-center gap-3">
                                <div style={{ width: 38, height: 38, borderRadius: 12, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <CheckCircle size={18} style={{ color: '#2563EB' }} />
                                </div>
                                <div>
                                  <h6 className="font-weight-bold text-dark mb-0" style={{ fontSize: '1.05rem', color: '#0F172A' }}>
                                    Found {trackedResults.length} {trackedResults.length === 1 ? 'Reservation' : 'Reservations'}
                                  </h6>
                                  <span className="text-secondary" style={{ fontSize: '0.82rem' }}>
                                    {trackId.trim() ? `Showing results matching "${trackId}"` : 'Showing all recent auditorium bookings'}
                                  </span>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-2">
                                <span className="badge px-3 py-2 rounded-pill font-weight-bold" style={{ background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}>
                                  📅 Last 30 Days Filter
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 d-flex align-items-center gap-1.5 text-secondary" style={{ fontSize: '0.82rem' }}>
                              <HelpCircle size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                              <span>Select any reservation record below to inspect full details and download official receipt PDF.</span>
                            </div>
                          </div>

                          {/* ─── DESKTOP DATATABLES VIEW (d-none d-md-block) ─── */}
                          <div className="d-none d-md-block table-responsive border rounded-4 bg-white shadow-sm" style={{ borderColor: '#E2E8F0', overflow: 'hidden' }}>
                            <table className="table table-hover align-middle mb-0 text-start" style={{ fontSize: '0.88rem' }}>
                              <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                                <tr>
                                  <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.6px' }}>
                                    Event Title & Reference ID
                                  </th>
                                  <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.6px' }}>
                                    Venue & Hall
                                  </th>
                                  <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.6px' }}>
                                    Date & Time Schedule
                                  </th>
                                  <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.6px' }}>
                                    Faculty Coordinator
                                  </th>
                                  <th style={{ padding: '14px 18px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.6px', textAlign: 'right' }}>
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {trackedResults.map((b) => {
                                  const todayStr = new Date().toISOString().split('T')[0];
                                  const isUpcoming = b.bookingDate >= todayStr;

                                  return (
                                    <tr 
                                      key={b.id} 
                                      style={{ 
                                        cursor: 'pointer', 
                                        transition: 'all 0.2s ease',
                                        backgroundColor: isUpcoming ? '#FAFCFF' : '#FFFFFF',
                                        borderBottom: '1px solid #F1F5F9'
                                      }}
                                      onClick={() => setSelectedTrackedBooking(b)}
                                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isUpcoming ? '#FAFCFF' : '#FFFFFF'}
                                    >
                                      {/* Column 1: Event Title & Booking ID */}
                                      <td style={{ padding: '16px 18px' }}>
                                        <div className="font-weight-bold text-dark" style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                                          {b.eventName}
                                        </div>
                                        <div className="mt-1 d-flex align-items-center gap-1.5">
                                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.76rem', color: '#4338CA', background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>
                                            {b.id}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Column 2: Venue & Hall */}
                                      <td style={{ padding: '16px 18px' }}>
                                        <div className="d-flex align-items-center gap-2 font-weight-semibold" style={{ color: '#1E293B', fontSize: '0.88rem' }}>
                                          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Building2 size={15} style={{ color: '#2563EB' }} />
                                          </div>
                                          <span>{b.venueName}</span>
                                        </div>
                                      </td>

                                      {/* Column 3: Date & Schedule */}
                                      <td style={{ padding: '16px 18px' }}>
                                        <div className="d-flex align-items-center gap-2 font-weight-bold" style={{ color: '#0F172A', fontSize: '0.88rem' }}>
                                          <Calendar size={14} style={{ color: '#6366F1', flexShrink: 0 }} />
                                          <span>{b.bookingDate}</span>
                                          {isUpcoming ? (
                                            <span style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                                              Upcoming
                                            </span>
                                          ) : (
                                            <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                                              Past
                                            </span>
                                          )}
                                        </div>
                                        <div className="d-flex align-items-center gap-1.5 text-secondary" style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                                          <Clock size={13} style={{ flexShrink: 0 }} />
                                          <span>{b.startTime} - {b.endTime}</span>
                                        </div>
                                      </td>

                                      {/* Column 4: Faculty Coordinator */}
                                      <td style={{ padding: '16px 18px' }}>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                          <div className="d-flex align-items-center gap-1.5 font-weight-bold" style={{ color: '#0F172A', fontSize: '0.88rem' }}>
                                            <User size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                                            <span>{b.facultyName}</span>
                                          </div>
                                          {b.deptName && (
                                            <span style={getDeptBadgeStyle(b.deptName)}>
                                              {b.deptName}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Column 5: Action Button */}
                                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                                        <button 
                                          type="button"
                                          className="btn btn-sm font-weight-bold rounded-pill px-3.5 py-2 text-white shadow-sm d-inline-flex align-items-center gap-1.5"
                                          style={{ 
                                            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', 
                                            border: 'none', 
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTrackedBooking(b);
                                          }}
                                        >
                                          Inspect Details <ArrowRight size={13} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* ─── MOBILE CARD VIEW (d-block d-md-none) ─── */}
                          <div className="d-block d-md-none">
                            <div className="d-flex flex-column gap-3">
                              {trackedResults.map((b) => {
                                const todayStr = new Date().toISOString().split('T')[0];
                                const isUpcoming = b.bookingDate >= todayStr;

                                return (
                                  <div 
                                    key={b.id}
                                    className="bg-white border rounded-4 p-3.5 shadow-sm"
                                    style={{ 
                                      borderColor: isUpcoming ? '#BFDBFE' : '#E2E8F0',
                                      background: isUpcoming ? 'linear-gradient(180deg, #FAFCFF 0%, #FFFFFF 100%)' : '#FFFFFF',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedTrackedBooking(b)}
                                  >
                                    {/* Top Row: Event Name + Upcoming Badge */}
                                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                      <div>
                                        <h6 className="font-weight-bold text-dark mb-1" style={{ fontSize: '1rem', color: '#0F172A', lineHeight: 1.3 }}>
                                          {b.eventName}
                                        </h6>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.74rem', color: '#4338CA', background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>
                                          {b.id}
                                        </span>
                                      </div>

                                      {isUpcoming ? (
                                        <span style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                                          Upcoming
                                        </span>
                                      ) : (
                                        <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}>
                                          Past
                                        </span>
                                      )}
                                    </div>

                                    {/* Info Grid */}
                                    <div className="p-2.5 my-2.5 rounded-3 bg-light border d-flex flex-column gap-2" style={{ fontSize: '0.84rem' }}>
                                      <div className="d-flex align-items-center gap-2 font-weight-bold" style={{ color: '#1E293B' }}>
                                        <Building2 size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                                        <span>{b.venueName}</span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2" style={{ color: '#334155' }}>
                                        <Calendar size={14} style={{ color: '#6366F1', flexShrink: 0 }} />
                                        <span className="font-weight-semibold">{b.bookingDate}</span>
                                        <span className="text-muted">({b.startTime} - {b.endTime})</span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2" style={{ color: '#334155' }}>
                                        <User size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                                        <span className="font-weight-bold">{b.facultyName}</span>
                                        {b.deptName && (
                                          <span style={getDeptBadgeStyle(b.deptName)}>
                                            {b.deptName}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Bottom Action Button */}
                                    <div className="d-flex justify-content-end align-items-center mt-3 pt-2 border-top" style={{ borderColor: '#F1F5F9' }}>
                                      <button 
                                        type="button"
                                        className="btn btn-sm font-weight-bold rounded-pill px-3 py-1.5 text-white shadow-sm d-inline-flex align-items-center gap-1.5"
                                        style={{ 
                                          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', 
                                          border: 'none', 
                                          fontSize: '0.8rem'
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedTrackedBooking(b);
                                        }}
                                      >
                                        Inspect Details <ArrowRight size={13} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Single Selected Tracked Booking Detail Card */}
                      {selectedTrackedBooking && (
                        <div className="premium-card bg-light border p-4 animate-fade-in">
                          {trackedResults.length > 1 && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-secondary mb-3 font-weight-semibold d-inline-flex align-items-center gap-1"
                              onClick={() => setSelectedTrackedBooking(null)}
                            >
                              <ChevronLeft size={16} /> Back to Search Results ({trackedResults.length})
                            </button>
                          )}

                          <div className="d-flex justify-content-between align-items-center border-bottom pb-2.5 mb-3 flex-wrap gap-2">
                            <h5 className="font-weight-bold text-primary mb-0" style={{ fontSize: '1.2rem' }}>{selectedTrackedBooking.eventName}</h5>
                            <span className={`badge px-3 py-2 rounded-pill font-weight-bold ${
                              selectedTrackedBooking.status === 'Approved' ? 'bg-success text-white' :
                              selectedTrackedBooking.status === 'Rejected' ? 'bg-danger text-white' : 'bg-warning text-dark'
                            }`} style={{ fontSize: '0.85rem' }}>
                              {selectedTrackedBooking.status === 'Approved' ? 'Confirmed' : selectedTrackedBooking.status}
                            </span>
                          </div>

                          <div className="row g-3 text-dark" style={{ fontSize: '0.95rem' }}>
                            <div className="col-12 col-sm-6">
                              <strong>Booking Reference ID:</strong> 
                              <span className="font-monospace text-dark bg-white border px-2 py-1 rounded ms-2" style={{ fontSize: '0.88rem' }}>
                                {selectedTrackedBooking.id}
                              </span>
                            </div>
                            <div className="col-12 col-sm-6">
                              <strong>Venue (Hall):</strong> {selectedTrackedBooking.venueName}
                            </div>
                            <div className="col-12 col-sm-6">
                              <strong>Booking Date:</strong> {selectedTrackedBooking.bookingDate}
                            </div>
                            <div className="col-12 col-sm-6">
                              <strong>Time Schedule:</strong> {selectedTrackedBooking.startTime} - {selectedTrackedBooking.endTime}
                            </div>
                            <div className="col-12 col-sm-6">
                              <strong>Faculty Member:</strong> {selectedTrackedBooking.facultyName}
                            </div>
                            <div className="col-12 col-sm-6">
                              <strong>Department:</strong> {selectedTrackedBooking.deptName}
                            </div>
                            {selectedTrackedBooking.attendees && (
                              <div className="col-12 col-sm-6">
                                <strong>Expected Attendees:</strong> {selectedTrackedBooking.attendees} People
                              </div>
                            )}
                            <div className="col-12">
                              <strong>Event Description & Objective:</strong>
                              <p className="text-muted mt-1.5 p-3 bg-white rounded border" style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
                                {selectedTrackedBooking.eventDescription || 'No detailed description specified.'}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons for Receipt Download */}
                          <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <button 
                              type="button" 
                              className="btn btn-outline-primary font-weight-bold d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedTrackedBooking.id);
                                Swal.fire({
                                  toast: true,
                                  position: 'top-end',
                                  icon: 'success',
                                  title: 'Booking ID copied to clipboard!',
                                  showConfirmButton: false,
                                  timer: 1500
                                });
                              }}
                            >
                              📋 Copy Booking ID
                            </button>

                            <button 
                              type="button" 
                              className="btn btn-primary font-weight-bold d-flex align-items-center gap-2 px-4 py-2 rounded-3 text-white shadow-sm"
                              style={{ background: 'linear-gradient(to right, #818cf8, #4f46e5)', border: 'none' }}
                              onClick={() => downloadPDFReceipt(selectedTrackedBooking)}
                            >
                              <Download size={16} /> Download Official PDF Receipt
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Fill Details Form */}
              {step === 2 && (
                <form onSubmit={handleSubmitBooking}>
                  {/* Selected Slot Recap */}
                  <div className="premium-card p-3 mb-4" style={{ background: '#f8f9fa', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <h6 className="font-weight-bold text-muted mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>Selected Schedule</h6>
                    <div className="row g-2 text-dark">
                      <div className="col-12 col-md-4 d-flex align-items-center">
                        <MapPin size={16} className="text-primary me-2" />
                        <span><strong>Venue:</strong> {selectedVenue?.name}</span>
                      </div>
                      <div className="col-6 col-md-4 d-flex align-items-center">
                        <Calendar size={16} className="text-primary me-2" />
                        <span><strong>Date:</strong> {availForm.bookingDate}</span>
                      </div>
                      <div className="col-6 col-md-4 d-flex align-items-center">
                        <Clock size={16} className="text-primary me-2" />
                        <span><strong>Time:</strong> {availForm.startTime} - {availForm.endTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label font-weight-bold text-secondary">Event Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><BookOpen size={18} className="text-muted" /></span>
                        <input 
                          type="text" 
                          className="form-control form-control-lg bg-light border-start-0" 
                          required
                          placeholder="e.g. Guest Lecture on Cyber Security"
                          value={bookingForm.eventName}
                          onChange={(e) => setBookingForm({ ...bookingForm, eventName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label font-weight-bold text-secondary">Department</label>
                      <CustomSelect 
                        value={bookingForm.departmentId}
                        onChange={(val) => setBookingForm({ ...bookingForm, departmentId: val })}
                        options={departments.map(d => ({ value: d.id, label: d.name }))}
                        placeholder="Select Department..."
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label font-weight-bold text-secondary">Faculty</label>
                      <CustomSelect 
                        value={bookingForm.facultyId}
                        onChange={(val) => setBookingForm({ ...bookingForm, facultyId: val })}
                        options={filteredFaculties.map(f => ({ value: f.id, label: f.name }))}
                        placeholder="Select Faculty..."
                        disabled={!bookingForm.departmentId}
                      />
                    </div>

                    {/* Faculty Contact details (Read-only) */}
                    {selectedFaculty && (
                      <div className="col-12 animate-fade-in">
                        <div className="p-3 rounded bg-light border d-flex justify-content-between flex-wrap gap-2 text-secondary" style={{ fontSize: '0.9rem' }}>
                          <span><strong>Email:</strong> {selectedFaculty.email}</span>
                          <span><strong>Mobile:</strong> {selectedFaculty.mobile ? (selectedFaculty.mobile.trim().startsWith('+') ? selectedFaculty.mobile : `+91 ${selectedFaculty.mobile}`) : ''}</span>
                        </div>
                      </div>
                    )}

                    <div className="col-12 col-md-6">
                      <label className="form-label font-weight-bold text-secondary">Number of Attendees</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><Users size={18} className="text-muted" /></span>
                        <input 
                          type="number" 
                          className="form-control form-control-lg bg-light border-start-0" 
                          required
                          placeholder="e.g. 150"
                          value={bookingForm.attendees}
                          onChange={(e) => setBookingForm({ ...bookingForm, attendees: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label font-weight-bold text-secondary">Event Description</label>
                      <textarea 
                        className="form-control bg-light" 
                        rows="3"
                        required
                        placeholder="Brief summary of the schedule, target audience, guest details, etc..."
                        value={bookingForm.eventDescription}
                        onChange={(e) => setBookingForm({ ...bookingForm, eventDescription: e.target.value })}
                      />
                    </div>


                  </div>

                  <div className="mt-4 d-flex gap-3">
                    <button 
                      type="button" 
                      className="btn btn-light btn-lg w-50 py-3 text-secondary font-weight-bold transition-all border"
                      style={{ borderRadius: '10px' }}
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-gradient-primary btn-lg w-50 py-3 text-white font-weight-bold shadow-sm"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(to right, #818cf8, #4f46e5)',
                        border: 'none',
                        borderRadius: '10px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                        e.currentTarget.style.boxShadow = '0 6px 15px rgba(79, 70, 229, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Confirmation / Thank You */}
              {step === 3 && bookingResult && (
                <div className="text-center py-4 animate-fade-in">
                  {/* Hidden logo image for PDF generation */}
                  <img id="college-logo-img" src="/Logo.png" style={{ display: 'none' }} alt="college-logo" />
                  <CheckCircle size={60} className="text-success mb-3" />
                  <h1 className="font-weight-bold text-success mb-1">Booking Confirmed!</h1>
                  <p className="text-muted">Your booking has been successfully confirmed and approved.</p>

                  {/* Details block (Centered Datatable Card) */}
                  <div className="d-flex justify-content-center my-4 mx-2 animate-fade-in">
                    <div 
                      className="p-4 border rounded-3 bg-white text-start shadow-sm" 
                      style={{ 
                        fontSize: '0.92rem', 
                        maxWidth: '600px', 
                        width: '100%',
                        borderColor: '#e2e8f0',
                        boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)'
                      }}
                    >
                      {/* Card Header */}
                      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3.5 flex-wrap gap-2">
                        <div>
                          <h5 className="font-weight-bold text-dark mb-0" style={{ letterSpacing: '-0.3px', fontSize: '1.15rem' }}>Booking Receipt</h5>
                        </div>
                        <span className="badge bg-success text-white px-3 py-2 rounded-pill font-weight-bold shadow-sm" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                          Confirmed
                        </span>
                      </div>

                      {/* Datatable Wrapper */}
                      <div className="table-responsive border rounded-3" style={{ overflow: 'hidden' }}>
                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
                          <tbody>
                            <tr>
                              <td className="bg-light font-weight-bold text-secondary border-end" style={{ width: '160px', padding: '12px 16px' }}>Faculty</td>
                              <td className="font-weight-semibold text-dark" style={{ padding: '12px 16px' }}>{selectedFaculty?.name}</td>
                            </tr>
                            <tr>
                              <td className="bg-light font-weight-bold text-secondary border-end" style={{ padding: '12px 16px' }}>Event Name</td>
                              <td className="font-weight-semibold text-dark" style={{ padding: '12px 16px' }}>{bookingResult.eventName}</td>
                            </tr>
                            <tr>
                              <td className="bg-light font-weight-bold text-secondary border-end" style={{ padding: '12px 16px' }}>Booking ID</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#1e293b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                                  {bookingResult.id}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="bg-light font-weight-bold text-secondary border-end" style={{ padding: '12px 16px' }}>Venue (Hall)</td>
                              <td className="font-weight-semibold text-dark" style={{ padding: '12px 16px' }}>{selectedVenue?.name}</td>
                            </tr>
                            <tr>
                              <td className="bg-light font-weight-bold text-secondary border-end" style={{ padding: '12px 16px' }}>Date</td>
                              <td className="font-weight-semibold text-dark" style={{ padding: '12px 16px' }}>{bookingResult.bookingDate}</td>
                            </tr>
                            <tr>
                              <td className="bg-light font-weight-bold text-secondary border-end" style={{ padding: '12px 16px' }}>Time Schedule</td>
                              <td className="font-weight-semibold text-dark" style={{ padding: '12px 16px' }}>{bookingResult.startTime} - {bookingResult.endTime}</td>
                            </tr>
                            <tr>
                              <td className="bg-light font-weight-bold text-secondary border-end" style={{ padding: '12px 16px' }}>Department</td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={getDeptBadgeStyle(selectedDept?.name)}>
                                  {selectedDept?.name}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Notice Alert Box */}
                  <div 
                    className="d-flex align-items-center gap-3 p-3.5 mx-auto rounded-3 border text-start mb-4 animate-fade-in animate-duration-300"
                    style={{ 
                      maxWidth: '660px', 
                      backgroundColor: '#e6fffa', 
                      borderColor: '#b2f5ea',
                      color: '#006d5b'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                      <HelpCircle size={18} className="text-success" />
                    </div>
                    <div style={{ fontSize: '0.86rem', lineHeight: '1.4' }}>
                      <strong>Important:</strong> An automated email/SMS confirmation has been dispatched to the faculty member with the booking details.
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="d-flex justify-content-center align-items-center flex-wrap gap-3">
                    <button 
                      type="button"
                      className="btn d-flex align-items-center gap-2 px-4 py-3 rounded-pill font-weight-bold text-white shadow-sm transition-all"
                      style={{ 
                        background: 'linear-gradient(to right, #818cf8, #4f46e5)',
                        border: 'none',
                        fontSize: '0.92rem',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => {
                        // Reset booking flow
                        setStep(1);
                        setAvailForm({ venueId: '', bookingDate: '', startTime: '', endTime: '' });
                        setBookingForm({ eventName: '', departmentId: '', facultyId: '', eventDescription: '', attendees: '' });
                        setBookingResult(null);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <PlusCircle size={18} />
                      Book Another Event
                    </button>

                    <button 
                      type="button"
                      className="btn d-flex align-items-center gap-2 px-4 py-3 rounded-pill font-weight-bold transition-all shadow-sm"
                      style={{ 
                        border: '2px solid #4f46e5', 
                        color: '#4f46e5',
                        backgroundColor: 'transparent',
                        fontSize: '0.92rem',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => downloadPDFReceipt(bookingResult)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#eef2ff';
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Download size={18} />
                      Download PDF Receipt
                    </button>

                    <button 
                      type="button"
                      className="btn d-flex align-items-center gap-2 px-4 py-3 rounded-pill font-weight-bold text-secondary transition-all border shadow-sm"
                      style={{ 
                        backgroundColor: '#f1f5f9',
                        borderColor: '#cbd5e1',
                        fontSize: '0.92rem',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => navigate('/')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                        e.currentTarget.style.color = '#0f172a';
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.color = 'var(--secondary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Home size={18} />
                      Exit to Home
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Rich Footer Component */}
      <Footer />
    </div>
  );
}

