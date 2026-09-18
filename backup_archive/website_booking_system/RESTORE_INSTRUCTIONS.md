# Website Booking System Backup & Restore Guide

This directory contains the original, complete source code of the Public Website Auditorium Booking System and Database before it was decoupled from the website.

## Files in this Archive:
1. **BookingPortal.jsx**: The original multi-step booking wizard with venue selection, slot check, faculty coordinator selection, attendees calculation, and booking confirmation.
2. **Home_original.jsx**: The original website homepage containing "Book Auditorium Now" hero CTA buttons and booking flow links.
3. **App_original.jsx**: React Router configuration containing the `/booking` route.
4. **server_original.js**: Backend server handling both website and app bookings.
5. **db_mysql_original.js**: Database helper methods.
6. **../database/auditorium_db_full_dump.sql**: Full MySQL database schema + data snapshot.
7. **../database/auditorium_db_full_dump.json**: Full JSON export of all database tables.

---

## How to Restore Website Booking in Future (1 Step):
Run the restore script:
```bash
node backend/scripts/restore_website_booking.js
```
Or copy `BookingPortal.jsx` back to `frontend/src/pages/BookingPortal.jsx` and add `<Route path="/booking" element={<BookingPortal />} />` in `frontend/src/App.jsx`.

Archived at: 2026-09-17T20:33:26.938Z
