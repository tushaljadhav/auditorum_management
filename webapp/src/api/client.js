// API Client for Kirti Auditorium User PWA
// Self-contained — no imports from other folders

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const FALLBACK_VENUES = [
  {
    id: 'venue_1789932120910',
    name: '2.8',
    capacity: 500,
    location: 'Ground floor',
    address: '',
    latitude: 19.0222,
    longitude: 72.8304,
    radius: 100,
    status: 'Active',
  },
];

export const FALLBACK_DEPARTMENTS = [
  { id: 'dept_1789844601506', name: 'General' },
];

const memoryCache = {
  venues: null,
  departments: null,
};

export const getCachedVenues = () => {
  if (memoryCache.venues && memoryCache.venues.length > 0) {
    return memoryCache.venues;
  }
  try {
    const raw = localStorage.getItem('kirti_cached_venues');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache.venues = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  return FALLBACK_VENUES;
};

export const getCachedDepartments = () => {
  if (memoryCache.departments && memoryCache.departments.length > 0) {
    return memoryCache.departments;
  }
  try {
    const raw = localStorage.getItem('kirti_cached_departments');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache.departments = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  return FALLBACK_DEPARTMENTS;
};

async function fetchJSON(url, options = {}) {
  const timeoutMs = options.timeout || 12000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status})`);
      error.status = data.status || response.status;
      error.notFound = data.notFound || response.status === 404;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new Error(`Request timed out (${url}).`);
      timeoutError.isTimeout = true;
      throw timeoutError;
    }
    throw err;
  }
}

export const api = {
  // ── Pre-warming & Background Cache ──
  warmUp: () => {
    try {
      fetchJSON('/health', { timeout: 15000 }).catch(() => {});
      api.getVenues().catch(() => {});
      api.getDepartments().catch(() => {});
    } catch (_) {}
  },

  // ── Faculty Registration & Phone Login ──
  registerFaculty: (payload) =>
    fetchJSON('/faculty/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  facultyLogin: (mobile) =>
    fetchJSON('/auth/faculty-login', {
      method: 'POST',
      body: JSON.stringify({ mobile })
    }),

  // ── Venues (with Instant Cache & Stale-While-Revalidate) ──
  getVenues: async () => {
    try {
      const data = await fetchJSON('/venues', { timeout: 8000 });
      if (Array.isArray(data) && data.length > 0) {
        memoryCache.venues = data;
        try { localStorage.setItem('kirti_cached_venues', JSON.stringify(data)); } catch (_) {}
        return data;
      }
    } catch (e) {
      console.warn('getVenues warning, using cached venues:', e.message);
    }
    return getCachedVenues();
  },

  // ── Departments & Faculty ──
  getDepartments: async () => {
    try {
      const data = await fetchJSON('/departments', { timeout: 8000 });
      if (Array.isArray(data) && data.length > 0) {
        memoryCache.departments = data;
        try { localStorage.setItem('kirti_cached_departments', JSON.stringify(data)); } catch (_) {}
        return data;
      }
    } catch (e) {
      console.warn('getDepartments warning, using cached departments:', e.message);
    }
    return getCachedDepartments();
  },
  getFaculty:     () => fetchJSON('/faculty'),

  // ── Bookings ──
  getBookings: () => fetchJSON('/bookings'),

  getBookingById: (id) => fetchJSON(`/bookings/${id}`),

  checkAvailability: (payload) =>
    fetchJSON('/bookings/check-availability', { method: 'POST', body: JSON.stringify(payload) }),

  createBooking: (payload) =>
    fetchJSON('/bookings', { method: 'POST', body: JSON.stringify(payload) }),

  // ── Attendance / Sessions ──
  getTodaySessions: (date, q = '') => {
    const query = new URLSearchParams();
    if (date) query.append('date', date);
    if (q)    query.append('q', q);
    return fetchJSON(`/attendance/today-sessions?${query.toString()}`);
  },

  markAttendance: (payload) =>
    fetchJSON('/attendance/mark', { method: 'POST', body: JSON.stringify(payload) }),

  getAttendanceRoster: (bookingId) =>
    fetchJSON(`/bookings/${bookingId}/attendance`),

  getArchive: (params = {}) =>
    fetchJSON(`/attendance/archive?${new URLSearchParams(params).toString()}`),

  getArchiveRoster: (bookingId) =>
    fetchJSON(`/bookings/${bookingId}/attendance`),

  // Start attendance window (Faculty) — updates sessionLatitude, sessionLongitude, sessionPin
  startAttendance: (bookingId, payload) =>
    fetchJSON(`/bookings/${bookingId}/start-attendance`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Stop / close attendance
  stopAttendance: (bookingId) =>
    fetchJSON(`/bookings/${bookingId}/stop-attendance`, { method: 'POST' }),

  // Create a new instant session (for Faculty Live)
  createInstantSession: (payload) =>
    fetchJSON('/attendance/create-instant-session', { method: 'POST', body: JSON.stringify(payload) }),

  // ── Admin ──
  getAdminStats: () => fetchJSON('/admin/stats'),

  adminOverrideBooking: (bookingId, payload) =>
    fetchJSON(`/admin/bookings/${bookingId}/override`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  adminCancelBooking: (bookingId, reason) =>
    fetchJSON(`/admin/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  addVenue: (payload) =>
    fetchJSON('/venues', { method: 'POST', body: JSON.stringify(payload) }),

  updateVenue: (id, payload) =>
    fetchJSON(`/venues/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteVenue: (id) =>
    fetchJSON(`/venues/${id}`, { method: 'DELETE' }),

  getAdminUsers: () => fetchJSON('/admin/users'),

  addAdminUser: (payload) =>
    fetchJSON('/admin/users', { method: 'POST', body: JSON.stringify(payload) }),

  deleteAdminUser: (id) =>
    fetchJSON(`/admin/users/${id}`, { method: 'DELETE' }),

  getAuditLogs: (bookingId) =>
    fetchJSON(`/admin/audit-logs/${bookingId}`),

  // ── Auth ──
  authLogin: (username, password) =>
    fetchJSON('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  authLogout: () =>
    fetchJSON('/auth/logout', { method: 'POST' }),

  getSession: () => fetchJSON('/auth/session'),
};

// ── Client Session Manager ──
export const sessionManager = {
  getUser: () => {
    try {
      const saved = localStorage.getItem('kirti_pwa_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  },

  setUser: (user) => {
    if (!user) {
      localStorage.removeItem('kirti_pwa_user');
    } else {
      localStorage.setItem('kirti_pwa_user', JSON.stringify(user));
    }
  },

  logout: () => {
    localStorage.removeItem('kirti_pwa_user');
  },
};

// ── Shareable Attendance URL Builder ──
// Faculty creates session on webapp → generates URL for students to open on main website
export const buildAttendanceUrl = (bookingId) => {
  const { protocol, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:3000/attendance?bookingId=${bookingId}`;
  }
  const portalBase = import.meta.env.VITE_PORTAL_URL || 'https://kirti-auditorium.vercel.app';
  return `${portalBase}/attendance?bookingId=${bookingId}`;
};
