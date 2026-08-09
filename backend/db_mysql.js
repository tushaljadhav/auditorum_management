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

// Run dynamic schema migration to ensure classStream column exists
(async () => {
  try {
    await pool.query('ALTER TABLE attendance ADD COLUMN classStream VARCHAR(100) NULL');
    console.log('Database Migration: Added classStream column to attendance table.');
  } catch (err) {
    if (err.errno !== 1060) {
      console.error('Migration Warning:', err.message);
    }
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
      INSERT INTO venues (id, name, capacity, location, address, latitude, longitude, radius, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        id, eventName, departmentId, facultyId, venueId, eventDescription, 
        bookingDate, startTime, endTime, attendees, status, attendanceStatus, 
        attendanceWindowStart, attendanceWindowEnd, coordinator, email, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      b.eventName,
      b.departmentId,
      b.facultyId,
      b.venueId,
      b.eventDescription || '',
      b.bookingDate,
      b.startTime,
      b.endTime,
      b.attendees !== undefined ? Number(b.attendees) : 0,
      b.status || 'Approved',
      b.attendanceStatus || 'CLOSED',
      b.attendanceWindowStart || null,
      b.attendanceWindowEnd || null,
      b.coordinator || '',
      b.email || '',
      b.phone || ''
    ]);
    return { id, status: 'Approved', attendanceStatus: 'CLOSED', ...b };
  },
  updateBookingStatus: async (id, status) => {
    await query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    const rows = await query('SELECT * FROM bookings WHERE id = ?', [id]);
    return rows[0] || null;
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
        AND status != 'Cancelled'
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
  }
};

module.exports = {
  query,
  dbMysql
};
