const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  console.log('Connecting to TiDB database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true // Essential for running SQL files with multiple commands
  });

  try {
    const sqlFilePath = path.join(__dirname, '../migration.sql');
    console.log(`Reading SQL file from: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing migration. This might take a few seconds...');
    await connection.query(sql);
    
    console.log('✅ Migration applied successfully! Database is now up to date.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
