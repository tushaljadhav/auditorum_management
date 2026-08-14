const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultData = {
  users: [
    { id: "user_1", username: "admin", password: "admin123", name: "System Admin" }
  ],
  departments: [
    { id: "dept_1", name: "IT" },
    { id: "dept_2", name: "CSE" },
    { id: "dept_3", name: "ECE" },
    { id: "dept_4", name: "Mechanical" }
  ],
  faculty: [
    { id: "faculty_1", name: "Dr. Rajesh Kumar", email: "rajesh.kumar@example.com", mobile: "+91 9876543210", departmentId: "dept_1" },
    { id: "faculty_2", name: "Prof. Vikram Singh", email: "vikram.singh@example.com", mobile: "+91 9876543211", departmentId: "dept_1" },
    { id: "faculty_3", name: "Dr. Neha Sharma", email: "neha.sharma@example.com", mobile: "+91 9876543212", departmentId: "dept_2" },
    { id: "faculty_4", name: "Prof. Amit Yadav", email: "amit.yadav@example.com", mobile: "+91 9876543213", departmentId: "dept_2" },
    { id: "faculty_5", name: "Prof. Anil Kumar", email: "anil.kumar@example.com", mobile: "+91 9876543214", departmentId: "dept_3" },
    { id: "faculty_6", name: "Dr. Priya Gupta", email: "priya.gupta@example.com", mobile: "+91 9876543215", departmentId: "dept_3" },
    { id: "faculty_7", name: "Prof. Radhika Joshi", email: "radhika.joshi@example.com", mobile: "+91 9876543216", departmentId: "dept_4" },
    { id: "faculty_8", name: "Dr. Kiran Patel", email: "kiran.patel@example.com", mobile: "+91 9876543217", departmentId: "dept_4" }
  ],
  venues: [
    { id: "venue_1", name: "Hall A", capacity: 150, location: "Block A, 2nd Floor", address: "Kirti College Block A, Dadar, Mumbai", latitude: 19.0269, longitude: 72.8422, radius: 50, status: "Active" },
    { id: "venue_2", name: "Hall B", capacity: 250, location: "Block B, Ground Floor", address: "Kirti College Block B, Dadar, Mumbai", latitude: 19.0272, longitude: 72.8425, radius: 50, status: "Active" },
    { id: "venue_3", name: "Hall C", capacity: 500, location: "Auditorium Complex", address: "Kirti College Auditorium Complex, Dadar, Mumbai", latitude: 19.0275, longitude: 72.8430, radius: 50, status: "Active" }
  ],
  bookings: [
    {
      id: "booking_1",
      eventName: "Web Development Workshop",
      departmentId: "dept_1",
      facultyId: "faculty_1",
      venueId: "venue_1",
      eventDescription: "A hands-on workshop covering Node.js and React concepts.",
      bookingDate: "2026-07-15",
      startTime: "10:00",
      endTime: "13:00",
      attendees: 120,
      status: "Approved",
      attendanceStatus: "CLOSED",
      attendanceWindowStart: null,
      attendanceWindowEnd: null
    },
    {
      id: "booking_2",
      eventName: "AI/ML Seminar",
      departmentId: "dept_2",
      facultyId: "faculty_3",
      venueId: "venue_3",
      eventDescription: "Guest lecture on future advancements in generative models.",
      bookingDate: "2026-07-20",
      startTime: "14:00",
      endTime: "16:00",
      attendees: 450,
      status: "Confirmed",
      attendanceStatus: "CLOSED",
      attendanceWindowStart: null,
      attendanceWindowEnd: null
    }
  ],
  attendance: []
};

// Helper function to read the database
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(defaultData);
      return defaultData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    
    // Ensure all arrays exist
    if (!parsed.users) parsed.users = defaultData.users;
    if (!parsed.departments) parsed.departments = [];
    if (!parsed.faculty) parsed.faculty = [];
    if (!parsed.venues) parsed.venues = [];
    if (!parsed.bookings) parsed.bookings = [];
    if (!parsed.attendance) parsed.attendance = [];
    
    return parsed;
  } catch (error) {
    console.error("Failed to read database, returning default data:", error);
    return defaultData;
  }
}

// Helper function to write to the database
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Failed to write to database:", error);
    return false;
  }
}

// Database helper functions
const db = {
  // Users CRUD
  getUsers: () => readDb().users,
  addUser: (user) => {
    const data = readDb();
    const newUser = { id: `user_${Date.now()}`, ...user };
    data.users.push(newUser);
    writeDb(data);
    return newUser;
  },
  updateUser: (id, updatedFields) => {
    const data = readDb();
    const idx = data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    data.users[idx] = { ...data.users[idx], ...updatedFields };
    writeDb(data);
    return data.users[idx];
  },
  deleteUser: (id) => {
    const data = readDb();
    const filtered = data.users.filter(u => u.id !== id);
    if (filtered.length === data.users.length) return false;
    data.users = filtered;
    writeDb(data);
    return true;
  },

  // Departments CRUD
  getDepartments: () => readDb().departments,
  addDepartment: (name) => {
    const data = readDb();
    const newDept = { id: `dept_${Date.now()}`, name };
    data.departments.push(newDept);
    writeDb(data);
    return newDept;
  },
  updateDepartment: (id, name) => {
    const data = readDb();
    const idx = data.departments.findIndex(d => d.id === id);
    if (idx === -1) return null;
    data.departments[idx].name = name;
    writeDb(data);
    return data.departments[idx];
  },
  deleteDepartment: (id) => {
    const data = readDb();
    data.departments = data.departments.filter(d => d.id !== id);
    // Cascade delete/clean associated faculty and bookings
    data.faculty = data.faculty.filter(f => f.departmentId !== id);
    data.bookings = data.bookings.filter(b => b.departmentId !== id);
    writeDb(data);
    return true;
  },

  // Faculty CRUD
  getFaculty: () => {
    const data = readDb();
    const designations = data.designations || [];
    return (data.faculty || []).map(f => {
      const desig = designations.find(d => d.id === f.designationId);
      return { ...f, designationName: desig ? desig.name : '' };
    });
  },
  addFaculty: (facultyMember) => {
    const data = readDb();
    const newFaculty = { id: `faculty_${Date.now()}`, ...facultyMember };
    data.faculty.push(newFaculty);
    writeDb(data);
    return newFaculty;
  },
  updateFaculty: (id, updatedFields) => {
    const data = readDb();
    const idx = data.faculty.findIndex(f => f.id === id);
    if (idx === -1) return null;
    data.faculty[idx] = { ...data.faculty[idx], ...updatedFields };
    writeDb(data);
    return data.faculty[idx];
  },
  deleteFaculty: (id) => {
    const data = readDb();
    data.faculty = data.faculty.filter(f => f.id !== id);
    data.bookings = data.bookings.filter(b => b.facultyId !== id);
    writeDb(data);
    return true;
  },

  // Venues CRUD
  getVenues: () => readDb().venues,
  addVenue: (venue) => {
    const data = readDb();
    const newVenue = { id: `venue_${Date.now()}`, ...venue };
    data.venues.push(newVenue);
    writeDb(data);
    return newVenue;
  },
  updateVenue: (id, updatedFields) => {
    const data = readDb();
    const idx = data.venues.findIndex(v => v.id === id);
    if (idx === -1) return null;
    data.venues[idx] = { ...data.venues[idx], ...updatedFields };
    writeDb(data);
    return data.venues[idx];
  },
  deleteVenue: (id) => {
    const data = readDb();
    data.venues = data.venues.filter(v => v.id !== id);
    data.bookings = data.bookings.filter(b => b.venueId !== id);
    writeDb(data);
    return true;
  },

  // Bookings CRUD
  getBookings: () => readDb().bookings,
  addBooking: (booking) => {
    const data = readDb();
    const newBooking = { 
      id: `booking_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`, 
      status: "Confirmed", // Instant booking confirmed by default
      attendanceStatus: "CLOSED",
      attendanceWindowStart: null,
      attendanceWindowEnd: null,
      ...booking 
    };
    data.bookings.push(newBooking);
    writeDb(data);
    return newBooking;
  },
  updateBookingStatus: (id, status) => {
    const data = readDb();
    const idx = data.bookings.findIndex(b => b.id === id);
    if (idx === -1) return null;
    data.bookings[idx].status = status;
    writeDb(data);
    return data.bookings[idx];
  },
  deleteBooking: (id) => {
    const data = readDb();
    const filtered = data.bookings.filter(b => b.id !== id);
    if (filtered.length === data.bookings.length) return false;
    data.bookings = filtered;
    writeDb(data);
    return true;
  },
  updateBooking: (id, fields) => {
    const data = readDb();
    const idx = data.bookings.findIndex(b => b.id === id);
    if (idx === -1) return null;
    data.bookings[idx] = { ...data.bookings[idx], ...fields };
    writeDb(data);
    return data.bookings[idx];
  },
  addAuditLog: (log) => {
    const data = readDb();
    if (!data.auditLogs) data.auditLogs = [];
    const newLog = { id: `audit_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`, created_at: new Date().toISOString(), ...log };
    data.auditLogs.push(newLog);
    writeDb(data);
    return newLog;
  },
  getAuditLogs: () => {
    const data = readDb();
    return (data.auditLogs || []).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },
  addNotification: (notif) => {
    const data = readDb();
    if (!data.notifications) data.notifications = [];
    const newNotif = { id: `notif_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`, isRead: 0, created_at: new Date().toISOString(), ...notif };
    data.notifications.push(newNotif);
    writeDb(data);
    return newNotif;
  },
  getNotifications: () => {
    const data = readDb();
    return (data.notifications || []).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  },
  clearAllBookings: () => {
    const data = readDb();
    data.bookings = [];
    writeDb(data);
    return true;
  },

  // Attendance helpers
  startAttendance: (bookingId, windowMins) => {
    const data = readDb();
    const idx = data.bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return null;
    
    const start = new Date();
    const end = new Date(start.getTime() + windowMins * 60000);
    
    data.bookings[idx].attendanceStatus = 'OPEN';
    data.bookings[idx].attendanceWindowStart = start.toISOString();
    data.bookings[idx].attendanceWindowEnd = end.toISOString();
    
    writeDb(data);
    return data.bookings[idx];
  },
  
  stopAttendance: (bookingId) => {
    const data = readDb();
    const idx = data.bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return null;
    
    data.bookings[idx].attendanceStatus = 'CLOSED';
    data.bookings[idx].attendanceWindowStart = null;
    data.bookings[idx].attendanceWindowEnd = null;
    
    writeDb(data);
    return data.bookings[idx];
  },
  
  getAttendance: (bookingId) => {
    const data = readDb();
    return data.attendance.filter(a => a.bookingId === bookingId);
  },
  
  addAttendanceRecord: (record) => {
    const data = readDb();
    const newRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      checkInTime: new Date().toISOString(),
      ...record
    };
    data.attendance.push(newRecord);
    writeDb(data);
    return newRecord;
  },
  
  hasMarkedAttendance: (bookingId, rollNumber) => {
    const data = readDb();
    return data.attendance.some(a => a.bookingId === bookingId && a.rollNumber.toLowerCase() === rollNumber.toLowerCase());
  },

  // Availability Checker
  isSlotAvailable: (venueId, bookingDate, startTime, endTime, excludeBookingId = null) => {
    const data = readDb();
    
    // Find all active bookings for the venue on that day
    const dayBookings = data.bookings.filter(b => 
      b.venueId === venueId && 
      b.bookingDate === bookingDate && 
      b.status !== "Cancelled" &&
      b.status !== "cancelled_by_admin" &&
      b.status !== "reassigned" &&
      b.id !== excludeBookingId
    );

    // Convert time HH:MM to integer minutes for easy comparison
    const toMins = (timeStr) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const start = toMins(startTime);
    const end = toMins(endTime);

    for (const booking of dayBookings) {
      const bStart = toMins(booking.startTime);
      const bEnd = toMins(booking.endTime);

      // Overlap condition:
      // (Start A < End B) AND (End A > Start B)
      if (start < bEnd && end > bStart) {
        return false; // Conflict found
      }
    }
    
    return true; // No conflict
  },

  getUsers: () => readDb().users || [],

  getAttendanceRecords: () => readDb().attendance || [],

  restoreFullBackup: (backupObj) => {
    const data = readDb();
    if (backupObj.users && Array.isArray(backupObj.users)) data.users = backupObj.users;
    if (backupObj.departments && Array.isArray(backupObj.departments)) data.departments = backupObj.departments;
    if (backupObj.faculty && Array.isArray(backupObj.faculty)) data.faculty = backupObj.faculty;
    if (backupObj.venues && Array.isArray(backupObj.venues)) data.venues = backupObj.venues;
    if (backupObj.bookings && Array.isArray(backupObj.bookings)) data.bookings = backupObj.bookings;
    if (backupObj.attendance && Array.isArray(backupObj.attendance)) data.attendance = backupObj.attendance;
    if (backupObj.designations && Array.isArray(backupObj.designations)) data.designations = backupObj.designations;
    writeDb(data);
    return {
      departmentsCount: (data.departments || []).length,
      facultyCount: (data.faculty || []).length,
      venuesCount: (data.venues || []).length,
      bookingsCount: (data.bookings || []).length
    };
  }
};

module.exports = db;
