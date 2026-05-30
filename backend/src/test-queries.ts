import pool from './config/database';

async function main() {
  try {
    await pool.query('SELECT COUNT(*) FROM users');
    console.log('users works');
    await pool.query('SELECT COUNT(*) FROM mentorship_sessions');
    console.log('mentorship_sessions works');
    await pool.query('SELECT COUNT(*) FROM jobs');
    console.log('jobs works');
    await pool.query('SELECT COUNT(*) FROM referrals');
    console.log('referrals works');
    await pool.query(`
      SELECT u.full_name as name, l.total_score as score
      FROM leaderboard_scores l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.total_score DESC
      LIMIT 2
    `);
    console.log('leaderboard_scores works');
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    process.exit(0);
  }
}
main();
