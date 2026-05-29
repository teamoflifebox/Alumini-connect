import pool from './src/core/config/db';

async function run() {
  try {
    const res = await pool.query('UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE RETURNING id', [2, '13']);
    console.log("Updated rows:", res.rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
