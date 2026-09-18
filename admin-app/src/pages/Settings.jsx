import React, { useState, useEffect } from 'react';
import {
  Download, Upload, Database, Shield,
  Users, Plus, Trash2, X, ExternalLink, LogOut, UserCheck
} from 'lucide-react';
import { adminApi } from '../api/client';
import Swal from 'sweetalert2';
import FacultyModal from '../components/FacultyModal';

export default function Settings({ currentUser, onLogout }) {
  const [restoring, setRestoring] = useState(false);
  const [users, setUsers] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', username: '', password: '' });

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDownloadBackup = () => {
    window.location.href = '/api/admin/backup';
    Swal.fire({
      icon: 'success',
      title: 'Backup Downloaded',
      text: 'Full system database exported.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        if (json && (json.data || json.venues || json.bookings)) {
          const confirm = await Swal.fire({
            title: 'Restore Database?',
            text: 'This will overwrite existing system records with the backup file.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Restore',
            confirmButtonColor: '#4F46E5',
          });

          if (confirm.isConfirmed) {
            setRestoring(true);
            try {
              await adminApi.restoreBackup(json.data || json);
              Swal.fire({ icon: 'success', title: 'Restored Successfully', timer: 1500, showConfirmButton: false });
            } catch (err) {
              Swal.fire({ icon: 'error', title: 'Restore Failed', text: err.message });
            } finally {
              setRestoring(false);
            }
          }
        } else {
          Swal.fire({ icon: 'error', title: 'Invalid File', text: 'Uploaded file is not a valid backup.' });
        }
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to read JSON file.' });
      }
    };
    reader.readAsText(file);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.username.trim() || !userForm.password.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required Fields', text: 'All fields are required.' });
      return;
    }
    try {
      await adminApi.addUser(userForm);
      setUserModalOpen(false);
      setUserForm({ name: '', username: '', password: '' });
      loadUsers();
      Swal.fire({ icon: 'success', title: 'Admin Account Created', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message });
    }
  };

  const handleDeleteUser = (u) => {
    if (['admin', 'dev'].includes((u.username || '').toLowerCase())) {
      Swal.fire({ icon: 'warning', title: 'Protected Account', text: 'Master admin accounts cannot be deleted.' });
      return;
    }
    Swal.fire({
      title: `Delete ${u.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#EF4444',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await adminApi.deleteUser(u.id);
          loadUsers();
        } catch {}
      }
    });
  };

  return (
    <div className="safe-bottom" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          System Settings
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
          Backups, accounts & app controls
        </p>
      </div>

      <div className="admin-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Database size={15} color="var(--primary)" /> Database Backups
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleDownloadBackup}
            className="btn-primary"
            style={{ width: '100%', height: 44, fontSize: 13 }}
          >
            <Download size={15} /> 1-Click Download Database Backup
          </button>

          <label style={{
            width: '100%',
            height: 44,
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface-subtle)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: restoring ? 'not-allowed' : 'pointer',
          }}>
            <Upload size={15} color="var(--primary)" />
            {restoring ? 'Restoring System...' : 'Upload & Restore Backup File'}
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={restoring}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Faculty & App Users Approvals Card */}
      <div className="admin-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                Faculty & App Users
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Review pending requests, approve logins & manage access
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate ? onNavigate('faculty') : setFacultyModalOpen(true)}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              background: '#4F46E5',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 750,
              cursor: 'pointer'
            }}
          >
            Manage Users
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={15} color="var(--primary)" /> Administrator Accounts
          </div>

          <button
            onClick={() => setUserModalOpen(true)}
            style={{
              background: 'var(--primary-light)',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              fontWeight: 750,
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={12} /> Add Admin
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map((u) => {
            const isMaster = ['admin', 'dev'].includes((u.username || '').toLowerCase());
            return (
              <div
                key={u.id}
                style={{
                  padding: '10px 12px',
                  background: 'var(--surface-subtle)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 750, color: 'var(--text-primary)' }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    username: <strong>{u.username}</strong>
                  </div>
                </div>

                {!isMaster && (
                  <button
                    onClick={() => handleDeleteUser(u)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="admin-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
              {currentUser?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Logged in as <strong>{currentUser?.username || 'admin'}</strong>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#DC2626',
              fontSize: 12,
              fontWeight: 750,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 11, color: 'var(--text-muted)' }}>
        <div>Developed with ❤️ by <strong style={{ color: 'var(--text-primary)' }}>Tushal Jadhav</strong></div>
        <a
          href="https://tushaljadhav-portfolio.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 3 }}
        >
          Portfolio <ExternalLink size={10} />
        </a>
      </div>

      {userModalOpen && (
        <div className="modal-overlay" onClick={() => setUserModalOpen(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 850, color: 'var(--text-primary)' }}>
                Add New Administrator
              </h3>
              <button onClick={() => setUserModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Nilesh Deshmukh"
                  value={userForm.name}
                  onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. nilesh_admin"
                  value={userForm.username}
                  onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', height: 44, marginTop: 8 }}>
                Create Admin Account
              </button>
            </form>
          </div>
        </div>
      )}

      <FacultyModal
        isOpen={facultyModalOpen}
        onClose={() => setFacultyModalOpen(false)}
      />

    </div>
  );
}
