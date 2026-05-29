import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function run() {
  const client = new Client({ connectionString: "postgresql://postgres:Sanjana123@localhost:5432/Alumni-connect" });
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, '../../database/migrations/013_event_moderation.sql'), 'utf8');
  await client.query(sql);
  console.log('Migration 13 applied');
  await client.end();
}

run().catch(console.error);
