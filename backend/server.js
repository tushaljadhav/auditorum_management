const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { dbMysql } = require('./db_mysql');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'auditorium_session',
  keys: ['auditorium_management_secret_key'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// --- Authentication Middleware ---
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
};

// --- Dynamic Network & IP Information API ---
app.get('/api/system/network-info', (req, res) => {
  const os = require('os');
  const ifaces = os.networkInterfaces();
  let lanIp = 'localhost';
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        lanIp = iface.address;
        break;
      }
    }
  }
  res.json({ lanIp, port: 3001, localUrl: 'http://localhost:3001', lanUrl: `http://${lanIp}:3001` });
});

// --- Faculty Phone Login API (Strict Status Verification) ---
app.post('/api/auth/faculty-login', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !String(mobile).trim()) {
    return res.status(400).json({ error: 'Mobile number is required.' });
  }

  const digits = String(mobile).replace(/[^0-9]/g, '');
  if (digits.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  try {
    const faculty = await dbMysql.findFacultyByMobile(digits);
    if (!faculty) {
      return res.status(404).json({
        error: 'Mobile number not registered. Please register first.',
        notFound: true
      });
    }

    const status = (faculty.status || 'Pending').trim().toLowerCase();

    if (status === 'pending') {
      return res.status(403).json({
        error: 'Your registration is pending approval by the Admin. Please wait for verification.',
        status: 'Pending'
      });
    }

    if (status === 'rejected') {
      return res.status(403).json({
        error: 'Your registration was rejected by the administrator. Please contact college administration.',
        status: 'Rejected'
      });
    }

    // Approved / Active
    req.session.userId = faculty.id;
    req.session.role = 'faculty';
    req.session.name = faculty.name;

    res.json({
      success: true,
      user: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        mobile: faculty.mobile,
        departmentId: faculty.departmentId,
        designationName: faculty.designationName || 'Faculty',
        role: 'faculty',
        status: faculty.status
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Auth APIs ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const users = await dbMysql.getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.name = user.name;

  res.json({ success: true, user: { id: user.id, username: user.username, name: user.name } });
});

app.post('/api/auth/logout', (req, res) => {
  req.session = null;
  res.json({ success: true });
});

app.get('/api/auth/session', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      loggedIn: true,
      user: { id: req.session.userId, username: req.session.username, name: req.session.name }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// --- Dashboard Stats API ---
app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const [bookings, faculty, venues, departments] = await Promise.all([
      dbMysql.getBookings(),
      dbMysql.getFaculty(),
      dbMysql.getVenues(),
      dbMysql.getDepartments()
    ]);

    const totalBookings = bookings.length;
    const pendingApprovals = 0;
    const approvedBookings = bookings.length;
    const rejectedBookings = 0;
    const totalFaculty = faculty.length;
    const totalVenues = venues.length;
    const totalDepartments = departments.length;

    // Venue utilization
    const venueStats = venues.map(v => ({
      id: v.id,
      name: v.name,
      count: bookings.filter(b => b.venueId === v.id).length
    }));

    // Department activity (group by stored department name text)
    const deptNameSet = [...new Set(bookings.map(b => b.departmentName).filter(Boolean))];
    const deptStats = deptNameSet.map(name => ({
      id: name,
      name: name,
      count: bookings.filter(b => b.departmentName === name).length
    }));

    res.json({
      totalBookings,
      pendingApprovals,
      approvedBookings,
      rejectedBookings,
      totalFaculty,
      totalVenues,
      totalDepartments,
      venueStats,
      deptStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Departments APIs ---
app.get('/api/departments', async (req, res) => {
  try {
    const depts = await dbMysql.getDepartments();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/departments', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name is required' });
  try {
    const newDept = await dbMysql.addDepartment(name);
    res.status(201).json(newDept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/departments/:id', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Department name is required' });
  try {
    const updated = await dbMysql.updateDepartment(req.params.id, name);
    if (!updated) return res.status(404).json({ error: 'Department not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/departments/:id', requireAuth, async (req, res) => {
  try {
    const success = await dbMysql.deleteDepartment(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Faculty APIs ---
app.get('/api/faculty', async (req, res) => {
  try {
    const faculty = await dbMysql.getFaculty();
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/designations', async (req, res) => {
  try {
    const list = await dbMysql.getDesignations();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/designations', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Title name is required' });
  }
  try {
    const newDesig = await dbMysql.addDesignation(name.trim());
    res.status(201).json(newDesig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/designations/:id', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Title name is required' });
  }
  try {
    const updated = await dbMysql.updateDesignation(req.params.id, name.trim());
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/designations/:id', requireAuth, async (req, res) => {
  try {
    const success = await dbMysql.deleteDesignation(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function validateFaculty(fac) {
  const { name, email, mobile, departmentId, designationId } = fac;
  if (!name || !email || !mobile || !departmentId || !designationId) {
    return { error: 'Name, email, mobile, department, and title are required' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { error: 'Invalid email address format (e.g. name@college.com)' };
  }
  let cleanMobile = mobile.replace(/[\s\-()]/g, '');
  if (cleanMobile.startsWith('+91')) {
    cleanMobile = cleanMobile.substring(3);
  } else if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
    cleanMobile = cleanMobile.substring(2);
  }
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanMobile)) {
    return { error: 'Invalid mobile number. Must be a valid 10-digit number.' };
  }
  return {
    valid: true,
    faculty: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: `+91 ${cleanMobile.substring(0, 5)} ${cleanMobile.substring(5)}`,
      departmentId,
      designationId
    }
  };
}

app.post('/api/faculty', requireAuth, async (req, res) => {
  const validation = validateFaculty(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }
  try {
    const newFaculty = await dbMysql.addFaculty(validation.faculty);
    res.status(201).json(newFaculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/faculty/:id', requireAuth, async (req, res) => {
  const validation = validateFaculty(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }
  try {
    const updated = await dbMysql.updateFaculty(req.params.id, validation.faculty);
    if (!updated) return res.status(404).json({ error: 'Faculty member not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/faculty/:id', requireAuth, async (req, res) => {
  try {
    const success = await dbMysql.deleteFaculty(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public registration for faculty / coordinators (Starts as Pending Admin Approval)
app.post('/api/faculty/register', async (req, res) => {
  const { firstName, lastName, name, email, mobile, department, designation, departmentId, designationId } = req.body;
  
  // Resolve first and last name
  const finalFirstName = (firstName || '').trim();
  const finalLastName = (lastName || '').trim();
  let fullName = '';

  if (finalFirstName && finalLastName) {
    fullName = `${finalFirstName} ${finalLastName}`;
  } else if (name && String(name).trim()) {
    fullName = String(name).trim();
  }

  if (!finalFirstName && (!name || !name.trim())) {
    return res.status(400).json({ error: 'First name is required.' });
  }
  if (!finalLastName && (!name || name.trim().split(/\s+/).length < 2)) {
    return res.status(400).json({ error: 'Last name is required.' });
  }
  if (!fullName) {
    return res.status(400).json({ error: 'Please enter both first name and last name.' });
  }

  // Email is COMPULSORY
  if (!email || !String(email).trim()) {
    return res.status(400).json({ error: 'Email address is compulsory. Please enter your email address.' });
  }
  const emailTrimmed = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailTrimmed)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!mobile || !String(mobile).trim()) {
    return res.status(400).json({ error: 'Mobile number is required.' });
  }

  const cleanDigits = String(mobile).replace(/[^0-9]/g, '').slice(-10);
  if (cleanDigits.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  try {
    const existing = await dbMysql.findFacultyByMobile(cleanDigits);
    if (existing) {
      const st = (existing.status || 'Pending').toLowerCase();
      if (st === 'approved' || st === 'active') {
        return res.status(400).json({
          error: 'An account with this mobile number is already approved! You can log in directly using this number.'
        });
      }
      if (st === 'pending') {
        return res.status(400).json({
          error: 'Your registration request is already submitted and awaiting Admin approval. Please wait for verification.'
        });
      }
      if (st === 'rejected') {
        return res.status(400).json({
          error: 'Your previous registration was rejected. Please contact the administrator.'
        });
      }
    }

    // Resolve department
    let targetDeptId = departmentId;
    if (!targetDeptId && department) {
      const depts = await dbMysql.getDepartments();
      const matchedDept = depts.find(d => (d.name || '').toLowerCase() === String(department).trim().toLowerCase());
      if (matchedDept) {
        targetDeptId = matchedDept.id;
      } else {
        const newD = await dbMysql.addDepartment(String(department).trim());
        targetDeptId = newD.id;
      }
    }
    if (!targetDeptId) targetDeptId = 'dept_1';

    // Resolve designation
    let targetDesigId = designationId;
    if (!targetDesigId && designation) {
      const desigs = await dbMysql.getDesignations();
      const matchedDesig = desigs.find(d => (d.name || '').toLowerCase() === String(designation).trim().toLowerCase());
      if (matchedDesig) {
        targetDesigId = matchedDesig.id;
      } else {
        const newDesig = await dbMysql.addDesignation(String(designation).trim());
        targetDesigId = newDesig.id;
      }
    }

    const formattedMobile = `+91 ${cleanDigits.substring(0, 5)} ${cleanDigits.substring(5)}`;

    const newFaculty = await dbMysql.addFaculty({
      name: fullName.trim(),
      email: emailTrimmed,
      mobile: formattedMobile,
      departmentId: targetDeptId,
      designationId: targetDesigId,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Your account is pending admin approval.',
      faculty: newFaculty
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin endpoint to Approve or Reject faculty
app.patch('/api/faculty/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Approved', 'Rejected', 'Pending'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
  }

  try {
    const updated = await dbMysql.updateFacultyStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Faculty member not found' });
    res.json({ success: true, faculty: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/faculty/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['Approved', 'Rejected', 'Pending'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
  }

  try {
    const updated = await dbMysql.updateFacultyStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Faculty member not found' });
    res.json({ success: true, faculty: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Venues APIs ---
app.get('/api/venues', async (req, res) => {
  try {
    const venues = await dbMysql.getVenues();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/venues', requireAuth, async (req, res) => {
  const { name, capacity, location, address, latitude, longitude, radius, status } = req.body;
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Venue name and capacity are required' });
  }
  try {
    const newVenue = await dbMysql.addVenue({
      name,
      capacity: Number(capacity),
      location,
      address: address || '',
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      radius: radius ? Number(radius) : 50,
      status: status || 'Active'
    });
    res.status(201).json(newVenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/venues/:id', requireAuth, async (req, res) => {
  try {
    const updated = await dbMysql.updateVenue(req.params.id, {
      ...req.body,
      capacity: req.body.capacity ? Number(req.body.capacity) : undefined,
      latitude: req.body.latitude !== undefined ? (req.body.latitude !== '' ? Number(req.body.latitude) : null) : undefined,
      longitude: req.body.longitude !== undefined ? (req.body.longitude !== '' ? Number(req.body.longitude) : null) : undefined,
      radius: req.body.radius !== undefined ? (req.body.radius !== '' ? Number(req.body.radius) : 50) : undefined
    });
    if (!updated) return res.status(404).json({ error: 'Venue not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/venues/:id', requireAuth, async (req, res) => {
  try {
    const success = await dbMysql.deleteVenue(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Bookings APIs ---
app.get('/api/bookings', async (req, res) => {
  try {
    const list = await dbMysql.getBookings();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const bookings = await dbMysql.getBookings();
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const [venues, departments, faculty] = await Promise.all([
      dbMysql.getVenues(),
      dbMysql.getDepartments(),
      dbMysql.getFaculty()
    ]);

    const enrichedBooking = {
      ...booking,
      venueName: venues.find(v => v.id === booking.venueId)?.name || 'Unknown Venue',
      venueLatitude: venues.find(v => v.id === booking.venueId)?.latitude || null,
      venueLongitude: venues.find(v => v.id === booking.venueId)?.longitude || null,
      venueRadius: venues.find(v => v.id === booking.venueId)?.radius || 50,
      venueAddress: venues.find(v => v.id === booking.venueId)?.address || '',
      deptName: booking.departmentName || 'Unknown Department',
      facultyName: booking.facultyName || 'Unknown Faculty'
    };

    res.json(enrichedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/venues/:venueId/bookings', async (req, res) => {
  const { date } = req.query;
  const { venueId } = req.params;

  if (!venueId || !date) {
    return res.status(400).json({ error: 'Venue ID and Date are required.' });
  }

  try {
    const bookings = await dbMysql.getBookings();
    const bookingsOnDay = bookings
      .filter(b =>
        b.venueId === venueId &&
        b.bookingDate === date &&
        b.status !== "Cancelled"
      )
      .map(b => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        eventName: b.eventName
      }));

    res.json(bookingsOnDay);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check availability API
app.post('/api/bookings/check-availability', async (req, res) => {
  const { venueId, bookingDate, startTime, endTime, excludeBookingId } = req.body;

  if (!venueId || !bookingDate || !startTime || !endTime) {
    return res.status(400).json({ error: 'Venue, Date, Start Time, and End Time are required.' });
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const minAllowedMins = now.getHours() * 60 + now.getMinutes() + 10;
    const startMins = Number(startTime.split(':')[0]) * 60 + Number(startTime.split(':')[1]);

    if (bookingDate < todayStr) {
      return res.status(400).json({ isAvailable: false, error: 'Cannot book a venue for a past date.' });
    }



    const venuesList = await dbMysql.getVenues();
    const targetVenue = venuesList.find(v => v.id === venueId);
    if (targetVenue && (targetVenue.status === 'Maintenance' || targetVenue.status === 'Inactive')) {
      return res.status(400).json({
        isAvailable: false,
        error: `🔒 ${targetVenue.name} is currently under maintenance (${targetVenue.maintenanceReason || 'Scheduled Repair'}). Bookings are locked.`
      });
    }

    const isAvailable = await dbMysql.isSlotAvailable(venueId, bookingDate, startTime, endTime, excludeBookingId);

    // Get all approved bookings for this venue on this date
    const bookings = await dbMysql.getBookings();
    const bookingsOnDay = bookings
      .filter(b =>
        b.venueId === venueId &&
        b.bookingDate === bookingDate &&
        b.status !== "Cancelled" &&
        b.id !== excludeBookingId
      )
      .map(b => ({
        startTime: b.startTime,
        endTime: b.endTime,
        eventName: b.eventName
      }));

    let alternatives = [];

    if (!isAvailable) {
      // 1. Check other venues at the same time
      const venues = await dbMysql.getVenues();
      const otherVenues = venues.filter(v => v.id !== venueId);
      const recommendedVenues = [];
      for (const v of otherVenues) {
        if (await dbMysql.isSlotAvailable(v.id, bookingDate, startTime, endTime)) {
          recommendedVenues.push({
            type: "venue",
            venueId: v.id,
            venueName: v.name,
            bookingDate,
            startTime,
            endTime,
            label: `Use ${v.name} at the same time`
          });
        }
      }

      // 2. Check the same venue at different times on the same date
      const toMins = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const toStr = (m) => {
        const h = Math.floor(m / 60).toString().padStart(2, '0');
        const min = (m % 60).toString().padStart(2, '0');
        return `${h}:${min}`;
      };

      const requestedDurationMins = toMins(endTime) - toMins(startTime);
      const testStartTimes = ["09:00", "11:30", "14:00", "16:30"];
      const recommendedTimes = [];
      const sameVenueObj = venues.find(v => v.id === venueId);

      for (const start of testStartTimes) {
        const startMins = toMins(start);
        const endMins = startMins + requestedDurationMins;
        const endStr = toStr(endMins);

        // Skip if exceeds operational hour 23:00 (1380 mins)
        if (endMins > 1380) continue;

        // Skip if it overlaps with the requested time block itself
        if (
          (startMins >= toMins(startTime) && startMins < toMins(endTime)) ||
          (endMins > toMins(startTime) && endMins <= toMins(endTime))
        ) {
          continue;
        }

        if (await dbMysql.isSlotAvailable(venueId, bookingDate, start, endStr)) {
          recommendedTimes.push({
            type: "time",
            venueId,
            venueName: sameVenueObj?.name || "Same Venue",
            bookingDate,
            startTime: start,
            endTime: endStr,
            label: `${start} - ${endStr} in ${sameVenueObj?.name || "Same Venue"}`
          });
        }
      }

      alternatives = [...recommendedVenues, ...recommendedTimes].slice(0, 3);
    }

    res.json({ isAvailable, bookingsOnDay, alternatives });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const {
    eventName, departmentName, facultyName, venueId,
    eventDescription, bookingDate, startTime, endTime, attendees, coordinator: reqCoord, email: reqEmail, phone: reqPhone,
    classYear
  } = req.body;

  const finalDept = (departmentName || '').trim();
  const finalFac = (facultyName || reqCoord || '').trim();

  if (!eventName || !finalDept || !finalFac || !venueId || !bookingDate || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required booking details.' });
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const minAllowedMins = now.getHours() * 60 + now.getMinutes() + 10;
    const startMins = Number(startTime.split(':')[0]) * 60 + Number(startTime.split(':')[1]);

    if (bookingDate < todayStr) {
      return res.status(400).json({ error: 'Cannot book a venue for a past date.' });
    }



    // Double-check availability on the server to prevent race conditions
    const isAvailable = await dbMysql.isSlotAvailable(venueId, bookingDate, startTime, endTime);
    if (!isAvailable) {
      return res.status(409).json({ error: 'The selected time slot is already booked.' });
    }

    const coordinator = reqCoord || finalFac;
    const email = reqEmail || '';
    const phone = reqPhone || '';

    const newBooking = await dbMysql.addBooking({
      eventName,
      departmentName: finalDept,
      facultyName: finalFac,
      venueId,
      eventDescription,
      bookingDate,
      startTime,
      endTime,
      attendees: Number(attendees) || 0,
      coordinator,
      email,
      phone,
      classYear: (classYear || '').trim()
    });

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bookings/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid booking status' });
  }

  try {
    const bookings = await dbMysql.getBookings();
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // If approving, make sure there is no double booking
    if (status === 'Approved') {
      const isAvailable = await dbMysql.isSlotAvailable(booking.venueId, booking.bookingDate, booking.startTime, booking.endTime, booking.id);
      if (!isAvailable) {
        return res.status(409).json({ error: 'Cannot approve: this slot conflicts with an already approved booking.' });
      }
    }

    const updated = await dbMysql.updateBookingStatus(req.params.id, status);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin Booking Override API (Requirement 1, 2, 3, 4, 5, 6, 8) ---
app.patch('/api/bookings/:id/override', requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { action, reason, newDetails } = req.body;

    // 1. Permission Gating Check
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized. Login required.' });
    }
    const users = await dbMysql.getUsers();
    const currentUser = users.find(u => u.id === req.session.userId);
    if (!currentUser) {
      return res.status(403).json({ error: 'Forbidden. Admin role required for booking override.' });
    }

    // 2. Mandatory Validations
    if (!action || !['cancel', 'reassign', 'reschedule'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action type. Must be cancel, reassign, or reschedule.' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A mandatory justification reason is required for admin override.' });
    }

    // 3. Target Booking Lookup
    const bookings = await dbMysql.getBookings();
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (!targetBooking) {
      return res.status(404).json({ error: 'Booking record not found.' });
    }

    const previousSnapshot = JSON.stringify(targetBooking);
    let updatedBooking = null;
    let notificationTitle = '';
    let notificationMsg = '';

    const adminId = req.session.userId;
    const adminName = req.session.name || 'System Admin';

    // 4. Handle Action Types
    if (action === 'cancel') {
      updatedBooking = await dbMysql.updateBooking(bookingId, {
        status: 'cancelled_by_admin',
        attendanceStatus: 'CLOSED'
      });

      notificationTitle = `Booking Cancelled by Admin: ${targetBooking.eventName}`;
      notificationMsg = `Your auditorium booking "${targetBooking.eventName}" on ${targetBooking.bookingDate} (${targetBooking.startTime} - ${targetBooking.endTime}) was cancelled by Administrator. Reason: "${reason.trim()}".`;
    }
    else if (action === 'reassign') {
      if (!newDetails || !newDetails.eventName || !newDetails.eventName.trim()) {
        return res.status(400).json({ error: 'New event name is required for reassigning.' });
      }

      updatedBooking = await dbMysql.updateBooking(bookingId, {
        eventName: newDetails.eventName.trim(),
        coordinator: (newDetails.bookedBy || newDetails.coordinator || 'Admin Priority Requester').trim(),
        departmentName: newDetails.departmentName || targetBooking.departmentName || '',
        facultyName: newDetails.facultyName || targetBooking.facultyName || '',
        eventDescription: newDetails.eventDescription || targetBooking.eventDescription || '',
        attendees: newDetails.attendees !== undefined ? Number(newDetails.attendees) : targetBooking.attendees,
        email: targetBooking.email || '',
        phone: targetBooking.phone || '',
        status: 'reassigned'
      });

      notificationTitle = `Booking Reassigned by Admin: ${targetBooking.eventName}`;
      notificationMsg = `Your auditorium booking "${targetBooking.eventName}" on ${targetBooking.bookingDate} was reassigned to priority event "${newDetails.eventName}" by Administrator. Reason: "${reason.trim()}".`;
    }
    else if (action === 'reschedule') {
      if (!newDetails || !newDetails.bookingDate || !newDetails.startTime || !newDetails.endTime) {
        return res.status(400).json({ error: 'New booking date, start time, and end time are required for rescheduling.' });
      }

      // Use new venueId if provided, otherwise keep the original
      const targetVenueId = newDetails.venueId || targetBooking.venueId;

      // Check slot availability for new date/time/venue
      const isAvailable = await dbMysql.isSlotAvailable(targetVenueId, newDetails.bookingDate, newDetails.startTime, newDetails.endTime, bookingId);
      if (!isAvailable) {
        return res.status(409).json({ error: 'Target slot conflicts with an existing booking at this venue.' });
      }

      updatedBooking = await dbMysql.updateBooking(bookingId, {
        venueId: targetVenueId,
        bookingDate: newDetails.bookingDate,
        startTime: newDetails.startTime,
        endTime: newDetails.endTime,
        status: 'rescheduled'
      });

      const venuesList = await dbMysql.getVenues();
      const newVenueName = venuesList.find(v => v.id === targetVenueId)?.name || targetVenueId;

      notificationTitle = `Booking Rescheduled by Admin: ${targetBooking.eventName}`;
      notificationMsg = `Your auditorium booking "${targetBooking.eventName}" has been rescheduled by Administrator to ${newDetails.bookingDate} (${newDetails.startTime} - ${newDetails.endTime}) at ${newVenueName}. Reason: "${reason.trim()}".`;
    }

    const newSnapshot = JSON.stringify(updatedBooking);

    // 5. Insert Audit Trail Record (Requirement 4)
    const auditLogEntry = await dbMysql.addAuditLog({
      booking_id: bookingId,
      admin_id: adminId,
      admin_name: adminName,
      action_type: action,
      reason: reason.trim(),
      previous_booking_snapshot: previousSnapshot,
      new_booking_snapshot: newSnapshot
    });

    // 6. Create Notification (Requirement 6)
    const notificationEntry = await dbMysql.addNotification({
      recipientId: targetBooking.coordinator || targetBooking.facultyName || targetBooking.departmentName,
      recipientEmail: targetBooking.email || '',
      title: notificationTitle,
      message: notificationMsg,
      reason: reason.trim(),
      type: `${action}_override`,
      bookingId: bookingId
    });

    res.json({
      success: true,
      message: `Booking ${action}ed successfully by Admin override.`,
      booking: updatedBooking,
      auditLog: auditLogEntry,
      notification: notificationEntry
    });
  } catch (err) {
    console.error('Error processing admin override:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', requireAuth, async (req, res) => {
  try {
    const logs = await dbMysql.getAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const list = await dbMysql.getNotifications();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings', requireAuth, async (req, res) => {
  try {
    const success = await dbMysql.clearAllBookings();
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', requireAuth, async (req, res) => {
  try {
    const success = await dbMysql.deleteBooking(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin Users APIs ---
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await dbMysql.getUsers();
    // Return users (omit passwords in output)
    const sanitized = users.map(({ password, ...u }) => u);
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', requireAuth, async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Username, password, and name are required' });
  }

  try {
    const users = await dbMysql.getUsers();
    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) return res.status(400).json({ error: 'Username already exists' });

    const newUser = await dbMysql.addUser({ username, password, name });
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', requireAuth, async (req, res) => {
  try {
    const updated = await dbMysql.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', requireAuth, async (req, res) => {
  try {
    const users = await dbMysql.getUsers();
    if (users.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin user.' });
    }

    const targetUser = users.find(u => u.id === req.params.id);
    if (targetUser) {
      const uname = (targetUser.username || '').toLowerCase();
      if (uname === 'admin' || uname === 'dev') {
        return res.status(403).json({ error: `Cannot delete permanent master admin account (@${targetUser.username}).` });
      }
    }

    const success = await dbMysql.deleteUser(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GPS Attendance APIs ---

// POST /api/attendance/create-instant-session — Faculty creates live session on-the-spot
// No admin approval needed: creates a Confirmed + immediately OPEN booking
app.post('/api/attendance/create-instant-session', async (req, res) => {
  const {
    eventName, facultyName, departmentName, email, phone,
    classYear, roomName, radius, windowMins, pin,
    latitude, longitude, attendees
  } = req.body;

  if (!eventName || !eventName.toString().trim()) {
    return res.status(400).json({ error: 'Event / Lecture title is required.' });
  }
  if (!facultyName || !facultyName.toString().trim()) {
    return res.status(400).json({ error: 'Faculty name is required.' });
  }

  try {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const startTimeStr = now.toTimeString().slice(0, 5);

    const winMins = Math.max(5, Math.min(120, Number(windowMins || 15)));
    const windowEnd = new Date(now.getTime() + winMins * 60 * 1000);
    const windowEndStr = windowEnd.toTimeString().slice(0, 5);

    const sessionPin = (pin && pin.toString().trim()) ? pin.toString().trim() : Math.floor(1000 + Math.random() * 9000).toString();

    // Create booking record directly as Confirmed + OPEN
    const newBooking = await dbMysql.addBooking({
      eventName: eventName.toString().trim(),
      departmentName: (departmentName || 'General').toString().trim(),
      facultyName: facultyName.toString().trim(),
      venueId: null,
      eventDescription: `Instant live session created by faculty. Room: ${roomName || 'Unspecified'}`,
      bookingDate: todayStr,
      startTime: startTimeStr,
      endTime: windowEndStr,
      attendees: Number(attendees || 60),
      status: 'Confirmed',
      attendanceStatus: 'OPEN',
      attendanceWindowStart: now.toISOString().replace('T', ' ').slice(0, 19),
      attendanceWindowEnd: windowEnd.toISOString().replace('T', ' ').slice(0, 19),
      coordinator: facultyName.toString().trim(),
      email: (email || '').toString().trim(),
      phone: (phone || '').toString().trim(),
      classYear: (classYear || '').toString().trim()
    });

    // Update with GPS + PIN + sessionRadius
    const finalLat = (latitude !== undefined && latitude !== null && latitude !== '') ? Number(latitude) : null;
    const finalLon = (longitude !== undefined && longitude !== null && longitude !== '') ? Number(longitude) : null;

    await dbMysql.updateBooking(newBooking.id, {
      sessionLatitude: finalLat,
      sessionLongitude: finalLon,
      sessionPin: sessionPin
    });

    // Return enriched session
    const updatedBooking = {
      ...newBooking,
      sessionLatitude: finalLat,
      sessionLongitude: finalLon,
      sessionPin: sessionPin,
      venueName: (roomName || 'Live Session').toString().trim(),
      presentCount: 0,
      secondsRemaining: winMins * 60
    };

    res.json(updatedBooking);
  } catch (err) {
    console.error('Error creating instant session:', err);
    res.status(500).json({ error: err.message });
  }
});



// Helper function to calculate distance using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in metres
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in metres
}

// Start Attendance (Faculty Side)
app.post('/api/bookings/:id/start-attendance', async (req, res) => {
  const { windowMins, latitude, longitude, pin } = req.body;
  try {
    const bookings = await dbMysql.getBookings();
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'Approved' && booking.status !== 'Confirmed') {
      return res.status(400).json({ error: 'Cannot start attendance for cancelled bookings.' });
    }

    // Generate a 4-digit PIN if not provided
    const sessionPin = pin && pin.toString().trim() ? pin.toString().trim() : Math.floor(1000 + Math.random() * 9000).toString();

    const updatedBooking = await dbMysql.startAttendance(
      req.params.id,
      Number(windowMins || 15),
      latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null,
      longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null,
      sessionPin
    );
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stop Attendance manually
app.post('/api/bookings/:id/stop-attendance', async (req, res) => {
  try {
    const bookings = await dbMysql.getBookings();
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const updatedBooking = await dbMysql.stopAttendance(req.params.id);
    res.json(updatedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Attendance list for a booking
app.get('/api/bookings/:id/attendance', async (req, res) => {
  try {
    const attendanceList = await dbMysql.getAttendance(req.params.id);
    res.json(attendanceList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/today-sessions - Today's Live Sessions Hub (Smart Event Selector)
app.get('/api/attendance/today-sessions', async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const [bookings, venues, allAttendance] = await Promise.all([
      dbMysql.getBookings(),
      dbMysql.getVenues(),
      dbMysql.getAttendanceRecords()
    ]);

    const venueMap = {};
    venues.forEach(v => { venueMap[v.id] = v; });

    const attendanceCountMap = {};
    allAttendance.forEach(a => {
      attendanceCountMap[a.bookingId] = (attendanceCountMap[a.bookingId] || 0) + 1;
    });

    const searchQuery = (req.query.q || '').trim().toLowerCase();
    const filterDate = req.query.date || null;

    // Filter relevant bookings (today's bookings OR currently open sessions OR matching query)
    const filtered = [];

    for (const b of bookings) {
      // Skip cancelled
      if (b.status === 'Cancelled' || b.status === 'cancelled_by_admin') continue;

      // Auto-close if window expired
      if (b.attendanceStatus === 'OPEN' && b.attendanceWindowEnd && now > new Date(b.attendanceWindowEnd)) {
        await dbMysql.stopAttendance(b.id);
        b.attendanceStatus = 'CLOSED';
      }

      const venue = venueMap[b.venueId] || {};
      const isToday = b.bookingDate === todayStr;
      const isOpen = b.attendanceStatus === 'OPEN';
      const isDateMatch = (filterDate && filterDate !== 'all') ? (b.bookingDate === filterDate || isOpen) : true;

      const searchMatch = !searchQuery ||
        (b.eventName || '').toLowerCase().includes(searchQuery) ||
        (b.facultyName || '').toLowerCase().includes(searchQuery) ||
        (b.departmentName || '').toLowerCase().includes(searchQuery) ||
        (b.coordinator || '').toLowerCase().includes(searchQuery) ||
        (venue.name || '').toLowerCase().includes(searchQuery) ||
        (b.id || '').toLowerCase().includes(searchQuery);

      if ((isDateMatch || searchQuery) && searchMatch) {
        let secondsRemaining = 0;
        if (b.attendanceStatus === 'OPEN' && b.attendanceWindowEnd) {
          const diffMs = new Date(b.attendanceWindowEnd).getTime() - now.getTime();
          secondsRemaining = Math.max(0, Math.floor(diffMs / 1000));
        }

        filtered.push({
          ...b,
          venueName: venue.name || 'Auditorium / Hall',
          venueLocation: venue.location || '',
          presentCount: attendanceCountMap[b.id] || 0,
          secondsRemaining
        });
      }
    }

    // Sort: OPEN sessions first, then by bookingDate desc, then by startTime
    filtered.sort((a, b) => {
      if (a.attendanceStatus === 'OPEN' && b.attendanceStatus !== 'OPEN') return -1;
      if (b.attendanceStatus === 'OPEN' && a.attendanceStatus !== 'OPEN') return 1;
      if (a.bookingDate !== b.bookingDate) return b.bookingDate.localeCompare(a.bookingDate);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });

    res.json({
      todayStr,
      sessions: filtered
    });
  } catch (err) {
    console.error('Error in /api/attendance/today-sessions:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/archive - Lifetime Attendance Archive
app.get('/api/attendance/archive', async (req, res) => {
  try {
    const [bookings, venues, allAttendance] = await Promise.all([
      dbMysql.getBookings(),
      dbMysql.getVenues(),
      dbMysql.getAttendanceRecords()
    ]);

    const venueMap = {};
    venues.forEach(v => { venueMap[v.id] = v; });

    const attendanceByBooking = {};
    allAttendance.forEach(a => {
      if (!attendanceByBooking[a.bookingId]) {
        attendanceByBooking[a.bookingId] = [];
      }
      attendanceByBooking[a.bookingId].push(a);
    });

    const searchQuery = (req.query.q || '').trim().toLowerCase();
    const fromDate = req.query.from || null;
    const toDate = req.query.to || null;

    const archiveList = bookings
      .filter(b => {
        if (b.status === 'Cancelled' || b.status === 'cancelled_by_admin') return false;
        if (fromDate && b.bookingDate < fromDate) return false;
        if (toDate && b.bookingDate > toDate) return false;

        if (searchQuery) {
          const venue = venueMap[b.venueId] || {};
          const match = (b.eventName || '').toLowerCase().includes(searchQuery) ||
            (b.facultyName || '').toLowerCase().includes(searchQuery) ||
            (b.departmentName || '').toLowerCase().includes(searchQuery) ||
            (venue.name || '').toLowerCase().includes(searchQuery) ||
            (b.id || '').toLowerCase().includes(searchQuery);
          if (!match) return false;
        }
        return true;
      })
      .map(b => {
        const records = attendanceByBooking[b.id] || [];
        const venue = venueMap[b.venueId] || {};
        return {
          id: b.id,
          eventName: b.eventName,
          facultyName: b.facultyName || b.coordinator || 'Faculty',
          departmentName: b.departmentName || 'General',
          classYear: b.classYear || '',
          venueName: venue.name || 'Auditorium / Hall',
          bookingDate: b.bookingDate,
          startTime: b.startTime,
          endTime: b.endTime,
          attendees: b.attendees || 0,
          presentCount: records.length,
          attendanceStatus: b.attendanceStatus,
          hasRecords: records.length > 0
        };
      });

    // Sort by bookingDate descending
    archiveList.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));

    res.json(archiveList);
  } catch (err) {
    console.error('Error in /api/attendance/archive:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark Attendance (Student Side - Public Endpoint)
app.post('/api/attendance/mark', async (req, res) => {
  const { bookingId, rollNumber, studentName, classStream, latitude, longitude, pin } = req.body;

  if (!bookingId || !rollNumber || !studentName || !classStream) {
    return res.status(400).json({ error: 'Session/Booking, Roll Number, Student Name, and Class/Stream are required.' });
  }

  try {
    // 1. Verify the Booking ID exists
    const bookings = await dbMysql.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Session not found. Please verify the Session selected.' });
    }

    // 2. Verify the booking is active/confirmed
    if (booking.status !== 'Approved' && booking.status !== 'Confirmed') {
      return res.status(400).json({ error: 'Attendance can only be marked for confirmed events.' });
    }

    // Check if window is expired and auto-close if so
    const now = new Date();
    if (booking.attendanceWindowEnd && now > new Date(booking.attendanceWindowEnd)) {
      await dbMysql.stopAttendance(bookingId);
      booking.attendanceStatus = 'CLOSED';
    }

    // 3. Verify attendance is currently OPEN
    if (booking.attendanceStatus !== 'OPEN') {
      return res.status(400).json({ error: 'Attendance session is CLOSED for this event. Please ask Faculty to start attendance.' });
    }

    // 4. Verify current time is within window
    const windowStart = new Date(booking.attendanceWindowStart);
    const windowEnd = new Date(booking.attendanceWindowEnd);
    if (now < windowStart || now > windowEnd) {
      return res.status(400).json({ error: 'Attendance window has expired or is no longer active.' });
    }

    // 5. Verify 4-Digit Live PIN if configured
    if (booking.sessionPin) {
      const studentPin = (pin || '').toString().trim();
      const expectedPin = booking.sessionPin.toString().trim();
      if (!studentPin || studentPin !== expectedPin) {
        return res.status(400).json({
          error: 'Incorrect 4-Digit Attendance PIN. Please check the board or ask your Faculty.'
        });
      }
    }

    // 6. Dynamic Faculty-Anchored GPS Geofence Check (100m radius)
    let anchorLat = null;
    let anchorLon = null;
    let anchorSource = '';

    if (booking.sessionLatitude !== null && booking.sessionLongitude !== null && booking.sessionLatitude !== undefined && booking.sessionLongitude !== undefined) {
      anchorLat = Number(booking.sessionLatitude);
      anchorLon = Number(booking.sessionLongitude);
      anchorSource = 'Faculty Live Location';
    } else {
      // Fallback to venue coordinates if faculty did not capture GPS
      const venues = await dbMysql.getVenues();
      const venue = venues.find(v => v.id === booking.venueId);
      if (venue && venue.latitude && venue.longitude) {
        anchorLat = Number(venue.latitude);
        anchorLon = Number(venue.longitude);
        anchorSource = `${venue.name} Location`;
      }
    }

    let calculatedDistance = 0;
    const allowedRadius = 100; // Universal 100-meter geofence

    if (anchorLat !== null && anchorLon !== null && !isNaN(anchorLat) && !isNaN(anchorLon) && anchorLat !== 0 && anchorLon !== 0) {
      // Location is required for student if anchor is set
      if (latitude === undefined || longitude === undefined || latitude === null || longitude === null || latitude === '' || longitude === '') {
        return res.status(400).json({ error: 'GPS location permission is required. Please enable device location and tap Check-In again.' });
      }

      const studentLat = Number(latitude);
      const studentLon = Number(longitude);

      if (isNaN(studentLat) || isNaN(studentLon)) {
        return res.status(400).json({ error: 'Invalid GPS coordinates received.' });
      }

      calculatedDistance = getDistance(studentLat, studentLon, anchorLat, anchorLon);

      // We allow up to 100 meters (with a 25m buffer for indoor GPS phone drift)
      const maxAllowedMeters = allowedRadius + 25; // 125m tolerance for indoor classroom drift
      if (calculatedDistance > maxAllowedMeters) {
        return res.status(400).json({
          error: `Proxy Protection: You are outside the 100m classroom/auditorium radius. Distance: ${Math.round(calculatedDistance)}m from ${anchorSource}. (Allowed: ≤100m)`
        });
      }
    }

    // 7. Check duplicate roll number
    const hasMarked = await dbMysql.hasMarkedAttendance(bookingId, rollNumber.trim());
    if (hasMarked) {
      return res.status(400).json({ error: `Attendance has already been marked for Roll Number "${rollNumber.trim()}".` });
    }

    // 8. Save attendance record
    const record = await dbMysql.addAttendanceRecord({
      bookingId,
      rollNumber: rollNumber.trim().toUpperCase(),
      studentName: studentName.trim(),
      classStream: classStream.trim(),
      latitude: latitude ? Number(latitude) : 0,
      longitude: longitude ? Number(longitude) : 0,
      distanceFromVenue: Math.round(calculatedDistance * 10) / 10,
      status: 'Present'
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully!',
      record: {
        ...record,
        eventName: booking.eventName,
        facultyName: booking.facultyName,
        bookingDate: booking.bookingDate
      }
    });
  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Admin System Backup & Restore APIs ---

// Helper: Build an HTML table sheet for Excel export
function buildExcelSheet(sheetName, headers, rows) {
  const thStyle = 'style="background-color: #1E3A8A; color: #FFFFFF; font-weight: bold; padding: 10px 14px; border: 1px solid #1E40AF; text-align: left;"';
  const tableHeader = headers.map(h => `<th ${thStyle}>${h}</th>`).join('');
  const tableBody = rows.map((row, rIdx) => {
    const bg = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    const cells = row.map(cell => {
      const val = cell !== undefined && cell !== null ? String(cell) : '';
      return `<td style="padding: 8px 12px; border: 1px solid #CBD5E1; background-color: ${bg}; mso-number-format:'\\@';">${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<Worksheet ss:Name="${sheetName}"><Table>${tableHeader ? `<Row>${headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>` : ''}${rows.map(row => `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${cell !== undefined && cell !== null ? String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''}</Data></Cell>`).join('')}</Row>`).join('')}</Table></Worksheet>`;
}

// Helper: Build full multi-sheet Excel workbook (HTML table format for .xls compat)
function buildMultiSheetExcel(sheets) {
  const thStyle = `background-color: #1E3A8A; color: #FFFFFF; font-weight: bold; padding: 10px 14px; border: 1px solid #1E40AF; text-align: left;`;

  let sheetsHtml = '';
  for (const sheet of sheets) {
    const headerRow = sheet.headers.map(h => `<th style="${thStyle}">${h}</th>`).join('');
    const bodyRows = sheet.rows.map((row, rIdx) => {
      const bg = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      const cells = row.map(cell => {
        const val = cell !== undefined && cell !== null ? String(cell) : '';
        return `<td style="padding: 8px 12px; border: 1px solid #CBD5E1; background-color: ${bg}; mso-number-format:'\\@';">${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    sheetsHtml += `
      <x:ExcelWorksheet>
        <x:Name>${sheet.name}</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet>`;
  }

  // Build workbook HTML (all sheets as separate tables separated by page breaks)
  let tablesHtml = '';
  for (const sheet of sheets) {
    const headerRow = sheet.headers.map(h => `<th style="${thStyle}">${h}</th>`).join('');
    const bodyRows = sheet.rows.map((row, rIdx) => {
      const bg = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      const cells = row.map(cell => {
        const val = cell !== undefined && cell !== null ? String(cell) : '';
        return `<td style="padding: 8px 12px; border: 1px solid #CBD5E1; background-color: ${bg}; mso-number-format:'\\@';">${val.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    tablesHtml += `
      <div style="page-break-after: always;">
        <h2 style="font-family: Calibri, Arial, sans-serif; color: #1E3A8A; margin-bottom: 8px;">${sheet.name}</h2>
        <table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; font-size: 11pt;">
          <thead><tr>${headerRow}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
  }

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>${sheetsHtml}</x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
    th { background-color: #1E3A8A !important; color: #FFFFFF !important; font-weight: bold; text-align: left; padding: 10px 14px; border: 1px solid #1E40AF; }
    td { padding: 8px 12px; border: 1px solid #CBD5E1; }
  </style>
</head>
<body>${tablesHtml}</body>
</html>`;
}

// Helper: Format 24h time to 12h AM/PM
function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

app.get('/api/admin/backup', async (req, res) => {
  try {
    const [users, departments, faculty, venues, bookings, attendance, designations] = await Promise.all([
      dbMysql.getUsers ? dbMysql.getUsers() : [],
      dbMysql.getDepartments(),
      dbMysql.getFaculty(),
      dbMysql.getVenues(),
      dbMysql.getBookings(),
      dbMysql.getAttendanceRecords ? dbMysql.getAttendanceRecords() : [],
      dbMysql.getDesignations ? dbMysql.getDesignations() : []
    ]);

    // Build multi-sheet Excel workbook
    const sheets = [
      {
        name: 'Bookings',
        headers: ['Booking ID', 'Event Name', 'Department', 'Faculty Name', 'Venue ID', 'Date', 'Start Time', 'End Time', 'Attendees', 'Status', 'Class/Year', 'Coordinator', 'Email', 'Phone', 'Description'],
        rows: bookings.map(b => [
          b.id, b.eventName, b.departmentName || '', b.facultyName || '', b.venueId || '',
          b.bookingDate, formatTime12h(b.startTime), formatTime12h(b.endTime),
          b.attendees || 0, b.status || 'Confirmed', b.classYear || '',
          b.coordinator || '', b.email || '', b.phone || '', b.eventDescription || ''
        ])
      },
      {
        name: 'Venues',
        headers: ['Venue ID', 'Name', 'Capacity', 'Location', 'Address', 'Latitude', 'Longitude', 'Radius (m)', 'Status'],
        rows: venues.map(v => [
          v.id, v.name, v.capacity, v.location || '', v.address || '',
          v.latitude || '', v.longitude || '', v.radius || 50, v.status || 'Active'
        ])
      },
      {
        name: 'Departments',
        headers: ['Department ID', 'Name'],
        rows: departments.map(d => [d.id, d.name])
      },
      {
        name: 'Faculty',
        headers: ['Faculty ID', 'Name', 'Email', 'Mobile', 'Department ID'],
        rows: faculty.map(f => [f.id, f.name, f.email || '', f.mobile || '', f.departmentId || ''])
      },
      {
        name: 'Attendance',
        headers: ['ID', 'Booking ID', 'Roll Number', 'Student Name', 'Class/Stream', 'Latitude', 'Longitude', 'Distance (m)', 'Check-in Time'],
        rows: attendance.map(a => [
          a.id, a.bookingId, a.rollNumber, a.studentName, a.classStream || '',
          a.latitude || '', a.longitude || '', a.distanceFromVenue || '', a.checkInTime || ''
        ])
      },
      {
        name: 'Admin Users',
        headers: ['User ID', 'Username', 'Name'],
        rows: users.map(u => [u.id, u.username, u.name])
      }
    ];

    const excelContent = buildMultiSheetExcel(sheets);
    const fileName = `Auditorium_System_Backup_${new Date().toISOString().split('T')[0]}.xls`;
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send('\uFEFF' + excelContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/restore', requireAuth, async (req, res) => {
  const payload = req.body?.data || req.body?.backupData?.data || req.body?.backupData;
  if (!payload) {
    return res.status(400).json({ error: 'Invalid backup format. Missing root data object.' });
  }
  try {
    const result = await dbMysql.restoreFullBackup(payload);
    res.json({ success: true, message: 'System restored successfully!', details: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const [bookings, faculty, venues, departments] = await Promise.all([
      dbMysql.getBookings(),
      dbMysql.getFaculty(),
      dbMysql.getVenues(),
      dbMysql.getDepartments()
    ]);
    res.json({
      totalBookings: bookings.length,
      totalVenues: venues.length,
      totalFaculty: faculty.length,
      totalDepartments: departments.length,
      venueStats: venues.map(v => ({ id: v.id, name: v.name, count: bookings.filter(b => b.venueId === v.id).length })),
      deptStats: [...new Set(bookings.map(b => b.departmentName).filter(Boolean))].map(name => ({ id: name, name, count: bookings.filter(b => b.departmentName === name).length }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendance/session/:id', async (req, res) => {
  try {
    const records = await dbMysql.getAttendance(req.params.id);
    res.json({ records, count: records.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', requireAuth, async (req, res) => {
  try {
    const users = await dbMysql.getUsers();
    res.json(users.map(({ password, ...u }) => u));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', requireAuth, async (req, res) => {
  try {
    const newUser = await dbMysql.addUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', requireAuth, async (req, res) => {
  try {
    const success = await dbMysql.deleteUser(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/bookings/:id/cancel', requireAuth, async (req, res) => {
  try {
    const reason = req.body?.reason || 'Cancelled by Administrator';
    const updated = await dbMysql.updateBooking(req.params.id, {
      status: 'cancelled_by_admin',
      attendanceStatus: 'CLOSED'
    });
    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
