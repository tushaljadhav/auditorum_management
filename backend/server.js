const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { dbMysql } = require('./db_mysql');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Vite dev servers
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

    // Department activity
    const deptStats = departments.map(d => ({
      id: d.id,
      name: d.name,
      count: bookings.filter(b => b.departmentId === d.id).length
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
      deptName: departments.find(d => d.id === booking.departmentId)?.name || 'Unknown Department',
      facultyName: faculty.find(f => f.id === booking.facultyId)?.name || 'Unknown Faculty'
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

    if (bookingDate === todayStr && startMins < minAllowedMins) {
      const minH = String(Math.floor(minAllowedMins / 60)).padStart(2, '0');
      const minM = String(minAllowedMins % 60).padStart(2, '0');
      return res.status(400).json({ isAvailable: false, error: `Bookings for today must be scheduled at least 10 minutes in advance. Earliest start time for today is ${minH}:${minM}.` });
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
    eventName, departmentId, facultyId, venueId, 
    eventDescription, bookingDate, startTime, endTime, attendees 
  } = req.body;
  
  if (!eventName || !departmentId || !facultyId || !venueId || !bookingDate || !startTime || !endTime) {
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

    if (bookingDate === todayStr && startMins < minAllowedMins) {
      const minH = String(Math.floor(minAllowedMins / 60)).padStart(2, '0');
      const minM = String(minAllowedMins % 60).padStart(2, '0');
      return res.status(400).json({ error: `Bookings for today must be scheduled at least 10 minutes in advance. Earliest start time is ${minH}:${minM}.` });
    }

    // Double-check availability on the server to prevent race conditions
    const isAvailable = await dbMysql.isSlotAvailable(venueId, bookingDate, startTime, endTime);
    if (!isAvailable) {
      return res.status(409).json({ error: 'The selected time slot is already booked.' });
    }
    
    // Fetch faculty info to format coordinator details automatically
    const faculty = await dbMysql.getFaculty();
    const facObj = faculty.find(f => f.id === facultyId);
    const coordinator = facObj ? `${facObj.designationName || ''} ${facObj.name}`.trim() : 'Faculty Coordinator';
    const email = facObj ? facObj.email : '';
    const phone = facObj ? facObj.mobile : '';

    const newBooking = await dbMysql.addBooking({
      eventName,
      departmentId,
      facultyId,
      venueId,
      eventDescription,
      bookingDate,
      startTime,
      endTime,
      attendees: Number(attendees) || 0,
      coordinator,
      email,
      phone
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
    // Prevent deleting the last remaining admin
    const users = await dbMysql.getUsers();
    if (users.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin user.' });
    }
    const success = await dbMysql.deleteUser(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GPS Attendance APIs ---

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

// Start Attendance
app.post('/api/bookings/:id/start-attendance', async (req, res) => {
  const { windowMins } = req.body;
  try {
    const bookings = await dbMysql.getBookings();
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'Approved') {
      return res.status(400).json({ error: 'Cannot start attendance for unapproved bookings.' });
    }

    const updatedBooking = await dbMysql.startAttendance(req.params.id, Number(windowMins || 15));
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

// Mark Attendance (Student Side - Public Endpoint)
app.post('/api/attendance/mark', async (req, res) => {
  const { bookingId, rollNumber, studentName, classStream, latitude, longitude } = req.body;

  if (!bookingId || !rollNumber || !studentName || !classStream) {
    return res.status(400).json({ error: 'Booking ID, Roll Number, Student Name, and Class/Stream are required.' });
  }

  try {
    // 1. Verify the Booking ID exists
    const bookings = await dbMysql.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking ID not found.' });
    }

    // 2. Verify the booking is approved
    if (booking.status !== 'Approved') {
      return res.status(400).json({ error: 'Attendance can only be marked for approved events.' });
    }

    // Check if window is expired and auto-close if so
    const now = new Date();
    if (booking.attendanceWindowEnd && now > new Date(booking.attendanceWindowEnd)) {
      await dbMysql.stopAttendance(bookingId);
      booking.attendanceStatus = 'CLOSED';
    }

    // 3. Verify attendance is currently OPEN
    if (booking.attendanceStatus !== 'OPEN') {
      return res.status(400).json({ error: 'Attendance is currently CLOSED for this event.' });
    }

    // 4. Verify current time is within window
    const windowStart = new Date(booking.attendanceWindowStart);
    const windowEnd = new Date(booking.attendanceWindowEnd);
    if (now < windowStart || now > windowEnd) {
      return res.status(400).json({ error: 'Attendance window has expired or has not started.' });
    }

    // 5. Retrieve the venue details
    const venues = await dbMysql.getVenues();
    const venue = venues.find(v => v.id === booking.venueId);
    if (!venue) {
      return res.status(400).json({ error: 'Associated venue not found.' });
    }

    // 6. Check GPS Location
    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return res.status(400).json({ error: 'GPS coordinates are required to verify location.' });
    }

    const studentLat = Number(latitude);
    const studentLon = Number(longitude);
    const venueLat = Number(venue.latitude || 0);
    const venueLon = Number(venue.longitude || 0);
    const allowedRadius = Number(venue.radius || 50); // meters

    if (!venueLat || !venueLon) {
      return res.status(400).json({ error: 'Venue GPS coordinates are not configured by Admin.' });
    }

    // Calculate distance
    const distance = getDistance(studentLat, studentLon, venueLat, venueLon);

    // 7. Reject if outside radius
    if (distance > allowedRadius) {
      return res.status(400).json({ 
        error: `You are outside the allowed area. Distance: ${Math.round(distance)}m, Allowed: ${allowedRadius}m.` 
      });
    }

    // 8 & 9. Check duplicate roll number
    const hasMarked = await dbMysql.hasMarkedAttendance(bookingId, rollNumber);
    if (hasMarked) {
      return res.status(400).json({ error: 'Attendance has already been marked for this event.' });
    }

    // 10. Save attendance
    const record = await dbMysql.addAttendanceRecord({
      bookingId,
      venueId: booking.venueId,
      rollNumber,
      studentName,
      classStream,
      latitude: studentLat,
      longitude: studentLon,
      distanceFromVenue: Math.round(distance * 100) / 100, // round to 2 decimals
      status: 'Present'
    });

    res.status(201).json({ 
      success: true, 
      message: 'Attendance marked successfully!', 
      record 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
