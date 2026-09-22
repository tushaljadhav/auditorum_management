import React, { useState, useEffect } from 'react';
import { api, sessionManager, getCachedVenues, getCachedDepartments } from '../api/client';
import { showCustomToast } from '../utils/toast';
import { QRCodeSVG } from 'qrcode.react';
import { downloadOfficialReceiptPDF } from '../utils/pdfHeader';
import {
  Calendar, Clock, Building2, Users, CheckCircle2,
  AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown,
  Download, Search, MapPin, Check, FileDown, Copy,
  Zap, Star, ArrowRight, X, Sparkles
} from 'lucide-react';

// Operating hours: 5:00 AM to midnight
const TIME_SLOTS = [
  '05:00','05:30','06:00','06:30','07:00','07:30',
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30',
  '17:00','17:30','18:00','18:30','19:00','19:30',
  '20:00','20:30','21:00','21:30','22:00','22:30',
  '23:00','23:30','00:00',
];

const STANDARD_DAY_SLOTS = [
  { id: 's1',  start: '05:00', end: '06:00' },
  { id: 's2',  start: '06:00', end: '07:00' },
  { id: 's3',  start: '07:00', end: '08:00' },
  { id: 's4',  start: '08:00', end: '09:00' },
  { id: 's5',  start: '09:00', end: '10:00' },
  { id: 's6',  start: '10:00', end: '11:00' },
  { id: 's7',  start: '11:00', end: '12:00' },
  { id: 's8',  start: '12:00', end: '13:00' },
  { id: 's9',  start: '13:00', end: '14:00' },
  { id: 's10', start: '14:00', end: '15:00' },
  { id: 's11', start: '15:00', end: '16:00' },
  { id: 's12', start: '16:00', end: '17:00' },
  { id: 's13', start: '17:00', end: '18:00' },
  { id: 's14', start: '18:00', end: '19:00' },
  { id: 's15', start: '19:00', end: '20:00' },
  { id: 's16', start: '20:00', end: '21:00' },
  { id: 's17', start: '21:00', end: '22:00' },
  { id: 's18', start: '22:00', end: '23:00' },
  { id: 's19', start: '23:00', end: '00:00' },
];

function timeToMins(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h === 0 ? 24 : h) * 60 + m;
}

function fmt12(t) {
  if (!t) return '';
  const [hStr, mStr] = t.split(':');
  let h = parseInt(hStr, 10);
  const ap = h >= 12 && h < 24 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${ap}`;
}

function calcDurationStr(start, end) {
  if (!start || !end) return '';
  const diff = timeToMins(end) - timeToMins(start);
  if (diff <= 0) return 'Invalid';
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${mins} mins`;
}

/* ── Venue Icon helper ── */
const VENUE_ICONS = ['🏛️', '🎭', '🏟️', '🎪', '🏢', '🎓'];
const VENUE_GRADIENTS = [
  'linear-gradient(135deg, #7C3AED, #4F46E5)',
  'linear-gradient(135deg, #06B6D4, #3B82F6)',
  'linear-gradient(135deg, #10B981, #059669)',
  'linear-gradient(135deg, #F59E0B, #D97706)',
  'linear-gradient(135deg, #EF4444, #DC2626)',
  'linear-gradient(135deg, #8B5CF6, #7C3AED)',
];

/* ── Step 1: Check Availability ── */
function StepAvailability({ onNext, currentUser, venues = [] }) {
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [bookDate, setBookDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [dayBookings, setDayBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotPage, setSlotPage] = useState(0);
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictModalData, setConflictModalData] = useState(null);

  useEffect(() => {
    if (venues.length > 0 && !venueId) setVenueId(venues[0].id);
  }, [venues, venueId]);

  useEffect(() => {
    setSlotPage(0);
  }, [slotFilter, venueId, bookDate]);

  // Load existing bookings on the selected venue & date
  useEffect(() => {
    if (!venueId || !bookDate) return;
    let active = true;
    api.getBookings()
      .then(all => {
        if (!active) return;
        const list = (all || []).filter(b =>
          b.venueId === venueId &&
          b.bookingDate === bookDate &&
          b.status !== 'Cancelled' &&
          b.status !== 'Rejected'
        );
        setDayBookings(list);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [venueId, bookDate]);

  const getSlotAvailability = (slot) => {
    const sStart = timeToMins(slot.start);
    const sEnd = timeToMins(slot.end);
    const conflict = dayBookings.find(b => {
      const bStart = timeToMins(b.startTime);
      const bEnd = timeToMins(b.endTime);
      return sStart < bEnd && sEnd > bStart;
    });
    return { isBooked: Boolean(conflict), conflict };
  };

  const handleCheck = async () => {
    if (!venueId || !bookDate || !startTime || !endTime) {
      showCustomToast('Select Time', 'Please select a time slot or enter custom timing', 'warning');
      return;
    }
    if (timeToMins(startTime) >= timeToMins(endTime)) {
      showCustomToast('Invalid Timing', 'End time must be after start time', 'warning');
      return;
    }
    if (timeToMins(startTime) < 300 || timeToMins(endTime) > 1440) {
      showCustomToast('Operating Hours', 'Bookings are between 5:00 AM and 12:00 AM', 'warning');
      return;
    }

    const sStart = timeToMins(startTime);
    const sEnd = timeToMins(endTime);
    const localConflict = dayBookings.find(b => {
      const bStart = timeToMins(b.startTime);
      const bEnd = timeToMins(b.endTime);
      return sStart < bEnd && sEnd > bStart;
    });

    if (localConflict) {
      const bookedBy = localConflict.facultyName || localConflict.coordinator || 'Faculty';
      setConflictModalData({
        venueName: selectedVenue?.name || 'Hall',
        date: bookDate,
        time: `${fmt12(startTime)} – ${endTime === '00:00' ? '12:00 AM' : fmt12(endTime)}`,
        bookedBy,
        eventName: localConflict.eventName || ''
      });
      setShowConflictModal(true);
      return;
    }

    setChecking(true);
    try {
      const res = await api.checkAvailability({ venueId, bookingDate: bookDate, startTime, endTime });
      const isAvailable = Boolean(res.isAvailable);

      if (isAvailable) {
        // Direct transition to next page if available!
        onNext({ venueId, bookDate, startTime, endTime, selectedVenue });
      } else {
        const conflict = res.conflict || localConflict;
        const bookedBy = conflict?.facultyName || conflict?.coordinator || 'Faculty';
        setConflictModalData({
          venueName: selectedVenue?.name || 'Hall',
          date: bookDate,
          time: `${fmt12(startTime)} – ${endTime === '00:00' ? '12:00 AM' : fmt12(endTime)}`,
          bookedBy,
          eventName: conflict?.eventName || '',
          error: res.error
        });
        setShowConflictModal(true);
      }
    } catch (err) {
      setConflictModalData({
        venueName: selectedVenue?.name || 'Hall',
        date: bookDate,
        time: `${fmt12(startTime)} – ${endTime === '00:00' ? '12:00 AM' : fmt12(endTime)}`,
        bookedBy: localConflict?.facultyName || 'Faculty',
        eventName: localConflict?.eventName || '',
        error: err.message || 'Yeh slot available nahi hai.'
      });
      setShowConflictModal(true);
    } finally {
      setChecking(false);
    }
  };

  const selectedVenue = venues.find(v => v.id === venueId);
  const durationLabel = calcDurationStr(startTime, endTime);
  const bookedCount = STANDARD_DAY_SLOTS.filter(s => getSlotAvailability(s).isBooked).length;
  const freeCount = STANDARD_DAY_SLOTS.length - bookedCount;

  const filteredSuggestions = STANDARD_DAY_SLOTS.filter(s => {
    const { isBooked } = getSlotAvailability(s);
    if (slotFilter === 'free') return !isBooked;
    if (slotFilter === 'booked') return isBooked;
    return true;
  });

  const SLOTS_PER_PAGE = 8;
  const totalSlotPages = Math.ceil(filteredSuggestions.length / SLOTS_PER_PAGE) || 1;
  const visibleSlots = filteredSuggestions.slice(slotPage * SLOTS_PER_PAGE, (slotPage + 1) * SLOTS_PER_PAGE);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 18 }}>
        <div className="section-eyebrow"><Calendar size={11} /> Book a Hall</div>
        <h2 className="section-title">Check Availability</h2>
        <p className="section-subtitle">Pick a venue, date &amp; time slot</p>
      </div>

      {/* ── Modern Decent Venue Selector Dropdown ── */}
      <div style={{ marginBottom: 16 }}>
        <label className="field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><Building2 size={11} style={{ display: 'inline', marginRight: 4 }} />Select Venue</span>
          {venues.length > 0 && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{venues.length} Venues</span>
          )}
        </label>

        {/* Selected Venue Trigger Card */}
        <div
          onClick={() => setVenueDropdownOpen(!venueDropdownOpen)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--r-lg)',
            background: '#FFFFFF',
            border: venueDropdownOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
            boxShadow: venueDropdownOpen ? '0 0 0 3px var(--primary-light)' : '0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0
            }}>
              {selectedVenue ? VENUE_ICONS[venues.findIndex(v => v.id === venueId) % VENUE_ICONS.length] : '🏛️'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">
                {selectedVenue ? selectedVenue.name : 'Select Venue'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                {selectedVenue && (
                  <>
                    <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Users size={11} /> {selectedVenue.capacity} seats
                    </span>
                    {selectedVenue.location && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={11} /> {selectedVenue.location}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{
            color: 'var(--primary)',
            transition: 'transform 0.2s ease',
            transform: venueDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            paddingLeft: 8
          }}>
            <ChevronDown size={18} />
          </div>
        </div>

        {/* Dropdown Options Menu */}
        {venueDropdownOpen && (
          <div style={{
            marginTop: 6,
            borderRadius: 'var(--r-lg)',
            background: '#FFFFFF',
            border: '1.5px solid var(--border)',
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
            overflow: 'hidden',
            zIndex: 60,
            position: 'relative',
            animation: 'fadeIn 0.15s ease'
          }}>
            {venues.map((v, idx) => {
              const isSelected = v.id === venueId;
              const icon = VENUE_ICONS[idx % VENUE_ICONS.length];
              return (
                <div
                  key={v.id}
                  onClick={() => {
                    setVenueId(v.id);
                    setResult(null);
                    setVenueDropdownOpen(false);
                  }}
                  style={{
                    padding: '11px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    borderBottom: idx < venues.length - 1 ? '1px solid var(--border-light)' : 'none',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: isSelected ? '#FFFFFF' : 'var(--surface-subtle)',
                      border: '1px solid ' + (isSelected ? 'var(--primary-border)' : 'var(--border)'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0
                    }}>
                      {icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: isSelected ? 800 : 700,
                        color: isSelected ? 'var(--primary-deeper)' : 'var(--text-primary)'
                      }}>
                        {v.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Users size={11} /> {v.capacity} seats
                        </span>
                        {v.location && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={11} /> {v.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0
                    }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        {/* ── Date ── */}
        <div style={{ marginBottom: 18 }}>
          <label className="field-label"><Calendar size={11} style={{ display: 'inline', marginRight: 4 }} />Date</label>

          {/* Quick day chips */}
          {(() => {
            const today = new Date();
            const chips = [
              { label: 'Today', date: new Date(today) },
              { label: 'Tomorrow', date: new Date(new Date().setDate(today.getDate() + 1)) },
              { label: 'Day After', date: new Date(new Date().setDate(today.getDate() + 2)) },
            ].map(c => ({ ...c, val: c.date.toISOString().split('T')[0] }));
            return (
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {chips.map(c => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => { setBookDate(c.val); setResult(null); }}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: 'var(--r-md)',
                      border: bookDate === c.val ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                      background: bookDate === c.val ? 'var(--primary-light)' : 'var(--surface)',
                      color: bookDate === c.val ? 'var(--primary-deeper)' : 'var(--text-muted)',
                      fontFamily: 'inherit',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    <div>{c.label}</div>
                    <div style={{ fontSize: 9, opacity: 0.75, marginTop: 1 }}>
                      {c.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Date input — styled with icon */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', color: 'var(--primary)', display: 'flex',
            }}>
              <Calendar size={15} />
            </div>
            <input
              className="app-input"
              type="date"
              value={bookDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => { setBookDate(e.target.value); setResult(null); }}
              style={{ paddingLeft: 36, fontWeight: 700, color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* ── Day Slots Grid (Quick Select — Primary) ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Zap size={12} color="var(--primary)" /> Quick Select Slot
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                {freeCount} Free · {bookedCount} Booked
              </div>
            </div>
            <div style={{ display: 'flex', gap: 3, background: 'var(--surface-subtle)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
              {[['all', 'All'], ['free', '🟢'], ['booked', '🔴']].map(([f, l]) => (
                <button key={f} type="button" onClick={() => setSlotFilter(f)} style={{
                  padding: '3px 8px', borderRadius: 6, border: 'none',
                  background: slotFilter === f ? '#FFFFFF' : 'transparent',
                  color: slotFilter === f
                    ? f === 'free' ? '#059669' : f === 'booked' ? '#DC2626' : 'var(--primary)'
                    : 'var(--text-muted)',
                  fontSize: 10, fontWeight: slotFilter === f ? 700 : 500, cursor: 'pointer',
                  boxShadow: slotFilter === f ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease',
                }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="slot-grid">
            {visibleSlots.map(slot => {
              const { isBooked, conflict } = getSlotAvailability(slot);
              const isSelected = !isBooked && Boolean(startTime) && Boolean(endTime) && startTime === slot.start && endTime === slot.end;
              const bookedBy = conflict?.facultyName || conflict?.coordinator || 'Faculty';
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => {
                    if (isBooked) {
                      setConflictModalData({
                        venueName: selectedVenue?.name || 'Hall',
                        date: bookDate,
                        time: `${fmt12(slot.start)} – ${slot.end === '00:00' ? '12:00 AM' : fmt12(slot.end)}`,
                        bookedBy,
                        eventName: conflict?.eventName || '',
                      });
                      setShowConflictModal(true);
                      return;
                    }
                    setStartTime(slot.start);
                    setEndTime(slot.end);
                    setResult(null);
                  }}
                  className={`slot-chip ${isSelected ? 'selected' : isBooked ? 'booked' : 'free'}`}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                    {fmt12(slot.start)} – {slot.end === '00:00' ? '12:00 AM' : fmt12(slot.end)}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>
                    {isBooked ? `👤 ${bookedBy}` : isSelected ? '✓ Selected' : calcDurationStr(slot.start, slot.end)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Slot Pagination Controls ── */}
          {totalSlotPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
              padding: '8px 0',
            }}>
              <button
                type="button"
                disabled={slotPage === 0}
                onClick={() => setSlotPage(p => Math.max(0, p - 1))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '7px 14px', borderRadius: 'var(--r-md)',
                  border: '1.5px solid var(--border)',
                  background: slotPage === 0 ? 'var(--surface-subtle)' : 'var(--surface)',
                  color: slotPage === 0 ? 'var(--text-muted)' : 'var(--primary)',
                  fontSize: 12, fontWeight: 700, cursor: slotPage === 0 ? 'default' : 'pointer',
                  opacity: slotPage === 0 ? 0.45 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                {slotPage + 1} / {totalSlotPages}
              </span>

              <button
                type="button"
                disabled={slotPage >= totalSlotPages - 1}
                onClick={() => setSlotPage(p => Math.min(totalSlotPages - 1, p + 1))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '7px 14px', borderRadius: 'var(--r-md)',
                  border: '1.5px solid var(--primary)',
                  background: slotPage >= totalSlotPages - 1 ? 'var(--surface-subtle)' : 'var(--primary)',
                  color: slotPage >= totalSlotPages - 1 ? 'var(--text-muted)' : '#FFFFFF',
                  fontSize: 12, fontWeight: 700,
                  cursor: slotPage >= totalSlotPages - 1 ? 'default' : 'pointer',
                  opacity: slotPage >= totalSlotPages - 1 ? 0.45 : 1,
                  transition: 'all 0.15s ease',
                  boxShadow: slotPage >= totalSlotPages - 1 ? 'none' : '0 2px 8px rgba(99,102,241,0.35)',
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Custom Timing (Secondary) ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            padding: '8px 12px', borderRadius: 'var(--r-md)',
            background: 'var(--surface-subtle)', border: '1px solid var(--border)',
          }}>
            <Clock size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', flex: 1 }}>Custom Time</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>5:00 AM – 12:00 AM</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="field-label">Start Time</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="app-input"
                  value={startTime}
                  onChange={e => {
                    const newStart = e.target.value;
                    setStartTime(newStart);
                    setResult(null);
                    if (timeToMins(newStart) >= timeToMins(endTime)) {
                      const next = TIME_SLOTS.filter(t => timeToMins(t) > timeToMins(newStart));
                      if (next.length > 0) setEndTime(next[0]);
                    }
                  }}
                  style={{ paddingRight: 32, appearance: 'none', WebkitAppearance: 'none', fontWeight: 700 }}
                >
                  <option value="" disabled>-- Select Start --</option>
                  {TIME_SLOTS.filter(t => t !== '00:00').map(t => (
                    <option key={t} value={t}>{fmt12(t)}</option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="field-label">End Time</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="app-input"
                  value={endTime}
                  onChange={e => { setEndTime(e.target.value); setResult(null); }}
                  style={{ paddingRight: 32, appearance: 'none', WebkitAppearance: 'none', fontWeight: 700 }}
                >
                  <option value="" disabled>-- Select End --</option>
                  {TIME_SLOTS
                    .filter(t => !startTime || timeToMins(t) > timeToMins(startTime))
                    .map(t => (
                      <option key={t} value={t}>
                        {t === '00:00' ? '12:00 AM (Midnight)' : fmt12(t)}
                      </option>
                    ))}
                </select>
                <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--primary)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Timing summary */}
          {startTime && endTime && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: 10,
              background: 'var(--primary-light)', border: '1px solid var(--primary-border)',
              marginTop: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} color="var(--primary)" />
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-deeper)' }}>
                  {fmt12(startTime)} → {endTime === '00:00' ? '12:00 AM' : fmt12(endTime)}
                </span>
              </div>
              <span className="badge badge-violet">{durationLabel}</span>
            </div>
          )}
        </div>

        {/* slot grid and custom timing now rendered above */}

        {/* Check Button */}
        <button
          className="btn-primary"
          onClick={handleCheck}
          disabled={checking || !venueId}
          style={{ marginTop: 16 }}
        >
          {checking
            ? <><span className="spinner-primary" style={{ width: 18, height: 18, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Checking…</>
            : <><Search size={15} /> Check Availability</>
          }
        </button>
      </div>

      {/* ── Slot Already Booked / Conflict Popup Modal ── */}
      {showConflictModal && (
        <div className="modal-backdrop" onClick={() => setShowConflictModal(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 380,
              padding: '24px 20px',
              background: '#FFFFFF',
              borderRadius: 18,
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.18)',
              border: '1.5px solid #FEE2E2',
              animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'center',
            }}
          >
            {/* Header Icon */}
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <AlertTriangle size={28} strokeWidth={2.5} />
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              Slot Available Nahi Hai!
            </h3>

            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: '0 0 16px' }}>
              Yeh slot already kisi aur ne book kiya hua hai. Kripya doosra slot ya timing select karein.
            </p>

            {conflictModalData && (
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: '12px 14px',
                textAlign: 'left',
                marginBottom: 18,
                fontSize: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Venue:</span>
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>{conflictModalData.venueName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Timing:</span>
                  <span style={{ color: '#DC2626', fontWeight: 700 }}>{conflictModalData.time}</span>
                </div>
                {conflictModalData.bookedBy && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Booked By:</span>
                    <span style={{ color: '#1E293B', fontWeight: 700 }}>👤 {conflictModalData.bookedBy}</span>
                  </div>
                )}
                {conflictModalData.eventName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 600 }}>Event:</span>
                    <span style={{ color: '#1E293B', fontWeight: 600 }}>{conflictModalData.eventName}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowConflictModal(false)}
              className="btn-primary"
              style={{
                width: '100%',
                height: 44,
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Choose Another Slot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Booking Form ── */
function StepForm({ slotData, onNext, onBack, currentUser: propUser }) {
  const { venueId, bookDate, startTime, endTime, selectedVenue } = slotData;
  const activeUser = propUser || sessionManager.getUser();

  const [eventName,   setEventName]   = useState('');
  const [deptName,    setDeptName]    = useState(() => activeUser?.departmentName || activeUser?.departmentId || 'General');
  const [facultyName, setFacultyName] = useState(() => activeUser?.name || localStorage.getItem('kirti_faculty_name') || '');
  const [classYear,   setClassYear]   = useState('');
  const [attendees,   setAttendees]   = useState(75);
  const [eventDesc,   setEventDesc]   = useState('');
  const [email,       setEmail]       = useState(() => activeUser?.email || localStorage.getItem('kirti_faculty_email') || '');
  const [phone,       setPhone]       = useState(() => activeUser?.mobile || activeUser?.phone || localStorage.getItem('kirti_faculty_phone') || '');
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    const u = propUser || sessionManager.getUser();
    if (u) {
      if (u.name) setFacultyName(u.name);
      if (u.departmentName || u.departmentId) setDeptName(u.departmentName || u.departmentId);
      if (u.email) setEmail(u.email);
      if (u.mobile || u.phone) setPhone(u.mobile || u.phone);
    } else {
      const sName = localStorage.getItem('kirti_faculty_name');
      if (sName) setFacultyName(sName);
      const sEmail = localStorage.getItem('kirti_faculty_email');
      if (sEmail) setEmail(sEmail);
      const sPhone = localStorage.getItem('kirti_faculty_phone');
      if (sPhone) setPhone(sPhone);
    }
  }, [propUser]);

  const overCapacity = selectedVenue && Number(attendees) > selectedVenue.capacity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventName.trim() || !facultyName.trim()) {
      showCustomToast('Required fields', 'Event name and faculty name are required', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.createBooking({
        venueId, bookingDate: bookDate, startTime, endTime,
        eventName: eventName.trim(),
        departmentName: deptName,
        facultyName: facultyName.trim(),
        classYear: classYear.trim(),
        eventDescription: eventDesc.trim(),
        attendees: Number(attendees),
        coordinator: facultyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      localStorage.setItem('kirti_faculty_name', facultyName.trim());
      if (email.trim()) localStorage.setItem('kirti_faculty_email', email.trim());
      if (phone.trim()) localStorage.setItem('kirti_faculty_phone', phone.trim());
      onNext({ ...res, venueName: selectedVenue?.name || res.venueName, departmentName: deptName });
    } catch (err) {
      showCustomToast('Booking Failed', err.message, 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: 'var(--primary)',
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 16, padding: '4px 0',
      }}>
        <ArrowLeft size={14} /> Back to Availability
      </button>

      {/* Slot Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1039, #2D1B69)',
        borderRadius: 'var(--r-xl)', padding: '16px 18px', marginBottom: 16, color: '#FFFFFF',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(30,16,57,0.35)',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)', filter: 'blur(15px)' }} />
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(196,181,253,0.85)', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>
          Selected Slot
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#FFFFFF', marginBottom: 4 }}>
          {selectedVenue?.name}
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(196,181,253,0.85)', fontWeight: 600 }}>
          <span>📅 {bookDate}</span>
          <span>⏰ {fmt12(startTime)} – {endTime === '00:00' ? '12:00 AM' : fmt12(endTime)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Event Details
        </div>

        <div>
          <label className="field-label">Event / Program Name *</label>
          <input className="app-input" type="text" required placeholder="e.g. Annual Tech Symposium"
            value={eventName} onChange={e => setEventName(e.target.value)} />
        </div>

        <div>
          <label className="field-label">Faculty Coordinator *</label>
          <input className="app-input" type="text" required placeholder="Prof. Name"
            value={facultyName} onChange={e => setFacultyName(e.target.value)} />
        </div>

        <div>
          <label className="field-label">Department</label>
          <input className="app-input" type="text" value={deptName} onChange={e => setDeptName(e.target.value)} />
        </div>

        <div>
          <label className="field-label">Class / Year</label>
          <input className="app-input" type="text" placeholder="e.g. T.Y. IT" value={classYear} onChange={e => setClassYear(e.target.value)} />
        </div>

        <div>
          <label className="field-label">Brief Description (optional)</label>
          <textarea className="app-input" placeholder="Describe the event…" rows={3}
            value={eventDesc} onChange={e => setEventDesc(e.target.value)}
            style={{ resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="field-label">Email (optional)</label>
            <input className="app-input" type="email" placeholder="faculty@college.edu" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Phone (optional)</label>
            <input className="app-input" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting
            ? <><span className="spinner-primary" style={{ width: 18, height: 18, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Confirming…</>
            : <><CheckCircle2 size={16} /> Confirm Booking</>
          }
        </button>
      </form>
    </div>
  );
}

/* ── Step 3: Confirmation ── */
function StepConfirmation({ booking, venues = [], departments = [], onReset }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const qrValue = JSON.stringify({
    bookingId: booking?.id,
    event: booking?.eventName,
    venue: booking?.venueName,
    date: booking?.bookingDate,
  });

  const handleCopy = () => {
    if (!booking?.id) return;
    navigator.clipboard.writeText(booking.id).then(() => {
      setCopied(true);
      showCustomToast('Copied!', booking.id, 'success');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPDF = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      await downloadOfficialReceiptPDF(booking, [], venues, departments);
      showCustomToast('PDF Downloaded!', `Receipt saved for ${booking.id}`, 'success');
    } catch (err) {
      showCustomToast('PDF Error', 'Failed to generate PDF: ' + err.message, 'error');
    } finally { setDownloading(false); }
  };

  return (
    <div className="animate-fade-in">
      {/* Success hero */}
      <div style={{
        background: 'linear-gradient(145deg, #064E3B, #065F46, #047857)',
        borderRadius: 'var(--r-2xl)', padding: '28px 20px',
        color: '#FFFFFF', textAlign: 'center', marginBottom: 16,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(6,95,70,0.35)',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }} />
        <div style={{
          width: 68, height: 68, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: '0 0 0 8px rgba(255,255,255,0.08)',
        }}>
          <CheckCircle2 size={36} color="#FFFFFF" />
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Booking Confirmed!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
          Your hall reservation is successfully recorded.<br />
          Instant approval — no waiting required.
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(255,255,255,0.15)', padding: '5px 14px', borderRadius: 'var(--r-full)', fontSize: 11, fontWeight: 700 }}>
          <Star size={11} /> Kirti M. Doongursee College
        </div>
      </div>

      {/* PDF Download */}
      <div style={{
        background: 'linear-gradient(135deg, #EDE9FE, #E0E7FF)',
        border: '1.5px solid var(--primary-border)',
        borderRadius: 'var(--r-xl)', padding: '18px', marginBottom: 14, textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary-deeper)', marginBottom: 4 }}>
          Official Booking Proof
        </div>
        <div style={{ fontSize: 11, color: 'var(--primary)', marginBottom: 14, lineHeight: 1.5 }}>
          Download college-stamped receipt with QR code &amp; event details
        </div>
        <button
          className="btn-primary"
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{ fontSize: 15, fontWeight: 800 }}
        >
          {downloading
            ? <><span className="spinner-primary" style={{ width: 18, height: 18, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Generating PDF…</>
            : <><FileDown size={18} /> Download PDF Receipt</>
          }
        </button>

        {/* Ref ID */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 14, padding: '8px 12px',
          background: 'rgba(255,255,255,0.7)', borderRadius: 10,
          border: '1px solid rgba(196,181,253,0.6)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Ref ID:</span>
          <span style={{ fontSize: 12, fontWeight: 900, fontFamily: 'monospace', color: 'var(--primary-deeper)' }}>{booking.id}</span>
          <button type="button" onClick={handleCopy} style={{
            background: 'none', border: 'none',
            color: copied ? '#059669' : 'var(--primary)',
            fontSize: 11, fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Booking details receipt */}
      <div className="receipt-card" style={{ marginBottom: 14 }}>
        <div className="receipt-header">
          <div style={{ fontSize: 11, fontWeight: 800, opacity: 0.7, letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' }}>
            Reservation Summary
          </div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{booking.eventName}</div>
        </div>
        <div className="receipt-body">
          {[
            { l: 'Booking ID', v: booking.id, mono: true },
            { l: 'Venue',      v: booking.venueName || '—' },
            { l: 'Date',       v: booking.bookingDate },
            { l: 'Timing',     v: `${fmt12(booking.startTime)} – ${booking.endTime === '00:00' ? '12:00 AM' : fmt12(booking.endTime)}` },
            { l: 'Faculty',    v: booking.facultyName },
            { l: 'Department', v: booking.departmentName },
          ].map(({ l, v, mono }) => (
            <div key={l} className="receipt-row">
              <span className="receipt-row-label">{l}</span>
              <span className="receipt-row-value" style={{ fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? 11 : 13 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* QR Pass */}
      <div className="card" style={{ marginBottom: 14, textAlign: 'center' }}>
        <div className="field-label" style={{ marginBottom: 12 }}>Digital QR Pass</div>
        <div style={{
          display: 'inline-flex', padding: '16px',
          background: '#FFFFFF', borderRadius: 14,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}>
          <QRCodeSVG value={qrValue} size={115} level="M" />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Show this QR or PDF receipt to venue attendants for entry
        </div>
      </div>

      <button className="btn-secondary" onClick={onReset} style={{ padding: '13px' }}>
        <Calendar size={14} /> Make Another Booking
      </button>
    </div>
  );
}

/* ── Step Bar ── */
function StepBar({ step }) {
  const steps = ['Select Timing', 'Details', 'Confirmed'];
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'future'}`}>
              {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
            </div>
            <div style={{
              fontSize: 9, fontWeight: 700,
              color: i <= step ? 'var(--primary)' : 'var(--text-muted)',
              whiteSpace: 'nowrap', letterSpacing: 0.2,
            }}>
              {s}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-line ${i < step ? 'done' : ''}`} style={{ marginBottom: 18 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Main Booking Page ── */
export default function Booking({ currentUser, onOpenAuth }) {
  const [step,        setStep]        = useState(0);
  const [slotData,    setSlotData]    = useState(null);
  const [booking,     setBooking]     = useState(null);
  const [venues,      setVenues]      = useState(() => {
    const cached = getCachedVenues();
    return (cached || []).filter(x => x.status !== 'Maintenance');
  });
  const [departments, setDepartments] = useState(() => getCachedDepartments());
  // Immediate 0ms load if venues are available from cache!
  const [loading,     setLoading]     = useState(() => venues.length === 0);
  const [isWakingUp,  setIsWakingUp]  = useState(false);

  useEffect(() => {
    let active = true;
    const wakeTimer = setTimeout(() => {
      if (active && loading) setIsWakingUp(true);
    }, 2000);

    const hardTimeout = setTimeout(() => {
      if (active && loading) {
        setVenues(getCachedVenues());
        setDepartments(getCachedDepartments());
        setLoading(false);
      }
    }, 4500);

    Promise.all([
      api.getVenues().catch(() => getCachedVenues()),
      api.getDepartments().catch(() => getCachedDepartments())
    ])
      .then(([v, d]) => {
        if (!active) return;
        const validV = (v && v.length > 0) ? v : getCachedVenues();
        const activeV = validV.filter(x => x.status !== 'Maintenance');
        setVenues(activeV.length > 0 ? activeV : getCachedVenues());
        setDepartments((d && d.length > 0) ? d : getCachedDepartments());
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      clearTimeout(wakeTimer);
      clearTimeout(hardTimeout);
    };
  }, []);

  return (
    <div className="page-container">
      <StepBar step={step} />

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <span className="spinner-primary" style={{ margin: '0 auto 14px', display: 'block' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
            {isWakingUp ? 'Waking up secure server…' : 'Loading venues…'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, margin: '0 auto 16px', lineHeight: 1.4 }}>
            {isWakingUp
              ? 'Free cloud servers take a few moments to spin up from sleep mode.'
              : 'Preparing auditorium booking details…'}
          </div>
          {isWakingUp && (
            <button
              type="button"
              onClick={() => {
                setVenues(getCachedVenues());
                setDepartments(getCachedDepartments());
                setLoading(false);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--r-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary-deeper)',
                border: '1px solid var(--primary-border)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              ⚡ Continue with standard auditorium
            </button>
          )}
        </div>
      ) : (
        <>
          {step === 0 && (
            <StepAvailability
              currentUser={currentUser}
              venues={venues}
              departments={departments}
              onNext={data => { setSlotData(data); setStep(1); }}
            />
          )}
          {step === 1 && (
            <StepForm
              slotData={slotData}
              currentUser={currentUser}
              onBack={() => setStep(0)}
              onNext={b => { setBooking(b); setStep(2); }}
            />
          )}
          {step === 2 && (
            <StepConfirmation
              booking={booking}
              venues={venues}
              departments={departments}
              onReset={() => { setStep(0); setSlotData(null); setBooking(null); }}
            />
          )}
        </>
      )}
    </div>
  );
}
