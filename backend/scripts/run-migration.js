const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alumniconnect',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function run() {
  try {
    const sqlPath = path.join(__dirname, '../../database/migrations/014_create_donations_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Migration successful');
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    pool.end();
  }
}

run();
