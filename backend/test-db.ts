import pool from './src/core/config/db';

async function run() {
  try {
    const res = await pool.query('SELECT id, conversation_id, sender_id, is_read, content FROM messages');
    console.log(res.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
