import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { exportAttendanceCSV, exportBookingsCSV } from '../utils/excelExport';
import {
  FileText, Briefcase, BookOpen, Search,
  Download, Eye, EyeOff, CheckCircle2, Radio,
  Calendar, MapPin, Clock, Users, ChevronDown, ChevronUp
} from 'lucide-react';

function fmt12(t) {
  if (!t) return '—';
  const [hStr, m] = t.split(':');
  let h = parseInt(hStr, 10);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2,'0')}:${m} ${ap}`;
}

function statusColor(status, attendanceStatus) {
  if (attendanceStatus === 'OPEN') return { bg: '#ECFDF5', border: '#A7F3D0', text: '#059669', label: '● LIVE' };
  if (status === 'Confirmed' || status === 'Approved') return { bg: '#EDE9FE', border: '#C4B5FD', text: '#6D28D9', label: 'Confirmed' };
  if (status === 'Cancelled') return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', label: 'Cancelled' };
  return { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', label: status || 'Pending' };
}

export default function History({ currentUser }) {
  const isFaculty = currentUser?.role === 'faculty';
  const [activeTab, setActiveTab] = useState('facultyBookings');

  const [facultyBookings, setFacultyBookings] = useState([]);
  const [archiveList,     setArchiveList]     = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [searchQ,         setSearchQ]         = useState('');
  const [expandedRosters, setExpandedRosters] = useState({});
  const [loadingRosters,  setLoadingRosters]  = useState({});

  useEffect(() => {
    api.getBookings()
      .then(all => {
        if (!Array.isArray(all)) return;
        const myB = (isFaculty && currentUser?.name)
          ? all.filter(b => b.facultyName?.toLowerCase().includes(currentUser.name.toLowerCase()))
          : all;
        setFacultyBookings(myB.slice(0, 30));
      })
      .catch(() => {});
  }, [currentUser, isFaculty]);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const data = await api.getArchive({ q: searchQ });
      setArchiveList(data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'collegeArchive') fetchArchive();
  }, [activeTab, searchQ]);

  const loadRoster = async (id) => {
    if (expandedRosters[id] !== undefined) {
      setExpandedRosters(p => { const n = {...p}; delete n[id]; return n; });
      return;
    }
    setLoadingRosters(p => ({ ...p, [id]: true }));
    try {
      const list = await api.getArchiveRoster(id);
      setExpandedRosters(p => ({ ...p, [id]: Array.isArray(list) ? list : [] }));
    } catch {} finally { setLoadingRosters(p => ({ ...p, [id]: false })); }
  };

  const TABS = [
    { id: 'facultyBookings', label: 'Event Bookings',     icon: Briefcase },
    { id: 'collegeArchive',  label: 'Attendance Archive', icon: BookOpen },
  ];

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div className="section-eyebrow"><FileText size={11} /> Records</div>
        <h2 className="section-title">History &amp; Records</h2>
        <p className="section-subtitle">Event bookings &amp; attendance archives</p>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <Icon size={12} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Faculty/Admin Bookings ── */}
      {activeTab === 'facultyBookings' && (
        <div className="animate-fade-in">
          {facultyBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No bookings found</div>
              <div className="empty-state-desc">Your venue bookings will appear here after you make one.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button onClick={() => exportBookingsCSV(facultyBookings)} className="btn-ghost">
                  <Download size={12} /> Export CSV
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {facultyBookings.map(b => {
                  const sc = statusColor(b.status, b.attendanceStatus);
                  const isExpanded = expandedRosters[b.id] !== undefined;
                  const hasAttendance = b.attendanceStatus === 'OPEN' || b.attendanceStatus === 'CLOSED';

                  return (
                    <div key={b.id} className="card" style={{ padding: '14px 16px' }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        {/* Icon */}
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          background: b.attendanceStatus === 'OPEN'
                            ? 'linear-gradient(135deg, #10B981, #059669)'
                            : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: b.attendanceStatus === 'OPEN'
                            ? '0 4px 10px rgba(16,185,129,0.3)'
                            : '0 4px 10px rgba(124,58,237,0.3)',
                        }}>
                          {b.attendanceStatus === 'OPEN'
                            ? <Radio size={17} color="#FFFFFF" />
                            : <Calendar size={17} color="#FFFFFF" />
                          }
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }} className="truncate">
                            {b.eventName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                              <MapPin size={10} /> {b.venueName}
                            </span>
                            <span style={{ color: 'var(--border-md)' }}>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                              <Calendar size={10} /> {b.bookingDate}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 600 }}>
                            <Clock size={10} /> {fmt12(b.startTime)} – {fmt12(b.endTime)}
                            <span style={{ color: 'var(--border-md)', margin: '0 2px' }}>•</span>
                            <Users size={10} /> {b.attendees} expected
                          </div>
                        </div>

                        {/* Status badge */}
                        <span style={{
                          padding: '4px 10px', borderRadius: 'var(--r-full)',
                          background: sc.bg, border: `1px solid ${sc.border}`,
                          color: sc.text, fontSize: 10, fontWeight: 800,
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {sc.label}
                        </span>
                      </div>

                      {/* Roster toggle */}
                      {hasAttendance && (
                        <button
                          onClick={() => loadRoster(b.id)}
                          style={{
                            marginTop: 12,
                            width: '100%',
                            padding: '8px',
                            background: isExpanded ? 'var(--primary-light)' : 'var(--surface-subtle)',
                            border: `1px solid ${isExpanded ? 'var(--primary-border)' : 'var(--border)'}`,
                            borderRadius: 'var(--r-sm)',
                            fontSize: 11, fontWeight: 700,
                            color: isExpanded ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {loadingRosters[b.id]
                            ? <span className="spinner-primary" style={{ width: 12, height: 12 }} />
                            : isExpanded ? <ChevronUp size={12} /> : <Eye size={12} />
                          }
                          {isExpanded ? 'Hide Roster' : 'View Attendance Roster'}
                          {isExpanded && expandedRosters[b.id] ? ` (${expandedRosters[b.id].length})` : ''}
                        </button>
                      )}

                      {/* Expanded roster */}
                      {isExpanded && (
                        <div style={{
                          marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 12,
                          animation: 'fadeInUp 0.25s ease both',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>
                              ROSTER — {expandedRosters[b.id].length} present
                            </div>
                            <button onClick={() => exportAttendanceCSV(expandedRosters[b.id], b.eventName)} className="btn-icon" style={{ width: 28, height: 28 }}>
                              <Download size={13} />
                            </button>
                          </div>
                          {expandedRosters[b.id].length === 0 ? (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                              No attendance records yet
                            </div>
                          ) : (
                            expandedRosters[b.id].slice(0, 6).map((r, i) => (
                              <div key={i} className="roster-row">
                                <div className="roster-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                                  {(r.studentName || 'S')[0]}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">{r.studentName}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.rollNumber}</div>
                                </div>
                                <span className="badge badge-emerald" style={{ fontSize: 10 }}>Present</span>
                              </div>
                            ))
                          )}
                          {expandedRosters[b.id].length > 6 && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>
                              +{expandedRosters[b.id].length - 6} more · Export CSV to see all
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── College Archive ── */}
      {activeTab === 'collegeArchive' && (
        <div className="animate-fade-in">
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <input className="app-input" type="text" placeholder="Search events or faculty…"
              value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ paddingLeft: 38 }} />
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton card" style={{ height: 84 }} />)}
            </div>
          ) : archiveList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <div className="empty-state-title">No archive records</div>
              <div className="empty-state-desc">College-wide attendance records will appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {archiveList.map(item => {
                const isExpanded = expandedRosters[item.id] !== undefined;
                return (
                  <div key={item.id} className="card" style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: item.hasRecords
                          ? 'linear-gradient(135deg, #10B981, #059669)'
                          : 'linear-gradient(135deg, #94A3B8, #64748B)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: item.hasRecords ? '0 4px 10px rgba(16,185,129,0.3)' : 'none',
                      }}>
                        {item.hasRecords
                          ? <CheckCircle2 size={18} color="#FFFFFF" />
                          : <Calendar size={18} color="#FFFFFF" />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">
                          {item.eventName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                          {item.facultyName} · {item.venueName}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{item.bookingDate}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span className={`badge ${item.presentCount > 0 ? 'badge-emerald' : 'badge-slate'}`} style={{ fontSize: 10 }}>
                          {item.presentCount} Present
                        </span>
                        <button
                          onClick={() => loadRoster(item.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          {loadingRosters[item.id]
                            ? <span className="spinner-primary" style={{ width: 12, height: 12 }} />
                            : isExpanded ? <EyeOff size={12} /> : <Eye size={12} />
                          }
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>
                            ROSTER — {expandedRosters[item.id].length} students
                          </span>
                          <button onClick={() => exportAttendanceCSV(expandedRosters[item.id], item.eventName)} className="btn-icon" style={{ width: 28, height: 28 }}>
                            <Download size={13} />
                          </button>
                        </div>
                        {expandedRosters[item.id].map((r, i) => (
                          <div key={i} className="roster-row">
                            <div className="roster-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                              {(r.studentName || 'S')[0]}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">{r.studentName}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.rollNumber} · {r.classStream}</div>
                            </div>
                            <span className="badge badge-emerald" style={{ fontSize: 10 }}>Present</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
