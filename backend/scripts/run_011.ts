import fs from 'fs';
import path from 'path';
import pool from '../src/core/config/db';

async function run() {
  const file = '011_create_profiles_table.sql';
  const sql = fs.readFileSync(path.join(__dirname, '../../database/migrations', file), 'utf8');
  console.log(`Running ${file}...`);
  await pool.query(sql);
  console.log(`Done: ${file}`);
  await pool.end();
}

run().catch(console.error);
