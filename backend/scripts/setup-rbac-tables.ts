import pool from '../src/config/database';

/**
 * Creates all RBAC tables and seeds them with the required data.
 * Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT DO NOTHING).
 * Run: ts-node scripts/setup-rbac-tables.ts
 */
async function setupRbacTables() {
  const client = await pool.connect();
  console.log('Setting up RBAC tables...\n');

  try {
    await client.query('BEGIN');

    // ── 1. roles ────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(50)  UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description  TEXT,
        is_active    BOOLEAN DEFAULT TRUE,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ roles table');

    // ── 2. capabilities ─────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS capabilities (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(100) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description  TEXT,
        category     VARCHAR(50),
        is_active    BOOLEAN DEFAULT TRUE,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ capabilities table');

    // ── 3. role_capabilities ────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_capabilities (
        id             SERIAL PRIMARY KEY,
        role_id        INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        capability_id  INTEGER NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(role_id, capability_id)
      )
    `);
    console.log('✓ role_capabilities table');

    // ── 4. user_capabilities ────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_capabilities (
        id             SERIAL PRIMARY KEY,
        user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        capability_id  INTEGER NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
        granted_by     INTEGER REFERENCES users(id),
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, capability_id)
      )
    `);
    console.log('✓ user_capabilities table');

    // ── 5. modules (capability groups) ──────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id                  SERIAL PRIMARY KEY,
        name                VARCHAR(50)  UNIQUE NOT NULL,
        display_name        VARCHAR(100) NOT NULL,
        description         TEXT,
        available_to_roles  TEXT[] DEFAULT '{}',
        is_active           BOOLEAN DEFAULT TRUE,
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        updated_at          TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ modules table');

    // ── 6. user_modules ─────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_modules (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module_id    INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        enabled      BOOLEAN DEFAULT TRUE,
        activated_at TIMESTAMPTZ DEFAULT NOW(),
        activated_by INTEGER REFERENCES users(id),
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, module_id)
      )
    `);
    console.log('✓ user_modules table');

    // ── 7. module_capabilities ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS module_capabilities (
        id             SERIAL PRIMARY KEY,
        module_id      INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        capability_id  INTEGER NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(module_id, capability_id)
      )
    `);
    console.log('✓ module_capabilities table');

    // ── 8. capability_requests ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS capability_requests (
        id                   SERIAL PRIMARY KEY,
        user_id              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        capability_group_id  INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
        status               VARCHAR(20) DEFAULT 'pending'
                               CHECK (status IN ('pending','approved','rejected')),
        reason               TEXT,
        rejection_reason     TEXT,
        reviewed_by          INTEGER REFERENCES users(id),
        reviewed_at          TIMESTAMPTZ,
        created_at           TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, capability_group_id, status)
      )
    `);
    console.log('✓ capability_requests table');

    // ── 9. Indexes ───────────────────────────────────────────────────────────
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_role_capabilities_role       ON role_capabilities(role_id)`,
      `CREATE INDEX IF NOT EXISTS idx_role_capabilities_capability  ON role_capabilities(capability_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_capabilities_user        ON user_capabilities(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_modules_user             ON user_modules(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_modules_module           ON user_modules(module_id)`,
      `CREATE INDEX IF NOT EXISTS idx_module_capabilities_module    ON module_capabilities(module_id)`,
      `CREATE INDEX IF NOT EXISTS idx_capability_requests_user      ON capability_requests(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_capability_requests_status    ON capability_requests(status)`,
    ];
    for (const idx of indexes) await client.query(idx);
    console.log('✓ indexes');

    // ── 10. Seed roles ───────────────────────────────────────────────────────
    const roles = [
      ['admin',     'Administrator',  'Platform administrator with full access'],
      ['student',   'Student',        'Current enrolled student'],
      ['alumni',    'Alumni',         'Graduated student'],
      ['recruiter', 'Recruiter',      'Company HR professional'],
      ['donor',     'Donor',          'Philanthropist or sponsor'],
    ];
    for (const [name, display, desc] of roles) {
      await client.query(
        `INSERT INTO roles (name, display_name, description)
         VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
        [name, display, desc]
      );
    }
    console.log('✓ seeded 5 roles');

    // ── 11. Seed capabilities ────────────────────────────────────────────────
    const caps = [
      // profile
      ['profile.read.own',    'Read Own Profile',    'profile'],
      ['profile.update.own',  'Update Own Profile',  'profile'],
      ['profile.read.all',    'Read All Profiles',   'profile'],
      ['profile.delete.any',  'Delete Any Profile',  'profile'],
      // user management
      ['user.create',         'Create User',         'user'],
      ['user.read.all',       'Read All Users',      'user'],
      ['user.update.any',     'Update Any User',     'user'],
      ['user.delete.any',     'Delete Any User',     'user'],
      ['user.approve',        'Approve User',        'user'],
      // jobs
      ['job.create',          'Create Job',          'job'],
      ['job.read',            'Read Jobs',           'job'],
      ['job.update.own',      'Update Own Job',      'job'],
      ['job.delete.own',      'Delete Own Job',      'job'],
      ['job.delete.any',      'Delete Any Job',      'job'],
      // events
      ['event.create',        'Create Event',        'event'],
      ['event.read',          'Read Events',         'event'],
      ['event.update.own',    'Update Own Event',    'event'],
      ['event.delete.own',    'Delete Own Event',    'event'],
      // mentorship
      ['mentorship.offer',    'Offer Mentorship',    'mentorship'],
      ['mentorship.manage',   'Manage Mentorship',   'mentorship'],
      // fundraising
      ['fundraising.read',    'Read Fundraising',    'fundraising'],
      ['fundraising.donate',  'Make Donation',       'fundraising'],
      ['donation.history.own','View Own Donations',  'fundraising'],
      // candidates
      ['candidate.read',      'Read Candidates',     'recruitment'],
      ['candidate.shortlist', 'Shortlist Candidate', 'recruitment'],
      ['candidate.contact',   'Contact Candidate',   'recruitment'],
      // admin
      ['admin.*',             'Full Admin Access',   'admin'],
    ];
    for (const [name, display, category] of caps) {
      await client.query(
        `INSERT INTO capabilities (name, display_name, category)
         VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING`,
        [name, display, category]
      );
    }
    console.log(`✓ seeded ${caps.length} capabilities`);

    // ── 12. Assign capabilities to roles ────────────────────────────────────
    const roleCapMap: Record<string, string[]> = {
      admin: ['admin.*'],
      student: ['profile.read.own', 'profile.update.own', 'job.read', 'event.read'],
      alumni: [
        'profile.read.own', 'profile.update.own', 'profile.read.all',
        'job.read', 'event.read', 'mentorship.offer',
      ],
      recruiter: [
        'profile.read.own', 'profile.update.own', 'profile.read.all',
        'job.create', 'job.read', 'job.update.own', 'job.delete.own',
        'candidate.read', 'candidate.shortlist', 'candidate.contact', 'event.read',
      ],
      donor: [
        'profile.read.own', 'profile.update.own',
        'fundraising.read', 'fundraising.donate', 'donation.history.own', 'event.read',
      ],
    };

    for (const [roleName, capNames] of Object.entries(roleCapMap)) {
      for (const capName of capNames) {
        await client.query(
          `INSERT INTO role_capabilities (role_id, capability_id)
           SELECT r.id, c.id FROM roles r, capabilities c
           WHERE r.name = $1 AND c.name = $2
           ON CONFLICT DO NOTHING`,
          [roleName, capName]
        );
      }
    }
    console.log('✓ assigned capabilities to roles');

    // ── 13. Seed modules (capability groups) ────────────────────────────────
    const mods = [
      ['mentor',              'Mentor',              'Offer mentorship to students'],
      ['recruiter',           'Recruiter',           'Post jobs and manage hiring'],
      ['donor',               'Donor',               'Make donations and sponsor scholarships'],
      ['community_moderator', 'Community Moderator', 'Moderate community content'],
      ['event_host',          'Event Host',          'Create and manage events'],
    ];
    for (const [name, display, desc] of mods) {
      await client.query(
        `INSERT INTO modules (name, display_name, description, available_to_roles)
         VALUES ($1, $2, $3, '{}') ON CONFLICT (name) DO NOTHING`,
        [name, display, desc]
      );
    }
    console.log('✓ seeded 5 modules (capability groups)');

    await client.query('COMMIT');
    console.log('\n✅ RBAC setup complete!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Setup failed — rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupRbacTables();
