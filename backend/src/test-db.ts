import pool from './core/config/db';

async function run() {
  const userId = 1; // Or any user id
  
  // Create settings manually if they don't exist
  await pool.query('INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]).catch(e => console.log('Insert error', e.message));

  // Try updating
  try {
    const result = await pool.query('UPDATE user_settings SET email_notifications = $1 WHERE user_id = $2 RETURNING *', [false, userId]);
    console.log('Update result:', result.rows);
  } catch (err: any) {
    console.log('Update query error:', err.message);
  }
  process.exit(0);
}
run();
