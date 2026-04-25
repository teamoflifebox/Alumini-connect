-- PostgreSQL Seed Data for Alumni Connect

-- Insert Roles
-- Roles are enums, naturally inserted directly into user records

-- 1. Insert Initial Users
INSERT INTO users (email, password_hash, role, is_verified) VALUES
('admin@alumniconnect.com', '$2y$10$Qx/h5Eok1a...', 'admin', true),
('alumni.tech@mail.com', '$2y$10$Qx/h5Eok1a...', 'alumni', true),
('student.john@university.edu', '$2y$10$Qx/h5Eok1a...', 'student', true),
('recruiter.stripe@stripe.com', '$2y$10$Qx/h5Eok1a...', 'recruiter', true);

-- 2. Insert Profiles
INSERT INTO profiles (user_id, first_name, last_name, headline, bio, location, industry, graduation_year, degree) VALUES
(1, 'System', 'Admin', 'Platform Administrator', 'Managing the best networking ecosystem.', 'San Francisco', 'Technology', NULL, NULL),
(2, 'David', 'Miller', 'Senior Software Engineer at Google', 'Passionate about mentoring the next gen of developers.', 'Mountain View, CA', 'Tech', 2018, 'B.S. Computer Science'),
(3, 'John', 'Doe', 'Aspiring SWE | CS Junior', 'Looking for summer 2027 internships and a mentor.', 'Austin, TX', 'Student', 2027, 'B.S. Computer Science'),
(4, 'Elena', 'Rodriguez', 'University Recruiting at Stripe', 'Connecting top graduates with high-growth teams.', 'San Francisco, CA', 'Recruiting', NULL, NULL);

-- 3. Insert Sample Jobs
INSERT INTO jobs (posted_by, title, company, location, type, description, requirements, salary_range) VALUES
(4, 'Software Engineering Intern', 'Stripe', 'San Francisco (Hybrid)', 'Internship', 'Join our payments platform team for a 12-week summer internship.', 'Proficiency in React, Go, and Ruby.', '$8,000 - $10,000 / month');

-- 4. Insert Scholarships
INSERT INTO scholarships (created_by, title, description, amount, deadline, eligibility_criteria, total_fund) VALUES
(2, 'Future Tech Innovators Scholarship', 'A scholarship aimed at supporting outstanding CS students with financial need.', 5000.00, '2027-05-01 00:00:00', 'Computer Science major, GPA 3.5+, Demonstrated financial need.', 15000.00);

-- 5. Insert Sample Applications
INSERT INTO applications (scholarship_id, student_id, status, academic_score, financial_need_score, profile_strength_score, statement_of_purpose) VALUES
(1, 3, 'under_review', 9.5, 8.0, 9.0, 'I have been passionate about systems programming since high school...');

-- 6. Insert Donations
INSERT INTO donations (donor_id, scholarship_id, amount, status, is_anonymous) VALUES
(2, 1, 10000.00, 'completed', false),
(2, 1, 5000.00, 'completed', true);
