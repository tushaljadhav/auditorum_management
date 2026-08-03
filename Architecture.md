# Architecture.md

## Tech Stack & Reasoning

### Frontend
- **Framework**: React 18 with Vite 8 (Ultra-fast build tooling and HMR).
- **Routing**: `react-router-dom` v6 for client-side SPA routing.
- **Styling**: Vanilla CSS with unified Design System tokens (`index.css`) + Tailux utility classes.
- **Icons**: `lucide-react` for modern icon set.
- **PDF Generation**: `html2canvas` + `jspdf` for client-side digital booking receipt generation.
- **Alerts**: `sweetalert2` for styled popups and alerts.

### Backend
- **Runtime**: Node.js v18+.
- **Framework**: Express.js (Lightweight REST API backend).
- **Database**: SQLite3 with `Knex.js` SQL query builder (Zero-config persistent relational database).
- **Session/Auth**: JWT (JSON Web Tokens) & bcryptjs password hashing.

---

## Directory Structure

```
c:/auditorum_management/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── migrations/
│   │   └── 20260101_init_schema.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── attendance.js
│   │   ├── venues.js
│   │   └── departments.js
│   ├── services/
│   │   ├── geofenceService.js
│   │   └── pdfService.js
│   ├── db.sqlite3
│   ├── knexfile.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   ├── Logo.png
    │   └── college_building_hero.png
    ├── src/
    │   ├── components/
    │   │   ├── AdminLayout.jsx
    │   │   ├── InteractiveCalendar.jsx
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── About.jsx
    │   │   ├── Features.jsx
    │   │   ├── HowItWorks.jsx
    │   │   ├── Contact.jsx
    │   │   ├── BookingPortal.jsx
    │   │   ├── StudentAttendance.jsx
    │   │   ├── AdminLogin.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AdminDepartments.jsx
    │   │   ├── AdminFaculty.jsx
    │   │   ├── AdminVenues.jsx
    │   │   ├── AdminBookings.jsx
    │   │   └── AdminUsers.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    └── package.json
```

---

## App Flow & Navigation Logic

### 1. Faculty Booking Journey
1. User visits `/` or `/booking`.
2. Selects Date (`bookingDate`) and Venue Hall (`venueId`).
3. System fetches existing bookings and displays available 1-hour slots. Past times and times within 10 minutes are disabled.
4. User clicks an available slot, fills event details (Event Title, Faculty Name, Department, Expected Attendees).
5. On Submit, backend stores booking record and returns `bookingId`.
6. UI renders Step 3 (Confirmation Screen) with downloadable PDF receipt proof.

### 2. Student Attendance Journey
1. Student visits `/attendance`.
2. Enters `bookingId` provided by faculty coordinator.
3. System checks if attendance session is currently OPEN for that booking.
4. Student enters Roll Number, Name, Class/Stream and taps `Submit GPS Attendance`.
5. Device GPS browser prompt requests geolocation (`navigator.geolocation`).
6. Distance calculated via Haversine formula against Kirti Auditorium coordinates (`19.0222, 72.8304`).
7. If distance <= 100 meters, attendance logged as `VERIFIED` and digital pass ticket is rendered.

---

## Database Schema (SQLite3 / Knex)

### 1. `venues` Table
- `id` (INTEGER, Primary Key)
- `name` (TEXT, e.g. "Main Auditorium Hall")
- `capacity` (INTEGER, e.g. 800)
- `location` (TEXT)
- `latitude` (REAL, default `19.0222`)
- `longitude` (REAL, default `72.8304`)
- `status` (TEXT, default `'Active'`)

### 2. `departments` Table
- `id` (INTEGER, Primary Key)
- `name` (TEXT, e.g. "Computer Science")
- `code` (TEXT, e.g. "CS")

### 3. `faculty` Table
- `id` (INTEGER, Primary Key)
- `name` (TEXT)
- `email` (TEXT, Unique)
- `department_id` (INTEGER, Foreign Key -> departments.id)
- `phone` (TEXT)

### 4. `bookings` Table
- `id` (TEXT, Primary Key, e.g. `booking_1782654643059`)
- `venue_id` (INTEGER, Foreign Key -> venues.id)
- `booking_date` (TEXT, format `YYYY-MM-DD`)
- `start_time` (TEXT, format `HH:MM`)
- `end_time` (TEXT, format `HH:MM`)
- `event_name` (TEXT)
- `faculty_name` (TEXT)
- `department` (TEXT)
- `expected_attendees` (INTEGER)
- `status` (TEXT, default `'Approved'`)
- `session_active` (INTEGER, default `0`)
- `session_expires_at` (TEXT)
- `created_at` (DATETIME, default `CURRENT_TIMESTAMP`)

### 5. `attendance_logs` Table
- `id` (INTEGER, Primary Key)
- `booking_id` (TEXT, Foreign Key -> bookings.id)
- `student_name` (TEXT)
- `roll_number` (TEXT)
- `class_stream` (TEXT)
- `latitude` (REAL)
- `longitude` (REAL)
- `distance_meters` (REAL)
- `status` (TEXT, `'VERIFIED'` or `'REJECTED'`)
- `timestamp` (DATETIME, default `CURRENT_TIMESTAMP`)

---

## API Structure & Endpoints

### Venues & Bookings
- `GET /api/venues` -> Fetch all active auditorium venues.
- `GET /api/bookings/available-slots?venueId=1&date=2026-07-18` -> Calculate free 1-hour slots.
- `POST /api/bookings` -> Create new booking & return reference receipt data.
- `POST /api/bookings/:id/start-session` -> Open GPS attendance window with duration.

### Attendance
- `GET /api/attendance/session-status/:bookingId` -> Check if GPS session is active.
- `POST /api/attendance/verify` -> Verify student location & log attendance record.
- `GET /api/attendance/export/:bookingId` -> Stream CSV / Excel attendance roster.

### Admin Auth
- `POST /api/admin/login` -> Authenticate admin & issue JWT token.
