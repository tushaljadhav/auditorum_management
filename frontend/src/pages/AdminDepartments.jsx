import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, X, Building2, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Layers, Filter } from 'lucide-react';

const deptBadge = (name) => {
  if (!name) return { background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 600, display: 'inline-block' };
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return { background: `hsl(${h},85%,96%)`, color: `hsl(${h},85%,35%)`, border: `1px solid hsl(${h},80%,90%)`, padding: '4px 12px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 };
};

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formName, setFormName] = useState('');

  // DataTables States
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) setDepartments(await res.json());
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openAddModal = () => { setEditingDept(null); setFormName(''); setModalOpen(true); };
  const openEditModal = (dept) => { setEditingDept(dept); setFormName(dept.name); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : '/api/departments';
      const res = await fetch(url, { method: editingDept ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formName }) });
      if (res.ok) { Swal.fire({ icon: 'success', title: editingDept ? 'Department Updated' : 'Department Created', timer: 1500, showConfirmButton: false }); setModalOpen(false); fetchDepartments(); }
      else { const err = await res.json(); Swal.fire({ icon: 'error', title: 'Error', text: err.error || 'Failed.' }); }
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Server error occurred.' }); }
  };

  const handleDelete = async (id, name) => {
    const r = await Swal.fire({ title: 'Delete Department?', html: `Delete <strong>${name}</strong>? Associated faculty and records will be affected.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete Department', confirmButtonColor: '#EF4444', cancelButtonColor: '#64748B', borderRadius: '16px' });
    if (!r.isConfirmed) return;
    const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    if (res.ok) { Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false }); fetchDepartments(); }
    else Swal.fire({ icon: 'error', title: 'Error', text: 'Delete failed.' });
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

  // Filtered & Sorted Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || String(d.id).includes(q);
    });
  }, [departments, searchQuery]);

  const sortedDepartments = useMemo(() => {
    return [...filteredDepartments].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDepartments, sortField, sortOrder]);

  // Pagination Logic
  const totalEntries = sortedDepartments.length;
  const effectiveEntriesPerPage = entriesPerPage === -1 ? totalEntries : entriesPerPage;
  const totalPages = effectiveEntriesPerPage > 0 ? Math.ceil(totalEntries / effectiveEntriesPerPage) : 1;
  const startIndex = (currentPage - 1) * effectiveEntriesPerPage;
  const endIndex = Math.min(startIndex + effectiveEntriesPerPage, totalEntries);
  const currentRecords = sortedDepartments.slice(startIndex, endIndex);

  // Reset page on search or filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, entriesPerPage]);

  if (loading) return <div className="spinner-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="premium-spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Tailux Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Academic Departments</h2>
            <span className="tailux-badge tailux-badge-purple" style={{ fontSize: '0.75rem' }}>{departments.length} Total Units</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>Manage college academic departments with real-time DataTables controls</p>
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
          <Plus size={16} /> Add Department
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
                placeholder="Search departments..." 
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
                    Department Name
                    {sortField === 'name' ? (sortOrder === 'asc' ? <ArrowUp size={13} style={{ color: '#2563EB' }} /> : <ArrowDown size={13} style={{ color: '#2563EB' }} />) : <ArrowUpDown size={13} style={{ color: '#CBD5E1' }} />}
                  </div>
                </th>

                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>
                  Category & Badge
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
                  <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={24} style={{ color: '#94A3B8' }} />
                      </div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                        {searchQuery ? 'No matching departments found' : 'No academic departments registered'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                        {searchQuery ? `Try clearing or modifying search query "${searchQuery}"` : 'Click "Add Department" button to create your first unit.'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentRecords.map((dept, index) => {
                  const displayIndex = startIndex + index + 1;
                  let hash = 0;
                  for (let c = 0; c < dept.name.length; c++) hash = dept.name.charCodeAt(c) + ((hash << 5) - hash);
                  const h = Math.abs(hash) % 360;

                  return (
                    <tr 
                      key={dept.id} 
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* ID Cell */}
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#64748B', fontSize: '0.82rem' }}>
                        #{dept.id || displayIndex}
                      </td>

                      {/* Name Cell */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `hsl(${h},85%,96%)`, border: `1px solid hsl(${h},80%,90%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Building2 size={18} style={{ color: `hsl(${h},85%,35%)` }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                              {dept.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              Academic Unit
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Badge Cell */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={deptBadge(dept.name)}>
                          <Layers size={13} />
                          {dept.name.toUpperCase().substring(0, 16)}
                        </div>
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
                          <button onClick={() => openEditModal(dept)} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer', color: '#334155', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#334155'; }}
                            title="Edit Department"
                          >
                            <Edit2 size={13} /> Edit
                          </button>

                          <button onClick={() => handleDelete(dept.id, dept.name)} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', color: '#EF4444', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                            title="Delete Department"
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
                {searchQuery && ` (filtered from ${departments.length} total departments)`}
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
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} style={{ color: '#6366F1' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    {editingDept ? 'Edit Academic Department' : 'Create Academic Department'}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>Specify the department or organizational unit name</div>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 4 }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="tailux-card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Department Name *</label>
                  <input type="text" required placeholder="e.g. Computer Science & IT" value={formName} onChange={e => setFormName(e.target.value)} 
                    style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    autoFocus
                  />
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
                  {editingDept ? 'Save Changes' : 'Create Department'}
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


