const mysql = require('mysql2/promise');

// Create the connection pool to the MySQL database.
// Using a pool is a best practice because it manages multiple active connections
// and recycles them, avoiding the overhead of opening a new connection for every HTTP request.
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678', // Your MySQL root password
  database: 'auditorium_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Run dynamic schema migration to ensure required columns and tables exist
(async () => {
  try {
    await pool.query('ALTER TABLE attendance ADD COLUMN classStream VARCHAR(100) NULL');
  } catch (err) {}

  // Migrate bookings: rename departmentId -> departmentName, facultyId -> facultyName, className -> classYear
  // Drop foreign key constraints for departmentId and facultyId first
  try {
    const [fks] = await pool.query(`SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'departmentId' AND REFERENCED_TABLE_NAME IS NOT NULL`);
    for (const fk of fks) {
      await pool.query(`ALTER TABLE bookings DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
    }
  } catch (err) {}
  try {
    const [fks] = await pool.query(`SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'facultyId' AND REFERENCED_TABLE_NAME IS NOT NULL`);
    for (const fk of fks) {
      await pool.query(`ALTER TABLE bookings DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
    }
  } catch (err) {}

  // Rename columns safely (skip if already renamed)
  try {
    await pool.query('ALTER TABLE bookings CHANGE COLUMN departmentId departmentName VARCHAR(150) NULL');
  } catch (err) {}
  try {
    await pool.query('ALTER TABLE bookings CHANGE COLUMN facultyId facultyName VARCHAR(150) NULL');
  } catch (err) {}
  try {
    await pool.query('ALTER TABLE bookings CHANGE COLUMN className classYear VARCHAR(100) NULL');
  } catch (err) {}
  // If classYear column doesn't exist at all (fresh DB without className either), add it
  try {
    await pool.query('ALTER TABLE bookings ADD COLUMN classYear VARCHAR(100) NULL');
  } catch (err) {}

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_audit_log (
        id VARCHAR(50) PRIMARY KEY,
        booking_id VARCHAR(50) NOT NULL,
        admin_id VARCHAR(50) NOT NULL,
        admin_name VARCHAR(150),
        action_type VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        previous_booking_snapshot TEXT,
        new_booking_snapshot TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        recipientId VARCHAR(50),
        recipientEmail VARCHAR(150),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        reason TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        bookingId VARCHAR(50),
        isRead TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database Migration: Verified audit logs and notifications tables.');
  } catch (err) {
    console.error('Migration Warning:', err.message);
  }
})();

// Helper function to run SQL queries.
// It automatically gets a connection from the pool, runs the query, and releases the connection.
async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error(`Database Query Error: ${error.message} (SQL: ${sql})`);
    throw error;
  }
}

// Database manager functions implemented via SQL queries
const dbMysql = {
  // Users CRUD
  getUsers: async () => {
    return await query('SELECT * FROM users');
  },
  addUser: async (user) => {
    const id = `user_${Date.now()}`;
    await query('INSERT INTO users (id, username, password, name) VALUES (?, ?, ?, ?)', [
      id,
      user.username,
      user.password,
      user.name
    ]);
    return { id, ...user };
  },
  updateUser: async (id, fields) => {
    await query('UPDATE users SET username = ?, password = ?, name = ? WHERE id = ?', [
      fields.username,
      fields.password,
      fields.name,
      id
    ]);
    const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },
  deleteUser: async (id) => {
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Departments CRUD
  getDepartments: async () => {
    return await query('SELECT * FROM departments');
  },
  addDepartment: async (name) => {
    const id = `dept_${Date.now()}`;
    await query('INSERT INTO departments (id, name) VALUES (?, ?)', [id, name]);
    return { id, name };
  },
  updateDepartment: async (id, name) => {
    await query('UPDATE departments SET name = ? WHERE id = ?', [name, id]);
    return { id, name };
  },
  deleteDepartment: async (id) => {
    // Note: Foreign keys in schema.sql handle cascade deletes automatically!
    const result = await query('DELETE FROM departments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Faculty CRUD
  getFaculty: async () => {
    return await query(`
      SELECT f.*, d.name as designationName, 
             CONCAT(IFNULL(d.name, ''), ' ', f.name) as fullName 
      FROM faculty f
      LEFT JOIN designations d ON f.designationId = d.id
    `);
  },
  addFaculty: async (f) => {
    const id = `faculty_${Date.now()}`;
    await query('INSERT INTO faculty (id, name, email, mobile, departmentId, designationId) VALUES (?, ?, ?, ?, ?, ?)', [
      id,
      f.name,
      f.email,
      f.mobile,
      f.departmentId,
      f.designationId
    ]);
    return { id, ...f };
  },
  updateFaculty: async (id, fields) => {
    await query('UPDATE faculty SET name = ?, email = ?, mobile = ?, departmentId = ?, designationId = ? WHERE id = ?', [
      fields.name,
      fields.email,
      fields.mobile,
      fields.departmentId,
      fields.designationId,
      id
    ]);
    const rows = await query(`
      SELECT f.*, d.name as designationName, 
             CONCAT(IFNULL(d.name, ''), ' ', f.name) as fullName 
      FROM faculty f
      LEFT JOIN designations d ON f.designationId = d.id
      WHERE f.id = ?
    `, [id]);
    return rows[0] || null;
  },
  deleteFaculty: async (id) => {
    const result = await query('DELETE FROM faculty WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Designations CRUD
  getDesignations: async () => {
    return await query('SELECT * FROM designations');
  },
  addDesignation: async (name) => {
    const id = `desig_${Date.now()}`;
    await query('INSERT INTO designations (id, name) VALUES (?, ?)', [id, name]);
    return { id, name };
  },
  updateDesignation: async (id, name) => {
    await query('UPDATE designations SET name = ? WHERE id = ?', [name, id]);
    return { id, name };
  },
  deleteDesignation: async (id) => {
    const result = await query('DELETE FROM designations WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Venues CRUD
  getVenues: async () => {
    const rows = await query('SELECT * FROM venues');
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
      INSERT INTO venues (id, name, capacity, location, address, latitude, longitude, radius, status, maintenanceReason) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      v.name,
      v.capacity !== undefined ? Number(v.capacity) : 0,
      v.location || '',
      v.address || '',
      v.latitude !== undefined && v.latitude !== '' ? Number(v.latitude) : null,
      v.longitude !== undefined && v.longitude !== '' ? Number(v.longitude) : null,
      v.radius !== undefined ? Number(v.radius) : 50,
      v.status || 'Active',
      v.maintenanceReason || ''
    ]);
    return { id, ...v };
  },
  updateVenue: async (id, fields) => {
    const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
    if (keys.length === 0) return null;
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);
    await query(`UPDATE venues SET ${setClause} WHERE id = ?`, params);
    const rows = await query('SELECT * FROM venues WHERE id = ?', [id]);
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
    // Note: Foreign keys in schema.sql handle cascade nulls automatically!
    const result = await query('DELETE FROM venues WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // Bookings CRUD
  getBookings: async () => {
    return await query('SELECT * FROM bookings');
  },
  addBooking: async (b) => {
    const id = `booking_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    await query(`
      INSERT INTO bookings (
        id, eventName, departmentName, facultyName, venueId, eventDescription, 
        bookingDate, startTime, endTime, attendees, status, attendanceStatus, 
        attendanceWindowStart, attendanceWindowEnd, coordinator, email, phone, classYear
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    await query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    const rows = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    return rows[0] || null;
  },
  updateBooking: async (id, fields) => {
    const keys = Object.keys(fields).filter(k => fields[k] !== undefined);
    if (keys.length === 0) return null;
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => fields[k]);
    params.push(id);
    await query(`UPDATE bookings SET ${setClause} WHERE id = ?`, params);
    const rows = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    return rows[0] || null;
  },
  addAuditLog: async (log) => {
    const id = `audit_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await query(`
      INSERT INTO booking_audit_log (id, booking_id, admin_id, admin_name, action_type, reason, previous_booking_snapshot, new_booking_snapshot, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      log.booking_id,
      log.admin_id,
      log.admin_name || 'Admin',
      log.action_type,
      log.reason,
      log.previous_booking_snapshot || null,
      log.new_booking_snapshot || null,
      createdAt
    ]);
    return { id, ...log, created_at: createdAt };
  },
  getAuditLogs: async () => {
    return await query('SELECT * FROM booking_audit_log ORDER BY created_at DESC');
  },
  addNotification: async (notif) => {
    const id = `notif_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await query(`
      INSERT INTO notifications (id, recipientId, recipientEmail, title, message, reason, type, bookingId, isRead, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `, [
      id,
      notif.recipientId || '',
      notif.recipientEmail || '',
      notif.title,
      notif.message,
      notif.reason,
      notif.type,
      notif.bookingId,
      createdAt
    ]);
    return { id, ...notif, isRead: 0, created_at: createdAt };
  },
  getNotifications: async () => {
    return await query('SELECT * FROM notifications ORDER BY created_at DESC');
  },
  deleteBooking: async (id) => {
    const result = await query('DELETE FROM bookings WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
  clearAllBookings: async () => {
    await query('DELETE FROM bookings');
    return true;
  },

  // Attendance-linked Booking helpers
  startAttendance: async (bookingId, windowMins) => {
    const start = new Date();
    const end = new Date(start.getTime() + windowMins * 60000);
    const startStr = start.toISOString();
    const endStr = end.toISOString();
    
    await query(`
      UPDATE bookings 
      SET attendanceStatus = 'OPEN', 
          attendanceWindowStart = ?, 
          attendanceWindowEnd = ? 
      WHERE id = ?
    `, [startStr, endStr, bookingId]);
    
    const rows = await query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    return rows[0] || null;
  },
  stopAttendance: async (bookingId) => {
    await query(`
      UPDATE bookings 
      SET attendanceStatus = 'CLOSED', 
          attendanceWindowStart = NULL, 
          attendanceWindowEnd = NULL 
      WHERE id = ?
    `, [bookingId]);
    
    const rows = await query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    return rows[0] || null;
  },
  isSlotAvailable: async (venueId, bookingDate, startTime, endTime, excludeBookingId = null) => {
    let sql = `
      SELECT COUNT(*) as count FROM bookings 
      WHERE venueId = ? 
        AND bookingDate = ? 
        AND status NOT IN ('Cancelled', 'cancelled_by_admin', 'reassigned')
        AND (? < endTime AND ? > startTime)
    `;
    const params = [venueId, bookingDate, startTime, endTime];
    if (excludeBookingId) {
      sql += ` AND id != ?`;
      params.push(excludeBookingId);
    }
    
    const rows = await query(sql, params);
    return rows[0].count === 0;
  },

  // Student Attendance CRUD
  getAttendance: async (bookingId) => {
    const rows = await query('SELECT * FROM attendance WHERE bookingId = ?', [bookingId]);
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
      INSERT INTO attendance (id, bookingId, rollNumber, studentName, classStream, latitude, longitude, distanceFromVenue, checkInTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      WHERE bookingId = ? AND LOWER(rollNumber) = LOWER(?)
    `, [bookingId, rollNumber]);
    return rows[0].count > 0;
  },

  getAttendanceRecords: async () => {
    return await query('SELECT * FROM attendance');
  },

  restoreFullBackup: async (backupObj) => {
    await query('SET FOREIGN_KEY_CHECKS = 0');
    try {
      if (backupObj.departments && Array.isArray(backupObj.departments)) {
        await query('TRUNCATE TABLE departments');
        for (const d of backupObj.departments) {
          await query('INSERT INTO departments (id, name) VALUES (?, ?)', [d.id, d.name]);
        }
      }
      if (backupObj.designations && Array.isArray(backupObj.designations)) {
        await query('TRUNCATE TABLE designations');
        for (const des of backupObj.designations) {
          await query('INSERT INTO designations (id, name) VALUES (?, ?)', [des.id, des.name]);
        }
      }
      if (backupObj.faculty && Array.isArray(backupObj.faculty)) {
        await query('TRUNCATE TABLE faculty');
        for (const f of backupObj.faculty) {
          await query('INSERT INTO faculty (id, name, email, mobile, departmentId, designationId) VALUES (?, ?, ?, ?, ?, ?)', 
            [f.id, f.name, f.email, f.mobile, f.departmentId, f.designationId || null]);
        }
      }
      if (backupObj.venues && Array.isArray(backupObj.venues)) {
        await query('TRUNCATE TABLE venues');
        for (const v of backupObj.venues) {
          await query('INSERT INTO venues (id, name, capacity, location, address, latitude, longitude, radius, status, maintenanceReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [v.id, v.name, v.capacity, v.location || '', v.address || '', v.latitude || null, v.longitude || null, v.radius || 50, v.status || 'Active', v.maintenanceReason || '']);
        }
      }
      if (backupObj.bookings && Array.isArray(backupObj.bookings)) {
        await query('TRUNCATE TABLE bookings');
        for (const b of backupObj.bookings) {
          await query('INSERT INTO bookings (id, eventName, departmentName, facultyName, venueId, eventDescription, bookingDate, startTime, endTime, attendees, status, attendanceStatus, attendanceWindowStart, attendanceWindowEnd, coordinator, email, phone, classYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [b.id, b.eventName, b.departmentName || b.departmentId || '', b.facultyName || b.facultyId || '', b.venueId, b.eventDescription || '', b.bookingDate, b.startTime, b.endTime, b.attendees, b.status || 'Confirmed', b.attendanceStatus || 'CLOSED', b.attendanceWindowStart || null, b.attendanceWindowEnd || null, b.coordinator || '', b.email || '', b.phone || '', b.classYear || '']);
        }
      }
      if (backupObj.attendance && Array.isArray(backupObj.attendance)) {
        await query('TRUNCATE TABLE attendance');
        for (const a of backupObj.attendance) {
          await query('INSERT INTO attendance (id, bookingId, rollNumber, studentName, classStream, latitude, longitude, distanceFromVenue, checkInTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [a.id || `att_${Date.now()}`, a.bookingId, a.rollNumber, a.studentName, a.classStream || 'General', a.latitude || 0, a.longitude || 0, a.distanceFromVenue || 0, a.checkInTime || new Date().toISOString()]);
        }
      }
    } finally {
      await query('SET FOREIGN_KEY_CHECKS = 1');
    }
    return {
      departmentsCount: backupObj.departments?.length || 0,
      facultyCount: backupObj.faculty?.length || 0,
      venuesCount: backupObj.venues?.length || 0,
      bookingsCount: backupObj.bookings?.length || 0
    };
  }
};

module.exports = {
  query,
  dbMysql
};
