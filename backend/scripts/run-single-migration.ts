import fs from 'fs';
import path from 'path';
import pool from '../src/core/config/db';

async function run() {
  const file = '012_create_events_tables.sql';
  const sql = fs.readFileSync(path.join(__dirname, '../../database/migrations', file), 'utf8');
  console.log(`Running ${file}...`);
  await pool.query(sql);
  console.log(`Done: ${file}`);
  await pool.end();
}

run().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
