import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { showCustomToast } from '../utils/toast';
import { QRCodeSVG } from 'qrcode.react';
import { downloadOfficialReceiptPDF } from '../utils/pdfHeader';
import {
  Calendar, Clock, Building2, Users, CheckCircle2,
  AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight,
  Download, Search, MapPin, Check, FileDown, Copy,
  Zap, Star
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
  { id: 's1',  start: '05:00', end: '07:00' },
  { id: 's2',  start: '07:00', end: '09:00' },
  { id: 's3',  start: '09:00', end: '11:00' },
  { id: 's4',  start: '11:00', end: '13:00' },
  { id: 's5',  start: '13:00', end: '15:00' },
  { id: 's6',  start: '15:00', end: '17:00' },
  { id: 's7',  start: '17:00', end: '19:00' },
  { id: 's8',  start: '19:00', end: '21:00' },
  { id: 's9',  start: '21:00', end: '23:00' },
  { id: 's10', start: '23:00', end: '00:00' },
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
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [slotFilter, setSlotFilter] = useState('all');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [dayBookings, setDayBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotPage, setSlotPage] = useState(0);

  useEffect(() => {
    if (venues.length > 0 && !venueId) setVenueId(venues[0].id);
  }, [venues, venueId]);

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
      showCustomToast('Missing fields', 'Select venue, date, and timing', 'warning');
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
    setChecking(true);
    try {
      const res = await api.checkAvailability({ venueId, bookingDate: bookDate, startTime, endTime });
      setResult({ ...res, available: res.isAvailable });
      setDayBookings(res.bookingsOnDay || []);
      setSlots(res.alternatives || []);
      setSlotPage(0);
    } catch (err) {
      showCustomToast('Error', err.message, 'error');
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

  const SLOTS_PER_PAGE = 6;
  const totalSlotPages = Math.ceil(slots.length / SLOTS_PER_PAGE);
  const visibleSlots = slots.slice(slotPage * SLOTS_PER_PAGE, (slotPage + 1) * SLOTS_PER_PAGE);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 18 }}>
        <div className="section-eyebrow"><Calendar size={11} /> Book a Hall</div>
        <h2 className="section-title">Check Availability</h2>
        <p className="section-subtitle">Pick a venue, date &amp; time slot</p>
      </div>

      {/* ── Venue Dropdown ── */}
      <div style={{ marginBottom: 16 }}>
        <label className="field-label"><Building2 size={11} style={{ display: 'inline', marginRight: 4 }} />Select Venue</label>
        <div style={{ position: 'relative' }}>
          <select
            className="app-input"
            value={venueId}
            onChange={e => { setVenueId(e.target.value); setResult(null); }}
            style={{ paddingRight: 36, appearance: 'none', WebkitAppearance: 'none' }}
          >
            {venues.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.capacity} seats{v.location ? ` · ${v.location}` : ''}
              </option>
            ))}
          </select>
          <div style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', color: 'var(--primary)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        {/* Selected venue info pill */}
        {selectedVenue && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
            padding: '8px 12px', borderRadius: 'var(--r-md)',
            background: 'var(--primary-light)', border: '1px solid var(--primary-border)',
          }}>
            <span style={{ fontSize: 16 }}>{VENUE_ICONS[venues.findIndex(v => v.id === venueId) % VENUE_ICONS.length]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-deeper)' }} className="truncate">{selectedVenue.name}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}><Users size={9} style={{ display: 'inline', marginRight: 2 }} />{selectedVenue.capacity} seats</span>
                {selectedVenue.location && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}><MapPin size={9} style={{ display: 'inline', marginRight: 2 }} />{selectedVenue.location}</span>}
              </div>
            </div>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={11} color="#FFFFFF" strokeWidth={3} />
            </div>
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
            {filteredSuggestions.map(slot => {
              const { isBooked, conflict } = getSlotAvailability(slot);
              const isSelected = startTime === slot.start && endTime === slot.end;
              const bookedBy = conflict?.facultyName || conflict?.coordinator || 'Faculty';
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isBooked}
                  onClick={() => {
                    if (isBooked) return;
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
                  {TIME_SLOTS
                    .filter(t => timeToMins(t) > timeToMins(startTime))
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

      {/* ── Result ── */}
      {result && (
        <div style={{ marginBottom: 14 }}>
          <div style={{
            borderRadius: 'var(--r-lg)', padding: '16px',
            background: result.available ? '#ECFDF5' : '#FEF2F2',
            border: `1.5px solid ${result.available ? '#A7F3D0' : '#FECACA'}`,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {result.available
                ? <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0 }} />
                : <AlertTriangle size={22} color="#DC2626" style={{ flexShrink: 0 }} />
              }
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: result.available ? '#065F46' : '#991B1B' }}>
                  {result.available ? '✓ Slot Available!' : '✗ Slot Not Available'}
                </div>
                {result.available ? (
                  <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>
                    <strong>{selectedVenue?.name}</strong> is free on <strong>{bookDate}</strong> from <strong>{fmt12(startTime)}</strong> to <strong>{endTime === '00:00' ? '12:00 AM' : fmt12(endTime)}</strong> ({durationLabel}).
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#991B1B', marginTop: 4 }}>
                    {result.error || result.conflict || 'This slot overlaps with an existing booking. Pick another time below.'}
                  </div>
                )}
              </div>
            </div>
            {result.available && (
              <button
                className="btn-emerald"
                style={{ marginTop: 14 }}
                onClick={() => onNext({ venueId, bookDate, startTime, endTime, selectedVenue })}
              >
                <Check size={16} /> Proceed to Fill Details
              </button>
            )}
          </div>

          {/* Alternative slots */}
          {slots.length > 0 && (
            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>
                {result.available ? 'OTHER FREE SLOTS TODAY' : 'SUGGESTED ALTERNATIVES'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {visibleSlots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => { setStartTime(slot.startTime || slot.start); setEndTime(slot.endTime || slot.end); setResult(null); }}
                    className="slot-chip free"
                  >
                    <div style={{ fontSize: 11, fontWeight: 700 }}>
                      {fmt12(slot.start)} – {fmt12(slot.end)}
                    </div>
                  </button>
                ))}
              </div>
              {totalSlotPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                  <button onClick={() => setSlotPage(p => Math.max(0, p-1))} disabled={slotPage === 0} className="btn-icon" style={{ width: 30, height: 30 }}><ChevronLeft size={14} /></button>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{slotPage+1}/{totalSlotPages}</span>
                  <button onClick={() => setSlotPage(p => Math.min(totalSlotPages-1, p+1))} disabled={slotPage >= totalSlotPages-1} className="btn-icon" style={{ width: 30, height: 30 }}><ChevronRight size={14} /></button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Booking Form ── */
function StepForm({ slotData, onNext, onBack, currentUser }) {
  const { venueId, bookDate, startTime, endTime, selectedVenue } = slotData;

  const [eventName,   setEventName]   = useState('');
  const [deptName,    setDeptName]    = useState('Information Technology');
  const [facultyName, setFacultyName] = useState(currentUser?.name || '');
  const [classYear,   setClassYear]   = useState('');
  const [attendees,   setAttendees]   = useState(75);
  const [eventDesc,   setEventDesc]   = useState('');
  const [email,       setEmail]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    if (currentUser?.name) setFacultyName(currentUser.name);
    else { const s = localStorage.getItem('kirti_faculty_name'); if (s) setFacultyName(s); }
  }, [currentUser]);

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="field-label">Class / Year</label>
            <input className="app-input" type="text" placeholder="e.g. T.Y. IT" value={classYear} onChange={e => setClassYear(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Attendees</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button type="button"
                onClick={() => setAttendees(a => Math.max(1, Number(a) - 5))}
                style={{ width: 32, height: 38, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
              <input className="app-input" type="number" min={1} max={selectedVenue?.capacity || 1000}
                value={attendees} onChange={e => setAttendees(e.target.value)}
                style={{ textAlign: 'center', padding: '10px 4px' }} />
              <button type="button"
                onClick={() => setAttendees(a => Number(a) + 5)}
                style={{ width: 32, height: 38, borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
            </div>
          </div>
        </div>

        {/* Capacity warning */}
        {overCapacity && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: 'var(--r-md)', padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertTriangle size={16} color="#D97706" />
            <div style={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
              ⚠ {attendees} attendees exceeds <strong>{selectedVenue.name}</strong>'s capacity of <strong>{selectedVenue.capacity}</strong>. Consider booking a larger hall.
            </div>
          </div>
        )}

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
  const [venues,      setVenues]      = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api.getVenues().catch(() => []), api.getDepartments().catch(() => [])])
      .then(([v, d]) => {
        const activeV = (v || []).filter(x => x.status !== 'Maintenance');
        setVenues(activeV);
        setDepartments(d || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <StepBar step={step} />

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <span className="spinner-primary" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading venues…</div>
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
