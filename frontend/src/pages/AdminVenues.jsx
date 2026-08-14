import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { showCustomToast } from '../utils/toast';
import { Plus, Edit2, Trash2, X, Users, MapPin, Navigation, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const S = {
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' },
  th: { padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', background: 'var(--bg)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' },
  td: { padding: '13px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle', borderBottom: '1px solid #F1F5F9' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: 'var(--text-primary)',
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
};

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [form, setForm] = useState({ name: '', capacity: '', location: '', address: '', latitude: '', longitude: '', radius: '50', status: 'Active' });

  const fetchVenues = async () => {
    try {
      const res = await fetch('/api/venues');
      if (res.ok) setVenues(await res.json());
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchVenues(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const openAddModal = () => { setEditingVenue(null); setForm({ name: '', capacity: '', location: '', address: '', latitude: '', longitude: '', radius: '50', status: 'Active', maintenanceReason: '' }); setModalOpen(true); };
  const openEditModal = (v) => {
    setEditingVenue(v);
    setForm({ name: v.name, capacity: v.capacity.toString(), location: v.location || '', address: v.address || '', latitude: v.latitude != null ? v.latitude.toString() : '', longitude: v.longitude != null ? v.longitude.toString() : '', radius: v.radius != null ? v.radius.toString() : '50', status: v.status || 'Active', maintenanceReason: v.maintenanceReason || '' });
    setModalOpen(true);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) { Swal.fire({ icon: 'error', title: 'Not Supported', text: 'Geolocation is not supported by your browser.' }); return; }
    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        let addr = '';
        try { const gr = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`); if (gr.ok) { const gd = await gr.json(); addr = gd.display_name || ''; } } catch {}
        setForm(p => ({ ...p, latitude: lat.toString(), longitude: lon.toString(), address: addr || p.address }));
        setFetchingGps(false);
        showCustomToast(addr ? 'Location & address captured!' : 'Coordinates captured!', '', 'success');
      },
      (err) => { setFetchingGps(false); Swal.fire({ icon: 'error', title: 'Location Error', text: err.code === 1 ? 'Permission denied.' : 'Failed to capture GPS coordinates.' }); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.capacity) { Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Venue Name and Capacity are required fields.' }); return; }
    try {
      const url = editingVenue ? `/api/venues/${editingVenue.id}` : '/api/venues';
      const res = await fetch(url, { method: editingVenue ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { Swal.fire({ icon: 'success', title: editingVenue ? 'Venue Updated' : 'Venue Added', timer: 1500, showConfirmButton: false }); setModalOpen(false); fetchVenues(); }
      else { const err = await res.json(); Swal.fire({ icon: 'error', title: 'Error', text: err.error || 'Failed.' }); }
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Server error occurred.' }); }
  };

  const handleDelete = async (id, name) => {
    const r = await Swal.fire({ title: 'Delete Venue?', html: `Delete <strong>${name}</strong>? This will also remove associated records.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#EF4444', cancelButtonColor: '#64748B', borderRadius: '16px' });
    if (!r.isConfirmed) return;
    const res = await fetch(`/api/venues/${id}`, { method: 'DELETE' });
    if (res.ok) { Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false }); fetchVenues(); }
    else Swal.fire({ icon: 'error', title: 'Error', text: 'Delete failed.' });
  };

  const filteredVenues = venues.filter(v => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return v.name.toLowerCase().includes(q) || (v.location || '').toLowerCase().includes(q) || (v.address || '').toLowerCase().includes(q);
  });

  const totalEntries = filteredVenues.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const paginatedVenues = filteredVenues.slice(startIndex, endIndex);

  if (loading) return <div className="spinner-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="premium-spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Tailux Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Venues & Halls</h2>
            <span className="tailux-badge tailux-badge-primary" style={{ fontSize: '0.75rem' }}>{venues.length} Halls</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>Configure auditorium venues, capacities, and geofence locations</p>
        </div>

        <button onClick={openAddModal} 
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', 
            background: '#2563EB', border: 'none', borderRadius: 10, color: '#FFFFFF', 
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', 
            transition: 'all 0.15s ease' 
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
          onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
        >
          <Plus size={16} /> Add New Venue
        </button>
      </div>

      {/* Tailux Filter Bar */}
      <div className="tailux-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search venue name, location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', padding: '8px 12px 8px 36px', fontSize: '0.85rem', color: '#0F172A', 
              background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', 
              boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.15s ease' 
            }}
            onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#FFFFFF'; }}
            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; }}
          />
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
          Showing {filteredVenues.length} of {venues.length} registered halls
        </div>
      </div>

      {/* Tailux Data Table Card */}
      <div className="tailux-card">
        {filteredVenues.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 12, textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={24} style={{ color: '#94A3B8' }} />
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>No matching venues found</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Try adjusting your search criteria or add a new hall.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Venue Name', 'Capacity', 'Location & Address', 'GPS Coordinates & Radius', 'Status', 'Actions'].map(h => (
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
                {paginatedVenues.map((v, idx) => (
                  <tr key={v.id} 
                    style={{ borderBottom: idx === paginatedVenues.length - 1 ? 'none' : '1px solid #F1F5F9', transition: 'background 0.12s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <MapPin size={18} style={{ color: '#2563EB' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>{v.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 1 }}>ID: {v.id}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#0F172A' }}>
                        <Users size={15} style={{ color: '#6366F1' }} />
                        <span>{v.capacity} seats</span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 600 }}>
                        <Navigation size={14} style={{ color: '#06B6D4', flexShrink: 0 }} />
                        <span>{v.location || 'Main Campus'}</span>
                      </div>
                      {v.address && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 3, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={v.address}>
                          {v.address}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                      {v.latitude && v.longitude ? (
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0F172A', fontWeight: 700 }}>
                            {Number(v.latitude).toFixed(4)}, {Number(v.longitude).toFixed(4)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>Geofence:</span>
                            <span className="tailux-badge tailux-badge-purple" style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                              {v.radius || 50}m Radius
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="tailux-badge tailux-badge-pending" style={{ fontSize: '0.7rem' }}>
                          GPS Not Configured
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                      <span className={`tailux-badge ${v.status === 'Inactive' ? 'tailux-badge-rejected' : 'tailux-badge-approved'}`}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }}></span>
                        {v.status || 'Active'}
                      </span>
                    </td>

                    <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button onClick={() => openEditModal(v)} 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
                        ><Edit2 size={13} /> Edit</button>

                        <button onClick={() => handleDelete(v.id, v.name)} 
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                        ><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                {searchQuery && ` (filtered from ${venues.length} total halls)`}
              </>
            ) : (
              `Showing 0 to 0 of 0 entries`
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
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

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px',
                  borderRadius: 8, border: '1px solid #CBD5E1', background: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF',
                  color: currentPage === totalPages ? '#334155' : '#334155', fontSize: '0.8rem', fontWeight: 700,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tailux Modal Drawer */}
      {modalOpen && createPortal(
        <div className="custom-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="custom-modal-content tailux-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 520, padding: 0, overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div className="tailux-card-header" style={{ padding: '20px 24px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    {editingVenue ? 'Edit Venue Configuration' : 'Register New Auditorium Venue'}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>Provide hall details, capacity, and GPS coordinates</div>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 4 }}><X size={18} /></button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="tailux-card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Venue / Hall Name *</label>
                  <input type="text" required placeholder="e.g. Main Auditorium Hall A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Seating Capacity *</label>
                    <input type="number" required placeholder="e.g. 350" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Building / Floor</label>
                    <input type="text" placeholder="e.g. 1st Floor, Main Campus" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Full Physical Address</label>
                  <textarea placeholder="Address details for navigation..." value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} 
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} 
                  />
                </div>

                {/* GPS Location Section */}
                <div style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Navigation size={15} style={{ color: '#2563EB' }} /> GPS & Geofence Coordinates
                    </div>
                    <button type="button" onClick={handleGetCurrentLocation} disabled={fetchingGps}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', fontSize: '0.78rem', fontWeight: 700, cursor: fetchingGps ? 'not-allowed' : 'pointer', transition: 'all 0.15s ease' }}
                    >
                      {fetchingGps ? (
                        <><span style={{ width: 12, height: 12, border: '2px solid rgba(37,99,235,0.3)', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Fetching...</>
                      ) : <><MapPin size={13} /> Detect Location</>}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Latitude</label>
                      <input type="number" step="any" placeholder="e.g. 19.0269" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} 
                        style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem', color: '#0F172A', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>Longitude</label>
                      <input type="number" step="any" placeholder="e.g. 72.8422" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} 
                        style={{ width: '100%', padding: '8px 10px', fontSize: '0.82rem', color: '#0F172A', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none' }} 
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Geofence Radius (Meters)</label>
                    <input type="number" placeholder="e.g. 50" value={form.radius} onChange={e => setForm({ ...form, radius: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }}
                    >
                      <option value="Active">Active (Available)</option>
                      <option value="Maintenance">Maintenance (Locked)</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {form.status === 'Maintenance' && (
                  <div style={{ marginTop: 4 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#B45309', marginBottom: 6 }}>
                      🔒 Maintenance Reason & Blackout Details
                    </label>
                    <textarea 
                      placeholder="e.g. AC Servicing & Stage Renovation (Aug 15 - Aug 25). Bookings locked." 
                      value={form.maintenanceReason || ''} 
                      onChange={e => setForm({ ...form, maintenanceReason: e.target.value })} 
                      rows={2} 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.85rem', color: '#78350F', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="tailux-card-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} 
                  style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" 
                  style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                >
                  {editingVenue ? 'Save Changes' : 'Register Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

