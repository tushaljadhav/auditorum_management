import React, { useState, useEffect } from 'react';
import {
  X, Check, AlertTriangle, Search, Filter,
  Phone, Mail, Building2, Briefcase, Trash2,
  Clock, ShieldCheck, UserCheck, UserX, RefreshCw
} from 'lucide-react';
import { adminApi } from '../api/client';
import Swal from 'sweetalert2';

export default function FacultyModal({ isOpen, onClose, onUpdated }) {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [actionLoading, setActionLoading] = useState(null);

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getFaculty();
      setFacultyList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFaculty();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (faculty, newStatus) => {
    const actionLabel = newStatus === 'Approved' ? 'Approve' : newStatus === 'Rejected' ? 'Reject' : 'Reset';
    const confirm = await Swal.fire({
      title: `${actionLabel} ${faculty.name}?`,
      text: newStatus === 'Approved'
        ? 'User will immediately be able to log in with their registered phone number.'
        : 'User will be blocked from logging in.',
      icon: newStatus === 'Approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionLabel}`,
      confirmButtonColor: newStatus === 'Approved' ? '#10B981' : '#EF4444',
      cancelButtonColor: '#64748B',
      borderRadius: '16px'
    });

    if (!confirm.isConfirmed) return;

    setActionLoading(faculty.id);
    try {
      await adminApi.updateFacultyStatus(faculty.id, newStatus);
      Swal.fire({
        icon: 'success',
        title: `Status: ${newStatus}`,
        timer: 1200,
        showConfirmButton: false
      });
      loadFaculty();
      onUpdated?.();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Action Failed', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (faculty) => {
    const confirm = await Swal.fire({
      title: `Delete ${faculty.name}?`,
      text: 'This faculty record will be removed from the database.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      borderRadius: '16px'
    });

    if (!confirm.isConfirmed) return;

    try {
      await adminApi.deleteFaculty(faculty.id);
      Swal.fire({ icon: 'success', title: 'Deleted', timer: 1200, showConfirmButton: false });
      loadFaculty();
      onUpdated?.();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
    }
  };

  // Metrics
  const totalCount = facultyList.length;
  const pendingCount = facultyList.filter(f => (f.status || 'Pending').toLowerCase() === 'pending').length;
  const approvedCount = facultyList.filter(f => {
    const s = (f.status || '').toLowerCase();
    return s === 'approved' || s === 'active';
  }).length;
  const rejectedCount = facultyList.filter(f => (f.status || '').toLowerCase() === 'rejected').length;

  // Filtered List
  const filtered = facultyList.filter(f => {
    const status = (f.status || 'Pending').toLowerCase();
    if (filter === 'pending' && status !== 'pending') return false;
    if (filter === 'approved' && status !== 'approved' && status !== 'active') return false;
    if (filter === 'rejected' && status !== 'rejected') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (f.name || '').toLowerCase().includes(q);
      const matchMobile = (f.mobile || '').replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''));
      const matchDept = (f.departmentId || '').toLowerCase().includes(q);
      return matchName || matchMobile || matchDept;
    }
    return true;
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 24,
        width: '100%',
        maxWidth: 580,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FFFFFF'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Faculty & App Users
              </h2>
              {pendingCount > 0 && (
                <span style={{
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  color: '#B45309',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0' }}>
              Verify faculty registration requests & grant app login access
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#F1F5F9', border: 'none',
              color: '#64748B', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Counter Summary Pills */}
        <div style={{
          padding: '14px 20px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
          textAlign: 'center'
        }}>
          <div
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 4px',
              borderRadius: 12,
              background: filter === 'all' ? '#FFFFFF' : 'transparent',
              border: `1px solid ${filter === 'all' ? '#CBD5E1' : 'transparent'}`,
              cursor: 'pointer',
              boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>{totalCount}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total</div>
          </div>

          <div
            onClick={() => setFilter('pending')}
            style={{
              padding: '8px 4px',
              borderRadius: 12,
              background: filter === 'pending' ? '#FEF3C7' : '#FFFBEB',
              border: `1px solid ${filter === 'pending' ? '#F59E0B' : '#FDE68A'}`,
              cursor: 'pointer',
              boxShadow: filter === 'pending' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: '#D97706' }}>{pendingCount}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>Pending</div>
          </div>

          <div
            onClick={() => setFilter('approved')}
            style={{
              padding: '8px 4px',
              borderRadius: 12,
              background: filter === 'approved' ? '#ECFDF5' : 'transparent',
              border: `1px solid ${filter === 'approved' ? '#10B981' : 'transparent'}`,
              cursor: 'pointer',
              boxShadow: filter === 'approved' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{approvedCount}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Approved</div>
          </div>

          <div
            onClick={() => setFilter('rejected')}
            style={{
              padding: '8px 4px',
              borderRadius: 12,
              background: filter === 'rejected' ? '#FEF2F2' : 'transparent',
              border: `1px solid ${filter === 'rejected' ? '#EF4444' : 'transparent'}`,
              cursor: 'pointer',
              boxShadow: filter === 'rejected' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: '#DC2626' }}>{rejectedCount}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>Rejected</div>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: '9px 14px'
          }}>
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search faculty by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                width: '100%', fontSize: 13, color: '#0F172A', fontWeight: 600
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Faculty List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 13 }}>
              Loading faculty records...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontSize: 13 }}>
              No faculty records matching criteria.
            </div>
          ) : (
            filtered.map(f => {
              const status = (f.status || 'Pending').toLowerCase();
              const isPending = status === 'pending';
              const isApproved = status === 'approved' || status === 'active';
              const isRejected = status === 'rejected';

              return (
                <div
                  key={f.id}
                  style={{
                    background: '#FFFFFF',
                    border: `1.5px solid ${isPending ? '#FDE68A' : '#E2E8F0'}`,
                    borderRadius: 16,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: isApproved ? '#ECFDF5' : isPending ? '#FEF3C7' : '#FEF2F2',
                        color: isApproved ? '#059669' : isPending ? '#D97706' : '#DC2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 14
                      }}>
                        {f.name ? f.name.substring(0, 2).toUpperCase() : 'FC'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span>{f.designationName || 'Faculty'}</span>
                          <span>•</span>
                          <span>{f.departmentId || 'Department'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      background: isApproved ? '#ECFDF5' : isPending ? '#FEF3C7' : '#FEF2F2',
                      border: `1px solid ${isApproved ? '#A7F3D0' : isPending ? '#FDE68A' : '#FECACA'}`,
                      color: isApproved ? '#047857' : isPending ? '#B45309' : '#B91C1C'
                    }}>
                      {f.status || 'Pending'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    fontSize: 12,
                    color: '#475569',
                    background: '#F8FAFC',
                    padding: '8px 12px',
                    borderRadius: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Phone size={12} color="#4F46E5" />
                      <strong style={{ color: '#0F172A' }}>{f.mobile || 'No Mobile'}</strong>
                    </div>
                    {f.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={12} color="#64748B" />
                        <span>{f.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(f, 'Approved')}
                            disabled={actionLoading === f.id}
                            style={{
                              padding: '7px 16px',
                              borderRadius: 10,
                              background: '#10B981',
                              border: 'none',
                              color: '#FFF',
                              fontSize: 12,
                              fontWeight: 750,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <Check size={14} /> Approve Login
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(f, 'Rejected')}
                            disabled={actionLoading === f.id}
                            style={{
                              padding: '7px 14px',
                              borderRadius: 10,
                              background: '#FEE2E2',
                              border: '1px solid #FECACA',
                              color: '#DC2626',
                              fontSize: 12,
                              fontWeight: 750,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <UserX size={14} /> Reject
                          </button>
                        </>
                      ) : isApproved ? (
                        <button
                          onClick={() => handleUpdateStatus(f, 'Rejected')}
                          disabled={actionLoading === f.id}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: '#FFF1F2',
                            border: '1px solid #FECDD3',
                            color: '#E11D48',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <UserX size={13} /> Block / Reject
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(f, 'Approved')}
                          disabled={actionLoading === f.id}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            background: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            color: '#059669',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <Check size={13} /> Re-Approve
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(f)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: 'transparent',
                        border: '1px solid #E2E8F0',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={loadFaculty}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#4F46E5',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <RefreshCw size={13} /> Refresh List
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

