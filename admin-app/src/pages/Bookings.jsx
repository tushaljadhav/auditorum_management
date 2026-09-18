import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Search, ShieldAlert, CheckCircle2,
  Clock, MapPin, Users, X, Check
} from 'lucide-react';
import { adminApi } from '../api/client';
import Swal from 'sweetalert2';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideAction, setOverrideAction] = useState('cancel');
  const [overrideReason, setOverrideReason] = useState('');
  const [reassignVenueId, setReassignVenueId] = useState('');

  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bData, vData] = await Promise.all([
        adminApi.getBookings(),
        adminApi.getVenues(),
      ]);
      if (Array.isArray(bData)) {
        bData.sort((a, b) => (b.bookingDate || '').localeCompare(a.bookingDate || ''));
        setBookings(bData);
      }
      setVenues(Array.isArray(vData) ? vData : []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatTime12h = (t) => {
    if (!t) return '—';
    const [hStr, mStr] = t.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return t;
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (b.eventName || '').toLowerCase().includes(q) ||
      (b.coordinator || '').toLowerCase().includes(q) ||
      (b.departmentName || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CONFIRMED' && !b.status?.toLowerCase().includes('cancel')) ||
      (statusFilter === 'CANCELLED' && b.status?.toLowerCase().includes('cancel'));

    return matchesSearch && matchesStatus;
  });

  const openOverride = (bk) => {
    setSelectedBooking(bk);
    setOverrideAction('cancel');
    setOverrideReason('');
    setReassignVenueId(venues[0]?.id || '');
    setOverrideModalOpen(true);
  };

  const handleExecuteOverride = async () => {
    if (!selectedBooking) return;
    try {
      if (overrideAction === 'cancel') {
        await adminApi.cancelBooking(selectedBooking.id, overrideReason || 'Cancelled by Administrator');
        Swal.fire({ icon: 'success', title: 'Booking Cancelled', timer: 1200, showConfirmButton: false });
      } else {
        await adminApi.overrideBooking(selectedBooking.id, {
          action: 'reassign',
          venueId: reassignVenueId,
          reason: overrideReason || 'Hall re-assigned by Admin',
        });
        Swal.fire({ icon: 'success', title: 'Hall Reassigned', timer: 1200, showConfirmButton: false });
      }
      setOverrideModalOpen(false);
      loadData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Action Failed', text: err.message });
    }
  };

  const handleViewAttendance = async (bk) => {
    setSelectedBooking(bk);
    setRosterModalOpen(true);
    setLoadingRoster(true);
    try {
      const data = await adminApi.getAttendance(bk.id);
      setAttendanceList(Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []));
    } catch {
      setAttendanceList([]);
    } finally {
      setLoadingRoster(false);
    }
  };

  return (
    <div className="safe-bottom" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Event Bookings
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          {bookings.length} Total Registered College Events
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          <Search size={15} />
        </div>
        <input
          type="text"
          placeholder="Search events or coordinators..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ paddingLeft: 38, height: 42, borderRadius: 12, fontSize: 13 }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setStatusFilter('ALL')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: statusFilter === 'ALL' ? 'var(--primary)' : '#FFFFFF',
            color: statusFilter === 'ALL' ? '#FFFFFF' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setStatusFilter('CONFIRMED')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: statusFilter === 'CONFIRMED' ? 'var(--primary)' : '#FFFFFF',
            color: statusFilter === 'CONFIRMED' ? '#FFFFFF' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          Confirmed
        </button>
        <button
          onClick={() => setStatusFilter('CANCELLED')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: statusFilter === 'CANCELLED' ? '#EF4444' : '#FFFFFF',
            color: statusFilter === 'CANCELLED' ? '#FFFFFF' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 130, background: '#E2E8F0', borderRadius: 16 }} />
          <div style={{ height: 130, background: '#E2E8F0', borderRadius: 16 }} />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="admin-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No reservations found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredBookings.map((bk) => {
            const venue = venues.find(v => v.id === bk.venueId);
            const isCancelled = (bk.status || '').toLowerCase().includes('cancel');

            return (
              <div
                key={bk.id}
                className="admin-card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 42,
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--surface-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {bk.bookingDate ? new Date(bk.bookingDate).toLocaleDateString('en-US', { month: 'short' }) : 'EVT'}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {bk.bookingDate ? bk.bookingDate.split('-')[2] : '•'}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: 14, fontWeight: 850, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {bk.eventName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {bk.departmentName || 'Academic'} • {bk.coordinator || 'Coordinator'}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${isCancelled ? 'badge-danger' : 'badge-success'}`}>
                    {isCancelled ? 'Cancelled' : 'Confirmed'}
                  </span>
                </div>

                <div style={{
                  background: 'var(--surface-subtle)',
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={12} color="var(--primary)" />
                    <span style={{ fontWeight: 750, color: 'var(--text-primary)' }}>{venue?.name || 'Hall'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="var(--text-muted)" />
                    <span>{formatTime12h(bk.startTime)} - {formatTime12h(bk.endTime)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, paddingTop: 6 }}>
                  <button
                    onClick={() => handleViewAttendance(bk)}
                    style={{
                      flex: 1,
                      height: 34,
                      borderRadius: 8,
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      color: 'var(--primary-dark)',
                      fontSize: 11,
                      fontWeight: 750,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      cursor: 'pointer',
                    }}
                  >
                    <Users size={12} /> View Attendance
                  </button>

                  {!isCancelled && (
                    <button
                      onClick={() => openOverride(bk)}
                      style={{
                        height: 34,
                        padding: '0 12px',
                        borderRadius: 8,
                        background: 'var(--surface-subtle)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <ShieldAlert size={12} /> Override
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Override Modal Sheet */}
      {overrideModalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setOverrideModalOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 17, fontWeight: 850, color: 'var(--text-primary)' }}>
                Admin Override
              </h3>
              <button onClick={() => setOverrideModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Modifying: <strong>{selectedBooking.eventName}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Action</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setOverrideAction('cancel')}
                  style={{
                    padding: '9px',
                    borderRadius: 10,
                    border: overrideAction === 'cancel' ? '2px solid #EF4444' : '1px solid var(--border)',
                    background: overrideAction === 'cancel' ? '#FEF2F2' : '#FFFFFF',
                    color: overrideAction === 'cancel' ? '#DC2626' : 'var(--text-secondary)',
                    fontWeight: 750,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel Event
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideAction('reassign')}
                  style={{
                    padding: '9px',
                    borderRadius: 10,
                    border: overrideAction === 'reassign' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: overrideAction === 'reassign' ? 'var(--primary-light)' : '#FFFFFF',
                    color: overrideAction === 'reassign' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: 750,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Reassign Hall
                </button>
              </div>
            </div>

            {overrideAction === 'reassign' && (
              <div className="form-group">
                <label className="form-label">Select Alternative Hall</label>
                <select
                  value={reassignVenueId}
                  onChange={e => setReassignVenueId(e.target.value)}
                  className="form-input"
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.capacity} Seats)</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Reason</label>
              <input
                type="text"
                placeholder="e.g. Hall urgently required for Official Inspection"
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="btn-secondary"
                style={{ flex: 1, height: 44 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteOverride}
                className="btn-primary"
                style={{ flex: 1, height: 44, background: overrideAction === 'cancel' ? '#DC2626' : 'var(--primary)' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Roster Sheet */}
      {rosterModalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={() => setRosterModalOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 850, color: 'var(--text-primary)' }}>
                  Attendance ({attendanceList.length})
                </h3>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {selectedBooking.eventName}
                </div>
              </div>
              <button onClick={() => setRosterModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {loadingRoster ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                Loading check-in logs...
              </div>
            ) : attendanceList.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                No verified student check-ins recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '48vh', overflowY: 'auto' }}>
                {attendanceList.map((st, i) => (
                  <div
                    key={st.id || i}
                    style={{
                      background: 'var(--surface-subtle)',
                      padding: '10px 12px',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {st.studentName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Roll No: {st.rollNumber}
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: 10 }}>
                      <Check size={10} /> Verified ({st.distanceFromVenue != null ? `${st.distanceFromVenue}m` : 'GPS'})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
