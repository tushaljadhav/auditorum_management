import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import CustomSelect from '../components/CustomSelect';
import { Plus, Edit2, Trash2, X, Mail, Phone, Users, Settings2 } from 'lucide-react';

const S = {
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' },
  th: { padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', background: 'var(--bg)', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' },
  td: { padding: '13px 16px', color: 'var(--text-secondary)', verticalAlign: 'middle', borderBottom: '1px solid #F1F5F9' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5 },
  input: {
    width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: 'var(--text-primary)',
    background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  btn: (c, bg, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px',
    borderRadius: 8, border: `1px solid ${border || c}`, background: bg || c,
    color: bg ? c : '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s ease', whiteSpace: 'nowrap',
  }),
};

const deptBadge = (name) => {
  if (!name) return { background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, display: 'inline-block' };
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return { background: `hsl(${h},85%,96%)`, color: `hsl(${h},85%,35%)`, border: `1px solid hsl(${h},80%,90%)`, padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600, display: 'inline-block' };
};

const avatarGrad = (name) => {
  const colors = ['linear-gradient(135deg,#60A5FA,#2563EB)','linear-gradient(135deg,#A78BFA,#6366F1)','linear-gradient(135deg,#34D399,#059669)','linear-gradient(135deg,#FBBF24,#D97706)','linear-gradient(135deg,#F87171,#DC2626)'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'NA';

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [titlesModalOpen, setTitlesModalOpen] = useState(false);
  const [newTitleName, setNewTitleName] = useState('');
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editingTitleName, setEditingTitleName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [form, setForm] = useState({ name: '', email: '', mobile: '', departmentId: '', designationId: '' });

  const fetchData = async () => {
    try {
      const [facRes, deptRes, desigRes] = await Promise.all([fetch('/api/faculty'), fetch('/api/departments'), fetch('/api/designations')]);
      if (facRes.ok) setFaculty(await facRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (desigRes.ok) setDesignations(await desigRes.json());
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddModal = () => { setEditingFaculty(null); setForm({ name: '', email: '', mobile: '', departmentId: '', designationId: '' }); setModalOpen(true); };
  const openEditModal = (fac) => { setEditingFaculty(fac); setForm({ name: fac.name, email: fac.email, mobile: fac.mobile, departmentId: fac.departmentId, designationId: fac.designationId || '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.mobile.trim() || !form.departmentId || !form.designationId) {
      Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'All required fields must be completed.' }); return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email.trim())) { Swal.fire({ icon: 'error', title: 'Invalid Email', text: 'Please enter a valid email address.' }); return; }
    let cleanMobile = form.mobile.replace(/[\s\-()]/g, '');
    if (cleanMobile.startsWith('+91')) cleanMobile = cleanMobile.substring(3);
    else if (cleanMobile.startsWith('91') && cleanMobile.length === 12) cleanMobile = cleanMobile.substring(2);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) { Swal.fire({ icon: 'error', title: 'Invalid Mobile', text: 'Enter a valid 10-digit mobile number starting with 6-9.' }); return; }
    const payload = { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), mobile: `+91 ${cleanMobile.substring(0,5)} ${cleanMobile.substring(5)}` };
    try {
      const url = editingFaculty ? `/api/faculty/${editingFaculty.id}` : '/api/faculty';
      const res = await fetch(url, { method: editingFaculty ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { Swal.fire({ icon: 'success', title: editingFaculty ? 'Faculty Updated' : 'Faculty Added', timer: 1500, showConfirmButton: false }); setModalOpen(false); fetchData(); }
      else { const err = await res.json(); Swal.fire({ icon: 'error', title: 'Error', text: err.error || 'Failed.' }); }
    } catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Server error occurred.' }); }
  };

  const handleDelete = async (id, name) => {
    const r = await Swal.fire({ title: 'Delete Faculty Member?', html: `Delete <strong>${name}</strong>? Associated records will be affected.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#EF4444', cancelButtonColor: '#64748B', borderRadius: '16px' });
    if (!r.isConfirmed) return;
    const res = await fetch(`/api/faculty/${id}`, { method: 'DELETE' });
    if (res.ok) { Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false }); fetchData(); }
    else Swal.fire({ icon: 'error', title: 'Error', text: 'Delete failed.' });
  };

  const handleAddTitle = async (e) => {
    e.preventDefault();
    if (!newTitleName.trim()) return;
    const res = await fetch('/api/designations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newTitleName.trim() }) });
    if (res.ok) { setNewTitleName(''); fetchData(); }
    else { const err = await res.json(); Swal.fire({ icon: 'error', title: 'Error', text: err.error || 'Failed.' }); }
  };

  const handleUpdateTitle = async (id) => {
    if (!editingTitleName.trim()) return;
    const res = await fetch(`/api/designations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingTitleName.trim() }) });
    if (res.ok) { setEditingTitleId(null); setEditingTitleName(''); fetchData(); }
  };

  const handleDeleteTitle = async (id, name) => {
    const r = await Swal.fire({ title: 'Delete Title?', html: `Delete designation <strong>${name}</strong>?`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete', confirmButtonColor: '#EF4444', cancelButtonColor: '#64748B', borderRadius: '16px' });
    if (!r.isConfirmed) return;
    const res = await fetch(`/api/designations/${id}`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const getDeptName = (id) => departments.find(d => d.id === id)?.name || 'Unknown';
  const getDesigName = (id) => designations.find(d => d.id === id)?.name || '';

  const filteredFaculty = faculty.filter(f => {
    const deptMatch = deptFilter === 'All' || f.departmentId === deptFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return deptMatch;
    return deptMatch && (f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q) || (f.mobile || '').includes(q));
  });

  const deptOptions = [{ value: 'All', label: 'All Departments' }, ...departments.map(d => ({ value: d.id, label: d.name }))];

  if (loading) return <div className="spinner-container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="premium-spinner" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Tailux Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Faculty Profiles</h2>
            <span className="tailux-badge tailux-badge-purple" style={{ fontSize: '0.75rem' }}>{faculty.length} Members</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>Manage registered faculty profiles, department assignments, and designations</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setTitlesModalOpen(true)} 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', 
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, 
              color: '#475569', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', 
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'all 0.15s ease' 
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0F172A'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
          >
            <Settings2 size={16} /> Manage Titles
          </button>

          <button onClick={openAddModal} 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', 
              background: '#2563EB', border: 'none', borderRadius: 10, color: '#FFFFFF', 
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)', 
              transition: 'all 0.15s ease' 
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
          >
            <Plus size={16} /> Add Faculty Member
          </button>
        </div>
      </div>

      {/* Tailux Filter Bar */}
      <div className="tailux-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <input type="text" placeholder="Search faculty name, email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '8px 12px', fontSize: '0.85rem', color: '#0F172A', 
                background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', 
                boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.15s ease' 
              }}
              onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#FFFFFF'; }}
              onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; }}
            />
          </div>
          <div style={{ width: '100%', minWidth: 160, maxWidth: 200, flex: '1 1 160px' }}>
            <CustomSelect value={deptFilter} onChange={setDeptFilter} options={deptOptions} placeholder="All Departments" />
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
          Showing {filteredFaculty.length} of {faculty.length} faculty profiles
        </div>
      </div>

      {/* Tailux Table Card */}
      <div className="tailux-card">
        {filteredFaculty.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', gap: 12, textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} style={{ color: '#94A3B8' }} />
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>No faculty profiles found</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Try adjusting your search criteria or add a new faculty member.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  {['Faculty Member', 'Department', 'Contact Info', 'Actions'].map(h => (
                    <th key={h} style={{ 
                      padding: '12px 18px', fontSize: '0.72rem', fontWeight: 750, 
                      textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', 
                      textAlign: h === 'Actions' ? 'center' : 'left', whiteSpace: 'nowrap' 
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((fac, idx) => {
                  const initial = fac.name ? fac.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'F';
                  return (
                    <tr key={fac.id}
                      style={{ borderBottom: idx === filteredFaculty.length - 1 ? 'none' : '1px solid #F1F5F9', transition: 'background 0.12s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="tailux-avatar" style={{ width: 38, height: 38, fontSize: '0.85rem', background: 'linear-gradient(135deg, #6366F1, #2563EB)' }}>
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                              {(fac.designationName || getDesigName(fac.designationId)) ? `${fac.designationName || getDesigName(fac.designationId)} ` : ''}{fac.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 1 }}>ID: {fac.id}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <span style={deptBadge(getDeptName(fac.departmentId))}>{getDeptName(fac.departmentId)}</span>
                      </td>

                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <a href={`mailto:${fac.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
                            <Mail size={13} style={{ flexShrink: 0 }} /> {fac.email}
                          </a>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#64748B' }}>
                            <Phone size={13} style={{ flexShrink: 0 }} /> {fac.mobile?.startsWith('+') ? fac.mobile : `+91 ${fac.mobile}`}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button onClick={() => openEditModal(fac)} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
                          ><Edit2 size={13} /> Edit</button>

                          <button onClick={() => handleDelete(fac.id, fac.name)} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                          ><Trash2 size={13} /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tailux Add/Edit Faculty Modal */}
      {modalOpen && createPortal(
        <div className="custom-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="custom-modal-content tailux-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, padding: 0, overflow: 'hidden' }}>
            
            <div className="tailux-card-header" style={{ padding: '20px 24px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} style={{ color: '#6366F1' }} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    {editingFaculty ? 'Edit Faculty Profile' : 'Register New Faculty Profile'}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>Configure personal info, department, and salutation</div>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 4 }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="tailux-card-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Salutation / Title *</label>
                    <CustomSelect value={form.designationId} onChange={val => setForm({ ...form, designationId: val })} options={designations.map(d => ({ value: d.id, label: d.name }))} placeholder="Title..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Full Name *</label>
                    <input type="text" required placeholder="e.g. Dr. Rajesh Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Department *</label>
                  <CustomSelect value={form.departmentId} onChange={val => setForm({ ...form, departmentId: val })} options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="Select Department..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Email Address *</label>
                    <input type="email" required placeholder="faculty@college.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Mobile Number *</label>
                    <input type="tel" required placeholder="+91 98765 43210" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} 
                      style={{ width: '100%', padding: '9px 12px', fontSize: '0.875rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, outline: 'none', boxSizing: 'border-box' }} 
                    />
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
                  {editingFaculty ? 'Save Profile' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Tailux Manage Titles Modal */}
      {titlesModalOpen && createPortal(
        <div className="custom-modal-overlay" onClick={() => { setTitlesModalOpen(false); setEditingTitleId(null); setEditingTitleName(''); }}>
          <div className="custom-modal-content tailux-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, padding: 0, overflow: 'hidden' }}>
            
            <div className="tailux-card-header" style={{ padding: '18px 20px', background: '#F8FAFC' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Manage Titles & Salutations</h4>
              <button onClick={() => { setTitlesModalOpen(false); setEditingTitleId(null); setEditingTitleName(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div className="tailux-card-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <form onSubmit={handleAddTitle} style={{ display: 'flex', gap: 10 }}>
                <input type="text" required placeholder="Add title (e.g. Dean, HOD, Prof)" value={newTitleName} onChange={e => setNewTitleName(e.target.value)} 
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', color: '#0F172A', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none' }} 
                />
                <button type="submit" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add
                </button>
              </form>

              <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 10, padding: 6 }}>
                {designations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.85rem', color: '#94A3B8' }}>No custom titles registered yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {designations.map(title => (
                      <div key={title.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        {editingTitleId === title.id ? (
                          <>
                            <input type="text" value={editingTitleName} onChange={e => setEditingTitleName(e.target.value)} 
                              style={{ flex: 1, fontSize: '0.85rem', padding: '5px 8px', border: '1px solid #2563EB', borderRadius: 6, outline: 'none' }} autoFocus 
                            />
                            <button type="button" onClick={() => handleUpdateTitle(title.id)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#22C55E', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                            <button type="button" onClick={() => { setEditingTitleId(null); setEditingTitleName(''); }} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{title.name}</span>
                            <button type="button" onClick={() => { setEditingTitleId(title.id); setEditingTitleName(title.name); }} 
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer', color: '#475569' }}
                            ><Edit2 size={13} /></button>
                            <button type="button" onClick={() => handleDeleteTitle(title.id, title.name)} 
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', cursor: 'pointer', color: '#EF4444' }}
                            ><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="tailux-card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setTitlesModalOpen(false); setEditingTitleId(null); setEditingTitleName(''); }} 
                style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

