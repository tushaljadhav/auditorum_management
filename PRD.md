# PRD.md

## Project Overview
- **Project Name**: Kirti M. Doongursee College Auditorium Booking & GPS Attendance Management System
- **One-Line Pitch**: A modern, real-time college venue reservation portal and location-verified GPS attendance tracking platform for Kirti College, Dadar (West), Mumbai.
- **Problem Statement**: Traditional auditorium reservations rely on manual paper registers subject to double-booking conflicts, slow approvals, and loss of paper records. Furthermore, event attendance verification frequently suffers from proxy attendance abuses.
- **Solution**: A unified web system providing instant conflict-free auditorium booking with instant digital PDF receipt generation, paired with location-bound GPS geofencing (100-meter radius) for zero-proxy student attendance check-ins.

---

## Target Users & Primary Personas

### 1. Faculty Coordinator (Primary User)
- **Needs**: Needs to quickly check hall availability for specific dates, reserve venue slots instantly without administrative delays, download official PDF booking proof, and initiate live GPS attendance sessions for student events.
- **Pain Points**: Paperwork delays, venue double-bookings, manual attendance taking, lost attendance sheets.

### 2. Student (End User)
- **Needs**: Needs a friction-free mobile/desktop portal to enter event booking IDs, verify location radius via GPS, and submit attendance in under 10 seconds during live events.
- **Pain Points**: Long physical queues, paper sign-in sheets, invalid proxy accusations.

### 3. Administrator / College Principal (Admin User)
- **Needs**: Needs complete administrative oversight over department registers, faculty credentials, venue capacities, booking overrides, and campus analytics.
- **Pain Points**: Lack of centralized audit logs, inability to track hall utilization efficiency.

---

## Core Features (v1 Must-Have)

### 1. Public Landing & Institutional Information Hub
- Dedicated responsive pages: `Home`, `About`, `Features`, `How It Works`, `Contact`.
- sticky Navbar with brand logo, quick route buttons, and active tab highlights.

### 2. Instant Conflict-Free Venue Booking Engine
- Select venue hall (`Main Auditorium - 800 pax`, `Mini Seminar Hall A - 250 pax`, `AV Media Room - 150 pax`).
- Select date with automatic exclusion of past dates and past times.
- 1-Hour slot availability calculator with exclusion of 10-minute buffers.
- Instant booking approval with digital reference ID (`booking_timestamp`).

### 3. Digital PDF Receipt Generator
- Generates official PDF proof of reservation with event title, department, coordinator name, hall assignment, and QR/reference code using `html2canvas` & `jspdf`.

### 4. Location-Secured GPS Attendance Gateway
- 100-meter radius geofence boundary centered at Kirti College Auditorium coordinates (`19.0222, 72.8304`).
- Haversine formula distance calculation measuring student proximity in meters.
- Live session countdown timer (5m, 10m, 15m, 30m, 60m duration).

### 5. Single-Click Excel CSV Attendance Roster Export
- Faculty members can export verified student check-in logs containing Roll Number, Student Name, Class/Stream, Distance in meters, and Timestamp.

### 6. Role-Based Admin Management Panel
- Dashboard metrics: Active bookings, department statistics, venue utilization.
- Management modules for Departments, Faculty, Venues, Bookings, and System Users.

---

## Future Features (Post-v1 / Nice-to-Have)
- **SMS / WhatsApp Alerts**: Automatic WhatsApp notifications for booking confirmations and attendance countdown alerts.
- **Biometric Hardware Integration**: RFID card scanner backup for offline attendance logging during network outages.
- **Multi-Campus Support**: Support for satellite campuses and secondary auditorium wings.

---

## Success Metrics
- **Booking Speed**: Reduction of venue booking approval time from 3 days to under 10 seconds.
- **Conflict Rate**: 0% double-booking conflicts across all auditorium halls.
- **Attendance Integrity**: 100% verification of student location within the 100m geofence radius.
- **System Uptime**: 99.9% availability during peak campus hours (08:00 AM - 05:00 PM).

---

## Constraints
- **Platform**: Web-based application responsive across Mobile (iOS/Android) and Desktop browsers.
- **Geography**: Geofence restricted to Kirti College, Kashinath Dhuru Road, Dadar (West), Mumbai - 400028.
- **Developer Attribution**: Includes developer credit `"Developed with ❤️ by Tushal Jadhav"`.
