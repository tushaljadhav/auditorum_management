const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function fullBackup() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'auditorium_db'
  });

  const outDir = path.join(__dirname, '..', '..', 'backup_archive', 'database');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const [tablesRows] = await conn.query('SHOW TABLES');
  const tableNames = tablesRows.map(r => Object.values(r)[0]);

  let sqlDump = '-- COMPLETE MYSQL DATABASE DUMP FOR AUDITORIUM_DB\n';
  sqlDump += '-- Generated on: ' + new Date().toISOString() + '\n';
  sqlDump += 'CREATE DATABASE IF NOT EXISTS auditorium_db;\nUSE auditorium_db;\nSET FOREIGN_KEY_CHECKS = 0;\n\n';

  const fullJson = {
    exportDate: new Date().toISOString(),
    database: 'auditorium_db',
    tables: {}
  };

  for (const table of tableNames) {
    const [createTableResult] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    const createSql = createTableResult[0]['Create Table'];
    sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n${createSql};\n\n`;

    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    fullJson.tables[table] = rows;

    if (rows.length > 0) {
      for (const row of rows) {
        const cols = Object.keys(row).map(c => `\`${c}\``).join(', ');
        const vals = Object.values(row).map(v => {
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return v;
          if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
          return `'${String(v).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
        }).join(', ');
        sqlDump += `INSERT INTO \`${table}\` (${cols}) VALUES (${vals});\n`;
      }
      sqlDump += '\n';
    }
  }

  sqlDump += 'SET FOREIGN_KEY_CHECKS = 1;\n';

  const sqlPath = path.join(outDir, 'auditorium_db_full_dump.sql');
  const jsonPath = path.join(outDir, 'auditorium_db_full_dump.json');

  fs.writeFileSync(sqlPath, sqlDump, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(fullJson, null, 2), 'utf8');

  console.log('SUCCESS: SQL dump written to:', sqlPath, 'Size:', fs.statSync(sqlPath).size, 'bytes');
  console.log('SUCCESS: JSON dump written to:', jsonPath, 'Size:', fs.statSync(jsonPath).size, 'bytes');

  await conn.end();
}

fullBackup().catch(err => {
  console.error('Backup error:', err);
  process.exit(1);
});
