import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Plus, User } from 'lucide-react';

export default function InteractiveCalendar({ onSelectDate, adminMode = false }) {
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
              const isToday = day && 
                new Date().getDate() === day && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year;
              const isSelected = selectedDateStr && day && 
                selectedDateStr === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

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
                      style={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #4f46e5' : isToday ? '1px dashed #4f46e5' : '1px solid transparent',
                        background: isSelected ? '#f5f3ff' : isToday ? '#faf5ff' : 'transparent',
                        fontWeight: (isToday || isSelected) ? '700' : '400',
                        color: isSelected ? '#4f46e5' : '#0F172A',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = isToday ? '#faf5ff' : 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '0.9rem' }}>{day}</span>
                      
                      {/* Booking indicators (dots) */}
                      {dayBookings.length > 0 && (
                        <div className="position-absolute bottom-0 mb-1 d-flex gap-1 justify-content-center w-100">
                          {dayBookings.slice(0, 3).map((_, bIdx) => (
                            <span 
                              key={bIdx} 
                              className="rounded-circle d-inline-block"
                              style={{
                                width: '4px',
                                height: '4px',
                                background: '#8e2de2'
                              }}
                            ></span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-100 h-100 opacity-20"></div>
                  )}
                </div>
              );
            })}
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
                {!adminMode && onSelectDate && (
                  <button 
                    className="btn btn-sm btn-gradient-primary d-flex align-items-center justify-content-center gap-1 py-1.5 px-3 rounded-pill shadow-sm"
                    onClick={() => onSelectDate(selectedDateStr)}
                    style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                  >
                    <Plus size={14} /> Book Date
                  </button>
                )}
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-5 my-auto text-muted d-flex flex-column align-items-center gap-2">
                  <CalendarIcon size={36} className="text-muted opacity-40" />
                  <p className="mb-0 font-weight-semibold" style={{ fontSize: '0.9rem', color: '#0F172A' }}>No Scheduled Events</p>
                  <p className="text-secondary mb-0" style={{ fontSize: '0.8rem' }}>This date is 100% free and available for auditorium bookings.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3 overflow-y-auto pr-1" style={{ maxHeight: '300px' }}>
                  {selectedDayEvents.map((ev, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-4 border shadow-sm"
                      style={{ 
                        backgroundColor: '#FAFCFF', 
                        borderColor: '#CBD5E1',
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
                          <span className="font-weight-semibold">{ev.startTime} - {ev.endTime}</span>
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
