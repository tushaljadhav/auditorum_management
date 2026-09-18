const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const backupDir = path.join(rootDir, 'backup_archive', 'website_booking_system');

if (!fs.existsSync(backupDir)) {
  console.error('Backup archive directory not found!');
  process.exit(1);
}

const restoreFiles = [
  {
    backupName: 'BookingPortal.jsx',
    dest: path.join(rootDir, 'frontend', 'src', 'pages', 'BookingPortal.jsx')
  },
  {
    backupName: 'Home_original.jsx',
    dest: path.join(rootDir, 'frontend', 'src', 'pages', 'Home.jsx')
  },
  {
    backupName: 'App_original.jsx',
    dest: path.join(rootDir, 'frontend', 'src', 'App.jsx')
  }
];

restoreFiles.forEach(item => {
  const src = path.join(backupDir, item.backupName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, item.dest);
    console.log(`Restored: ${item.dest}`);
  } else {
    console.warn(`Backup file not found: ${src}`);
  }
});

console.log('\n=========================================');
console.log('SUCCESS: Website booking system restored!');
console.log('=========================================');
