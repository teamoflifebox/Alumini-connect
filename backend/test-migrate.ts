import pool from './src/core/config/db';
import fs from 'fs';

async function run() {
  try {
    const sql = fs.readFileSync('../database/migrations/016_create_groups_discussions.sql', 'utf8');
    await pool.query(sql);
    console.log('Migration successful');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
