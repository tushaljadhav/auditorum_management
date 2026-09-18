const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..');

fs.copyFileSync(
  path.join(rootDir, 'frontend', 'src', 'pages', 'BookingNotice.jsx'),
  path.join(rootDir, 'frontend', 'src', 'pages', 'BookingPortal.jsx')
);
console.log('Switched /booking to App Gateway Notice.');
