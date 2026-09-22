const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.SUPABASE_HOST || 'aws-0-ap-south-1.pooler.supabase.com',
  port: parseInt(process.env.SUPABASE_PORT || '5432', 10),
  database: process.env.SUPABASE_DB || 'postgres',
  user: process.env.SUPABASE_USER || 'postgres.ovaqqznuzpvmtvpyokpx',
  password: process.env.SUPABASE_PASSWORD || 't5viqwFaey1ykvpx',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Ensure sessionRadius column exists in bookings
pool.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS "sessionRadius" INT DEFAULT 100').catch(() => {});

async function query(sql, params = []) {
  try {
    const res = await pool.query(sql, params);
    return res.rows;
  } catch (error) {
    console.error(`Supabase Query Error: ${error.message} (SQL: ${sql})`);
    throw error;
  }
}

const dbSupabase = {
  // Users CRUD
  getUsers: async () => {
    return await query('SELECT * FROM users');
  },
  addUser: async (user) => {
    const id = `user_${Date.now()}`;
    await query('INSERT INTO users (id, username, password, name) VALUES ($1, $2, $3, $4)', [
      id,
      user.username,
      user.password,
      user.name
    ]);
    return { id, ...user };
  },
  updateUser: async (id, fields) => {
    await query('UPDATE users SET username = $1, password = $2, name = $3 WHERE id = $4', [
      fields.username,
      fields.password,
      fields.name,
      id
    ]);
    const rows = await query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },
  deleteUser: async (id) => {
    const rows = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (rows.length > 0) {
      const uname = (rows[0].username || '').toLowerCase();
      if (uname === 'admin' || uname === 'dev') {
        throw new Error(`Cannot delete permanent protected master account: @${rows[0].username}`);
      }
    }
    const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return res.rowCount > 0;
  },

  // Departments CRUD
  getDepartments: async () => {
    return await query('SELECT * FROM departments ORDER BY name ASC');
  },
  addDepartment: async (name) => {
    const id = `dept_${Date.now()}`;
    await query('INSERT INTO departments (id, name) VALUES ($1, $2)', [id, name]);
    return { id, name };
  },
  updateDepartment: async (id, name) => {
    await query('UPDATE departments SET name = $1 WHERE id = $2', [name, id]);
    return { id, name };
  },
  deleteDepartment: async (id) => {
    const res = await pool.query('DELETE FROM departments WHERE id = $1', [id]);
    return res.rowCount > 0;
  },

  // Designations CRUD
  getDesignations: async () => {
    return await query('SELECT * FROM designations ORDER BY name ASC');
  },
  addDesignation: async (name) => {
    const id = `desig_${Date.now()}`;
    await query('INSERT INTO designations (id, name) VALUES ($1, $2)', [id, name]);
    return { id, name };
  },
  updateDesignation: async (id, name) => {
    await query('UPDATE designations SET name = $1 WHERE id = $2', [name, id]);
    return { id, name };
  },
  deleteDesignation: async (id) => {
    const res = await pool.query('DELETE FROM designations WHERE id = $1', [id]);
    return res.rowCount > 0;
  },

  // Faculty CRUD
  getFaculty: async () => {
    return await query(`
      SELECT f.*, d.name as "designationName", 
             COALESCE(dept.name, f."departmentId", '') as "departmentName",
             CONCAT(COALESCE(d.name, ''), ' ', f.name) as "fullName" 
      FROM faculty f
      LEFT JOIN designations d ON f."designationId" = d.id
      LEFT JOIN departments dept ON f."departmentId" = dept.id
      ORDER BY f.name ASC
    `);
  },
  addFaculty: async (f) => {
    const id = `faculty_${Date.now()}`;
    const status = f.status || 'Pending';
    await query(`
      INSERT INTO faculty (id, name, email, mobile, "departmentId", "designationId", status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      id,
      f.name,
      f.email,
      f.mobile,
      f.departmentId,
      f.designationId || null,
      status
    ]);
    const rows = await query(`
      SELECT f.*, d.name as "designationName", 
             COALESCE(dept.name, f."departmentId", '') as "departmentName",
             CONCAT(COALESCE(d.name, ''), ' ', f.name) as "fullName" 
      FROM faculty f
      LEFT JOIN designations d ON f."designationId" = d.id
      LEFT JOIN departments dept ON f."departmentId" = dept.id
      WHERE f.id = $1
    `, [id]);
    return rows[0] || { id, ...f, status };
  },
  updateFaculty: async (id, fields) => {
    await query(`
      UPDATE faculty 
      SET name = $1, email = $2, mobile = $3, "departmentId" = $4, "designationId" = $5 
      WHERE id = $6
    `, [
      fields.name,
      fields.email,
      fields.mobile,
      fields.departmentId,
      fields.designationId,
      id
    ]);
    const rows = await query(`
      SELECT f.*, d.name as "designationName", 
             COALESCE(dept.name, f."departmentId", '') as "departmentName",
             CONCAT(COALESCE(d.name, ''), ' ', f.name) as "fullName" 
      FROM faculty f
      LEFT JOIN designations d ON f."designationId" = d.id
      LEFT JOIN departments dept ON f."departmentId" = dept.id
      WHERE f.id = $1
    `, [id]);
    return rows[0] || null;
  },
  updateFacultyStatus: async (id, status) => {
    await query('UPDATE faculty SET status = $1 WHERE id = $2', [status, id]);
    const rows = await query(`
      SELECT f.*, d.name as "designationName", 
             COALESCE(dept.name, f."departmentId", '') as "departmentName",
             CONCAT(COALESCE(d.name, ''), ' ', f.name) as "fullName" 
      FROM faculty f
      LEFT JOIN designations d ON f."designationId" = d.id
      LEFT JOIN departments dept ON f."departmentId" = dept.id
      WHERE f.id = $1
    `, [id]);
    return rows[0] || null;
  },
  findFacultyByMobile: async (rawMobile) => {
    const digits = String(rawMobile).replace(/[^0-9]/g, '');
    const clean10 = digits.slice(-10);
    if (!clean10) return null;
    const rows = await dbSupabase.getFaculty();
    return rows.find(f => {
      if (!f.mobile) return false;
      const fDigits = String(f.mobile).replace(/[^0-9]/g, '').slice(-10);
      return fDigits === clean10;
    }) || null;
  },
  deleteFaculty: async (id) => {
    const res = await pool.query('DELETE FROM faculty WHERE id = $1', [id]);
    return res.rowCount > 0;
  },

  // Venues CRUD
  getVenues: async () => {
    const rows = await query('SELECT * FROM venues ORDER BY name ASC');
    return rows.map(r => ({
      ...r,
      capacity: r.capacity !== null ? Number(r.capacity) : null,
      radius: r.radius !== null ? Number(r.radius) : 50,
      latitude: r.latitude !== null ? Number(r.latitude) : null,
      longitude: r.longitude !== null ? Number(r.longitude) : null
    }));
  },
  addVenue: async (v) => {
    const id = `venue_${Date.now()}`;
    await query(`
      INSERT INTO venues (id, name, capacity, location, address, latitude, longitude, radius, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      id,
      v.name,
      v.capacity !== undefined ? Number(v.capacity) : 0,
      v.location || '',
      v.address || '',
      v.latitude !== undefined && v.latitude !== '' ? Number(v.latitude) : null,
      v.longitude !== undefined && v.longitude !== '' ? Number(v.longitude) : null,
      v.radius !== undefined ? Number(v.radius) : 50,
      v.status || 'Active'
    ]);
    return { id, ...v };
  },
  updateVenue: async (id, fields) => {
    const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
    if (keys.length === 0) return null;
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);
    await query(`UPDATE venues SET ${setClause} WHERE id = $${params.length}`, params);
    const rows = await query('SELECT * FROM venues WHERE id = $1', [id]);
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      capacity: r.capacity !== null ? Number(r.capacity) : null,
      radius: r.radius !== null ? Number(r.radius) : 50,
      latitude: r.latitude !== null ? Number(r.latitude) : null,
      longitude: r.longitude !== null ? Number(r.longitude) : null
    };
  },
  deleteVenue: async (id) => {
    const res = await pool.query('DELETE FROM venues WHERE id = $1', [id]);
    return res.rowCount > 0;
  },

  // Bookings CRUD
  getBookings: async () => {
    return await query('SELECT * FROM bookings ORDER BY "bookingDate" DESC, "startTime" DESC');
  },
  addBooking: async (b) => {
    const id = `booking_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    await query(`
      INSERT INTO bookings (
        id, "eventName", "departmentName", "facultyName", "venueId", "eventDescription", 
        "bookingDate", "startTime", "endTime", attendees, status, "attendanceStatus", 
        "attendanceWindowStart", "attendanceWindowEnd", coordinator, email, phone, "classYear"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `, [
      id,
      b.eventName,
      b.departmentName || '',
      b.facultyName || '',
      b.venueId,
      b.eventDescription || '',
      b.bookingDate,
      b.startTime,
      b.endTime,
      b.attendees !== undefined ? Number(b.attendees) : 0,
      b.status || 'Confirmed',
      b.attendanceStatus || 'CLOSED',
      b.attendanceWindowStart || null,
      b.attendanceWindowEnd || null,
      b.coordinator || '',
      b.email || '',
      b.phone || '',
      b.classYear || ''
    ]);
    return { id, status: b.status || 'Confirmed', attendanceStatus: 'CLOSED', ...b };
  },
  updateBookingStatus: async (id, status) => {
    await query('UPDATE bookings SET status = $1 WHERE id = $2', [status, id]);
    const rows = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    return rows[0] || null;
  },
  updateBooking: async (id, fields) => {
    const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
    if (keys.length === 0) return null;
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);
    await query(`UPDATE bookings SET ${setClause} WHERE id = $${params.length}`, params);
    const rows = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    return rows[0] || null;
  },
  addAuditLog: async (log) => {
    const id = `audit_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    await query(`
      INSERT INTO booking_audit_log (id, booking_id, admin_id, admin_name, action_type, reason, previous_booking_snapshot, new_booking_snapshot, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      id,
      log.booking_id,
      log.admin_id,
      log.admin_name || 'Admin',
      log.action_type,
      log.reason,
      log.previous_booking_snapshot || null,
      log.new_booking_snapshot || null
    ]);
    return { id, ...log, created_at: new Date().toISOString() };
  },
  getAuditLogs: async () => {
    return await query('SELECT * FROM booking_audit_log ORDER BY created_at DESC');
  },
  addNotification: async (notif) => {
    const id = `notif_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    await query(`
      INSERT INTO notifications (id, "recipientId", "recipientEmail", title, message, reason, type, "bookingId", "isRead", created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NOW())
    `, [
      id,
      notif.recipientId || '',
      notif.recipientEmail || '',
      notif.title,
      notif.message,
      notif.reason,
      notif.type,
      notif.bookingId
    ]);
    return { id, ...notif, isRead: 0, created_at: new Date().toISOString() };
  },
  getNotifications: async () => {
    return await query('SELECT * FROM notifications ORDER BY created_at DESC');
  },
  deleteBooking: async (id) => {
    const res = await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    return res.rowCount > 0;
  },
  clearAllBookings: async () => {
    await pool.query('DELETE FROM bookings');
    return true;
  },

  // Attendance-linked Booking helpers
  startAttendance: async (bookingId, windowMins, latitude = null, longitude = null, pin = null) => {
    const start = new Date();
    const end = new Date(start.getTime() + windowMins * 60000);
    const startStr = start.toISOString();
    const endStr = end.toISOString();
    
    await query(`
      UPDATE bookings 
      SET "attendanceStatus" = 'OPEN', 
          "attendanceWindowStart" = $1, 
          "attendanceWindowEnd" = $2,
          "sessionLatitude" = $3,
          "sessionLongitude" = $4,
          "sessionPin" = $5
      WHERE id = $6
    `, [
      startStr, 
      endStr, 
      latitude !== null && latitude !== undefined && latitude !== '' ? Number(latitude) : null,
      longitude !== null && longitude !== undefined && longitude !== '' ? Number(longitude) : null,
      pin || null,
      bookingId
    ]);
    
    const rows = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    return rows[0] || null;
  },
  stopAttendance: async (bookingId) => {
    await query(`
      UPDATE bookings 
      SET "attendanceStatus" = 'CLOSED', 
          "attendanceWindowStart" = NULL, 
          "attendanceWindowEnd" = NULL 
      WHERE id = $1
    `, [bookingId]);
    
    const rows = await query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    return rows[0] || null;
  },
  isSlotAvailable: async (venueId, bookingDate, startTime, endTime, excludeBookingId = null) => {
    let sql = `
      SELECT COUNT(*) as count FROM bookings 
      WHERE "venueId" = $1 
        AND "bookingDate" = $2 
        AND status NOT IN ('Cancelled', 'cancelled_by_admin', 'reassigned')
        AND ($3 < "endTime" AND $4 > "startTime")
    `;
    const params = [venueId, bookingDate, startTime, endTime];
    if (excludeBookingId) {
      sql += ` AND id != $5`;
      params.push(excludeBookingId);
    }
    
    const rows = await query(sql, params);
    return parseInt(rows[0].count, 10) === 0;
  },

  // Student Attendance CRUD
  getAttendance: async (bookingId) => {
    const rows = await query('SELECT * FROM attendance WHERE "bookingId" = $1', [bookingId]);
    return rows.map(r => ({
      ...r,
      latitude: r.latitude !== null ? Number(r.latitude) : null,
      longitude: r.longitude !== null ? Number(r.longitude) : null,
      distanceFromVenue: r.distanceFromVenue !== null ? Number(r.distanceFromVenue) : null
    }));
  },
  addAttendanceRecord: async (r) => {
    const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const checkInTime = new Date().toISOString();
    await query(`
      INSERT INTO attendance (id, "bookingId", "rollNumber", "studentName", "classStream", latitude, longitude, "distanceFromVenue", "checkInTime")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      id,
      r.bookingId,
      r.rollNumber,
      r.studentName,
      r.classStream || '',
      r.latitude !== undefined ? Number(r.latitude) : 0,
      r.longitude !== undefined ? Number(r.longitude) : 0,
      r.distanceFromVenue !== undefined ? Number(r.distanceFromVenue) : null,
      checkInTime
    ]);
    return { id, checkInTime, ...r };
  },
  hasMarkedAttendance: async (bookingId, rollNumber) => {
    const rows = await query(`
      SELECT COUNT(*) as count FROM attendance 
      WHERE "bookingId" = $1 AND LOWER("rollNumber") = LOWER($2)
    `, [bookingId, rollNumber]);
    return parseInt(rows[0].count, 10) > 0;
  },
  getAttendanceRecords: async () => {
    return await query('SELECT * FROM attendance');
  }
};

module.exports = {
  query,
  dbMysql: dbSupabase,
  dbSupabase
};
