import pool from '../src/config/database';

/**
 * Creates both profile tables:
 *  1. profiles          – simple legacy profile (GET/PATCH /api/profiles/me)
 *  2. role_based_profiles – rich JSONB profile (all /api/role-profiles/* endpoints)
 *
 * Run: ts-node scripts/setup-profile-tables.ts
 */
async function setupProfileTables() {
  const client = await pool.connect();
  console.log('Setting up profile tables...\n');

  try {
    await client.query('BEGIN');

    // ── 1. Simple profiles table ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id                  SERIAL PRIMARY KEY,
        user_id             INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        first_name          VARCHAR(100),
        last_name           VARCHAR(100),
        batch_year          INTEGER,
        department          VARCHAR(100),
        current_company     VARCHAR(255),
        designation         VARCHAR(255),
        experience_years    INTEGER,
        skills              TEXT[]    DEFAULT '{}',
        domains             TEXT[]    DEFAULT '{}',
        is_mentor_available BOOLEAN   DEFAULT FALSE,
        preferences         JSONB     DEFAULT '{}',
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        updated_at          TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)`);
    console.log('✓ profiles table');

    // Auto-create a profile row whenever a user is inserted
    await client.query(`
      CREATE OR REPLACE FUNCTION create_profile_for_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO profiles (user_id, first_name, last_name)
        VALUES (
          NEW.id,
          COALESCE(NEW.first_name, split_part(NEW.name, ' ', 1)),
          COALESCE(NEW.last_name,  split_part(NEW.name, ' ', 2))
        )
        ON CONFLICT (user_id) DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_create_profile ON users;
      CREATE TRIGGER trg_create_profile
        AFTER INSERT ON users
        FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();
    `);
    console.log('✓ auto-create profile trigger');

    // Back-fill profiles for existing users
    const { rowCount } = await client.query(`
      INSERT INTO profiles (user_id, first_name, last_name)
      SELECT
        id,
        COALESCE(first_name, split_part(name, ' ', 1)),
        COALESCE(last_name,  split_part(name, ' ', 2))
      FROM users
      ON CONFLICT (user_id) DO NOTHING
    `);
    console.log(`✓ back-filled ${rowCount} profile rows for existing users`);

    // ── 2. role_based_profiles table ────────────────────────────────────────
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE primary_role_enum AS ENUM
          ('admin','student','alumni','recruiter','donor');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS role_based_profiles (
        id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id            INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        role               VARCHAR(20) NOT NULL
                             CHECK (role IN ('admin','student','alumni','recruiter','donor')),
        common_fields      JSONB NOT NULL DEFAULT '{}',
        role_specific_data JSONB NOT NULL DEFAULT '{}',
        activity_logs      JSONB NOT NULL DEFAULT '[]',
        created_at         TIMESTAMPTZ DEFAULT NOW(),
        updated_at         TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Indexes
    const idxs = [
      `CREATE INDEX IF NOT EXISTS idx_rbp_user_id    ON role_based_profiles(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_rbp_role        ON role_based_profiles(role)`,
      `CREATE INDEX IF NOT EXISTS idx_rbp_created_at  ON role_based_profiles(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_rbp_common      ON role_based_profiles USING GIN (common_fields)`,
      `CREATE INDEX IF NOT EXISTS idx_rbp_role_data   ON role_based_profiles USING GIN (role_specific_data)`,
      `CREATE INDEX IF NOT EXISTS idx_rbp_activity    ON role_based_profiles USING GIN (activity_logs)`,
    ];
    for (const idx of idxs) await client.query(idx);

    // Auto-update updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_rbp_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`
      DROP TRIGGER IF EXISTS trg_rbp_updated_at ON role_based_profiles;
      CREATE TRIGGER trg_rbp_updated_at
        BEFORE UPDATE ON role_based_profiles
        FOR EACH ROW EXECUTE FUNCTION update_rbp_updated_at();
    `);
    console.log('✓ role_based_profiles table + indexes + trigger');

    await client.query('COMMIT');
    console.log('\n✅ All profile tables ready!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Setup failed — rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupProfileTables();
