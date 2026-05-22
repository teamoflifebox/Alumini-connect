import pool from '../src/config/database';

async function runFixMigration() {
  const client = await pool.connect();
  console.log('Connected to database. Running migration...\n');

  try {
    await client.query('BEGIN');

    // ── Step 1: Rename role → primary_role ──────────────────────────────────
    const { rows: cols } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users'
    `);
    const colNames = cols.map((r) => r.column_name);
    console.log('Current columns:', colNames.join(', '));

    if (colNames.includes('role') && !colNames.includes('primary_role')) {
      await client.query(`ALTER TABLE users RENAME COLUMN role TO primary_role`);
      console.log('✓ Renamed  role  →  primary_role');
    } else if (colNames.includes('primary_role')) {
      console.log('⚠ primary_role already exists — skipping rename');
    } else {
      console.log('⚠ Neither role nor primary_role found — check schema manually');
    }

    // ── Step 2: Add missing columns ─────────────────────────────────────────
    const additions: [string, string][] = [
      ['is_approved',      'BOOLEAN DEFAULT FALSE'],
      ['approval_status',  "VARCHAR(50) DEFAULT 'pending'"],
      ['approved_by',      'INTEGER'],
      ['approved_at',      'TIMESTAMPTZ'],
      ['rejection_reason', 'TEXT'],
      ['company',          'VARCHAR(255)'],
      ['graduation_year',  'INTEGER'],
    ];

    for (const [col, def] of additions) {
      await client.query(
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${def}`
      );
      console.log(`✓ Added column  ${col}`);
    }

    // ── Step 3: Approve existing admins & students ───────────────────────────
    const { rowCount: approvedCount } = await client.query(`
      UPDATE users
      SET is_approved = TRUE, approval_status = 'approved', updated_at = NOW()
      WHERE primary_role IN ('admin', 'student')
        AND (is_approved IS NULL OR is_approved = FALSE)
    `);
    console.log(`✓ Approved ${approvedCount} admin/student rows`);

    await client.query(`
      UPDATE users
      SET approval_status = COALESCE(approval_status, 'pending'),
          is_approved     = COALESCE(is_approved, FALSE),
          updated_at      = NOW()
      WHERE primary_role NOT IN ('admin', 'student')
    `);
    console.log('✓ Set pending status for non-admin/student rows');

    // ── Step 4: Rebuild indexes ──────────────────────────────────────────────
    await client.query(`DROP INDEX IF EXISTS idx_users_role`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_primary_role   ON users(primary_role)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_is_approved     ON users(is_approved)`);
    console.log('✓ Rebuilt indexes');

    await client.query('COMMIT');

    // ── Step 5: Verify ───────────────────────────────────────────────────────
    const { rows: finalCols } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'users' ORDER BY ordinal_position
    `);
    console.log('\n✅ Migration complete!');
    console.log('Final columns:', finalCols.map((r) => r.column_name).join(', '));

    // Show current users
    const { rows: users } = await client.query(`
      SELECT id, name, email, primary_role, is_approved, approval_status
      FROM users ORDER BY id
    `);
    console.log('\nCurrent users:');
    users.forEach((u) => {
      console.log(`  [${u.id}] ${u.email} | role=${u.primary_role} | approved=${u.is_approved} | status=${u.approval_status}`);
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed — rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runFixMigration();
