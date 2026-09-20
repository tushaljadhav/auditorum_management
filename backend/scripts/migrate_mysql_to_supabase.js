const mysql = require('mysql2/promise');
const { Client } = require('pg');

async function migrate() {
  console.log('--- Starting Migration from MySQL (FreeSQLDatabase) to PostgreSQL (Supabase) ---');

  // 1. MySQL Source Connection
  const mysqlConn = await mysql.createConnection({
    host: 'sql12.freesqldatabase.com',
    user: 'sql12837315',
    password: 'DkRewv54r5',
    database: 'sql12837315',
    port: 3306
  });
  console.log(' Connected to Source MySQL (FreeSQLDatabase).');

  // 2. Supabase Target Connection (Session Pooler ap-south-1)
  const pgClient = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.ovaqqznuzpvmtvpyokpx',
    password: 't5viqwFaey1ykvpx',
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log(' Connected to Target PostgreSQL (Supabase Mumbai).');

  // 3. Create Tables in Supabase (PostgreSQL DDL)
  const ddlStatements = [
    // venues
    `CREATE TABLE IF NOT EXISTS venues (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      capacity INT,
      location VARCHAR(255),
      address TEXT,
      latitude NUMERIC(10, 8),
      longitude NUMERIC(11, 8),
      radius INT,
      status VARCHAR(50) DEFAULT 'Available'
    );`,

    // departments
    `CREATE TABLE IF NOT EXISTS departments (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL
    );`,

    // designations
    `CREATE TABLE IF NOT EXISTS designations (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL
    );`,

    // faculty
    `CREATE TABLE IF NOT EXISTS faculty (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150),
      mobile VARCHAR(50),
      "departmentId" VARCHAR(50),
      "designationId" VARCHAR(50),
      password VARCHAR(255),
      status VARCHAR(50) DEFAULT 'Pending',
      "facultyId" VARCHAR(50)
    );`,

    // bookings
    `CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(50) PRIMARY KEY,
      "eventName" VARCHAR(255),
      "departmentName" VARCHAR(150),
      "facultyName" VARCHAR(150),
      "venueId" VARCHAR(50),
      "eventDescription" TEXT,
      "bookingDate" VARCHAR(50),
      "startTime" VARCHAR(10),
      "endTime" VARCHAR(10),
      attendees INT,
      status VARCHAR(50),
      "attendanceStatus" VARCHAR(50),
      "attendanceWindowStart" VARCHAR(100),
      "attendanceWindowEnd" VARCHAR(100),
      coordinator VARCHAR(150),
      email VARCHAR(150),
      phone VARCHAR(50),
      department VARCHAR(255),
      faculty VARCHAR(255),
      "classYear" VARCHAR(100),
      "sessionLatitude" NUMERIC(10, 8),
      "sessionLongitude" NUMERIC(11, 8),
      "sessionPin" VARCHAR(10),
      "sessionRadius" INT
    );`,

    // attendance
    `CREATE TABLE IF NOT EXISTS attendance (
      id VARCHAR(50) PRIMARY KEY,
      "bookingId" VARCHAR(50),
      "rollNumber" VARCHAR(100),
      "studentName" VARCHAR(150),
      latitude NUMERIC(10, 8),
      longitude NUMERIC(11, 8),
      "distanceFromVenue" INT,
      "checkInTime" VARCHAR(100),
      "classStream" VARCHAR(100)
    );`,

    // users
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(150) NOT NULL
    );`,

    // booking_audit_log
    `CREATE TABLE IF NOT EXISTS booking_audit_log (
      id VARCHAR(50) PRIMARY KEY,
      booking_id VARCHAR(50) NOT NULL,
      admin_id VARCHAR(50) NOT NULL,
      admin_name VARCHAR(150),
      action_type VARCHAR(50) NOT NULL,
      reason TEXT NOT NULL,
      previous_booking_snapshot TEXT,
      new_booking_snapshot TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,

    // notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(50) PRIMARY KEY,
      "recipientId" VARCHAR(50),
      "recipientEmail" VARCHAR(150),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      reason TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      "bookingId" VARCHAR(50),
      "isRead" SMALLINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  console.log('Creating Supabase tables...');
  for (const ddl of ddlStatements) {
    await pgClient.query(ddl);
  }
  console.log(' All Supabase tables created successfully.');

  // 4. Data Migration helper
  const tables = ['venues', 'departments', 'designations', 'faculty', 'bookings', 'attendance', 'users', 'booking_audit_log', 'notifications'];

  for (const table of tables) {
    const [rows] = await mysqlConn.query(`SELECT * FROM \`${table}\``);
    if (!rows || rows.length === 0) {
      console.log(`Table "${table}": 0 rows to migrate.`);
      continue;
    }

    console.log(`Migrating ${rows.length} rows for table "${table}"...`);
    // Clear existing target rows to avoid conflict
    await pgClient.query(`TRUNCATE TABLE "${table}" CASCADE;`);

    const columns = Object.keys(rows[0]);
    const quotedCols = columns.map(c => `"${c}"`).join(', ');

    for (const row of rows) {
      // Auto-approve Tushal Jadhav if found so user can log in immediately
      if (table === 'faculty' && (row.mobile && row.mobile.includes('85918') || row.name === 'Tushal Jadhav')) {
        row.status = 'Approved';
      }

      const values = columns.map(c => row[c]);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const insertQuery = `INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING;`;
      await pgClient.query(insertQuery, values);
    }
    console.log(` Migrated table "${table}" (${rows.length} rows).`);
  }

  // Verification
  console.log('\n--- VERIFICATION IN SUPABASE ---');
  for (const table of tables) {
    const res = await pgClient.query(`SELECT COUNT(*) as count FROM "${table}"`);
    console.log(`Supabase table "${table}": ${res.rows[0].count} rows.`);
  }

  await mysqlConn.end();
  await pgClient.end();
  console.log('\n SUCCESS: All database tables and rows migrated to Supabase!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
