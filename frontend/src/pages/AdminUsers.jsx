import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, X, ShieldCheck, Key, UserCheck, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const avatarGrad = (name) => {
  const colors = ['linear-gradient(135deg,#60A5FA,#2563EB)','linear-gradient(135deg,#A78BFA,#6366F1)','linear-gradient(135deg,#34D399,#059669)','linear-gradient(135deg,#FBBF24,#D97706)'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((hash << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'A';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', password: '' });

  // DataTables States
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAddModal = () => { setEditingUser(null); setForm({ name: '', username: '', password: '' }); setModalOpen(true); };
  const openEditModal = (u) => { setEditingUser(u); setForm({ name: u.name, username: u.username, password: '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || (!editingUser && !form.password)) { Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Please fill in all required fields.' }); return; }
    try {
      const payload = { ...form };
      if (editingUser && !payload.password) delete payload.password;
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const res = await fetch(url, { method: editingUser ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { Swal.fire({ icon: 'success', title: editingUser ? 'Account Updated' : 'Account Created', timer: 1500, showConfirmButton: false }); setModalOpen(false); fetchUsers(); }
      else { const err = await res.json(); Swal.fire({ icon: 'error', title: 'Error', text: err.error || 'Failed.' }); }
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Server error occurred.' }); }
  };

  const handleDelete = async (id, name, username) => {
    if (users.length <= 1) { Swal.fire({ icon: 'error', title: 'Action Denied', text: 'Cannot delete the last administrator account.' }); return; }
    const r = await Swal.fire({ title: 'Delete Administrator?', html: `Delete admin account for <strong>${name}</strong> (@${username})?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete Account', confirmButtonColor: '#EF4444', cancelButtonColor: '#64748B', borderRadius: '16px' });
    if (!r.isConfirmed) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) { Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false }); fetchUsers(); }
    else { const err = await res.json(); Swal.fire({ icon: 'error', title: 'Error', text: err.error || 'Failed.' }); }
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || String(u.id).includes(q);
    });
  }, [users, searchQuery]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortOrder]);

  // Pagination Logic
  const totalEntries = sortedUsers.length;
  const effectiveEntriesPerPage = entriesPerPage === -1 ? totalEntries : entriesPerPage;
  const totalPages = effectiveEntriesPerPage > 0 ? Math.ceil(totalEntries / effectiveEntriesPerPage) : 1;
  const startIndex = (currentPage - 1) * effectiveEntriesPerPage;
  const endIndex = Math.min(startIndex + effectiveEntriesPerPage, totalEntries);
  const currentRecords = sortedUsers.slice(startIndex, endIndex);

  // Reset page on search or filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, entriesPerPage]);

  if (loading) return <div className="spinner-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="premium-spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Tailux Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Admin Users</h2>
            <span className="tailux-badge tailux-badge-primary" style={{ fontSize: '0.75rem' }}>{users.length} Total Admins</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>Manage system administrators, login credentials, and security access with DataTables</p>
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
          <Plus size={16} /> Add Administrator
        </button>
      </div>

      {/* DataTables Card Container */}
      <div className="tailux-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #E2E8F0', borderRadius: 14, background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        
        {/* DataTables Header Toolbar */}
        <div style={{ padding: '18px 20px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          
          {/* DataTables Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input 
                type="text" 
                placeholder="Search administrators..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '7px 32px 7px 36px', fontSize: '0.85rem', color: '#0F172A',
                  background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* DataTables Main HTML Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th 
                  onClick={() => handleSort('id')}
                  style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', cursor: 'pointer', userSelect: 'none', width: '90px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    # ID
                    {sortField === 'id' ? (sortOrder === 'asc' ? <ArrowUp size={13} style={{ color: '#2563EB' }} /> : <ArrowDown size={13} style={{ color: '#2563EB' }} />) : <ArrowUpDown size={13} style={{ color: '#CBD5E1' }} />}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('name')}
                  style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Administrator Name
                    {sortField === 'name' ? (sortOrder === 'asc' ? <ArrowUp size={13} style={{ color: '#2563EB' }} /> : <ArrowDown size={13} style={{ color: '#2563EB' }} />) : <ArrowUpDown size={13} style={{ color: '#CBD5E1' }} />}
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('username')}
                  style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Username
                    {sortField === 'username' ? (sortOrder === 'asc' ? <ArrowUp size={13} style={{ color: '#2563EB' }} /> : <ArrowDown size={13} style={{ color: '#2563EB' }} />) : <ArrowUpDown size={13} style={{ color: '#CBD5E1' }} />}
                  </div>
                </th>

                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Role & Access Level
                </th>

                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', textAlign: 'center' }}>
                  Status
                </th>

                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCheck size={24} style={{ color: '#94A3B8' }} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                        {searchQuery ? 'No matching administrator accounts found' : 'No administrator accounts found'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                        {searchQuery ? `Try clearing or modifying search query "${searchQuery}"` : 'Click "Add Administrator" to create an account.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRecords.map((user, index) => {
                  const displayIndex = startIndex + index + 1;
                  const initial = initials(user.name);

                  return (
                    <tr 
                      key={user.id} 
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* ID Cell */}
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#64748B', fontSize: '0.82rem' }}>
                        #{user.id || displayIndex}
                      </td>

                      {/* Name Cell */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="tailux-avatar" style={{ width: 38, height: 38, fontSize: '0.88rem', background: 'linear-gradient(135deg, #2563EB, #6366F1)', flexShrink: 0 }}>
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              College Administrator
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username Cell */}
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                        @{user.username}
                      </td>

                      {/* Role Cell */}
                      <td style={{ padding: '14px 20px' }}>
                        <span className="tailux-badge tailux-badge-primary" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                          <ShieldCheck size={11} /> SUPER ADMIN
                        </span>
                      </td>

                      {/* Status Cell */}
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span className="tailux-badge tailux-badge-success" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                          Active
                        </span>
                      </td>

                      {/* Actions Cell */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditModal(user)} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer', color: '#334155', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#334155'; }}
                            title="Edit Administrator"
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          <button onClick={() => handleDelete(user.id, user.name, user.username)} disabled={users.length <= 1}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', cursor: users.length <= 1 ? 'not-allowed' : 'pointer', color: '#EF4444', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s', opacity: users.length <= 1 ? 0.4 : 1 }}
                            onMouseEnter={e => { if (users.length > 1) { e.currentTarget.style.background = '#FEE2E2'; }}}
                            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                            title={users.length <= 1 ? 'Cannot delete last admin' : 'Delete Administrator'}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* DataTables Footer Pagination Controls */}
        <div style={{ padding: '16px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          
          {/* Summary Text */}
          <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
            {totalEntries > 0 ? (
              <>
                Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> entries
                {searchQuery && ` (filtered from ${users.length} total administrators)`}
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
                    fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                    transition: 'all 0.15s ease'
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
                  color: currentPage === totalPages ? '#94A3B8' : '#334155', fontSize: '0.8rem', fontWeight: 700,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tailux Modal */}
      {modalOpen && createPortal(
        <div className="custom-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="custom-modal-content tailux-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, padding: 0, overflow: 'hidden' }}>
            
            <div className="tailux-card-header" style={{ padding: '20px 24px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    {editingUser ? 'Edit Administrator Credentials' : 'Create Administrator Account'}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>Set full name, username, and secure password</div>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 4 }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="tailux-card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Full Name *</label>
                  <input type="text" required placeholder="e.g. System Admin" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Username *</label>
                  <input type="text" required placeholder="e.g. admin" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} 
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type="password" required={!editingUser} placeholder={editingUser ? '••••••••' : 'Enter password...'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px 9px 36px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    />
                    <Key size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  </div>
                </div>
              </div>

              <div className="tailux-card-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalOpen(false)} 
                  style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" 
                  style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                >
                  {editingUser ? 'Update Account' : 'Create Account'}
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



