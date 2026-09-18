import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Building2, Users, CheckCircle2,
  AlertTriangle, ArrowRight, ShieldAlert,
  ChevronRight, Download, Plus, Clock, UserCheck, UserX
} from 'lucide-react';
import { adminApi } from '../api/client';
import FacultyModal from '../components/FacultyModal';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facultyModalOpen, setFacultyModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, vData, bData, fData] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.getVenues().catch(() => []),
        adminApi.getBookings().catch(() => []),
        adminApi.getFaculty().catch(() => []),
      ]);
      setStats(sData);
      setVenues(Array.isArray(vData) ? vData : []);
      setFaculty(Array.isArray(fData) ? fData : []);
      if (Array.isArray(bData)) {
        bData.sort((a, b) => (b.bookingDate || '').localeCompare(a.bookingDate || ''));
        setBookings(bData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maintenanceVenues = venues.filter(v => v.status === 'Maintenance');
  const recentBookings = bookings.slice(0, 4);
  const pendingFacultyCount = faculty.filter(f => (f.status || 'Pending').toLowerCase() === 'pending').length;

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

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ height: 70, background: '#E2E8F0', borderRadius: 16 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <div style={{ height: 90, background: '#E2E8F0', borderRadius: 14 }} />
          <div style={{ height: 90, background: '#E2E8F0', borderRadius: 14 }} />
          <div style={{ height: 90, background: '#E2E8F0', borderRadius: 14 }} />
          <div style={{ height: 90, background: '#E2E8F0', borderRadius: 14 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="safe-bottom" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      
      {/* Top Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            Hello, Admin 👋
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
            {todayDateStr} • Kirti College
          </p>
        </div>

        {maintenanceVenues.length > 0 && (
          <span 
            onClick={() => onNavigate('venues')}
            className="badge badge-warning" 
            style={{ cursor: 'pointer', padding: '6px 10px', fontSize: 11 }}
          >
            <ShieldAlert size={12} /> {maintenanceVenues.length} Hall Locked
          </span>
        )}
      </div>

      {/* Pending Faculty Registrations Banner */}
      {pendingFacultyCount > 0 && (
        <div
          onClick={() => onNavigate('faculty')}
          style={{
            background: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: 16,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.12)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#FEF3C7', color: '#D97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <UserCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>
                {pendingFacultyCount} Faculty Registrations Pending
              </div>
              <div style={{ fontSize: 11, color: '#B45309', marginTop: 1 }}>
                Tap to review details & approve phone login access
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#B45309" />
        </div>
      )}

      {/* 4 Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        <div 
          onClick={() => onNavigate('bookings')}
          className="admin-card" 
          style={{ padding: '14px 12px', textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Active Bookings</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', marginTop: 4, letterSpacing: '-0.5px' }}>
            {stats?.totalBookings ?? bookings.length}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 600 }}>Total Scheduled</div>
        </div>

        <div 
          onClick={() => onNavigate('venues')}
          className="admin-card" 
          style={{ padding: '14px 12px', textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>College Halls</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)', marginTop: 4, letterSpacing: '-0.5px' }}>
            {venues.length}
          </div>
          <div style={{ fontSize: 10, color: maintenanceVenues.length > 0 ? 'var(--warning-dark)' : 'var(--success-dark)', marginTop: 2, fontWeight: 700 }}>
            {maintenanceVenues.length > 0 ? `${maintenanceVenues.length} in Maintenance` : 'All Active & Ready'}
          </div>
        </div>

        <div 
          onClick={() => onNavigate('faculty')}
          className="admin-card" 
          style={{
            padding: '14px 12px', textAlign: 'center', cursor: 'pointer',
            border: pendingFacultyCount > 0 ? '1.5px solid #FDE68A' : '1px solid var(--border)'
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Faculty / Users</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#4F46E5', marginTop: 4, letterSpacing: '-0.5px' }}>
            {faculty.length}
          </div>
          <div style={{
            fontSize: 10,
            color: pendingFacultyCount > 0 ? '#D97706' : '#059669',
            marginTop: 2,
            fontWeight: 800
          }}>
            {pendingFacultyCount > 0 ? `⚠️ ${pendingFacultyCount} Pending` : '✓ All Approved'}
          </div>
        </div>

        <div 
          onClick={() => onNavigate('bookings')}
          className="admin-card" 
          style={{ padding: '14px 12px', textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>Attendance</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#059669', marginTop: 4, letterSpacing: '-0.5px' }}>
            {stats?.totalAttendance ?? '240+'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 600 }}>GPS Verified</div>
        </div>
      </div>

      {/* Quick Actions (4-Grid) */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <button
            onClick={() => onNavigate('venues')}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '14px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 750, color: 'var(--text-primary)' }}>Lock Hall</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Maintenance Toggle</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('bookings')}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '14px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarDays size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 750, color: 'var(--text-primary)' }}>Bookings Log</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Schedule & Overrides</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('faculty')}
            style={{
              background: pendingFacultyCount > 0 ? '#FFFBEB' : '#FFFFFF',
              border: `1.5px solid ${pendingFacultyCount > 0 ? '#FDE68A' : 'var(--border)'}`,
              borderRadius: 14,
              padding: '14px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: pendingFacultyCount > 0 ? '#FEF3C7' : 'var(--primary-light)',
              color: pendingFacultyCount > 0 ? '#D97706' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Users size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 750, color: pendingFacultyCount > 0 ? '#92400E' : 'var(--text-primary)' }}>
                Faculty & Users
              </div>
              <div style={{ fontSize: 10, color: pendingFacultyCount > 0 ? '#B45309' : 'var(--text-muted)' }}>
                {pendingFacultyCount > 0 ? `${pendingFacultyCount} Waiting Approval` : 'Manage Logins'}
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '14px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Download size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 750, color: 'var(--text-primary)' }}>Data Backup</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>1-Click Export</div>
            </div>
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Upcoming Schedule
          </div>
          <button
            onClick={() => onNavigate('bookings')}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 750, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
          >
            See All ({bookings.length}) <ChevronRight size={13} />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="admin-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No upcoming bookings scheduled.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentBookings.map((bk) => {
              const venue = venues.find(v => v.id === bk.venueId);
              const isCancelled = (bk.status || '').toLowerCase().includes('cancel');

              return (
                <div
                  key={bk.id}
                  onClick={() => onNavigate('bookings')}
                  className="admin-card"
                  style={{
                    padding: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 48,
                      borderRadius: 12,
                      background: 'var(--surface-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {bk.bookingDate ? new Date(bk.bookingDate).toLocaleDateString('en-US', { month: 'short' }) : 'EVT'}
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {bk.bookingDate ? bk.bookingDate.split('-')[2] : '•'}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {bk.eventName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                        {venue?.name || 'Hall'} • {formatTime12h(bk.startTime)}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${isCancelled ? 'badge-danger' : 'badge-success'}`}>
                    {isCancelled ? 'Cancelled' : 'Confirmed'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Faculty Approvals & Users Modal */}
      <FacultyModal
        isOpen={facultyModalOpen}
        onClose={() => setFacultyModalOpen(false)}
        onUpdated={loadData}
      />

    </div>
  );
}
