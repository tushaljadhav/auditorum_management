/**
 * Official College Receipt PDF & Canvas Generator
 * Strictly implements the official institutional college receipt layout matching the reference image.
 *
 * Color Palette:
 * Primary Navy: #123A8C
 * Dark Navy:    #0B2E73
 * Light Blue:   #EEF4FF
 * Border Blue:  #C9D8F2
 * Text:         #111827
 * Sec. Text:    #4B5563
 * White:        #FFFFFF
 * Green:        #16A34A
 * Light Green:  #DCFCE7
 */

import { jsPDF } from 'jspdf';

/**
 * Preload fonts used in canvas rendering
 */
async function ensureFontsLoaded() {
  if (document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('700 24px "Noto Sans Devanagari"'),
        document.fonts.load('400 18px "Noto Sans Devanagari"'),
        document.fonts.load('700 24px "DM Sans"'),
        document.fonts.load('400 18px "DM Sans"')
      ]);
    } catch (e) {
      console.warn('Font loading warning:', e);
    }
  }
}

/**
 * Retrieves the college logo image from DOM or loads from public folder
 */
function getCollegeLogo() {
  return new Promise((resolve) => {
    const existing = document.getElementById("college-logo-img");
    if (existing && existing.complete && existing.naturalWidth > 0) {
      return resolve(existing);
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = "/Logo.png";
  });
}

/**
 * Helper to format time into 12-hour AM/PM format (e.g. 12:00 PM - 01:00 PM)
 */
function formatTime12h(timeStr) {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const hStr = h < 10 ? '0' + h : h;
  return `${hStr}:${m} ${ampm}`;
}

/**
 * Format timestamp into standard date-time format (e.g. Aug 8, 2026, 2:32 PM)
 */
function formatRequestedOn(dStr) {
  const dateObj = dStr ? new Date(dStr) : new Date();
  if (isNaN(dateObj.getTime())) return 'Aug 8, 2026, 2:32 PM';
  
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormatted = dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `${dateFormatted}, ${timeFormatted}`;
}

/**
 * Format current timestamp for "Generated on ..." string
 */
function formatGeneratedDate(dStr) {
  const dateObj = dStr ? new Date(dStr) : new Date();
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();
  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Generated on ${dayName}, ${monthName} ${day}, ${year} at ${timeStr}`;
}

/**
 * Draw 2D Navy Vector Icon inside Circle Badge
 */
function drawFieldIcon(ctx, iconType, cx, cy) {
  ctx.save();
  ctx.strokeStyle = '#123A8C';
  ctx.fillStyle = '#123A8C';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (iconType === 'user') {
    // Faculty / Coordinator
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 13, 11, Math.PI, 0);
    ctx.stroke();
  } else if (iconType === 'bookmark') {
    // Reference ID
    ctx.beginPath();
    ctx.rect(cx - 7, cy - 11, 14, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 3);
    ctx.lineTo(cx, cy - 2);
    ctx.lineTo(cx + 7, cy + 3);
    ctx.stroke();
  } else if (iconType === 'file') {
    // Event Name
    ctx.beginPath();
    ctx.rect(cx - 7, cy - 11, 14, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 5);
    ctx.lineTo(cx + 3, cy - 5);
    ctx.moveTo(cx - 3, cy);
    ctx.lineTo(cx + 3, cy);
    ctx.moveTo(cx - 3, cy + 5);
    ctx.lineTo(cx + 1, cy + 5);
    ctx.stroke();
  } else if (iconType === 'pin') {
    // Venue Location Pin
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 1);
    ctx.lineTo(cx, cy + 11);
    ctx.lineTo(cx + 6, cy - 1);
    ctx.stroke();
  } else if (iconType === 'calendar') {
    // Booking Date / Generated Date
    ctx.beginPath();
    ctx.rect(cx - 9, cy - 8, 18, 17);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy - 3);
    ctx.lineTo(cx + 9, cy - 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 12);
    ctx.lineTo(cx - 5, cy - 7);
    ctx.moveTo(cx + 5, cy - 12);
    ctx.lineTo(cx + 5, cy - 7);
    ctx.stroke();
    // Grid dots
    ctx.fillRect(cx - 5, cy + 1, 2.5, 2.5);
    ctx.fillRect(cx, cy + 1, 2.5, 2.5);
    ctx.fillRect(cx + 3.5, cy + 1, 2.5, 2.5);
  } else if (iconType === 'clock') {
    // Time Slot
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + 4, cy + 4);
    ctx.stroke();
  } else if (iconType === 'building') {
    // Department
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 3);
    ctx.lineTo(cx, cy - 11);
    ctx.lineTo(cx + 10, cy - 3);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(cx - 8, cy - 2, 16, 13);
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(cx - 3, cy + 3, 6, 8);
    ctx.stroke();
  } else if (iconType === 'send') {
    // Requested On
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 8);
    ctx.lineTo(cx + 9, cy - 8);
    ctx.lineTo(cx + 1, cy + 8);
    ctx.lineTo(cx - 3, cy + 3);
    ctx.closePath();
    ctx.stroke();
  } else if (iconType === 'check-circle') {
    // Status
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy);
    ctx.lineTo(cx - 1, cy + 4);
    ctx.lineTo(cx + 5, cy - 4);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Render Official College Receipt Canvas
 */
export async function renderOfficialReceiptCanvas(booking, faculties = [], venues = [], departments = []) {
  await ensureFontsLoaded();
  const logoImg = await getCollegeLogo();

  // Canvas Resolution (A4 Aspect Ratio: 1600 x 2262)
  const W = 1600;
  const H = 2262;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fill White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Outer Page Border (Thin Navy)
  ctx.strokeStyle = '#123A8C';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // ── 1. HEADER / LETTERHEAD (3 Columns) ──
  
  // LEFT COLUMN: Marathi Text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#123A8C';
  ctx.font = 'bold 23px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('डेक्कन एज्युकेशन सोसायटीचे', 55, 90);

  ctx.font = 'bold 21px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('कीर्ती एम. डुंगरसी कला, विज्ञान आणि वाणिज्य महाविद्यालय', 55, 126);

  ctx.font = 'normal 17px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('काशीनाथ धुरू मार्ग, दादर (प.), मुंबई - २८', 55, 158);

  // CENTER COLUMN: College Logo Crest & Estd. 1884
  const logoX = 725;
  const logoY = 48;
  const logoW = 150;
  const logoH = 135;
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    try {
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    } catch (e) {
      console.warn("Error drawing logo:", e);
    }
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#123A8C';
  ctx.font = '600 17px "DM Sans", sans-serif';
  ctx.fillText('Estd. 1884', W / 2, 212);

  // RIGHT COLUMN: English Text
  ctx.textAlign = 'right';
  ctx.fillStyle = '#123A8C';
  ctx.font = 'normal 19px "DM Sans", sans-serif';
  ctx.fillText("Deccan Education Society's", W - 55, 82);

  ctx.font = 'bold 31px "DM Sans", sans-serif';
  ctx.fillText('Kirti M. Doongursee College', W - 55, 120);

  ctx.font = '500 19px "DM Sans", sans-serif';
  ctx.fillText('of Arts, Science & Commerce (Autonomous)', W - 55, 150);

  ctx.font = 'normal 17px "DM Sans", sans-serif';
  ctx.fillText('Kashinath Dhuru Road, Off. Veer Savarkar Road,', W - 55, 180);
  ctx.fillText('Dadar (W), Mumbai - 28', W - 55, 206);

  // ── 2. ACCREDITATION STRIP ──
  ctx.strokeStyle = '#123A8C';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(50, 228);
  ctx.lineTo(W - 50, 228);
  ctx.stroke();

  // Solid Navy Bar
  ctx.fillStyle = '#123A8C';
  ctx.fillRect(50, 236, W - 100, 52);

  // Accreditation Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 16.5px "DM Sans", sans-serif';
  ctx.fillText(
    "✪ Reaccredited with 'A' Grade by NAAC   |   🏆 Best College Award - University of Mumbai   |   ⭐ Recipient of DST-FIST & PM-USHA Grants",
    W / 2,
    268
  );

  // ── 3. MAIN TITLE & SEPARATOR ──
  ctx.font = '800 40px "DM Sans", sans-serif';
  ctx.fillStyle = '#123A8C';
  ctx.fillText('BOOKING REQUEST RECEIPT', W / 2, 380);

  // Decorative Diamond Separator
  const lineY = 412;
  ctx.strokeStyle = '#C9D8F2';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(440, lineY);
  ctx.lineTo(765, lineY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(835, lineY);
  ctx.lineTo(1160, lineY);
  ctx.stroke();

  // Center Diamond
  ctx.fillStyle = '#123A8C';
  ctx.beginPath();
  ctx.moveTo(800, lineY - 8);
  ctx.lineTo(808, lineY);
  ctx.moveTo(808, lineY);
  ctx.lineTo(800, lineY + 8);
  ctx.lineTo(792, lineY);
  ctx.lineTo(800, lineY - 8);
  ctx.fill();

  // ── 4. GENERATED DATE CARD ──
  const dateCardX = 390;
  const dateCardY = 450;
  const dateCardW = 820;
  const dateCardH = 72;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#C9D8F2';
  ctx.lineWidth = 2;
  
  // Rounded rect for card
  ctx.beginPath();
  ctx.roundRect(dateCardX, dateCardY, dateCardW, dateCardH, 12);
  ctx.fill();
  ctx.stroke();

  // Calendar Icon inside date card
  drawFieldIcon(ctx, 'calendar', 430, 486);

  // Generated date text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111827';
  ctx.font = '600 21px "DM Sans", sans-serif';
  const genDateStr = formatGeneratedDate(booking?.createdAt || new Date());
  ctx.fillText(genDateStr, 475, 494);

  // ── 5. BOOKING DETAILS TABLE ──
  const tableX = 90;
  const tableY = 565;
  const tableW = 1420;
  const col1W = 560; // 40%
  const col2W = 860; // 60%
  const headerH = 68;
  const rowH = 115;

  // Solid Navy Table Header
  ctx.fillStyle = '#123A8C';
  ctx.beginPath();
  ctx.roundRect(tableX, tableY, tableW, headerH, [12, 12, 0, 0]);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "DM Sans", sans-serif';
  ctx.fillText('BOOKING DETAILS', W / 2, tableY + 44);

  // Table Body Rows Data
  const facultyName = booking?.facultyName || faculties.find(f => f.id === booking?.facultyId)?.name || 'N/A';
  const venueName = booking?.venueName || venues.find(v => v.id === booking?.venueId)?.name || 'N/A';
  const deptName = booking?.departmentName || departments.find(d => d.id === booking?.departmentId)?.name || 'N/A';
  const timeSlotStr = (booking?.startTime && booking?.endTime) 
    ? `${formatTime12h(booking.startTime)} - ${formatTime12h(booking.endTime)}` 
    : (booking?.timeSlot || 'N/A');
  const reqOnStr = formatRequestedOn(booking?.createdAt);
  const rawStatus = booking?.status || 'Confirmed';
  const statusStr = rawStatus === 'Approved' ? 'Confirmed' : rawStatus;

  const rows = [
    { icon: 'user', label: 'Faculty / Coordinator', value: facultyName },
    { icon: 'bookmark', label: 'Booking Reference ID', value: booking?.id || 'N/A', isRefId: true },
    { icon: 'file', label: 'Event / Program Name', value: booking?.eventName || 'N/A' },
    { icon: 'pin', label: 'Venue (Hall / Room)', value: venueName },
    { icon: 'calendar', label: 'Booking Date', value: booking?.bookingDate || 'N/A' },
    { icon: 'clock', label: 'Time Slot', value: timeSlotStr },
    { icon: 'building', label: 'Department', value: deptName },
    { icon: 'send', label: 'Requested On', value: reqOnStr },
    { icon: 'check-circle', label: 'Booking Status', value: statusStr, isStatus: true }
  ];

  let currentY = tableY + headerH;

  rows.forEach((row, i) => {
    const isLast = i === rows.length - 1;

    // Row Background (Zebra)
    if (i % 2 === 0) {
      ctx.fillStyle = '#FFFFFF';
    } else {
      ctx.fillStyle = '#EEF4FF'; // Light blue secondary background
    }

    if (isLast) {
      ctx.beginPath();
      ctx.roundRect(tableX, currentY, tableW, rowH, [0, 0, 12, 12]);
      ctx.fill();
    } else {
      ctx.fillRect(tableX, currentY, tableW, rowH);
    }

    // Row Bottom Border
    ctx.strokeStyle = '#C9D8F2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tableX, currentY + rowH);
    ctx.lineTo(tableX + tableW, currentY + rowH);
    ctx.stroke();

    // Column Divider Line (40% mark)
    ctx.beginPath();
    ctx.moveTo(tableX + col1W, currentY);
    ctx.lineTo(tableX + col1W, currentY + rowH);
    ctx.stroke();

    // ── Column 1: Circular Icon Badge + Label ──
    const badgeCx = tableX + 50;
    const badgeCy = currentY + 57;

    // Circle Badge background
    ctx.fillStyle = (i % 2 === 0) ? '#EEF4FF' : '#FFFFFF';
    ctx.strokeStyle = '#C9D8F2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw Vector Icon inside badge
    drawFieldIcon(ctx, row.icon, badgeCx, badgeCy);

    // Label Text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#123A8C';
    ctx.font = '600 21.5px "DM Sans", sans-serif';
    ctx.fillText(row.label, tableX + 95, currentY + 65);

    // ── Column 2: Details / Values ──
    const valX = tableX + col1W + 40;

    if (row.isStatus) {
      // Booking Status Pill Badge
      let pillBg = '#DCFCE7';
      let pillBorder = '#BBF7D0';
      let pillText = '#16A34A';
      let iconSymbol = '✓';

      if (row.value.toLowerCase() === 'pending') {
        pillBg = '#FEF3C7';
        pillBorder = '#FDE68A';
        pillText = '#D97706';
        iconSymbol = '⏱';
      } else if (row.value.toLowerCase() === 'cancelled' || row.value.toLowerCase() === 'rejected') {
        pillBg = '#FEE2E2';
        pillBorder = '#FECACA';
        pillText = '#DC2626';
        iconSymbol = '✕';
      }

      ctx.fillStyle = pillBg;
      ctx.strokeStyle = pillBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(valX, currentY + 32, 210, 50, 25);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = pillText;
      ctx.font = 'bold 21px "DM Sans", sans-serif';
      ctx.fillText(`${iconSymbol}  ${row.value}`, valX + 105, currentY + 64);
    } else if (row.isRefId) {
      // Booking Reference ID with subtle blue text treatment
      ctx.textAlign = 'left';
      ctx.fillStyle = '#123A8C';
      ctx.font = 'bold 21.5px "Courier New", monospace, sans-serif';
      ctx.fillText(row.value, valX, currentY + 65);
    } else {
      // Standard Value Text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#111827';
      ctx.font = '500 21.5px "DM Sans", sans-serif';
      ctx.fillText(row.value, valX, currentY + 65);
    }

    currentY += rowH;
  });

  // Table Outer Border
  ctx.strokeStyle = '#C9D8F2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(tableX, tableY, tableW, rows.length * rowH + headerH, 12);
  ctx.stroke();

  // ── 6. IMPORTANT NOTE CARD (Final Section at Bottom) ──
  const noteX = 90;
  const noteY = 1710;
  const noteW = 1420;
  const noteH = 150;

  ctx.fillStyle = '#EEF4FF';
  ctx.strokeStyle = '#C9D8F2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(noteX, noteY, noteW, noteH, 16);
  ctx.fill();
  ctx.stroke();

  // Left Info Circle Badge (Solid Navy with white 'i')
  const infoCx = noteX + 55;
  const infoCy = noteY + 75;

  ctx.fillStyle = '#123A8C';
  ctx.beginPath();
  ctx.arc(infoCx, infoCy, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold italic 26px "DM Sans", sans-serif';
  ctx.fillText('i', infoCx, infoCy + 9);

  // Heading & Text Block
  ctx.textAlign = 'left';
  ctx.fillStyle = '#123A8C';
  ctx.font = 'bold 22px "DM Sans", sans-serif';
  ctx.fillText('Important Note', noteX + 105, noteY + 56);

  ctx.fillStyle = '#4B5563';
  ctx.font = 'normal 19.5px "DM Sans", sans-serif';
  ctx.fillText('Please keep this receipt for your records. For any queries, contact the administration office.', noteX + 105, noteY + 98);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Downloads the Official College Booking Receipt PDF
 */
export async function downloadOfficialReceiptPDF(booking, faculties = [], venues = [], departments = []) {
  if (!booking) return;

  const canvasDataUrl = await renderOfficialReceiptCanvas(booking, faculties, venues, departments);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Fit exact A4 canvas onto PDF page (210mm x 297mm)
  doc.addImage(canvasDataUrl, 'PNG', 0, 0, 210, 297);
  doc.save(`Receipt_${booking.id}.pdf`);
}

/**
 * Format timestamp into official human-readable date & time (e.g. 08 Aug 2026, 03:09 PM)
 */
function formatAttendanceTime(tStr) {
  if (!tStr) return 'N/A';
  const d = new Date(tStr);
  if (isNaN(d.getTime())) return String(tStr);
  
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hourStr = String(hours).padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hourStr}:${minutes} ${ampm}`;
}

/**
 * Renders a single A4 page canvas for the Official Attendance Sheet
 */
async function renderAttendanceCanvasPage({ pageNumber, totalPages, pageStudents, startIndex, bookingInfo, isLastPage }) {
  await ensureFontsLoaded();
  const logoImg = await getCollegeLogo();

  const W = 1600;
  const H = 2262;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fill White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Outer Page Border (Thin Navy)
  ctx.strokeStyle = '#123A8C';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // ── 1. HEADER / LETTERHEAD (3 Columns) ──
  
  // LEFT COLUMN: Marathi Text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#123A8C';
  ctx.font = 'bold 23px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('डेक्कन एज्युकेशन सोसायटीचे', 55, 90);

  ctx.font = 'bold 21px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('कीर्ती एम. डुंगरसी कला, विज्ञान आणि वाणिज्य महाविद्यालय', 55, 126);

  ctx.font = 'normal 17px "Noto Sans Devanagari", sans-serif';
  ctx.fillText('काशीनाथ धुरू मार्ग, दादर (प.), मुंबई - २८', 55, 158);

  // CENTER COLUMN: College Logo Crest & Estd. 1884
  const logoX = 725;
  const logoY = 48;
  const logoW = 150;
  const logoH = 135;
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    try {
      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    } catch (e) {
      console.warn("Error drawing logo:", e);
    }
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#123A8C';
  ctx.font = '600 17px "DM Sans", sans-serif';
  ctx.fillText('Estd. 1884', W / 2, 212);

  // RIGHT COLUMN: English Text
  ctx.textAlign = 'right';
  ctx.fillStyle = '#123A8C';
  ctx.font = 'normal 19px "DM Sans", sans-serif';
  ctx.fillText("Deccan Education Society's", W - 55, 82);

  ctx.font = 'bold 31px "DM Sans", sans-serif';
  ctx.fillText('Kirti M. Doongursee College', W - 55, 120);

  ctx.font = '500 19px "DM Sans", sans-serif';
  ctx.fillText('of Arts, Science & Commerce (Autonomous)', W - 55, 150);

  ctx.font = 'normal 17px "DM Sans", sans-serif';
  ctx.fillText('Kashinath Dhuru Road, Off. Veer Savarkar Road,', W - 55, 180);
  ctx.fillText('Dadar (W), Mumbai - 28', W - 55, 206);

  // ── 2. ACCREDITATION STRIP ──
  ctx.strokeStyle = '#123A8C';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(50, 228);
  ctx.lineTo(W - 50, 228);
  ctx.stroke();

  // Solid Navy Bar
  ctx.fillStyle = '#123A8C';
  ctx.fillRect(50, 236, W - 100, 52);

  // Accreditation Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 16.5px "DM Sans", sans-serif';
  ctx.fillText(
    "Reaccredited with ‘A’ Grade by NAAC   |   Best College Award - University of Mumbai   |   Recipient of DST-FIST & PM-USHA Grants",
    W / 2,
    268
  );

  let currentY = 320;

  // ── PAGE 1 ONLY: METADATA & FULL ATTENDANCE TITLE ──
  if (pageNumber === 1) {
    const dateVal = bookingInfo.bookingDate || bookingInfo.date || '';
    const timeVal = (bookingInfo.startTime && bookingInfo.endTime)
      ? `${formatTime12h(bookingInfo.startTime)} - ${formatTime12h(bookingInfo.endTime)}`
      : (bookingInfo.time || '');
    const venueVal = bookingInfo.venueName || bookingInfo.venue || bookingInfo.location || '';
    const deptVal = bookingInfo.departmentName || bookingInfo.deptName || bookingInfo.department || bookingInfo.coordinator || '';
    const agendaVal = bookingInfo.eventName || bookingInfo.agenda || bookingInfo.eventDescription || '';

    // Line 1: Date, Time, Venue
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px "DM Sans", sans-serif';
    ctx.fillStyle = '#123A8C';
    ctx.fillText('1.  Date:', 60, currentY);

    ctx.strokeStyle = '#123A8C';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(145, currentY + 3); ctx.lineTo(450, currentY + 3); ctx.stroke();
    ctx.font = '500 19.5px "DM Sans", sans-serif'; ctx.fillStyle = '#111827';
    ctx.fillText(dateVal, 160, currentY);

    ctx.font = 'bold 20px "DM Sans", sans-serif'; ctx.fillStyle = '#123A8C';
    ctx.fillText('Time:', 480, currentY);

    ctx.beginPath(); ctx.moveTo(545, currentY + 3); ctx.lineTo(880, currentY + 3); ctx.stroke();
    ctx.font = '500 19.5px "DM Sans", sans-serif'; ctx.fillStyle = '#111827';
    ctx.fillText(timeVal, 560, currentY);

    ctx.font = 'bold 20px "DM Sans", sans-serif'; ctx.fillStyle = '#123A8C';
    ctx.fillText('Venue:', 910, currentY);

    ctx.beginPath(); ctx.moveTo(985, currentY + 3); ctx.lineTo(1540, currentY + 3); ctx.stroke();
    ctx.font = '500 19.5px "DM Sans", sans-serif'; ctx.fillStyle = '#111827';
    ctx.fillText(venueVal, 1000, currentY);

    currentY += 55;

    // Line 2: Committee Name
    ctx.font = 'bold 20px "DM Sans", sans-serif'; ctx.fillStyle = '#123A8C';
    ctx.fillText('2.  Committee Name:', 60, currentY);

    ctx.beginPath(); ctx.moveTo(270, currentY + 3); ctx.lineTo(1540, currentY + 3); ctx.stroke();
    ctx.font = '500 19.5px "DM Sans", sans-serif'; ctx.fillStyle = '#111827';
    ctx.fillText(deptVal, 285, currentY);

    currentY += 55;

    // Line 3: Agenda
    ctx.font = 'bold 20px "DM Sans", sans-serif'; ctx.fillStyle = '#123A8C';
    ctx.fillText('3.  Agenda:', 60, currentY);

    ctx.beginPath(); ctx.moveTo(170, currentY + 3); ctx.lineTo(1540, currentY + 3); ctx.stroke();
    ctx.font = '500 19.5px "DM Sans", sans-serif'; ctx.fillStyle = '#111827';
    ctx.fillText(agendaVal, 185, currentY);

    currentY += 75;

    // MAIN TITLE: ATTENDANCE
    ctx.textAlign = 'center';
    ctx.fillStyle = '#123A8C';
    ctx.font = 'bold 38px "DM Sans", sans-serif';
    ctx.fillText('ATTENDANCE', W / 2, currentY);

    // Decorative Lines & Diamond below ATTENDANCE
    const titleLineY = currentY + 18;
    ctx.strokeStyle = '#C9D8F2';
    ctx.lineWidth = 2;

    ctx.beginPath(); ctx.moveTo(520, titleLineY); ctx.lineTo(765, titleLineY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(835, titleLineY); ctx.lineTo(1080, titleLineY); ctx.stroke();

    ctx.fillStyle = '#123A8C';
    ctx.beginPath();
    ctx.moveTo(800, titleLineY - 8);
    ctx.lineTo(808, titleLineY);
    ctx.lineTo(800, titleLineY + 8);
    ctx.lineTo(792, titleLineY);
    ctx.lineTo(800, titleLineY - 8);
    ctx.fill();

    currentY += 55;
  } else {
    // PAGE 2 ONWARD CONTINUATION TITLE
    ctx.textAlign = 'center';
    ctx.fillStyle = '#123A8C';
    ctx.font = 'bold 28px "DM Sans", sans-serif';
    ctx.fillText('ATTENDANCE — CONTINUED', W / 2, currentY);

    currentY += 45;
  }

  // ── ATTENDANCE TABLE ──
  const tableX = 50;
  const tableW = 1500;
  const colWidths = [150, 405, 225, 195, 525]; // Sr No, Name, Class, Roll No, Date & Time of Attendance
  const colHeaderLabels = ['Sr. No.', 'Name', 'Class', 'Roll No.', 'Date & Time of Attendance'];

  const headerH = 62;
  const rowH = 58;

  const headerY = currentY;

  // Header Dark Navy Bar
  ctx.fillStyle = '#0B2E73';
  ctx.fillRect(tableX, headerY, tableW, headerH);

  // Outer Table Header Border
  ctx.strokeStyle = '#0B2E73';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tableX, headerY, tableW, headerH);

  // Draw Header Vertical Dividers & Header Labels
  let currColX = tableX;
  ctx.font = 'bold 20px "DM Sans", sans-serif';
  ctx.fillStyle = '#FFFFFF';

  colHeaderLabels.forEach((label, i) => {
    const w = colWidths[i];
    if (i > 0) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(currColX, headerY);
      ctx.lineTo(currColX, headerY + headerH);
      ctx.stroke();
    }

    if (i === 0 || i === 2 || i === 3) {
      ctx.textAlign = 'center';
      ctx.fillText(label, currColX + w / 2, headerY + 39);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(label, currColX + 20, headerY + 39);
    }
    currColX += w;
  });

  currentY = headerY + headerH;

  // ── TABLE BODY ROWS ──
  if (!pageStudents || pageStudents.length === 0) {
    // Empty Attendance Row
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(tableX, currentY, tableW, rowH);

    ctx.strokeStyle = '#C9D8F2';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(tableX, currentY, tableW, rowH);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#4B5563';
    ctx.font = 'italic 20px "DM Sans", sans-serif';
    ctx.fillText('No attendance records available.', W / 2, currentY + 37);

    currentY += rowH;
  } else {
    pageStudents.forEach((student, idx) => {
      const globalIndex = startIndex + idx + 1; // 1-based serial number across pages

      // Zebra background
      ctx.fillStyle = (idx % 2 === 0) ? '#FFFFFF' : '#EEF4FF';
      ctx.fillRect(tableX, currentY, tableW, rowH);

      // Row Border
      ctx.strokeStyle = '#C9D8F2';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(tableX, currentY, tableW, rowH);

      // Vertical Dividers & Data
      let cellX = tableX;

      const sName = student.studentName || student.name || student.full_name || student.fullName || 'N/A';
      const sClass = student.classStream || student.class || student.course || student.department || student.dept || 'N/A';
      const sRoll = student.rollNumber || student.rollNo || student.roll_no || student.roll || 'N/A';
      const sTimeRaw = student.checkInTime || student.attendanceTime || student.timestamp || student.created_at;
      const sTimeFormatted = formatAttendanceTime(sTimeRaw);

      const cellValues = [
        String(globalIndex),
        sName,
        sClass,
        String(sRoll),
        sTimeFormatted
      ];

      cellValues.forEach((val, i) => {
        const w = colWidths[i];
        if (i > 0) {
          ctx.strokeStyle = '#C9D8F2';
          ctx.beginPath();
          ctx.moveTo(cellX, currentY);
          ctx.lineTo(cellX, currentY + rowH);
          ctx.stroke();
        }

        if (i === 0) {
          ctx.textAlign = 'center';
          ctx.fillStyle = '#123A8C';
          ctx.font = 'bold 20px "DM Sans", sans-serif';
          ctx.fillText(val, cellX + w / 2, currentY + 36);
        } else if (i === 1) {
          ctx.textAlign = 'left';
          ctx.fillStyle = '#111827';
          ctx.font = '500 19.5px "DM Sans", sans-serif';
          
          let displayVal = val;
          while (ctx.measureText(displayVal).width > (w - 30) && displayVal.length > 3) {
            displayVal = displayVal.slice(0, -1);
          }
          if (displayVal !== val) displayVal += '..';
          ctx.fillText(displayVal, cellX + 18, currentY + 36);
        } else if (i === 2) {
          ctx.textAlign = 'center';
          ctx.fillStyle = '#111827';
          ctx.font = '500 19px "DM Sans", sans-serif';
          ctx.fillText(val, cellX + w / 2, currentY + 36);
        } else if (i === 3) {
          ctx.textAlign = 'center';
          ctx.fillStyle = '#123A8C';
          ctx.font = 'bold 19.5px "DM Sans", sans-serif';
          ctx.fillText(val, cellX + w / 2, currentY + 36);
        } else if (i === 4) {
          ctx.textAlign = 'left';
          ctx.fillStyle = '#111827';
          ctx.font = 'normal 19px "DM Sans", sans-serif';
          ctx.fillText(val, cellX + 20, currentY + 36);
        }

        cellX += w;
      });

      currentY += rowH;
    });
  }

  // ── LAST PAGE ONLY: SIGNATURE SECTION ──
  if (isLastPage) {
    const sigY = Math.max(currentY + 80, H - 180);

    ctx.strokeStyle = '#123A8C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, sigY);
    ctx.lineTo(440, sigY);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#123A8C';
    ctx.font = 'bold 21px "DM Sans", sans-serif';
    ctx.fillText('In charge / Coordinator / Head', 60, sigY + 36);
  }

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Downloads the Official College Attendance Sheet PDF (Multi-Page Supported)
 */
export async function downloadOfficialAttendancePDF(attendanceList = [], bookingInfo = {}) {
  // 1. Sort list by Roll Number ascending if available
  const sortedList = [...(attendanceList || [])].sort((a, b) => {
    const rollA = parseInt(a.rollNumber || a.rollNo || a.roll_no || a.roll, 10);
    const rollB = parseInt(b.rollNumber || b.rollNo || b.roll_no || b.roll, 10);
    if (!isNaN(rollA) && !isNaN(rollB)) {
      return rollA - rollB;
    }
    return 0;
  });

  // 2. Pagination calculation
  // Page 1 capacity: 24 rows
  // Page 2+ capacity: 27 rows per page
  const PAGE1_CAPACITY = 24;
  const PAGE_CAPACITY = 27;

  let pagesData = [];

  if (sortedList.length === 0) {
    pagesData.push({
      pageNumber: 1,
      startIndex: 0,
      students: [],
      isLastPage: true
    });
  } else if (sortedList.length <= PAGE1_CAPACITY) {
    pagesData.push({
      pageNumber: 1,
      startIndex: 0,
      students: sortedList,
      isLastPage: true
    });
  } else {
    // Page 1
    pagesData.push({
      pageNumber: 1,
      startIndex: 0,
      students: sortedList.slice(0, PAGE1_CAPACITY),
      isLastPage: false
    });

    let currentIdx = PAGE1_CAPACITY;
    let pageNum = 2;

    while (currentIdx < sortedList.length) {
      const remaining = sortedList.length - currentIdx;
      const currentChunk = sortedList.slice(currentIdx, currentIdx + PAGE_CAPACITY);
      const isLast = (currentIdx + PAGE_CAPACITY) >= sortedList.length;

      pagesData.push({
        pageNumber: pageNum,
        startIndex: currentIdx,
        students: currentChunk,
        isLastPage: isLast
      });

      currentIdx += PAGE_CAPACITY;
      pageNum++;
    }
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const totalPages = pagesData.length;

  for (let i = 0; i < pagesData.length; i++) {
    const p = pagesData[i];
    if (i > 0) {
      doc.addPage();
    }

    const dataUrl = await renderAttendanceCanvasPage({
      pageNumber: p.pageNumber,
      totalPages: totalPages,
      pageStudents: p.students,
      startIndex: p.startIndex,
      bookingInfo: bookingInfo || {},
      isLastPage: p.isLastPage
    });

    doc.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
  }

  const safeEventName = (bookingInfo.eventName || 'Event').replace(/[^\w\s-]/gi, '').replace(/\s+/g, '_');
  const dateStr = bookingInfo.bookingDate || new Date().toISOString().split('T')[0];
  doc.save(`Attendance_${safeEventName}_${dateStr}.pdf`);
}

// Preserve export for backward compatibility
export async function drawCollegeHeader(doc, logoImg) {
  return 45;
}

