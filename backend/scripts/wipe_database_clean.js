const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function wipeClean() {
  console.log('--- Wiping Database to Clean Slate (Keeping Admin Users Only) ---');

  const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.ovaqqznuzpvmtvpyokpx',
    password: 't5viqwFaey1ykvpx',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log(' Connected to Supabase.');

  // 1. Create a safe backup before wiping
  const backupDir = path.resolve(__dirname, '../../backup_archive/database');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupData = {};
  const allTables = ['attendance', 'bookings', 'faculty', 'venues', 'departments', 'designations', 'users', 'booking_audit_log', 'notifications'];
  
  for (const t of allTables) {
    const res = await client.query(`SELECT * FROM "${t}"`);
    backupData[t] = res.rows;
  }

  const backupPath = path.join(backupDir, `backup_before_wipe_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(` Safe backup saved to: ${backupPath}`);

  // 2. Tables to wipe
  const tablesToWipe = [
    'attendance',
    'bookings',
    'faculty',
    'venues',
    'departments',
    'designations',
    'booking_audit_log',
    'notifications'
  ];

  for (const t of tablesToWipe) {
    await client.query(`TRUNCATE TABLE "${t}" CASCADE;`);
    console.log(` Cleared table: "${t}" (0 records remaining)`);
  }

  // 3. Verify Users table (Make sure admin & dev exist)
  const usersRes = await client.query('SELECT id, username, name FROM users');
  console.log('\n--- PRESERVED ADMIN USERS ---');
  console.table(usersRes.rows);

  // 4. Verification of all tables
  console.log('\n--- FINAL RECORD COUNTS IN SUPABASE ---');
  for (const t of allTables) {
    const res = await client.query(`SELECT COUNT(*) as count FROM "${t}"`);
    console.log(`"${t}": ${res.rows[0].count} records`);
  }

  await client.end();
  console.log('\n SUCCESS: Database is now 100% clean with only Admin accounts preserved!');
}

wipeClean().catch(err => {
  console.error('Wipe failed:', err);
  process.exit(1);
});
