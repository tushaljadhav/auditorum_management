const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const backupDir = path.join(rootDir, 'backup_archive', 'website_booking_system');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const filesToBackup = [
  {
    src: path.join(rootDir, 'frontend', 'src', 'pages', 'BookingPortal.jsx'),
    destName: 'BookingPortal.jsx'
  },
  {
    src: path.join(rootDir, 'frontend', 'src', 'pages', 'Home.jsx'),
    destName: 'Home_original.jsx'
  },
  {
    src: path.join(rootDir, 'frontend', 'src', 'App.jsx'),
    destName: 'App_original.jsx'
  },
  {
    src: path.join(rootDir, 'backend', 'server.js'),
    destName: 'server_original.js'
  },
  {
    src: path.join(rootDir, 'backend', 'db_mysql.js'),
    destName: 'db_mysql_original.js'
  }
];

filesToBackup.forEach(item => {
  if (fs.existsSync(item.src)) {
    const destPath = path.join(backupDir, item.destName);
    fs.copyFileSync(item.src, destPath);
    console.log(`Copied: ${item.destName} (${fs.statSync(destPath).size} bytes)`);
  } else {
    console.warn(`File not found: ${item.src}`);
  }
});

// Write a clear RESTORE_INSTRUCTIONS.md file
const restoreDoc = `# Website Booking System Backup & Restore Guide

This directory contains the original, complete source code of the Public Website Auditorium Booking System and Database before it was decoupled from the website.

## Files in this Archive:
1. **BookingPortal.jsx**: The original multi-step booking wizard with venue selection, slot check, faculty coordinator selection, attendees calculation, and booking confirmation.
2. **Home_original.jsx**: The original website homepage containing "Book Auditorium Now" hero CTA buttons and booking flow links.
3. **App_original.jsx**: React Router configuration containing the \`/booking\` route.
4. **server_original.js**: Backend server handling both website and app bookings.
5. **db_mysql_original.js**: Database helper methods.
6. **../database/auditorium_db_full_dump.sql**: Full MySQL database schema + data snapshot.
7. **../database/auditorium_db_full_dump.json**: Full JSON export of all database tables.

---

## How to Restore Website Booking in Future (1 Step):
Run the restore script:
\`\`\`bash
node backend/scripts/restore_website_booking.js
\`\`\`
Or copy \`BookingPortal.jsx\` back to \`frontend/src/pages/BookingPortal.jsx\` and add \`<Route path="/booking" element={<BookingPortal />} />\` in \`frontend/src/App.jsx\`.

Archived at: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(backupDir, 'RESTORE_INSTRUCTIONS.md'), restoreDoc, 'utf8');
console.log('SUCCESS: Written RESTORE_INSTRUCTIONS.md');
