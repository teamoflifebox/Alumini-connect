import pool from '../src/config/database';

/**
 * Migration script for role-based profiles table
 * 
 * This creates a flexible JSONB-based profile system that adapts to different user roles
 */
async function migrateRoleProfiles() {
  const client = await pool.connect();

  try {
    console.log('Starting role-based profiles migration...');

    await client.query('BEGIN');

    // Create enum type for primary roles
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE primary_role AS ENUM ('admin', 'student', 'alumni', 'recruiter', 'donor');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('✓ Created primary_role enum type');

    // Create role_based_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_based_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        role primary_role NOT NULL,
        common_fields JSONB NOT NULL DEFAULT '{}',
        role_specific_data JSONB NOT NULL DEFAULT '{}',
        activity_logs JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Foreign key constraint (assuming users table exists)
        CONSTRAINT fk_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    console.log('✓ Created role_based_profiles table');

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role_profiles_user_id 
        ON role_based_profiles(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role_profiles_role 
        ON role_based_profiles(role);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role_profiles_created_at 
        ON role_based_profiles(created_at DESC);
    `);

    // Create GIN indexes for JSONB fields to enable efficient querying
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role_profiles_common_fields 
        ON role_based_profiles USING GIN (common_fields);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role_profiles_role_specific_data 
        ON role_based_profiles USING GIN (role_specific_data);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_role_profiles_activity_logs 
        ON role_based_profiles USING GIN (activity_logs);
    `);

    console.log('✓ Created indexes');

    // Create function to update updated_at timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_role_profiles_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✓ Created update timestamp function');

    // Create trigger for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_role_profiles_updated_at 
        ON role_based_profiles;
      
      CREATE TRIGGER trigger_update_role_profiles_updated_at
        BEFORE UPDATE ON role_based_profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_role_profiles_updated_at();
    `);

    console.log('✓ Created update timestamp trigger');

    // Create view for profile statistics
    await client.query(`
      CREATE OR REPLACE VIEW role_profile_stats AS
      SELECT 
        role,
        COUNT(*) as total_profiles,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as profiles_last_7_days,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as profiles_last_30_days
      FROM role_based_profiles
      GROUP BY role;
    `);

    console.log('✓ Created profile statistics view');

    await client.query('COMMIT');

    console.log('\n✅ Role-based profiles migration completed successfully!');
    console.log('\nTable structure:');
    console.log('- id: UUID (Primary Key)');
    console.log('- user_id: UUID (Unique, Foreign Key to users)');
    console.log('- role: primary_role enum');
    console.log('- common_fields: JSONB (name, email, profilePhoto, bio, location)');
    console.log('- role_specific_data: JSONB (dynamic based on role)');
    console.log('- activity_logs: JSONB (array of activity logs)');
    console.log('- created_at: TIMESTAMP');
    console.log('- updated_at: TIMESTAMP');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateRoleProfiles()
  .then(() => {
    console.log('\nMigration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration script failed:', error);
    process.exit(1);
  });
