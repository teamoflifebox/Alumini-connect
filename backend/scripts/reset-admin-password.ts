import bcrypt from 'bcryptjs';
import pool from '../src/config/database';

/**
 * Resets the admin password to a known value.
 * Run: ts-node scripts/reset-admin-password.ts
 */
async function resetAdminPassword() {
  const email    = 'admin@alumniconnect.com';
  const newPass  = 'Admin123!';

  const hash = await bcrypt.hash(newPass, 10);

  const { rowCount } = await pool.query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
    [hash, email]
  );

  if (rowCount && rowCount > 0) {
    console.log('✅ Admin password reset successfully');
    console.log('📧 Email   :', email);
    console.log('🔑 Password:', newPass);
  } else {
    console.log('❌ Admin user not found:', email);
  }

  await pool.end();
}

resetAdminPassword().catch((e) => { console.error(e); process.exit(1); });
