import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import CustomSelect from '../components/CustomSelect';
import { Eye, Calendar, MapPin, Clock, Users, Check, X, Trash2, Filter, RefreshCw, Copy, Mail, Phone, Download, Search, CalendarDays, CheckCircle, Building2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_BADGE = {
  Approved: { class: 'tailux-badge-approved', label: 'Confirmed' },
  Confirmed: { class: 'tailux-badge-approved', label: 'Confirmed' },
  Cancelled: { class: 'tailux-badge-cancelled', label: 'Cancelled' },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.Approved;
  return (
    <span className={`tailux-badge ${s.class}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
      {s.label}
    </span>
  );
}

const formatTime12h = (timeStr) => {
  if (!timeStr) return '—';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
};

const deptBadge = (name) => {
  if (!name || name === '—') return { background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 650, display: 'inline-block' };
  return { background: '#EEF2FF', color: '#3730A3', border: '1px solid #C7D2FE', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 };
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [venueFilter, setVenueFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const [bRes, vRes, dRes, fRes] = await Promise.all([fetch('/api/bookings'), fetch('/api/venues'), fetch('/api/departments'), fetch('/api/faculty')]);
      const [bData, vData, dData, fData] = await Promise.all([bRes.json(), vRes.json(), dRes.json(), fRes.json()]);
      if (Array.isArray(bData)) {
        bData.sort((a, b) => b.id.localeCompare(a.id));
        setBookings(bData);
      }
      if (Array.isArray(vData)) setVenues(vData);
      if (Array.isArray(dData)) setDepartments(dData);
      if (Array.isArray(fData)) setFaculties(fData);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, venueFilter]);

  const handleDelete = async (id, name) => {
    const r = await Swal.fire({
      title: 'Delete Booking Record?',
      html: `Are you sure you want to permanently delete booking <strong>"${name}"</strong> (ID: ${id})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Delete Record',
      borderRadius: '16px'
    });
    if (!r.isConfirmed) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Booking deleted!', showConfirmButton: false, timer: 1500 });
        fetchData();
        if (selectedBookingDetail?.id === id) setDetailModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleClearAll = async () => {
    const r = await Swal.fire({
      title: 'Clear ALL Bookings?',
      text: 'This will permanently wipe all booking records from the system. This action cannot be undone.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Clear All Bookings',
      borderRadius: '16px'
    });
    if (!r.isConfirmed) return;
    try {
      const res = await fetch('/api/bookings', { method: 'DELETE' });
      if (res.ok) {
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'All bookings cleared!', showConfirmButton: false, timer: 1500 });
        fetchData();
        setDetailModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  const handleDownloadExcel = () => {
    if (bookings.length === 0) {
      Swal.fire({ icon: 'info', title: 'No Data', text: 'No bookings available to export.' });
      return;
    }
    const headers = ['Booking ID', 'Event Name', 'Venue Name', 'Booking Date', 'Start Time', 'End Time', 'Faculty Name', 'Department Name', 'Attendees', 'Status'];
    const csvRows = [headers.join(',')];
    filteredBookings.forEach(b => {
      const fac = faculties.find(f => f.id === b.facultyId);
      const row = [
        `"${b.id}"`,
        `"${(b.eventName || '').replace(/"/g, '""')}"`,
        `"${(getVenueName(b.venueId) || '').replace(/"/g, '""')}"`,
        `"${b.bookingDate || ''}"`,
        `"${b.startTime || ''}"`,
        `"${b.endTime || ''}"`,
        `"${(fac?.name || 'Unknown').replace(/"/g, '""')}"`,
        `"${(getDeptName(b.departmentId) || '').replace(/"/g, '""')}"`,
        `"${b.attendees || 0}"`,
        `"${b.status || 'Approved'}"`
      ];
      csvRows.push(row.join(','));
    });
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Auditorium_Bookings_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyId = (id) => { 
    navigator.clipboard.writeText(id); 
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'ID copied!', showConfirmButton: false, timer: 1200 }); 
  };

  const getVenueName = id => venues.find(v => v.id === id)?.name || id;
  const getDeptName = id => departments.find(d => d.id === id)?.name || id;

  const filteredBookings = bookings.filter(b => {
    const venueMatch = venueFilter === 'All' || b.venueId === venueFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return venueMatch;
    const fac = faculties.find(f => f.id === b.facultyId);
    return venueMatch && (b.eventName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || (fac?.name || '').toLowerCase().includes(q));
  });

  const totalEntries = filteredBookings.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const venueOptions = [{ value: 'All', label: 'All Venues & Halls' }, ...venues.map(v => ({ value: v.id, label: v.name }))];

  // Calculated Stats Metrics
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === 'Approved' || b.status === 'Confirmed').length;
  const totalAttendees = bookings.reduce((sum, b) => sum + (Number(b.attendees) || 0), 0);
  const uniqueVenues = new Set(bookings.map(b => b.venueId)).size;

  if (loading) return <div className="spinner-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="premium-spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Tailux Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Bookings Log</h2>
            <span className="tailux-badge tailux-badge-primary" style={{ fontSize: '0.75rem' }}>{bookings.length} Total</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>Review, filter, and manage auditorium instant reservation logs</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={fetchData} 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', 
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, 
              fontSize: '0.85rem', fontWeight: 650, color: '#475569', cursor: 'pointer', 
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'all 0.15s ease' 
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
          ><RefreshCw size={15} /> Refresh</button>

          <button onClick={handleDownloadExcel} 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', 
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, 
              fontSize: '0.85rem', fontWeight: 650, color: '#2563EB', cursor: 'pointer', 
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'all 0.15s ease' 
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
          ><Download size={15} /> Export CSV</button>

          <button onClick={handleClearAll} 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', 
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, 
              fontSize: '0.85rem', fontWeight: 650, color: '#EF4444', cursor: 'pointer', 
              transition: 'all 0.15s ease' 
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
          ><Trash2 size={15} /> Clear All</button>
        </div>
      </div>

      {/* Top Analytics Metrics Row (SaaS Dashboard Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
        gap: 16
      }}>
        {[
          { label: 'Total Reservations', value: totalBookings, icon: Calendar, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Confirmed Events', value: approvedBookings, icon: CheckCircle, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
          { label: 'Expected Attendees', value: totalAttendees, icon: Users, color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
          { label: 'Venues Occupied', value: uniqueVenues, icon: Building2, color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' },
        ].map((card, idx) => (
          <div key={idx} className="tailux-card" style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            transition: 'all 0.2s ease',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: card.bg, border: `1px solid ${card.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <card.icon size={22} style={{ color: card.color }} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, marginTop: 2 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tailux Filter Bar */}
      <div className="tailux-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: '1 1 340px' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search event, faculty, ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '8px 12px 8px 36px', fontSize: '0.85rem', color: '#0F172A', 
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', 
                boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.15s ease' 
              }}
              onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ width: '100%', minWidth: 160, maxWidth: 200, flex: '1 1 160px' }}>
            <CustomSelect value={venueFilter} onChange={setVenueFilter} options={venueOptions} placeholder="All Venues" />
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
          Showing {filteredBookings.length} of {bookings.length} confirmed bookings
        </div>
      </div>

      {/* Tailux Data Table Card */}
      <div className="tailux-card">
        {filteredBookings.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 12, textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={24} style={{ color: '#94A3B8' }} />
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>No matching bookings found</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: 360 }}>Try adjusting your search keywords or venue dropdown filters.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Event Name', 'Venue / Hall', 'Reservation Date', 'Time Window', 'Faculty Requester', 'Department', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ 
                      padding: '12px 18px', fontSize: '0.72rem', fontWeight: 750, 
                      textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', 
                      textAlign: ['Status', 'Actions'].includes(h) ? 'center' : 'left', whiteSpace: 'nowrap' 
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((b, idx) => {
                  const fac = faculties.find(f => f.id === b.facultyId);
                  const facultyName = fac?.name || '—';
                  const deptName = getDeptName(b.departmentId);
                  const venueName = getVenueName(b.venueId);

                  return (
                    <tr key={b.id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 18px', color: '#0F172A' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                          {b.eventName}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 600, color: '#64748B', background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '1px 6px', borderRadius: 4 }}>
                            ID: #{b.id?.split('_').pop() || b.id}
                          </span>
                          <button 
                            onClick={() => handleCopyId(b.id)}
                            style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: '#6366F1' }}
                            title={`Copy Full ID: ${b.id}`}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#334155' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 size={14} style={{ color: '#2563EB' }} />
                          </div>
                          <span style={{ fontWeight: 750, color: '#0F172A', fontSize: '0.88rem' }}>{venueName}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#334155', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} style={{ color: '#6366F1' }} />
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{b.bookingDate}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#334155', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} style={{ color: '#059669' }} />
                          <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                            {formatTime12h(b.startTime)} – {formatTime12h(b.endTime)}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px', color: '#0F172A' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366F1', color: '#FFFFFF', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {facultyName && facultyName !== '—' ? facultyName[0].toUpperCase() : 'F'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 750, color: '#0F172A', fontSize: '0.87rem' }}>{facultyName}</div>
                            {fac?.designation && (
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{fac.designation}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={deptBadge(deptName)}>
                          <Building2 size={12} /> {deptName}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <StatusBadge status={b.status || 'Approved'} />
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button
                            onClick={() => { setSelectedBookingDetail(b); setDetailModalOpen(true); }}
                            style={{
                              padding: '6px 10px', borderRadius: 8, background: '#EFF6FF', border: '1px solid #BFDBFE',
                              color: '#2563EB', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                            onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}
                          >
                            <Eye size={13} /> View
                          </button>

                          <button
                            onClick={() => handleDelete(b.id, b.eventName)}
                            style={{
                              padding: '6px 10px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA',
                              color: '#EF4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                            onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* DataTables Footer Pagination Controls */}
        <div style={{ padding: '16px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          
          {/* Summary Text */}
          <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
            {totalEntries > 0 ? (
              <>
                Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> entries
                {searchQuery && ` (filtered from ${bookings.length} total bookings)`}
              </>
            ) : (
              `Showing 0 to 0 of 0 entries`
            )}
          </div>

          {/* Pagination Controls - Always Visible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                borderRadius: 8, border: '1px solid #CBD5E1', background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                color: currentPage === 1 ? '#94A3B8' : '#334155', fontSize: '0.8rem', fontWeight: 700,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  minWidth: 32, height: 32, padding: '0 8px', borderRadius: 8,
                  border: page === currentPage ? '1px solid #2563EB' : '1px solid #CBD5E1',
                  background: page === currentPage ? '#2563EB' : '#FFFFFF',
                  color: page === currentPage ? '#FFFFFF' : '#334155',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages || 1))}
              disabled={currentPage === (totalPages || 1)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                borderRadius: 8, border: '1px solid #CBD5E1', background: currentPage === (totalPages || 1) ? '#F1F5F9' : '#FFFFFF',
                color: currentPage === (totalPages || 1) ? '#94A3B8' : '#334155', fontSize: '0.8rem', fontWeight: 700,
                cursor: currentPage === (totalPages || 1) ? 'not-allowed' : 'pointer'
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Popover Modal */}
      {detailModalOpen && selectedBookingDetail && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }} onClick={() => setDetailModalOpen(false)}>
          <div style={{
            width: '100%', maxWidth: 540, background: '#FFFFFF', borderRadius: 20,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E2E8F0',
            overflow: 'hidden', animation: 'tailuxModalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#DBEAFE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Booking Confirmation Details
                </div>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {selectedBookingDetail.eventName}
                </h3>
              </div>
              <button onClick={() => setDetailModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Specs Grid */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 14 }}>
                <div style={{ padding: '12px 14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Booking ID</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{selectedBookingDetail.id}</div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                  <div style={{ marginTop: 4 }}><StatusBadge status={selectedBookingDetail.status || 'Approved'} /></div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Venue / Hall</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2563EB', marginTop: 2 }}>{getVenueName(selectedBookingDetail.venueId)}</div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Date & Time</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{selectedBookingDetail.bookingDate} ({selectedBookingDetail.startTime} - {selectedBookingDetail.endTime})</div>
                </div>
              </div>

              {/* Faculty & Department Block */}
              <div style={{ padding: '14px 16px', borderRadius: 14, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Applicant Information</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E3A8A' }}>
                      {faculties.find(f => f.id === selectedBookingDetail.facultyId)?.name || 'Unknown Faculty'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#3B82F6', fontWeight: 600 }}>
                      Department: {getDeptName(selectedBookingDetail.departmentId)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E3A8A' }}>
                      👥 {selectedBookingDetail.attendees || 0} Expected Attendees
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              {selectedBookingDetail.eventDescription && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Event Description</div>
                  <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, background: '#F8FAFC', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    {selectedBookingDetail.eventDescription}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setDetailModalOpen(false)} style={{ padding: '8px 18px', borderRadius: 10, background: '#FFFFFF', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 650, color: '#475569', cursor: 'pointer' }}>
                Close
              </button>
              <button onClick={() => handleDelete(selectedBookingDetail.id, selectedBookingDetail.eventName)} style={{ padding: '8px 18px', borderRadius: 10, background: '#EF4444', border: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer' }}>
                Delete Record
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
