import pool from '../src/core/config/db';

async function main() {
  const cols = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'users' ORDER BY ordinal_position`
  );
  console.log('Columns:', cols.rows.map((r) => r.column_name).join(', '));

  const users = await pool.query(
    `SELECT id, name, first_name, last_name, email, primary_role,
            password_hash IS NOT NULL AS has_password,
            refresh_token IS NOT NULL AS has_refresh,
            is_verified, approval_status, created_at, updated_at
     FROM users ORDER BY id DESC LIMIT 10`
  );
  console.log('Recent users:', JSON.stringify(users.rows, null, 2));
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
