# Phases.md

## Phase 1: Database & Backend Core API Setup
- **Goal**: Initialize SQLite database with Knex migrations, seed initial venues and departments, and create REST API server.
- **Specific Tasks**:
  - Create database tables: `venues`, `departments`, `faculty`, `bookings`, `attendance_logs`, `users`.
  - Build endpoints for `/api/venues` and `/api/bookings/available-slots`.
- **Dependencies**: Node.js & Express environment setup.
- **Definition of Done**: Backend server runs on `http://localhost:5000` with 0 migration errors.

---

## Phase 2: Public Navigation & 5 Dedicated Public Pages
- **Goal**: Build responsive public navigation header, footer, and 5 dedicated public SPA pages.
- **Specific Tasks**:
  - `Home.jsx`: Hero building photo height, 2 service cards, live calendar preview.
  - `About.jsx`: Institutional legacy, venue specs grid, 4 metric counters, 1954-2026 milestones, developer attribution card.
  - `Features.jsx`: 8 feature modules & Traditional Paper vs Digital Comparison Matrix.
  - `HowItWorks.jsx`: Role switcher (Faculty vs Student) & Interactive GPS Distance Simulator slider.
  - `Contact.jsx`: Interactive inquiry form, Dadar West campus landmarks, and direct contact details.
- **Dependencies**: React Router setup in `App.jsx`.
- **Definition of Done**: Navigating all 5 pages works smoothly with active tab highlights.

---

## Phase 3: Instant Venue Booking Engine & PDF Receipt Generator
- **Goal**: Build the 3-step faculty booking portal (`/booking`) with instant approval logic.
- **Specific Tasks**:
  - Step 1: Availability checker with URL query pre-fill (`?date=YYYY-MM-DD`). Exclusion of past dates and 10m buffers.
  - Step 2: Event details form (Title, Faculty Name, Department, Expected Attendees).
  - Step 3: Confirmation screen with 1-click downloadable PDF receipt generated via `html2canvas` & `jspdf`.
- **Dependencies**: Backend `/api/bookings` endpoints & Phase 2 routing.
- **Definition of Done**: Booking is created instantly in database, returning reference ID and valid PDF download.

---

## Phase 4: Student Attendance Gateway & GPS Geofence Verification
- **Goal**: Build student attendance portal (`/attendance`) with location-secured check-in.
- **Specific Tasks**:
  - Booking ID lookup & live session status check.
  - Device GPS location capture via `navigator.geolocation`.
  - Haversine distance calculation against Kirti Auditorium coordinates (`19.0222, 72.8304`).
  - Attendance log created with status `VERIFIED` if distance <= 100m.
  - 1-Click Excel CSV attendance roster download for faculty.
- **Dependencies**: Booking session initiation endpoint & database attendance schema.
- **Definition of Done**: Student within 100m receives verified attendance pass; Excel export produces valid CSV file.

---

## Phase 5: Role-Based Admin Control Panel
- **Goal**: Build protected administrative management pages (`/admin/*`).
- **Specific Tasks**:
  - Admin authentication (`/admin/login`) with JWT.
  - Admin Dashboard metrics (`/admin/dashboard`).
  - Management modules: Departments, Faculty, Venues, Bookings, Users.
- **Dependencies**: JWT auth middleware & database seed data.
- **Definition of Done**: Admin can log in, edit venues, view audit logs, and manage faculty lists.

---

## Phase 6: Production Build & Final Polish
- **Goal**: Optimize bundle size, verify zero console errors, and validate full Vite production build.
- **Specific Tasks**:
  - Run `npm run build` in `frontend/`.
  - Validate light theme consistency across all views.
  - Verify developer attribution branding rules.
- **Dependencies**: Completion of Phases 1 to 5.
- **Definition of Done**: `npm run build` completes cleanly in under 5 seconds with 0 errors.
