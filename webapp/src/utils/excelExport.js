// excelExport.js — Self-contained CSV/Excel export utility
// Webapp copy — no imports from other folders

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCSV(row) {
  return row.map(escapeCsvCell).join(',');
}

function downloadCSV(csvContent, filename) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

// Export attendance records to CSV/Excel
export function exportAttendanceCSV(records = [], eventName = 'Attendance') {
  const headers = ['Sr. No.', 'Roll Number', 'Student Name', 'Class / Stream', 'Check-In Time', 'Distance (m)', 'Status'];

  const rows = records.map((r, i) => [
    i + 1,
    r.rollNumber || '—',
    r.studentName || '—',
    r.classStream || '—',
    r.checkInTime ? new Date(r.checkInTime).toLocaleString('en-IN') : '—',
    r.distanceFromVenue != null ? r.distanceFromVenue : '—',
    r.status || 'Present',
  ]);

  const csv = [rowToCSV(headers), ...rows.map(rowToCSV)].join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `Attendance_${eventName.replace(/\s+/g, '_')}_${date}.csv`);
}

// Export bookings list to CSV/Excel
export function exportBookingsCSV(bookings = []) {
  const headers = ['Booking ID', 'Event Name', 'Department', 'Faculty', 'Venue', 'Date', 'Start Time', 'End Time', 'Attendees', 'Status'];

  const rows = bookings.map((b) => [
    b.id || '—',
    b.eventName || '—',
    b.departmentName || '—',
    b.facultyName || '—',
    b.venueName || '—',
    b.bookingDate || '—',
    b.startTime || '—',
    b.endTime || '—',
    b.attendees || 0,
    b.status || '—',
  ]);

  const csv = [rowToCSV(headers), ...rows.map(rowToCSV)].join('\n');
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, `Bookings_${date}.csv`);
}

// Generic table export
export function exportToExcel(data = [], columns = [], filename = 'export') {
  if (!data.length || !columns.length) return;
  const headers = columns.map(c => c.label || c.key);
  const rows = data.map(row => columns.map(c => row[c.key]));
  const csv = [rowToCSV(headers), ...rows.map(rowToCSV)].join('\n');
  downloadCSV(csv, `${filename}.csv`);
}
