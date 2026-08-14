import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Plus, User, Lock } from 'lucide-react';

// Configurable Density Thresholds & Tiers for Auditorium Daily Capacity
export const DEFAULT_DENSITY_THRESHOLDS = {
  LIGHT_MAX: 4,     // 1–4 bookings -> Light
  MODERATE_MAX: 9,  // 5–9 bookings -> Moderate
  HEAVY_MIN: 10     // 10+ bookings -> Heavy
};

export const getDensityStyle = (bookingCount, customThresholds = DEFAULT_DENSITY_THRESHOLDS) => {
  if (!bookingCount || bookingCount <= 0) {
    return {
      bg: '#ECFDF5',       // Soft Emerald Green (0 Free)
      textColor: '#15803D',// Dark Forest Green
      fontWeight: '600',
      border: '1px solid #A7F3D0',
      tierName: 'free'
    };
  }
  if (bookingCount <= customThresholds.LIGHT_MAX) {
    return {
      bg: '#FEE2E2',       // Soft Light Red / Rose (1–4 Light)
      textColor: '#991B1B',// Dark Red
      fontWeight: '700',
      border: '1px solid #FECACA',
      tierName: 'light'
    };
  }
  if (bookingCount <= customThresholds.MODERATE_MAX) {
    return {
      bg: '#FCA5A5',       // Medium Red (5–9 Moderate)
      textColor: '#7F1D1D',// Deep Dark Red
      fontWeight: '800',
      border: '1px solid #F87171',
      tierName: 'moderate'
    };
  }
  return {
    bg: '#DC2626',       // Rich Dark Crimson Red (10+ Heavy)
    textColor: '#FFFFFF',// High contrast pure white text
    fontWeight: '900',
    border: '1px solid #991B1B',
    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
    tierName: 'heavy'
  };
};

export default function InteractiveCalendar({ onSelectDate, adminMode = false, densityThresholds = DEFAULT_DENSITY_THRESHOLDS }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch approved bookings & venues
  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then(res => res.json()),
      fetch('/api/venues').then(res => res.json())
    ])
      .then(([bookingsData, venuesData]) => {
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setVenues(Array.isArray(venuesData) ? venuesData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading calendar data:", err);
        setLoading(false);
      });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Create calendar cells array
  const cells = [];
  // Add empty pads for start of month
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }
  // Add days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
    setSelectedDateStr(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
    setSelectedDateStr(null);
  };

  const getVenueName = (vId) => {
    return venues.find(v => v.id === vId)?.name || 'Unknown Venue';
  };

  const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${m} ${ampm}`;
  };

  const getBookingsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.bookingDate === dateStr);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBookings = getBookingsForDate(day);
    setSelectedDayEvents(dayBookings);
    setSelectedDateStr(dateStr);
  };

  const isSelectedDatePast = selectedDateStr ? (() => {
    const [selY, selM, selD] = selectedDateStr.split('-').map(Number);
    const selDateObj = new Date(selY, selM - 1, selD);
    selDateObj.setHours(0, 0, 0, 0);
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    return selDateObj < todayCheck;
  })() : false;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4 animate-fade-in">
      {/* Calendar Grid Col */}
      <div className="col-12 col-md-7">
        <div className="premium-card bg-white border p-4 shadow-sm" style={{ borderRadius: '16px' }}>
          {/* Header Controls */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="font-weight-bold text-dark mb-0">
              {monthNames[month]} {year}
            </h5>
            <div className="d-flex gap-1.5">
              <button className="btn btn-sm btn-outline-secondary p-2 rounded" onClick={handlePrevMonth}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-sm btn-outline-secondary p-2 rounded" onClick={handleNextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            textAlign: 'center', 
            fontWeight: 700, 
            fontSize: '0.75rem', 
            color: '#64748B', 
            marginBottom: '10px' 
          }}>
            <div style={{ color: '#EF4444' }}>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div style={{ color: '#4F46E5' }}>SAT</div>
          </div>

          {/* Days Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: '4px', 
            textAlign: 'center' 
          }}>
            {cells.map((day, idx) => {
              const dayBookings = getBookingsForDate(day);
              const bookingCount = dayBookings.length;
              const densityStyle = getDensityStyle(bookingCount, densityThresholds);

              const todayObj = new Date();
              todayObj.setHours(0, 0, 0, 0);

              const cellDate = day ? new Date(year, month, day) : null;
              if (cellDate) cellDate.setHours(0, 0, 0, 0);
              const isPast = cellDate ? cellDate < todayObj : false;

              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year;
              const isSelected = selectedDateStr && day && 
                selectedDateStr === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

              // Background Fill (Density intensity color with past date styling)
              let cellBackground = isPast && bookingCount === 0 ? '#F8FAFC' : densityStyle.bg;

              // Border
              let cellBorder = densityStyle.border || '1px solid transparent';
              if (isPast && !isSelected) {
                cellBorder = '1px solid #E2E8F0';
              }
              if (isSelected) {
                cellBorder = '2.5px solid #4F46E5';
              } else if (isToday) {
                cellBorder = '2px dashed #4F46E5';
              }

              // Text Color
              let cellTextColor = isPast && bookingCount === 0 ? '#94A3B8' : densityStyle.textColor;
              if (isSelected && bookingCount === 0) {
                cellTextColor = '#4F46E5';
              }

              // Font Weight
              let cellFontWeight = densityStyle.fontWeight;
              if (isSelected || isToday) {
                cellFontWeight = '800';
              }

              return (
                <div 
                  key={idx} 
                  style={{ 
                    width: '100%',
                    aspectRatio: '1',
                    position: 'relative'
                  }}
                >
                  {day ? (
                    <div 
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center cursor-pointer transition-all"
                      onClick={() => handleDayClick(day)}
                      title={isPast ? "Past Date (Locked for new bookings)" : isToday ? "Today" : `${day} ${monthNames[month]}`}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        border: cellBorder,
                        background: cellBackground,
                        fontWeight: cellFontWeight,
                        color: cellTextColor,
                        opacity: isPast && !isSelected ? 0.8 : 1,
                        boxShadow: densityStyle.boxShadow || 'none',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.filter = 'brightness(0.93)';
                          e.currentTarget.style.transform = 'scale(1.04)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = cellBackground;
                          e.currentTarget.style.filter = 'none';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      <span style={{ fontSize: '0.9rem' }}>{day}</span>
                      {isPast && (
                        <span 
                          title="Past Date (Locked)" 
                          style={{ 
                            position: 'absolute', 
                            top: 3, 
                            right: 3, 
                            fontSize: '0.62rem', 
                            lineHeight: 1, 
                            opacity: 0.65,
                            pointerEvents: 'none'
                          }}
                        >
                          🔒
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-100 h-100 opacity-20"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Density Legend Bar */}
          <div className="mt-4 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ borderColor: '#F1F5F9' }}>
            <div className="d-flex align-items-center gap-1.5" style={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748B', display: 'inline-block' }}></span>
              <span>Booking Density:</span>
            </div>

            <div className="d-flex align-items-center flex-wrap gap-2">
              {/* 0 Free Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#15803D', fontSize: '0.75rem', fontWeight: 700, boxShadow: '0 1px 3px rgba(16, 185, 129, 0.08)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                <span>0 Free</span>
              </div>

              {/* 1-4 Light Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '0.75rem', fontWeight: 700, boxShadow: '0 1px 3px rgba(239, 68, 68, 0.08)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
                <span>1–4 Light</span>
              </div>

              {/* 5-9 Moderate Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#FCA5A5', border: '1px solid #F87171', color: '#7F1D1D', fontSize: '0.75rem', fontWeight: 800, boxShadow: '0 1px 4px rgba(220, 38, 38, 0.12)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#991B1B', display: 'inline-block' }}></span>
                <span>5–9 Moderate</span>
              </div>

              {/* 10+ Heavy Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#DC2626', border: '1px solid #991B1B', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 900, boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFFFFF', display: 'inline-block' }}></span>
                <span>10+ Heavy</span>
              </div>

              {/* Past Date Locked Pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '0.72rem' }}>🔒</span>
                <span>Past Date (Locked)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Details Side Col */}
      <div className="col-12 col-md-5">
        <div className="premium-card bg-white border p-4 shadow-sm h-100 d-flex flex-column" style={{ borderRadius: '16px', minHeight: '320px' }}>
          {selectedDateStr ? (
            <div className="d-flex flex-column h-100">
              <div className="border-bottom pb-3 mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div style={{ flex: '1 1 auto', minWidth: '120px' }}>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="font-weight-bold text-dark mb-0" style={{ fontSize: '0.96rem' }}>
                      Date Schedule
                    </h6>
                    {selectedDayEvents.length > 0 && (
                      <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {selectedDayEvents.length} Booked
                      </span>
                    )}
                  </div>
                  <span className="text-secondary font-weight-medium" style={{ fontSize: '0.82rem', display: 'block', marginTop: '2px' }}>
                    {selectedDateStr}
                  </span>
                </div>
                {isSelectedDatePast ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#64748B', fontSize: '0.78rem', fontWeight: 700 }}>
                    <Lock size={13} /> Locked (Past Date)
                  </div>
                ) : (!adminMode && onSelectDate && (
                  <button 
                    className="btn btn-sm btn-gradient-primary d-flex align-items-center justify-content-center gap-1 py-1.5 px-3 rounded-pill shadow-sm"
                    onClick={() => onSelectDate(selectedDateStr)}
                    style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                  >
                    <Plus size={14} /> Book Date
                  </button>
                ))}
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-5 my-auto text-muted d-flex flex-column align-items-center gap-2">
                  {isSelectedDatePast ? <Lock size={36} className="text-muted opacity-40" /> : <CalendarIcon size={36} className="text-muted opacity-40" />}
                  <p className="mb-0 font-weight-semibold" style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                    {isSelectedDatePast ? "Past Date — Locked" : "No Scheduled Events"}
                  </p>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.8rem' }}>
                    {isSelectedDatePast ? "New auditorium bookings are locked for past dates." : "This date is 100% free and available for auditorium bookings."}
                  </p>
                </div>
              ) : (
                <div 
                  className="d-flex flex-column gap-3 custom-scrollbar" 
                  style={{ 
                    flex: 1, 
                    maxHeight: '440px', 
                    overflowY: 'auto', 
                    paddingRight: '6px', 
                    paddingBottom: '12px' 
                  }}
                >
                  {selectedDayEvents.map((ev, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-4 border shadow-sm transition-all"
                      style={{ 
                        backgroundColor: '#FAFCFF', 
                        borderColor: '#E2E8F0',
                        borderLeft: '4px solid #EF4444'
                      }}
                    >
                      {/* Event Title & Booked Badge */}
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <div className="font-weight-bold text-dark" style={{ fontSize: '0.95rem', color: '#0F172A', lineHeight: 1.3 }}>
                          {ev.eventName}
                        </div>
                        <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }}></span>
                          Booked Slot
                        </span>
                      </div>

                      {/* Details Info */}
                      <div className="d-flex flex-column gap-1.5" style={{ fontSize: '0.83rem' }}>
                        <div className="d-flex align-items-center gap-2 font-weight-bold" style={{ color: '#1E293B' }}>
                          <MapPin size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                          <span>{getVenueName(ev.venueId)}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: '0.8rem' }}>
                          <Clock size={13} style={{ color: '#6366F1', flexShrink: 0 }} />
                          <span className="font-weight-semibold">{formatTime12h(ev.startTime)} – {formatTime12h(ev.endTime)}</span>
                        </div>
                        {ev.facultyName && (
                          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                            <User size={13} style={{ flexShrink: 0 }} />
                            <span>Faculty: <strong style={{ color: '#334155' }}>{ev.facultyName}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5 my-auto text-muted d-flex flex-column align-items-center gap-2">
              <CalendarIcon size={40} className="text-muted opacity-30" />
              <p className="mb-0 font-weight-semibold" style={{ fontSize: '0.92rem', color: '#0F172A' }}>Select a Date</p>
              <p className="text-secondary mb-0" style={{ fontSize: '0.82rem' }}>Click any day on the calendar to view its schedule and availability.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
