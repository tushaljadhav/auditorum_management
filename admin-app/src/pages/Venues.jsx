import React, { useState, useEffect } from 'react';
import {
  MapPin, Plus, Edit2, Trash2, ShieldAlert,
  CheckCircle2, Navigation, X, Users, Building2,
  Lock, Unlock
} from 'lucide-react';
import { adminApi } from '../api/client';
import Swal from 'sweetalert2';

export default function Venues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [targetVenue, setTargetVenue] = useState(null);
  const [maintReason, setMaintReason] = useState('');
  const [capturingGps, setCapturingGps] = useState(false);

  const [form, setForm] = useState({
    name: '',
    capacity: '',
    location: '',
    latitude: '',
    longitude: '',
    radius: '50',
    status: 'Active',
  });

  const loadVenues = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getVenues();
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  const openAddModal = () => {
    setEditingVenue(null);
    setForm({
      name: '',
      capacity: '',
      location: '',
      latitude: '19.0222',
      longitude: '72.8304',
      radius: '100',
      status: 'Active',
    });
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVenue(v);
    setForm({
      name: v.name || '',
      capacity: v.capacity != null ? v.capacity.toString() : '',
      location: v.location || '',
      latitude: v.latitude != null ? v.latitude.toString() : '',
      longitude: v.longitude != null ? v.longitude.toString() : '',
      radius: v.radius != null ? v.radius.toString() : '50',
      status: v.status || 'Active',
    });
    setModalOpen(true);
  };

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      Swal.fire({ icon: 'error', title: 'GPS Not Supported', text: 'Geolocation is not supported.' });
      return;
    }
    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(p => ({
          ...p,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setCapturingGps(false);
        Swal.fire({ icon: 'success', title: 'GPS Captured', timer: 1000, showConfirmButton: false });
      },
      () => {
        setCapturingGps(false);
        Swal.fire({ icon: 'error', title: 'GPS Error', text: 'Could not fetch location.' });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveVenue = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.capacity) {
      Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Please enter hall name and capacity.' });
      return;
    }

    const payload = {
      ...form,
      capacity: parseInt(form.capacity, 10),
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      radius: parseInt(form.radius, 10) || 50,
    };

    try {
      if (editingVenue) {
        await adminApi.updateVenue(editingVenue.id, payload);
      } else {
        await adminApi.addVenue(payload);
      }
      setModalOpen(false);
      loadVenues();
      Swal.fire({ icon: 'success', title: 'Saved Successfully', timer: 1000, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Save Failed', text: err.message });
    }
  };

  const handleDeleteVenue = (venue) => {
    Swal.fire({
      title: `Delete ${venue.name}?`,
      text: 'Remove this venue from the booking system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      confirmButtonColor: '#EF4444',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await adminApi.deleteVenue(venue.id);
          loadVenues();
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.message });
        }
      }
    });
  };

  const handleUnlockVenue = async (venue) => {
    try {
      await adminApi.setVenueMaintenance(venue, false);
      Swal.fire({ icon: 'success', title: `${venue.name} Unlocked!`, timer: 1200, showConfirmButton: false });
      loadVenues();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Action Failed', text: err.message });
    }
  };

  const handleLockVenueSubmit = async () => {
    if (!targetVenue) return;
    try {
      await adminApi.setVenueMaintenance(targetVenue, true, maintReason || 'Routine Maintenance');
      setMaintModalOpen(false);
      Swal.fire({ icon: 'warning', title: `${targetVenue.name} Locked!`, timer: 1200, showConfirmButton: false });
      loadVenues();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Lock Failed', text: err.message });
    }
  };

  return (
    <div className="safe-bottom" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Halls & Auditoriums
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {venues.length} Total Venues Registered
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: 12, borderRadius: 10 }}
        >
          <Plus size={14} /> Add Hall
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 120, background: '#E2E8F0', borderRadius: 16 }} />
          <div style={{ height: 120, background: '#E2E8F0', borderRadius: 16 }} />
        </div>
      ) : venues.length === 0 ? (
        <div className="admin-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No halls configured. Tap "Add Hall" to register one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {venues.map((venue) => {
            const isMaint = venue.status === 'Maintenance';

            return (
              <div
                key={venue.id}
                className="admin-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 850, color: 'var(--text-primary)' }}>
                      {venue.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={12} color="var(--primary)" />
                      <span>{venue.location || 'Kirti College'}</span>
                      <span>•</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{venue.capacity} Seats</span>
                    </div>
                  </div>

                  <span className={`badge ${isMaint ? 'badge-warning' : 'badge-success'}`}>
                    <span className="badge-dot" />
                    {isMaint ? 'In Maintenance' : 'Available'}
                  </span>
                </div>

                {isMaint && (
                  <div style={{
                    background: '#FFFBEB',
                    border: '1px solid #FEF3C7',
                    borderRadius: 10,
                    padding: '8px 12px',
                    fontSize: 11,
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span><strong>Reason:</strong> {venue.maintenanceReason || 'Under Maintenance'}</span>
                    <button
                      onClick={() => handleUnlockVenue(venue)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #FCD34D',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 10,
                        fontWeight: 800,
                        color: '#92400E',
                        cursor: 'pointer',
                      }}
                    >
                      Unlock Now
                    </button>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-light)',
                  gap: 8,
                }}>
                  {!isMaint ? (
                    <button
                      onClick={() => {
                        setTargetVenue(venue);
                        setMaintReason('');
                        setMaintModalOpen(true);
                      }}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 10,
                        background: '#FFFBEB',
                        border: '1px solid #FEF3C7',
                        color: '#B45309',
                        fontSize: 11,
                        fontWeight: 750,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <Lock size={13} /> Lock for Maintenance
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlockVenue(venue)}
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--success-light)',
                        border: '1px solid var(--success-border)',
                        color: 'var(--success-dark)',
                        fontSize: 11,
                        fontWeight: 750,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <Unlock size={13} /> Unlock for Booking
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(venue)}
                    style={{
                      height: 36,
                      padding: '0 12px',
                      borderRadius: 10,
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
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteVenue(venue)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--danger-light)',
                      border: '1px solid var(--danger-border)',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal Sheet ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 17, fontWeight: 850, color: 'var(--text-primary)' }}>
                {editingVenue ? 'Edit Hall' : 'Add New Hall'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVenue}>
              <div className="form-group">
                <label className="form-label">Hall Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Auditorium"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Capacity (Seats) *</label>
                  <input
                    type="number"
                    required
                    placeholder="800"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Geofence Radius (m)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={form.radius}
                    onChange={e => setForm({ ...form, radius: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Floor</label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor, Main Wing"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 750, color: 'var(--text-primary)' }}>GPS Coordinates (Geofence)</span>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={capturingGps}
                    style={{
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      color: 'var(--primary)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 10,
                      fontWeight: 750,
                      cursor: 'pointer',
                    }}
                  >
                    {capturingGps ? 'Capturing...' : '📍 Use Phone GPS'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Lat (19.0222)"
                    value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: e.target.value })}
                    className="form-input"
                    style={{ height: 36, fontSize: 12 }}
                  />
                  <input
                    type="text"
                    placeholder="Long (72.8304)"
                    value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: e.target.value })}
                    className="form-input"
                    style={{ height: 36, fontSize: 12 }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', height: 46 }}>
                {editingVenue ? 'Save Changes' : 'Create Hall'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Maintenance Lock Prompt Modal ── */}
      {maintModalOpen && targetVenue && (
        <div className="modal-overlay" onClick={() => setMaintModalOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 17, fontWeight: 850, color: '#92400E', marginBottom: 6 }}>
              Lock {targetVenue.name}?
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Faculty will not be able to book this hall while it is in maintenance.
            </p>

            <div className="form-group">
              <label className="form-label">Maintenance Reason (Optional)</label>
              <input
                type="text"
                placeholder="e.g. AC Repair / Stage Renovation"
                value={maintReason}
                onChange={e => setMaintReason(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setMaintModalOpen(false)}
                className="btn-secondary"
                style={{ flex: 1, height: 44 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLockVenueSubmit}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  background: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 750,
                  cursor: 'pointer',
                }}
              >
                Lock Hall
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
