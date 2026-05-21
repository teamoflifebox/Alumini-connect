-- Seed default roles and capabilities

-- Insert roles
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'Full system access and user management'),
('student', 'Student', 'Current students with limited access'),
('alumni', 'Alumni', 'Graduated students with extended access'),
('recruiter', 'Recruiter', 'Company recruiters posting jobs'),
('donor', 'Donor', 'Donors supporting fundraising campaigns')
ON CONFLICT (name) DO NOTHING;

-- Insert capabilities

-- Admin capabilities
INSERT INTO capabilities (name, display_name, description, category) VALUES
('admin.*', 'All Admin Permissions', 'Wildcard for all admin permissions', 'admin'),
('user.create', 'Create Users', 'Create new user accounts', 'users'),
('user.read', 'View Users', 'View user information', 'users'),
('user.update', 'Update Users', 'Update user information', 'users'),
('user.delete', 'Delete Users', 'Delete user accounts', 'users'),
('user.approve', 'Approve Users', 'Approve pending user registrations', 'users'),
('user.reject', 'Reject Users', 'Reject user registrations', 'users'),
('role.assign', 'Assign Roles', 'Assign roles to users', 'roles'),
('capability.manage', 'Manage Capabilities', 'Create and manage capabilities', 'capabilities'),

-- Profile capabilities
('profile.read.own', 'View Own Profile', 'View own profile information', 'profiles'),
('profile.update.own', 'Update Own Profile', 'Update own profile information', 'profiles'),
('profile.read.all', 'View All Profiles', 'View all user profiles', 'profiles'),
('profile.update.all', 'Update All Profiles', 'Update any user profile', 'profiles'),

-- Job capabilities
('job.create', 'Create Jobs', 'Post new job openings', 'jobs'),
('job.read', 'View Jobs', 'View job postings', 'jobs'),
('job.update.own', 'Update Own Jobs', 'Update own job postings', 'jobs'),
('job.update.all', 'Update All Jobs', 'Update any job posting', 'jobs'),
('job.delete.own', 'Delete Own Jobs', 'Delete own job postings', 'jobs'),
('job.delete.all', 'Delete All Jobs', 'Delete any job posting', 'jobs'),
('job.apply', 'Apply to Jobs', 'Apply to job postings', 'jobs'),

-- Candidate capabilities
('candidate.read', 'View Candidates', 'View job applications', 'candidates'),
('candidate.shortlist', 'Shortlist Candidates', 'Shortlist job applicants', 'candidates'),
('candidate.contact', 'Contact Candidates', 'Contact job applicants', 'candidates'),

-- Event capabilities
('event.create', 'Create Events', 'Create new events', 'events'),
('event.read', 'View Events', 'View events', 'events'),
('event.update.own', 'Update Own Events', 'Update own events', 'events'),
('event.update.all', 'Update All Events', 'Update any event', 'events'),
('event.delete.own', 'Delete Own Events', 'Delete own events', 'events'),
('event.delete.all', 'Delete All Events', 'Delete any event', 'events'),
('event.register', 'Register for Events', 'Register for events', 'events'),

-- Mentorship capabilities
('mentorship.offer', 'Offer Mentorship', 'Offer mentorship to students', 'mentorship'),
('mentorship.request', 'Request Mentorship', 'Request mentorship from alumni', 'mentorship'),
('mentorship.manage', 'Manage Mentorship', 'Manage mentorship programs', 'mentorship'),

-- Fundraising capabilities
('fundraising.create', 'Create Campaigns', 'Create fundraising campaigns', 'fundraising'),
('fundraising.read', 'View Campaigns', 'View fundraising campaigns', 'fundraising'),
('fundraising.update', 'Update Campaigns', 'Update fundraising campaigns', 'fundraising'),
('fundraising.delete', 'Delete Campaigns', 'Delete fundraising campaigns', 'fundraising'),
('fundraising.donate', 'Make Donations', 'Make donations to campaigns', 'fundraising'),
('donation.history.own', 'View Own Donations', 'View own donation history', 'fundraising'),
('donation.history.all', 'View All Donations', 'View all donation history', 'fundraising')
ON CONFLICT (name) DO NOTHING;

-- Assign capabilities to roles

-- Admin gets all permissions
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id
FROM roles r, capabilities c
WHERE r.name = 'admin' AND c.name = 'admin.*'
ON CONFLICT DO NOTHING;

-- Student capabilities
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id
FROM roles r, capabilities c
WHERE r.name = 'student' AND c.name IN (
    'profile.read.own',
    'profile.update.own',
    'job.read',
    'job.apply',
    'event.read',
    'event.register',
    'mentorship.request',
    'fundraising.read'
)
ON CONFLICT DO NOTHING;

-- Alumni capabilities
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id
FROM roles r, capabilities c
WHERE r.name = 'alumni' AND c.name IN (
    'profile.read.own',
    'profile.update.own',
    'profile.read.all',
    'job.read',
    'job.apply',
    'event.read',
    'event.create',
    'event.update.own',
    'event.delete.own',
    'event.register',
    'mentorship.offer',
    'mentorship.request',
    'fundraising.read',
    'fundraising.donate',
    'donation.history.own'
)
ON CONFLICT DO NOTHING;

-- Recruiter capabilities
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id
FROM roles r, capabilities c
WHERE r.name = 'recruiter' AND c.name IN (
    'profile.read.own',
    'profile.update.own',
    'profile.read.all',
    'job.create',
    'job.read',
    'job.update.own',
    'job.delete.own',
    'candidate.read',
    'candidate.shortlist',
    'candidate.contact',
    'event.read'
)
ON CONFLICT DO NOTHING;

-- Donor capabilities
INSERT INTO role_capabilities (role_id, capability_id)
SELECT r.id, c.id
FROM roles r, capabilities c
WHERE r.name = 'donor' AND c.name IN (
    'profile.read.own',
    'profile.update.own',
    'fundraising.read',
    'fundraising.donate',
    'donation.history.own',
    'event.read'
)
ON CONFLICT DO NOTHING;
