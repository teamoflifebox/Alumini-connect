-- Optional: seed a default admin (change credentials before production)
-- Password: Admin@12345

INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified)
VALUES (
  'System',
  'Admin',
  'admin@alumniconnect.com',
  '$2b$10$zNRTBTKJUvJgM3Q0hRDjieibrDsv2RcXLK28RO6pdx4IMnEplySHK',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;
