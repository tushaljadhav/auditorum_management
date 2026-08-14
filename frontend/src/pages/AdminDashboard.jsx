import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Clock, Users, MapPin,
  RefreshCw, ArrowRight, CheckCircle,
  TrendingUp, Building2, ChevronRight, ChevronLeft
} from 'lucide-react';

const STATUS_BADGE = {
  Approved: { class: 'tailux-badge-approved', label: 'Confirmed' },
  Confirmed: { class: 'tailux-badge-approved', label: 'Confirmed' },
  Cancelled: { class: 'tailux-badge-cancelled', label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.Approved;
  return (
    <span className={`tailux-badge ${s.class}`}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}></span>
      {s.label}
    </span>
  );
}

function StatWidget({ icon: Icon, iconBg, iconColor, value, label, sublabel, badgeText, badgeBg, badgeColor }) {
  return (
    <div className="tailux-stat-widget">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="tailux-icon-box" style={{ background: iconBg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        {badgeText && (
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '20px',
            background: badgeBg || '#F1F5F9',
            color: badgeColor || '#475569',
            lineHeight: 1
          }}>
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: 6 }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 650, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
          {label}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, flexShrink: 0 }}>
          {value} booking{value !== 1 ? 's' : ''} ({pct}%)
        </span>
      </div>
      <div style={{ height: 7, background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: '999px', transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [venuePage, setVenuePage] = useState(1);
  const [deptPage, setDeptPage] = useState(1);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, bRes, vRes, dRes, fRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/bookings'),
        fetch('/api/venues'),
        fetch('/api/departments'),
        fetch('/api/faculty'),
      ]);
      const [sData, bData, vData, dData, fData] = await Promise.all([
        sRes.json(), bRes.json(), vRes.json(), dRes.json(), fRes.json(),
      ]);
      setStats(sData);
      if (Array.isArray(bData)) {
        bData.sort((a, b) => b.id.localeCompare(a.id));
        setBookings(bData);
      }
      if (Array.isArray(vData)) setVenues(vData);
      if (Array.isArray(dData)) setDepartments(dData);
      if (Array.isArray(fData)) setFaculties(fData);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getVenueName = id => venues.find(v => v.id === id)?.name || '—';
  const getFacultyName = id => faculties.find(f => f.id === id)?.name || '—';
  const recentBookings = bookings.slice(0, 6);
  const maxVenueCount = Math.max(...(stats?.venueStats || []).map(v => v.count), 1);
  const maxDeptCount = Math.max(...(stats?.deptStats || []).map(d => d.count), 1);

  const VENUE_COLORS = ['#2563EB', '#6366F1', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444'];
  const DEPT_COLORS = ['#6366F1', '#2563EB', '#06B6D4', '#F59E0B', '#22C55E', '#EF4444'];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="tailux-card" style={{ padding: 20 }}>
              <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 12, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: 60, height: 28, borderRadius: 6, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
        <StatWidget 
          icon={CalendarDays} 
          iconBg="#EFF6FF" 
          iconColor="#2563EB" 
          value={stats?.totalBookings ?? 0} 
          label="Total Bookings" 
          sublabel="Instant venue reservations"
          badgeText="Active"
          badgeBg="#EFF6FF"
          badgeColor="#2563EB"
        />
        <StatWidget 
          icon={MapPin} 
          iconBg="#ECFEFF" 
          iconColor="#06B6D4" 
          value={stats?.totalVenues ?? 0} 
          label="Venues & Halls" 
          sublabel="Auditoriums & halls"
          badgeText="Halls"
          badgeBg="#ECFEFF"
          badgeColor="#0891B2"
        />
      </div>

      {/* ─── Middle Section: Analytics Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 20 }}>

        {/* Venue Utilization Widget with DataTables Pagination */}
        {(() => {
          const allVenueStats = stats?.venueStats || [];
          const itemsPerPage = 4;
          const totalPages = Math.ceil(allVenueStats.length / itemsPerPage) || 1;
          const currentPage = Math.min(venuePage, totalPages);
          const paginatedVenueStats = allVenueStats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

          return (
            <div className="tailux-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="tailux-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} style={{ color: '#2563EB' }} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Venue Utilization</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>By Booking Count</span>
                </div>

                <div className="tailux-card-body">
                  {allVenueStats.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '0.85rem' }}>No venue usage data available</div>
                  ) : (
                    paginatedVenueStats.map((v, i) => {
                      const globalIdx = ((currentPage - 1) * itemsPerPage) + i;
                      return (
                        <ProgressBar key={v.id} label={v.name} value={v.count} max={maxVenueCount} color={VENUE_COLORS[globalIdx % VENUE_COLORS.length]} />
                      );
                    })
                  )}
                </div>
              </div>

              {/* DataTables Style Pagination Footer */}
              {allVenueStats.length > itemsPerPage && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: '0 0 16px 16px', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                    Page {currentPage} of {totalPages} ({allVenueStats.length} venues)
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => setVenuePage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2, padding: '4px 8px',
                        borderRadius: 6, border: '1px solid #CBD5E1', background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                        color: currentPage === 1 ? '#94A3B8' : '#334155', fontSize: '0.75rem', fontWeight: 700,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ChevronLeft size={13} /> Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pNum => (
                      <button
                        key={pNum}
                        onClick={() => setVenuePage(pNum)}
                        style={{
                          minWidth: 26, height: 26, borderRadius: 6,
                          border: currentPage === pNum ? '1px solid #2563EB' : '1px solid #CBD5E1',
                          background: currentPage === pNum ? '#2563EB' : '#FFFFFF',
                          color: currentPage === pNum ? '#FFFFFF' : '#334155',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {pNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setVenuePage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2, padding: '4px 8px',
                        borderRadius: 6, border: '1px solid #CBD5E1', background: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF',
                        color: currentPage === totalPages ? '#94A3B8' : '#334155', fontSize: '0.75rem', fontWeight: 700,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Department Activity Widget with DataTables Pagination */}
        {(() => {
          const allDeptStats = stats?.deptStats || [];
          const itemsPerPage = 4;
          const totalPages = Math.ceil(allDeptStats.length / itemsPerPage) || 1;
          const currentPage = Math.min(deptPage, totalPages);
          const paginatedDeptStats = allDeptStats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

          return (
            <div className="tailux-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="tailux-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={16} style={{ color: '#6366F1' }} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Department Activity</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Department Requests</span>
                </div>

                <div className="tailux-card-body">
                  {allDeptStats.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: '0.85rem' }}>No department activity recorded</div>
                  ) : (
                    paginatedDeptStats.map((d, i) => {
                      const globalIdx = ((currentPage - 1) * itemsPerPage) + i;
                      return (
                        <ProgressBar key={d.id} label={d.name} value={d.count} max={maxDeptCount} color={DEPT_COLORS[globalIdx % DEPT_COLORS.length]} />
                      );
                    })
                  )}
                </div>
              </div>

              {/* DataTables Style Pagination Footer */}
              {allDeptStats.length > itemsPerPage && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', borderRadius: '0 0 16px 16px', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                    Page {currentPage} of {totalPages} ({allDeptStats.length} depts)
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      onClick={() => setDeptPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2, padding: '4px 8px',
                        borderRadius: 6, border: '1px solid #CBD5E1', background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                        color: currentPage === 1 ? '#94A3B8' : '#334155', fontSize: '0.75rem', fontWeight: 700,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <ChevronLeft size={13} /> Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(pNum => (
                      <button
                        key={pNum}
                        onClick={() => setDeptPage(pNum)}
                        style={{
                          minWidth: 26, height: 26, borderRadius: 6,
                          border: currentPage === pNum ? '1px solid #2563EB' : '1px solid #CBD5E1',
                          background: currentPage === pNum ? '#2563EB' : '#FFFFFF',
                          color: currentPage === pNum ? '#FFFFFF' : '#334155',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {pNum}
                      </button>
                    ))}

                    <button
                      onClick={() => setDeptPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 2, padding: '4px 8px',
                        borderRadius: 6, border: '1px solid #CBD5E1', background: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF',
                        color: currentPage === totalPages ? '#94A3B8' : '#334155', fontSize: '0.75rem', fontWeight: 700,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ─── Tailux Recent Activity Table Card ─── */}
      <div className="tailux-card">
        <div className="tailux-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={16} style={{ color: '#475569' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Recent Booking Activity</span>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Latest submitted requests from faculty</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/bookings')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'transparent', border: 'none', color: '#2563EB',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', padding: '4px 8px',
              borderRadius: '6px', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            View All Log <ChevronRight size={14} />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', gap: 8, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={22} style={{ color: '#94A3B8' }} />
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>No bookings logged yet</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Booking requests submitted by faculty will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Event Name', 'Faculty', 'Venue & Hall', 'Booking Date', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '12px 18px', fontSize: '0.72rem', fontWeight: 750,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: '#64748B', textAlign: 'left', whiteSpace: 'nowrap'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, idx) => {
                  const facultyName = b.facultyName || getFacultyName(b.facultyId) || b.coordinator || '—';
                  const initial = facultyName && facultyName !== '—' ? facultyName[0].toUpperCase() : 'F';
                  return (
                    <tr key={b.id}
                      style={{ borderBottom: idx < recentBookings.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background 0.12s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F172A' }}>{b.eventName}</td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="tailux-avatar" style={{ width: 26, height: 26, fontSize: '0.7rem', background: '#6366F1' }}>
                            {initial}
                          </div>
                          <span>{facultyName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={14} style={{ color: '#2563EB', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600 }}>{getVenueName(b.venueId)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748B', whiteSpace: 'nowrap', fontWeight: 500 }}>{b.bookingDate}</td>
                      <td style={{ padding: '14px 18px' }}><StatusBadge status={b.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


