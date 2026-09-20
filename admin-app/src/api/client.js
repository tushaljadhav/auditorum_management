// Admin API Client for Kirti Auditorium Management System

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const sessionManager = {
  KEY: 'kirti_admin_session',
  getUser() {
    try {
      const s = localStorage.getItem(this.KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  },
  setUser(user) {
    if (user) {
      localStorage.setItem(this.KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.KEY);
    }
  },
  logout() {
    localStorage.removeItem(this.KEY);
  }
};

async function fetchJSON(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: Request failed`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${endpoint}]:`, err.message);
    throw err;
  }
}

export const adminApi = {
  login: (username, password) =>
    fetchJSON('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    fetchJSON('/auth/logout', { method: 'POST' }),

  checkSession: () =>
    fetchJSON('/auth/session'),

  getStats: () =>
    fetchJSON('/admin/stats'),

  getVenues: () =>
    fetchJSON('/venues'),

  addVenue: (payload) =>
    fetchJSON('/venues', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateVenue: (id, payload) =>
    fetchJSON(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteVenue: (id) =>
    fetchJSON(`/venues/${id}`, {
      method: 'DELETE',
    }),

  setVenueMaintenance: (venue, isMaintenance, reason = '') =>
    fetchJSON(`/venues/${venue.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...venue,
        status: isMaintenance ? 'Maintenance' : 'Active',
        maintenanceReason: isMaintenance ? reason : '',
      }),
    }),

  getBookings: () =>
    fetchJSON('/bookings'),

  overrideBooking: (bookingId, payload) =>
    fetchJSON(`/bookings/${bookingId}/override`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  cancelBooking: (bookingId, reason = 'Cancelled by Admin') =>
    fetchJSON(`/bookings/${bookingId}/override`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'cancel', reason }),
    }),

  deleteBooking: (id) =>
    fetchJSON(`/bookings/${id}`, {
      method: 'DELETE',
    }),

  getAttendance: (bookingId) =>
    fetchJSON(`/bookings/${bookingId}/attendance`),

  getUsers: () =>
    fetchJSON('/admin/users'),

  addUser: (payload) =>
    fetchJSON('/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateUser: (id, payload) =>
    fetchJSON(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteUser: (id) =>
    fetchJSON(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  // Faculty & User Approvals
  getFaculty: () =>
    fetchJSON('/faculty'),

  updateFacultyStatus: (id, status) =>
    fetchJSON(`/faculty/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteFaculty: (id) =>
    fetchJSON(`/faculty/${id}`, {
      method: 'DELETE',
    }),

  getBackupDownloadUrl: () => '/api/admin/backup',

  restoreBackup: (jsonData) =>
    fetchJSON('/admin/restore', {
      method: 'POST',
      body: JSON.stringify({ data: jsonData }),
    }),
};
