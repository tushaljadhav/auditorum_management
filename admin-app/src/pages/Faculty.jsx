import React, { useState, useEffect } from 'react';
import {
  Users, Search, CheckCircle2, Clock, ShieldAlert,
  UserCheck, UserX, Trash2, Phone, Mail, Check,
  X, AlertTriangle, GraduationCap
} from 'lucide-react';
import { adminApi } from '../api/client';
import Swal from 'sweetalert2';

export default function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFaculty();
      setFaculty(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const totalCount = faculty.length;
  const pendingCount = faculty.filter(f => (f.status || 'Pending').toLowerCase() === 'pending').length;
  const approvedCount = faculty.filter(f => (f.status || '').toLowerCase() === 'approved').length;
  const rejectedCount = faculty.filter(f => (f.status || '').toLowerCase() === 'rejected').length;

  const handleUpdateStatus = async (id, name, newStatus) => {
    const isApprove = newStatus === 'Approved';
    const result = await Swal.fire({
      title: isApprove ? 'Approve Faculty?' : 'Block Faculty?',
      html: `Set access for <strong>${name}</strong> to <strong style="color:${isApprove ? 'var(--success)' : 'var(--danger)'}">${newStatus}</strong>?`,
      icon: isApprove ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isApprove ? '#10B981' : '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: isApprove ? 'Yes, Approve' : 'Yes, Block',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setActionLoadingId(id);
    try {
      await adminApi.updateFacultyStatus(id, newStatus);
      Swal.fire({
        icon: 'success',
        title: isApprove ? 'Faculty Approved!' : 'Access Updated!',
        timer: 1100,
        showConfirmButton: false
      });
      loadFaculty();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Delete Faculty?',
      html: `Permanently remove <strong>${name}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;

    setActionLoadingId(id);
    try {
      await adminApi.deleteFaculty(id);
      Swal.fire({ icon: 'success', title: 'Faculty Removed', timer: 1000, showConfirmButton: false });
      loadFaculty();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Delete Failed', text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveAllPending = async () => {
    const pendingList = faculty.filter(f => (f.status || 'Pending').toLowerCase() === 'pending');
    if (pendingList.length === 0) return;

    const result = await Swal.fire({
      title: `Approve All (${pendingList.length})?`,
      text: 'Grant instant mobile login access to all pending registrations.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      confirmButtonText: 'Yes, Approve All'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      for (const f of pendingList) {
        await adminApi.updateFacultyStatus(f.id, 'Approved');
      }
      Swal.fire({ icon: 'success', title: 'All Pending Approved!', timer: 1200, showConfirmButton: false });
      loadFaculty();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Action Failed', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (f.name || '').toLowerCase().includes(q) ||
      (f.mobile || '').replace(/[^0-9]/g, '').includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.designationName || '').toLowerCase().includes(q);

    const st = (f.status || 'Pending').toLowerCase();
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && st === 'pending') ||
      (statusFilter === 'APPROVED' && st === 'approved') ||
      (statusFilter === 'REJECTED' && st === 'rejected');

    return matchesSearch && matchesFilter;
  });

  const getInitials = (name) => {
    if (!name) return 'FC';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="safe-bottom" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      
      {/* ── Page Header (Identical to Halls & Bookings) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Faculty & Users
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {faculty.length} Registered Faculty Accounts
          </p>
        </div>

        {pendingCount > 0 && (
          <button
            onClick={handleApproveAllPending}
            className="btn-primary"
            style={{ padding: '7px 12px', fontSize: 11.5, borderRadius: 10, background: 'var(--success)' }}
          >
            <Check size={13} strokeWidth={2.6} /> Approve All ({pendingCount})
          </button>
        )}
      </div>

      {/* ── Search Bar (Identical to Bookings.jsx) ── */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          <Search size={15} />
        </div>
        <input
          type="text"
          placeholder="Search faculty by name, phone, or email..."
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

      {/* ── Segmented Tab Filter (Identical to Bookings.jsx) ── */}
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
          All ({totalCount})
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: statusFilter === 'PENDING' ? 'var(--warning)' : '#FFFFFF',
            color: statusFilter === 'PENDING' ? '#FFFFFF' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          Pending ({pendingCount})
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: statusFilter === 'APPROVED' ? 'var(--success)' : '#FFFFFF',
            color: statusFilter === 'APPROVED' ? '#FFFFFF' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          Approved ({approvedCount})
        </button>

        <button
          onClick={() => setStatusFilter('REJECTED')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: statusFilter === 'REJECTED' ? 'var(--danger)' : '#FFFFFF',
            color: statusFilter === 'REJECTED' ? '#FFFFFF' : 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 750,
            cursor: 'pointer',
          }}
        >
          Blocked ({rejectedCount})
        </button>
      </div>

      {/* ── Faculty Cards List (Identical styling to Venues & Bookings) ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ height: 110, background: '#E2E8F0', borderRadius: 16 }} />
          <div style={{ height: 110, background: '#E2E8F0', borderRadius: 16 }} />
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="admin-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No faculty members found in this view.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredFaculty.map((item) => {
            const st = (item.status || 'Pending').toLowerCase();
            const isPending = st === 'pending';
            const isApproved = st === 'approved';
            const isRejected = st === 'rejected';
            const isActing = actionLoadingId === item.id;

            return (
              <div
                key={item.id}
                className="admin-card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Top Row: Initial Badge + Name + Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 42,
                      height: 44,
                      borderRadius: 10,
                      background: isPending
                        ? 'var(--warning-light)'
                        : isApproved
                        ? 'var(--success-light)'
                        : 'var(--danger-light)',
                      border: `1px solid ${
                        isPending
                          ? 'var(--warning-border)'
                          : isApproved
                          ? 'var(--success-border)'
                          : 'var(--danger-border)'
                      }`,
                      color: isPending
                        ? 'var(--warning-dark)'
                        : isApproved
                        ? 'var(--success-dark)'
                        : 'var(--danger-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 850,
                      fontSize: 14,
                      flexShrink: 0,
                    }}>
                      {getInitials(item.name)}
                    </div>

                    <div>
                      <div style={{ fontSize: 14, fontWeight: 850, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.designationName || 'Faculty'} • Kirti College
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${
                    isPending ? 'badge-warning' : isApproved ? 'badge-success' : 'badge-danger'
                  }`}>
                    <span className="badge-dot" />
                    {isPending ? 'Pending' : isApproved ? 'Approved' : 'Blocked'}
                  </span>
                </div>

                {/* Info Block (Identical to Bookings Venue/Time row) */}
                <div style={{
                  background: 'var(--surface-subtle)',
                  borderRadius: 10,
                  padding: '8px 10px',
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Phone size={12} color="var(--primary)" />
                    <a href={`tel:${item.mobile}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 750 }}>
                      {item.mobile || 'No Mobile'}
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
                    <Mail size={12} color="var(--primary)" />
                    <a
                      href={`mailto:${item.email}`}
                      title={item.email}
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        fontWeight: 600,
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.email || 'No Email'}
                    </a>
                  </div>
                </div>

                {/* Actions Row (Identical to Bookings & Venues button rows) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-light)',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isPending && (
                      <>
                        <button
                          disabled={isActing}
                          onClick={() => handleUpdateStatus(item.id, item.name, 'Approved')}
                          className="btn-primary"
                          style={{
                            padding: '6px 12px',
                            fontSize: 11,
                            borderRadius: 8,
                            background: 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Check size={12} strokeWidth={2.6} /> Approve Login
                        </button>

                        <button
                          disabled={isActing}
                          onClick={() => handleUpdateStatus(item.id, item.name, 'Rejected')}
                          style={{
                            padding: '6px 10px',
                            fontSize: 11,
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--surface-subtle)',
                            color: 'var(--danger)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                          }}
                        >
                          <X size={12} /> Reject
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(item.id, item.name, 'Rejected')}
                        style={{
                          padding: '6px 12px',
                          fontSize: 11,
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--surface-subtle)',
                          color: 'var(--danger)',
                          fontWeight: 750,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <UserX size={12} /> Block Access
                      </button>
                    )}

                    {isRejected && (
                      <button
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(item.id, item.name, 'Approved')}
                        style={{
                          padding: '6px 12px',
                          fontSize: 11,
                          borderRadius: 8,
                          border: '1px solid var(--success-border)',
                          background: 'var(--success-light)',
                          color: 'var(--success-dark)',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <UserCheck size={12} /> Re-Approve
                      </button>
                    )}
                  </div>

                  <button
                    disabled={isActing}
                    onClick={() => handleDelete(item.id, item.name)}
                    title="Delete record"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
