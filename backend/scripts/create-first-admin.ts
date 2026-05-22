import bcrypt from 'bcryptjs';
import pool from '../src/config/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Script to create the first admin user
 * Run: ts-node scripts/create-first-admin.ts
 */

async function createFirstAdmin() {
  console.log('🚀 Creating first admin user...\n');

  try {
    // Admin details
    const adminData = {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@alumniconnect.com',
      password: 'Admin123!', // Change this to a secure password
      department: 'Platform Operations',
    };

    // Check if admin already exists
    const checkQuery = 'SELECT id, email FROM users WHERE email = $1';
    const existingUser = await pool.query(checkQuery, [adminData.email]);

    if (existingUser.rows.length > 0) {
      console.log('❌ Admin user already exists!');
      console.log('📧 Email:', existingUser.rows[0].email);
      console.log('🆔 ID:', existingUser.rows[0].id);
      console.log('\nIf you forgot the password, use the forgot password API.');
      process.exit(0);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const insertQuery = `
      INSERT INTO users (
        first_name,
        last_name,
        name,
        email,
        password_hash,
        primary_role,
        is_verified,
        is_approved,
        approval_status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, email, primary_role, created_at
    `;

    const values = [
      adminData.firstName,
      adminData.lastName,
      `${adminData.firstName} ${adminData.lastName}`,
      adminData.email,
      hashedPassword,
      'admin',
      true,
      true,
      'approved',
    ];

    console.log('💾 Inserting admin into database...');
    const result = await pool.query(insertQuery, values);
    const admin = result.rows[0];

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 Admin Details:');
    console.log('─────────────────────────────────────');
    console.log('🆔 ID:', admin.id);
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', adminData.password);
    console.log('👔 Role:', admin.primary_role);
    console.log('📅 Created:', admin.created_at);
    console.log('─────────────────────────────────────\n');

    console.log('🎯 Next Steps:');
    console.log('1. Login using the credentials above');
    console.log('2. Change the password after first login');
    console.log('3. Start creating other users\n');

    console.log('📝 Login API:');
    console.log('POST http://localhost:5001/api/auth/admin/login');
    console.log('Body: {');
    console.log(`  "email": "${adminData.email}",`);
    console.log(`  "password": "${adminData.password}"`);
    console.log('}\n');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        console.log('\n💡 Tip: Admin with this email already exists.');
      } else if (error.message.includes('connection')) {
        console.log('\n💡 Tip: Check if PostgreSQL is running and database exists.');
      }
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
createFirstAdmin();
