# API Testing Guide - Alumni Connect

Complete guide to test all APIs in the correct order with real examples.

---

## 🚀 Quick Start

### Step 1: Import Postman Collection

1. Open Postman
2. Click **Import**
3. Select `COMPLETE_API_COLLECTION.postman_collection.json`
4. Collection will be imported with all endpoints

### Step 2: Set Base URL

The collection uses `http://localhost:5001/api` by default.

To change:
1. Click on the collection
2. Go to **Variables** tab
3. Update `baseUrl` value

---

## 📝 Testing Flow

### Phase 1: Setup (Admin Creates First User)

Since this is a fresh system, you need to create the first admin manually in the database.

**Option A: Using Database**

```sql
-- Connect to your database
psql -U postgres -d alumni_connect

-- Create first admin
INSERT INTO users (first_name, last_name, name, email, password_hash, primary_role, is_verified, is_approved)
VALUES (
  'Super',
  'Admin',
  'Super Admin',
  'admin@alumniconnect.com',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt to hash 'Admin123!'
  'admin',
  true,
  true
);
```

**Option B: Using Node.js Script**

Create `scripts/create-admin.ts`:

```typescript
import bcrypt from 'bcryptjs';
import pool from '../src/config/database';

async function createAdmin() {
  const password = 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const query = `
    INSERT INTO users (first_name, last_name, name, email, password_hash, primary_role, is_verified, is_approved)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, name, email, primary_role
  `;
  
  const values = [
    'Super',
    'Admin',
    'Super Admin',
    'admin@alumniconnect.com',
    hashedPassword,
    'admin',
    true,
    true
  ];
  
  const result = await pool.query(query, values);
  console.log('Admin created:', result.rows[0]);
  process.exit(0);
}

createAdmin().catch(console.error);
```

Run:
```bash
ts-node scripts/create-admin.ts
```

---

### Phase 2: Test Authentication

#### Test 1: Admin Login ✅

**Request:**
```http
POST http://localhost:5001/api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@alumniconnect.com",
  "password": "Admin123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "Super Admin",
      "email": "admin@alumniconnect.com",
      "primary_role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Action:** Copy the `accessToken` and save it. You'll need it for all admin operations.

---

#### Test 2: Create Student Account ✅

**Request:**
```http
POST http://localhost:5001/api/user-management/students
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@university.edu",
  "password": "Student123!",
  "batchYear": 2024,
  "department": "Computer Science"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Student account created successfully",
  "data": {
    "user": {
      "id": "student-uuid",
      "name": "Jane Smith",
      "email": "jane.smith@university.edu",
      "primary_role": "student"
    }
  }
}
```

---

#### Test 3: Student Login ✅

**Request:**
```http
POST http://localhost:5001/api/auth/student/login
Content-Type: application/json

{
  "email": "jane.smith@university.edu",
  "password": "Student123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "student-uuid",
      "name": "Jane Smith",
      "primary_role": "student"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

#### Test 4: Alumni Self-Registration ✅

**Request:**
```http
POST http://localhost:5001/api/auth/alumni/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@alumni.com",
  "password": "Alumni123!",
  "confirmPassword": "Alumni123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email and wait for admin approval.",
  "data": {
    "user": {
      "id": "alumni-uuid",
      "name": "John Doe",
      "email": "john.doe@alumni.com",
      "primary_role": "alumni",
      "is_verified": false,
      "approval_status": "pending"
    }
  }
}
```

**Note:** Alumni cannot login until:
1. Email is verified
2. Admin approves the account

---

#### Test 5: Approve Alumni (Admin) ✅

**Request:**
```http
PATCH http://localhost:5001/api/user-management/alumni/verify
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
Content-Type: application/json

{
  "userId": "alumni-uuid-from-registration",
  "isApproved": true,
  "rejectionReason": null
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Alumni account approved successfully"
}
```

---

#### Test 6: Alumni Login ✅

**Request:**
```http
POST http://localhost:5001/api/auth/alumni/login
Content-Type: application/json

{
  "email": "john.doe@alumni.com",
  "password": "Alumni123!"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "alumni-uuid",
      "name": "John Doe",
      "primary_role": "alumni"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

### Phase 3: Test Profile Management

#### Test 7: Get My Profile ✅

**Request:**
```http
GET http://localhost:5001/api/profiles/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile-uuid",
      "user_id": "user-uuid",
      "first_name": "Jane",
      "last_name": "Smith",
      "batch_year": 2024,
      "department": "Computer Science",
      "skills": [],
      "domains": []
    }
  }
}
```

---

#### Test 8: Update My Profile ✅

**Request:**
```http
PATCH http://localhost:5001/api/profiles/me
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "current_company": "Google",
  "designation": "Software Engineer",
  "skills": ["JavaScript", "Python", "React"],
  "domains": ["Web Development", "AI"],
  "is_mentor_available": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "profile": {
      "current_company": "Google",
      "designation": "Software Engineer",
      "skills": ["JavaScript", "Python", "React"]
    }
  }
}
```

---

### Phase 4: Test Role-Based Profiles

#### Test 9: Create Role-Based Profile ✅

**Request:**
```http
POST http://localhost:5001/api/role-profiles
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "userId": "your-user-uuid",
  "role": "student",
  "commonFields": {
    "name": "Jane Smith",
    "email": "jane.smith@university.edu",
    "bio": "Computer Science student passionate about AI",
    "location": "Boston, MA"
  },
  "roleSpecificData": {
    "skills": ["JavaScript", "Python", "React"],
    "education": [{
      "institution": "MIT",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startYear": 2021,
      "endYear": 2025,
      "grade": "3.9 GPA"
    }],
    "projects": [],
    "interests": ["Web Development", "Machine Learning"],
    "internshipAvailable": false,
    "internshipExperience": []
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": "profile-uuid",
    "userId": "user-uuid",
    "role": "student",
    "commonFields": {...},
    "roleSpecificData": {...},
    "activityLogs": [{
      "action": "profile_created",
      "timestamp": "2024-01-15T10:30:00Z"
    }]
  }
}
```

---

#### Test 10: Get Role-Based Profile ✅

**Request:**
```http
GET http://localhost:5001/api/role-profiles/user/your-user-uuid
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

#### Test 11: Update Role-Based Profile ✅

**Request:**
```http
PUT http://localhost:5001/api/role-profiles/user/your-user-uuid
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "roleSpecificData": {
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Docker"]
  }
}
```

---

#### Test 12: Search Profiles ✅

**Request:**
```http
GET http://localhost:5001/api/role-profiles/search?q=software&role=student
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

### Phase 5: Test Jobs

#### Test 13: Get All Jobs (Public) ✅

**Request:**
```http
GET http://localhost:5001/api/jobs?page=1&limit=10
```

**Note:** This endpoint is public, no authentication required.

---

#### Test 14: Create Job ✅

**Request:**
```http
POST http://localhost:5001/api/jobs
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "title": "Senior Software Engineer",
  "company": "TechCorp Inc.",
  "location": "San Francisco, CA",
  "type": "Full-time",
  "description": "We are seeking a talented Senior Software Engineer...",
  "requirements": [
    "5+ years of software development experience",
    "Strong knowledge of JavaScript/TypeScript"
  ],
  "salary_range": "$120k - $180k",
  "application_url": "https://techcorp.com/careers/apply/123"
}
```

---

### Phase 6: Test User Management (Admin Only)

#### Test 15: Get All Users ✅

**Request:**
```http
GET http://localhost:5001/api/user-management/users?page=1&limit=10
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
```

---

#### Test 16: Get Users by Role ✅

**Request:**
```http
GET http://localhost:5001/api/user-management/users/role/student
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
```

---

#### Test 17: Delete User ✅

**Request:**
```http
DELETE http://localhost:5001/api/user-management/users/user-uuid-to-delete
Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN
```

---

### Phase 7: Test OAuth (Optional)

#### Test 18: Google OAuth ✅

**Prerequisites:**
1. Set up Google OAuth in Google Cloud Console
2. Get Google Client ID
3. Implement Google Sign-In on frontend
4. Get ID token from Google

**Request:**
```http
POST http://localhost:5001/api/auth/google
Content-Type: application/json

{
  "token": "google_id_token_here",
  "role": "alumni"
}
```

---

#### Test 19: LinkedIn OAuth ✅

**Option 1: Redirect Flow**

1. Open browser and go to:
```
http://localhost:5001/api/v1/auth/linkedin/redirect
```

2. Authorize on LinkedIn

3. You'll be redirected back with tokens

**Option 2: Token Exchange**

**Request:**
```http
POST http://localhost:5001/api/auth/linkedin
Content-Type: application/json

{
  "code": "linkedin_authorization_code",
  "role": "alumni"
}
```

---

### Phase 8: Test Password Management

#### Test 20: Forgot Password ✅

**Request:**
```http
POST http://localhost:5001/api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset email sent. Please check your inbox."
}
```

**Note:** Check your email for reset link.

---

#### Test 21: Reset Password ✅

**Request:**
```http
POST http://localhost:5001/api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

---

### Phase 9: Test Token Refresh

#### Test 22: Refresh Access Token ✅

**Request:**
```http
POST http://localhost:5001/api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Port 5001 already in use"

**Solution:**
```bash
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

### Issue 2: "Database connection failed"

**Solution:**
1. Check if PostgreSQL is running
2. Verify database credentials in `.env`
3. Test connection:
```bash
psql -U postgres -d alumni_connect
```

---

### Issue 3: "Invalid credentials"

**Possible Causes:**
- Wrong email/password
- User not verified (for alumni)
- User not approved (for alumni)
- Account doesn't exist

**Solution:**
- Check user exists in database
- Verify email is verified
- Check approval status

---

### Issue 4: "Token expired"

**Solution:**
Use refresh token to get new access token:
```http
POST /api/auth/refresh
{
  "refreshToken": "your_refresh_token"
}
```

---

### Issue 5: "Validation failed"

**Common Validation Errors:**
- Email format invalid
- Password too short (minimum 8 characters)
- Required fields missing
- Password and confirmPassword don't match

**Solution:**
Check the error response for specific field errors.

---

## 📊 Testing Checklist

### Authentication ✅
- [ ] Admin login
- [ ] Student login
- [ ] Alumni registration
- [ ] Alumni approval
- [ ] Alumni login
- [ ] Google OAuth
- [ ] LinkedIn OAuth
- [ ] Forgot password
- [ ] Reset password
- [ ] Email verification
- [ ] Token refresh
- [ ] Logout

### User Management (Admin) ✅
- [ ] Create student
- [ ] Create admin
- [ ] Get all users
- [ ] Get users by role
- [ ] Approve alumni
- [ ] Reject alumni
- [ ] Update user role
- [ ] Delete user

### Profiles ✅
- [ ] Get my profile
- [ ] Update my profile

### Role-Based Profiles ✅
- [ ] Create profile
- [ ] Get profile by user ID
- [ ] Update profile
- [ ] Search profiles
- [ ] Get profiles by role
- [ ] Add activity log
- [ ] Get statistics
- [ ] Check profile exists

### Jobs ✅
- [ ] Get all jobs (public)
- [ ] Create job (authenticated)

### RBAC ✅
- [ ] Get my capabilities
- [ ] Assign capability

### Health Checks ✅
- [ ] Server health
- [ ] API health

---

## 🎯 Quick Test Script

Create `test-apis.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5001/api"

echo "Testing Health Check..."
curl -X GET "$BASE_URL/health"

echo "\n\nTesting Admin Login..."
curl -X POST "$BASE_URL/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@alumniconnect.com",
    "password": "Admin123!"
  }'

echo "\n\nDone!"
```

Run:
```bash
chmod +x test-apis.sh
./test-apis.sh
```

---

## 📝 Notes

1. **Always use HTTPS in production**
2. **Store tokens securely** (never in localStorage for sensitive apps)
3. **Implement token refresh** before access token expires
4. **Handle rate limits** (429 errors)
5. **Validate all inputs** on frontend before sending
6. **Log all errors** for debugging

---

## 🎉 Success Criteria

Your API is working correctly if:

✅ Admin can login  
✅ Admin can create students  
✅ Students can login  
✅ Alumni can register  
✅ Admin can approve alumni  
✅ Alumni can login after approval  
✅ Users can view and update profiles  
✅ Jobs can be created and viewed  
✅ OAuth works (Google/LinkedIn)  
✅ Password reset works  
✅ Token refresh works  

---

**Happy Testing! 🚀**
