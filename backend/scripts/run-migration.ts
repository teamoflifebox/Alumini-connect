import { pool } from '../src/core/config/database';
import * as fs from 'fs';
import * as path from 'path';

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
